import { RARITIES } from "../data/rarities";
import { calcSellPrice } from "../lib/items";

type ItemRarity = "normal" | "magic" | "rare" | "legendary" | "mythic";

interface ItemLike {
  uid: string;
  rarity: string;
  type?: string;
  [key: string]: any;
}

type EquipmentMap = Record<string, ItemLike | null>;

function getRarityRank(rarityId: string): number {
  const index = RARITIES.findIndex((r) => r.id === rarityId);
  return index === -1 ? 0 : index;
}

export function getBulkSellResult(
  inventory: ItemLike[],
  equipment: EquipmentMap,
  threshold: ItemRarity,
) {
  const cutoff = getRarityRank(threshold);
  const equipped = new Set(
    Object.values(equipment)
      .filter(Boolean)
      .map((item) => (item as ItemLike).uid),
  );
  const items = inventory.filter(
    (item) =>
      getRarityRank(item.rarity) <= cutoff &&
      !equipped.has(item.uid) &&
      item.type !== "merc_scroll" &&
      item.type !== "potion",
  );
  return { items, gold: items.reduce((sum, item) => sum + calcSellPrice(item), 0) };
}
