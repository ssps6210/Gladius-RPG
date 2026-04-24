import type { RuntimeArenaOpponent } from "./arena";
import type { RuntimeItem } from "./item";

export type RuntimeLogEntry = {
  txt: string;
  type: string;
};

export type RuntimeReplay = {
  lines: RuntimeLogEntry[];
  cursor: number;
  drops: RuntimeItem[];
  won: boolean;
  isArena?: boolean;
  isExpedition?: boolean;
  isMerc?: boolean;
  dungeon?: RuntimeItem | null;
  tier?: RuntimeItem | null;
  expedition?: RuntimeItem | null;
  mercDungeonId?: string;
  opponent?: RuntimeArenaOpponent | null;
  [key: string]: unknown;
};
