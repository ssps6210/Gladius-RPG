import type { RuntimeItem } from "./item";
import type { RuntimePlayer } from "./player";

export type GameSave = {
  player: RuntimePlayer;
  inventory: RuntimeItem[];
};
