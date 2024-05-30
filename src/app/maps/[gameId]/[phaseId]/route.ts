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
  console.log("gameId", gameId);
  console.log("phaseId", phaseId);

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

  // request data in series
  const gameResponse = await gamePromise
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch game: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data as ApiResponse<Game>;
    })
    .catch((error) => {
      log.error(`Failed to fetch game: ${error}`);
      throw error;
    });

  const phaseResponse = await phasePromise
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch phase: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      return data as ApiResponse<Phase>;
    })
    .catch((error) => {
      log.error(`Failed to fetch phase: ${error}`);
      throw error;
    });

  const variantsResponse = await variantPromise
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch variants");
      }
      return response.json();
    })
    .then((data) => {
      return data as ListApiResponse<Variant>;
    })
    .catch((error) => {
      log.error(`Failed to fetch variants: ${error}`);
      throw error;
    });

  const mapResponse = await mapPromise
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch map");
      }
      return response.text();
    })
    .catch((error) => {
      log.error(`Failed to fetch map: ${error}`);
      throw error;
    });

  const armyResponse = await armyPromise
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch army");
      }
      return response.text();
    })
    .catch((error) => {
      log.error(`Failed to fetch army: ${error}`);
      throw error;
    });

  const fleetResponse = await fleetPromise
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch fleet");
      }
      return response.text();
    })
    .catch((error) => {
      log.error(`Failed to fetch fleet: ${error}`);
      throw error;
    });

  const transformedGame = gameAdapter(gameResponse.Properties);
  const variantName = transformedGame.variant;

  const variant = variantsResponse.Properties.find(
    (variant) => variant.Name === variantName
  );

  if (!variant) {
    return "Cannot find variant";
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
}
