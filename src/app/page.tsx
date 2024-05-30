import {
  variantAdapter,
  phaseAdapter,
  ListApiResponse,
  Phase,
  Variant,
  ApiResponse,
  Game,
  gameAdapter,
} from "@/data";
import { createMap } from "@/map";

// Copy token from Diplicity web app and paste here until we work out auth
const TOKEN =
  "P44TttLSZ3LBAZuM0WM605aLQsP9zQuxsdI77CWc3FzJaYmMGYDCk8rUtnvdLKpRTBsMl9hRXhMCpUuxUkunG0sl-8vR5H3KxD4zR0X586yqB3Z6HZlppxBT2sNWWxt9JFn7f-0OQ2ljdnkvjL2IUtzqi0ptoakw_gwXMMXmrg1fI8CVJwXUtJXX-Ap4dkAveTNl0vH6egx0j5zh3fbwtlM0v2reLTj0DpxUzmWpTkWtWvfw9zqn64PFdJrIvHkeAU164CVqr5iNcHvyvaLblkjJu9AgTpRjYMEgqEBLnbcXkkdzAHCGQ7wv6lhKrUHadqU9E6fXD_taQ1gd8gJVN8a_jmdsKNBCEC66WP2DwGkWc8C1DdUEzjCzz7-zIhZnSRbs29ARKfG0YFndAgBADIRUaGH7vnORJRZcCCYjeASXSBfK0aijfZqh3Vxv0NJP2gueUiBfd2Fj4AsIU7QQcuUj5z3PB3ed-P2PtL93p6DXhiUgUppfyZwh6pQZ-7QeSn210-uLUg==";

const BASE_URL = "https://diplicity-engine.appspot.com";

const headers = new Headers();
headers.set("XDiplicityAPILevel", "8");
headers.set("XDiplicityClientName", "diplicity-map@");
headers.set("Accept", "application/json");
headers.set("Content-Type", "application/json");
headers.set("Authorization", `bearer ${TOKEN}`);

type DiplicityMapProps = {
  searchParams: { [key: string]: string };
};

const DiplicityMap = async (props: DiplicityMapProps) => {
  const searchParams = new URLSearchParams(props.searchParams);
  const gameId = searchParams.get("game");
  if (!gameId) {
    return "Game ID must be provided";
  }

  const phase = searchParams.get("phase");

  const phaseOrdinal = phase ? parseInt(phase, 10) : undefined;

  const gamePromise = fetch(`${BASE_URL}/Game/${gameId}`, { headers });
  const phasePromise = fetch(`${BASE_URL}/Game/${gameId}/Phases`, { headers });
  const variantPromise = fetch(`${BASE_URL}/Variants`, { headers });
  const mapPromise = fetch(`${BASE_URL}/Variant/Classical/Map.svg`);
  const armyPromise = fetch(`${BASE_URL}/Variant/Classical/Units/Army.svg`);
  const fleetPromise = fetch(`${BASE_URL}/Variant/Classical/Units/Fleet.svg`);

  // Request all data in parallel
  const [
    gameResponse,
    phaseResponse,
    variantResponse,
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
  ]);

  if (!gameResponse.ok) {
    return "Failed to fetch game";
  }

  if (!phaseResponse.ok) {
    return "Failed to fetch phases";
  }

  if (!variantResponse.ok) {
    return "Failed to fetch variants";
  }

  if (!mapResponse.ok) {
    return "Failed to fetch map";
  }

  if (!armyResponse.ok) {
    return "Failed to fetch army";
  }

  if (!fleetResponse.ok) {
    return "Failed to fetch fleet";
  }

  const game = (await gameResponse.json()) as ApiResponse<Game>;
  const phases = (await phaseResponse.json()) as ListApiResponse<Phase>;
  const variants = (await variantResponse.json()) as ListApiResponse<Variant>;
  const mapSvgData = await mapResponse.text();
  const armySvgData = await armyResponse.text();
  const fleetSvgData = await fleetResponse.text();

  const transformedGame = gameAdapter(game.Properties);
  const variantName = transformedGame.variant;

  const selectedOrCurrentPhase = phaseOrdinal
    ? phaseOrdinal
    : transformedGame.newestPhaseMeta
    ? transformedGame.newestPhaseMeta[0].PhaseOrdinal
    : undefined;

  if (!selectedOrCurrentPhase) {
    return "Cannot find valid phase for game";
  }

  const classicalVariant = variants.Properties.find(
    (variant) => variant.Name === variantName
  );

  if (!classicalVariant) {
    return "Classical variant not found";
  }

  const selectedPhase = phases.Properties.find(
    (phase) => phase.Properties.PhaseOrdinal === selectedOrCurrentPhase
  );

  if (!selectedPhase) {
    return `Phase with ID ${phaseOrdinal} not found`;
  }

  const transformedVariant = variantAdapter(classicalVariant.Properties);
  const transformedPhase = phaseAdapter(selectedPhase.Properties);

  const map = createMap(
    mapSvgData,
    armySvgData,
    fleetSvgData,
    transformedVariant,
    transformedPhase
  );

  return (
    <main>
      <div
        dangerouslySetInnerHTML={{ __html: map }}
        className="w-full h-full"
      />
    </main>
  );
};

export default DiplicityMap;
