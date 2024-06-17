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

const diplicityApiBaseUrl = process.env.DIPLICITY_API_BASE_URL;

if (!diplicityApiBaseUrl) {
  throw new Error("DIPLICITY_API_BASE_URL is required");
}

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
  log.info(`GET /maps/${params.gameId}/${params.phaseId}`);

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
    log.info("Data fetched successfully");

    log.info("Transforming game response");
    const transformedGame = gameAdapter(gameResponse.Properties);
    log.info("Game response transformed successfully");

    log.info(`Finding variant with name ${transformedGame.variant}`);
    const variant = variantsResponse.Properties.find(
      (variant) => variant.Name === transformedGame.variant
    );

    if (!variant) {
      log.error(`Variant not found with name ${transformedGame.variant}`);
      return new Response("Variant not found", {
        status: 500,
      });
    } else {
      log.info(`Variant found with name ${transformedGame.variant}`);
    }

    log.info(`Transforming variant`);
    const transformedVariant = variantAdapter(variant.Properties);
    log.info(`Variant transformed successfully`);

    log.info("Transforming phase");
    const transformedPhase = phaseAdapter(phaseResponse.Properties);
    log.info("Phase transformed successfully");

    log.info("Creating map SVG");
    const map = createMap(
      mapResponse,
      armyResponse,
      fleetResponse,
      transformedVariant,
      transformedPhase
    );
    log.info("Map SVG created successfully");

    return new Response(map, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  } catch (error) {
    log.error(`Error fetching data: ${error}`);
    return new Response(`Error fetching data: ${error}`, {
      status: 500,
    });
  }
}
