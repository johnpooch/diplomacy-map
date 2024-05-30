type Edge = {
  Flags: {
    [key: string]: boolean;
  };
};

export type Unit = {
  Type: string;
  Nation: string;
};

type Sub = {
  Name: string;
  Edges: { [key: string]: Edge };
  ReverseEdges: { [key: string]: Edge };
  Flags: {
    [key: string]: boolean;
  };
};

type Node = {
  Name: string;
  Subs: { [key: string]: Sub };
  SC: string | null;
};

type Graph = {
  Nodes: { [key: string]: Node };
};

type Start = {
  Year: number;
  Season: string;
  Type: string;
  SCs: { [key: string]: string };
  Units: { [key: string]: Unit };
  Map: string;
};

export type Variant = {
  Name: string;
  Nations: string[];
  PhaseTypes: string[];
  Seasons: string[];
  UnitTypes: string[];
  SVGVersion: string;
  ProvinceLongNames: { [key: string]: string };
  NationColors: null | { [key: string]: string };
  CreatedBy: string;
  Version: string;
  Description: string;
  Rules: string;
  OrderTypes: string[];
  Start: Start;
  Graph: Graph;
};

export type TransformedVariant = {
  createdBy: string;
  description: string;
  graph: Graph;
  map: string;
  name: string;
  nationColors: null | { [key: string]: string };
  nations: string[];
  orderTypes: string[];
  phaseTypes: string[];
  provinceLongNames: { [key: string]: string };
  rules: string;
  seasons: string[];
  startSeason: string;
  startSCs: { [key: string]: string };
  startUnits: { [key: string]: Unit };
  startType: string;
  startYear: number;
  unitTypes: string[];
};

export interface ApiResponse<P> {
  Properties: P;
  Name?: string;
  Type?: string;
  Desc?: string[][];
}

export type ListApiResponse<P> = ApiResponse<ApiResponse<P>[]>;

export type ColorOverrides = {
  nationCodes: { [key: string]: string };
  variantCodes: { [key: string]: string };
  positions: string[];
  variants: { [key: string]: { [key: string]: string } };
  nations: { [key: string]: string };
};

export type NewGame = {
  Anonymous: boolean;
  ChatLanguageISO639_1: string;
  Desc: string;
  DisableConferenceChat: boolean;
  DisableGroupChat: boolean;
  DisablePrivateChat: boolean;
  GameMasterEnabled: boolean;
  LastYear: number;
  MaxHated: number | null;
  MaxHater: number;
  MaxRating: number;
  MinQuickness: number;
  MinRating: number;
  MinReliability: number;
  NationAllocation: number;
  NonMovementPhaseLengthMinutes: number;
  PhaseLengthMinutes: number;
  Private: boolean;
  RequireGameMasterInvitation: boolean;
  SkipMuster: boolean;
  Variant: string;
};

export type PhaseState = {
  GameID: string;
  PhaseOrdinal: number;
  Nation: string;
  ReadyToResolve: boolean;
  WantsDIAS: boolean;
  WantsConcede: boolean;
  OnProbation: boolean;
  NoOrders: boolean;
  Eliminated: boolean;
  Messages: string;
  ZippedOptions: null;
  Note: string;
};

export interface PhaseMeta {
  PhaseOrdinal: number;
  Season: string;
  Year: number;
  Type: string;
  Resolved: false;
  CreatedAt: string;
  CreatedAgo: number;
  ResolvedAt: string;
  ResolvedAgo: number;
  DeadlineAt: string;
  NextDeadlineIn: number;
  UnitsJSON: string;
  SCsJSON: string;
}

export type Game = Omit<NewGame, "FirstMember"> & {
  ActiveBans: null;
  Closed: boolean;
  CreatedAgo: number;
  CreatedAt: string;
  FailedRequirements: null | string[];
  Finished: boolean;
  FinishedAgo: number;
  FinishedAt: string;
  ID: string;
  Mustered: boolean;
  NMembers: number;
  NewestPhaseMeta: PhaseMeta[] | null;
  NoMerge: boolean;
  StartETA: string;
  Started: boolean;
  StartedAgo: number;
  StartedAt: string;
};

export type TransformedGame = {
  anonymous: boolean;
  chatDisabled: boolean;
  chatLanguage: string;
  closed: boolean;
  conferenceChatEnabled: boolean;
  createdAt: string;
  endYear: number;
  finished: boolean;
  finishedAt: string;
  groupChatEnabled: boolean;
  id: string;
  name: string;
  newestPhaseMeta: PhaseMeta[] | null;
  numPlayers: number;
  playerIdentity: "anonymous" | "public";
  privateChatEnabled: boolean;
  privateGame: boolean;
  started: boolean;
  startedAt: string;
  status: "staging" | "started" | "finished";
  variant: string;
  visibility: "private" | "public";
};

export interface Player {
  id: string;
  username: string;
  image: string;
}

export type GameState = {
  GameID: string;
  Nation: string;
  Muted: null | string[];
};

export type UnitState = {
  Province: string;
  Unit: Unit;
};

export type SCState = {
  Province: string;
  Owner: string;
};

export type Resolution = {
  Province: string;
  Resolution: string;
};

export type PreliminaryScore = {
  UserId: string;
  Member: string;
  SCs: number;
  Score: number;
  Explanation: string;
};

export type Bounce = {
  Province: string;
  BounceList: string;
};

export type Dislodged = {
  Province: string;
  Dislodged: Unit;
};

export type Dislodger = {
  Province: string;
  Dislodger: string;
};

export type Phase = {
  PhaseOrdinal: number;
  Season: string;
  Year: number;
  Type: string;
  Resolved: boolean;
  CreatedAt: string;
  CreatedAgo: number;
  ResolvedAt: string;
  ResolvedAgo: number;
  DeadlineAt: string;
  NextDeadlineIn: number;
  UnitsJSON: string;
  SCsJSON: string;
  GameID: string;
  Units: UnitState[];
  SCs: SCState[];
  Dislodgeds: null | Dislodged[];
  Dislodgers: null | Dislodger[];
  ForceDisbands: null | string[];
  Bounces: null | Bounce[];
  Resolutions: null | Resolution[];
  Host: string;
  SoloSCCount: number;
  PreliminaryScores: PreliminaryScore[];
};

export type TransformedUnit = {
  type: string;
  nation: string;
};

export type TransformedUnitState = {
  province: string;
  unit: TransformedUnit;
};
export type TransformedSupplyCenterState = {
  province: string;
  owner: string;
};
export type TransformedDislodgedUnit = {
  province: string;
  unit: TransformedUnit;
};
export type TransformedDislodgingProvinces = {
  province: string;
  dislodgingProvince: string;
};

export type TransformedPhase = {
  id: number;
  season: string;
  year: number;
  type: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string;
  deadlineAt: string;
  units: TransformedUnitState[];
  supplyCenters: TransformedSupplyCenterState[];
  dislodgedUnits: TransformedDislodgedUnit[];
  dislodgingProvinces: TransformedDislodgingProvinces[];
};

export interface ColorMap {
  [key: string]: {
    name: string;
    color: string;
    edited: boolean;
  }[];
}

export interface NationDisplay {
  abbreviation: string;
  color: string;
  flagLink: string;
  name: string;
  isUser: boolean;
}

export type ResolutionDisplay = {
  message: string;
  province?: string;
};

export interface OrderDisplay {
  label: string;
  inconsistencies: string[];
  resolution: ResolutionDisplay | null;
}

export enum UnitType {
  Fleet,
  Army,
}

export enum OrderType {
  Buid = "Build",
  Convoy = "Convoy",
  Disband = "Disband",
  Hold = "Hold",
  Move = "Move",
  MoveViaConvoy = "MoveViaConvoy",
  Support = "Support",
}

export interface CreateOrder {
  source?: string;
  type?: OrderType;
  target?: string;
  aux?: string;
}

export interface CreateOrderDisplay extends CreateOrder {}

export interface UnitDisplay {
  type: UnitType;
  color: string;
}

export interface ProvinceDisplay {
  name: string;
  id: string;
  color: string;
  unit: UnitDisplay | null;
  dislodgedUnit: UnitDisplay | null;
  highlight: boolean;
}

export interface Option {
  Next: { [key: string]: Option };
  Type: string;
}

export interface Options {
  [key: string]: Option;
}

export interface MapState {
  provinces: {
    id: string;
    fill: string;
    highlight: boolean;
  }[];
  units: {
    fill: string;
    province: string;
    type: string;
  }[];
  orders: {
    type: string;
    source: string;
    target: string;
    aux: string;
    fill: string;
    result: string;
  }[];
}
