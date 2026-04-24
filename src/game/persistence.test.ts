import { describe, expect, it } from "vitest";

import { INITIAL_EQUIPMENT, INITIAL_PLAYER, TRAIN_STAT_DISPLAY_KEYS } from "./constants/index";
import * as constantsShim from "./constants";
import {
  clearGameState,
  loadGameState,
  migrateGameState,
  saveGameState,
} from "./persistence/index";
import * as persistenceShim from "./persistence";

function createStorage(seed: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(seed));

  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key) {
      return data.has(key) ? data.get(key)! : null;
    },
    key(index) {
      return Array.from(data.keys())[index] ?? null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}

describe("module shims", () => {
  it("keeps the constants shim aligned with the folder exports", () => {
    expect(constantsShim.INITIAL_EQUIPMENT).toEqual(INITIAL_EQUIPMENT);
    expect(constantsShim.INITIAL_PLAYER).toEqual(INITIAL_PLAYER);
    expect(constantsShim.TRAIN_STAT_DISPLAY_KEYS).toEqual(TRAIN_STAT_DISPLAY_KEYS);
  });

  it("keeps the persistence shim aligned with the folder exports", () => {
    expect(persistenceShim.migrateGameState).toBe(migrateGameState);
    expect(persistenceShim.loadGameState).toBe(loadGameState);
    expect(persistenceShim.saveGameState).toBe(saveGameState);
    expect(persistenceShim.clearGameState).toBe(clearGameState);
  });
});

describe("migrateGameState", () => {
  it("merges saved player data over defaults and preserves all equipment slots", () => {
    const save = migrateGameState({
      player: {
        name: "測試角鬥士",
        gold: 999,
        equipment: {
          weapon: { uid: "blade-1", name: "短劍" },
        },
      },
      inventory: [{ uid: "loot-1", name: "戰利品" }],
    });

    expect(save.player.name).toBe("測試角鬥士");
    expect(save.player.gold).toBe(999);
    expect(save.player.equipment).toEqual({
      ...INITIAL_EQUIPMENT,
      weapon: { uid: "blade-1", name: "短劍" },
    });
    expect(save.inventory).toEqual([{ uid: "loot-1", name: "戰利品" }]);
  });

  it("falls back safely when provided payloads are malformed", () => {
    const save = migrateGameState({
      player: "bad payload",
      inventory: { not: "an array" },
    });

    expect(save.player).toEqual(INITIAL_PLAYER);
    expect(save.inventory).toEqual([]);
  });

  it("falls back to defaults for invalid scalar player field types", () => {
    const save = migrateGameState({
      player: {
        name: 123,
        level: "9",
        gold: Number.NaN,
        attack: Infinity,
        defense: 14,
      },
    });

    expect(save.player.name).toBe(INITIAL_PLAYER.name);
    expect(save.player.level).toBe(INITIAL_PLAYER.level);
    expect(save.player.gold).toBe(INITIAL_PLAYER.gold);
    expect(save.player.attack).toBe(INITIAL_PLAYER.attack);
    expect(save.player.defense).toBe(14);
  });

  it("ignores unknown equipment slots during migration", () => {
    const save = migrateGameState({
      player: {
        equipment: {
          weapon: { uid: "blade-1", name: "短劍" },
          relic: { uid: "relic-1", name: "未知聖物" },
        },
      },
    });

    expect(save.player.equipment).toEqual({
      ...INITIAL_EQUIPMENT,
      weapon: { uid: "blade-1", name: "短劍" },
    });
    expect("relic" in save.player.equipment).toBe(false);
  });

  it("keeps only object inventory entries during migration", () => {
    const save = migrateGameState({
      inventory: [
        { uid: "loot-1", name: "戰利品" },
        null,
        "bad-entry",
        7,
        { uid: "loot-2", name: "皮甲" },
      ],
    });

    expect(save.inventory).toEqual([
      { uid: "loot-1", name: "戰利品" },
      { uid: "loot-2", name: "皮甲" },
    ]);
  });

  it("preserves player monster kill counters when provided as numeric map", () => {
    const save = migrateGameState({
      player: {
        monsterKills: {
          wolf: 7,
          goblin: 3,
        },
      },
    });

    expect(save.player.monsterKills).toEqual({ wolf: 7, goblin: 3 });
  });

  it("falls back monster kill counters when payload has invalid values", () => {
    const save = migrateGameState({
      player: {
        monsterKills: {
          wolf: "7",
          goblin: Number.NaN,
        },
      },
    });

    expect(save.player.monsterKills).toEqual({});
  });
});

describe("loadGameState", () => {
  it("returns migration-safe defaults when storage is empty", () => {
    const save = loadGameState(createStorage());

    expect(save.player).toEqual(INITIAL_PLAYER);
    expect(save.inventory).toEqual([]);
  });

  it("loads legacy g_pl and g_inv data through the migration boundary", () => {
    const storage = createStorage({
      g_pl: JSON.stringify({
        name: "測試角鬥士",
        gold: 999,
        equipment: {
          weapon: { uid: "blade-1", name: "短劍" },
        },
      }),
      g_inv: JSON.stringify([{ uid: "loot-1", name: "戰利品" }]),
    });

    const save = loadGameState(storage);

    expect(save.player.name).toBe("測試角鬥士");
    expect(save.player.gold).toBe(999);
    expect(save.player.equipment).toEqual({
      ...INITIAL_EQUIPMENT,
      weapon: { uid: "blade-1", name: "短劍" },
    });
    expect(save.inventory).toEqual([{ uid: "loot-1", name: "戰利品" }]);
  });

  it("falls back safely when stored payloads are malformed", () => {
    const storage = createStorage({
      g_pl: "{bad json",
      g_inv: JSON.stringify({ not: "an array" }),
    });

    const save = loadGameState(storage);

    expect(save.player).toEqual(INITIAL_PLAYER);
    expect(save.inventory).toEqual([]);
  });
});

describe("saveGameState", () => {
  it("writes the canonical save keys", () => {
    const storage = createStorage();
    const player = {
      ...INITIAL_PLAYER,
      gold: 321,
      equipment: {
        ...INITIAL_EQUIPMENT,
        weapon: { uid: "blade-2", name: "訓練劍" },
      },
    };
    const inventory = [{ uid: "loot-2", name: "皮甲" }];

    saveGameState({ player, inventory }, storage);

    expect(storage.getItem("g_pl")).toBe(JSON.stringify(player));
    expect(storage.getItem("g_inv")).toBe(JSON.stringify(inventory));
  });
});

describe("clearGameState", () => {
  it("removes the canonical save keys", () => {
    const storage = createStorage({
      g_pl: JSON.stringify(INITIAL_PLAYER),
      g_inv: JSON.stringify([]),
    });

    clearGameState(storage);

    expect(storage.getItem("g_pl")).toBeNull();
    expect(storage.getItem("g_inv")).toBeNull();
  });
});
