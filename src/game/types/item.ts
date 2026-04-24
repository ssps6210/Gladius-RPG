import type { RuntimeEquipment } from "./player";

export type RuntimeSpecial = {
  type?: string;
  val?: number;
  [key: string]: unknown;
};

export type RuntimeAffix = {
  id?: string;
  tag?: string;
  stat?: string;
  special?: string;
  rolledVal?: number;
  [key: string]: unknown;
};

export type RuntimeItem = {
  uid?: number | string;
  name?: string;
  icon?: string;
  slot?: string;
  type?: string;
  rarity?: string;
  cat?: string;
  attack?: number;
  defense?: number;
  hp?: number;
  speed?: number;
  heal?: number;
  enhLv?: number;
  itemLevel?: number;
  cost?: number;
  title?: string;
  equipment?: RuntimeEquipment;
  affixes?: RuntimeAffix[];
  specials?: RuntimeSpecial[];
  [key: string]: unknown;
};
