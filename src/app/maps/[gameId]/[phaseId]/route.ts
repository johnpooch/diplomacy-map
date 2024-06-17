import puppeteer from "puppeteer";

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
  const { gameId, phaseId } = params;

  const trimmedPhaseId = phaseId.replace(".png", "");

  log.info(`API base URL: ${diplicityApiBaseUrl}`);

  const gamePromise = fetch(`${diplicityApiBaseUrl}/Game/${gameId}`, {
    headers,
  });
  const phasePromise = fetch(
    `${diplicityApiBaseUrl}/Game/${gameId}/Phase/${trimmedPhaseId}`,
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

    log.info(`Transforming game response: ${JSON.stringify(gameResponse)}`);
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
    const mapSvg = createMap(
      mapResponse,
      armyResponse,
      fleetResponse,
      transformedVariant,
      transformedPhase
    );
    log.info("Map SVG created successfully");

    log.info("Use puppeteer to convert SVG to PNG");
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    log.info("Puppeteer browser launched successfully");
    const page = await browser.newPage();
    log.info("Puppeteer page created successfully");
    await page.setContent(mapSvg);
    log.info("SVG content set successfully");
    const png = await page.screenshot({ type: "png" });
    log.info("Screenshot taken successfully");
    await browser.close();
    log.info("SVG converted to PNG successfully");

    return new Response(png, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    log.error(`Error fetching data: ${JSON.stringify(error)}`);
    return new Response(`Error fetching data: ${JSON.stringify(error)}`, {
      status: 500,
    });
  }
}
