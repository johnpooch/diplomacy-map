import * as dotenv from "dotenv";

import {
  ApiResponse,
  Game,
  Phase,
  ListApiResponse,
  Variant,
  gameAdapter,
  variantAdapter,
  phaseAdapter,
} from "@/data";
import { createMap } from "@/map";
import { createScopedLogger } from "@/util/telemetry";

const envConfig = dotenv.config();

const diplicityApiBaseUrl = envConfig.parsed?.DIPLICITY_API_BASE_URL;

const log = createScopedLogger("app/page");

const headers = new Headers();
headers.set("XDiplicityAPILevel", "8");
headers.set("XDiplicityClientName", "diplicity-map@");
headers.set("Accept", "application/json");
headers.set("Content-Type", "application/json");

export async function GET(
  request: Request,
  { params }: { params: { gameId: string; phaseId: string } }
) {
  const { gameId, phaseId } = params;

  const gamePromise = fetch(`${diplicityApiBaseUrl}/Game/${gameId}`, {
    headers,
  });
  const phasePromise = fetch(
    `${diplicityApiBaseUrl}/Game/${gameId}/Phase/${phaseId}`,
    { headers }
  );
  const variantPromise = fetch(`${diplicityApiBaseUrl}/Variants`, { headers });
  const mapPromise = fetch(`${diplicityApiBaseUrl}/Variant/Classical/Map.svg`);
  const armyPromise = fetch(
    `${diplicityApiBaseUrl}/Variant/Classical/Units/Army.svg`
  );
  const fleetPromise = fetch(
    `${diplicityApiBaseUrl}/Variant/Classical/Units/Fleet.svg`
  );

  try {
    const [
      gameResponse,
      phaseResponse,
      variantsResponse,
      mapResponse,
      armyResponse,
      fleetResponse,
    ] = await Promise.all([
      gamePromise,
      phasePromise,
      variantPromise,
      mapPromise,
      armyPromise,
      fleetPromise,
    ]).then(
      async ([
        gameResponse,
        phaseResponse,
        variantsResponse,
        mapResponse,
        armyResponse,
        fleetResponse,
      ]) => {
        return Promise.all([
          gameResponse.json() as Promise<ApiResponse<Game>>,
          phaseResponse.json() as Promise<ApiResponse<Phase>>,
          variantsResponse.json() as Promise<ListApiResponse<Variant>>,
          mapResponse.text(),
          armyResponse.text(),
          fleetResponse.text(),
        ]);
      }
    );
    const transformedGame = gameAdapter(gameResponse.Properties);
    const variantName = transformedGame.variant;

    const variant = variantsResponse.Properties.find(
      (variant) => variant.Name === variantName
    );

    if (!variant) {
      return new Response("Variant not found", {
        status: 500,
      });
    }

    const transformedVariant = variantAdapter(variant.Properties);
    const transformedPhase = phaseAdapter(phaseResponse.Properties);

    const map = createMap(
      mapResponse,
      armyResponse,
      fleetResponse,
      transformedVariant,
      transformedPhase
    );

    return new Response(map, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  } catch (error) {
    log.error("Error fetching data");
    return new Response("Error fetching data", {
      status: 500,
    });
  }
}
