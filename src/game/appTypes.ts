import type {
  RuntimeArenaOpponent,
  RuntimeItem,
  RuntimePlayer,
  RuntimeQuestState,
  RuntimeReplay,
} from "./types";

export type AnyRecord = Record<string, any>;
export type AnyList = any[];

export type GameItem = RuntimeItem & AnyRecord & {
  uid: any;
  name: any;
  icon: any;
  rarity: any;
  cat: any;
  attack: any;
  defense: any;
  hp: any;
  speed: any;
  heal: any;
  enhLv: any;
  itemLevel: any;
  slot: any;
  type: any;
  cost: any;
  affixes: any[];
  specials: any[];
};

export type GamePlayer = RuntimePlayer & AnyRecord & {
  level: any;
  exp: any;
  expNeeded: any;
  hp: any;
  maxHp: any;
  attack: any;
  defense: any;
  speed: any;
  gold: any;
  equipment: AnyRecord;
};

export type GameQuestState = RuntimeQuestState & AnyRecord;

export type GameArenaOpponent = Omit<RuntimeArenaOpponent, "equipment"> & AnyRecord & {
  equipment: AnyRecord;
  attack: any;
  defense: any;
  maxHp: any;
  hp: any;
  goldCarried: any;
};

export type GameReplay = Omit<RuntimeReplay, "drops" | "dungeon" | "tier" | "expedition" | "opponent"> & AnyRecord & {
  lines: any[];
  cursor: any;
  drops: GameItem[];
  won?: any;
  dungeon?: any;
  tier?: any;
  expedition?: any;
  opponent?: any;
};

export type LootDrop = GameItem & { _remaining?: GameItem[] };
