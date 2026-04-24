import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ShopTab } from "./ShopTab";

it("renders sell-threshold bulk sell controls in sell tab", () => {
  const onThresholdChange = vi.fn();
  const onSellJunk = vi.fn();

  render(
    <ShopTab
      playerGold={1000}
      playerLevel={10}
      shopTab="sell"
      shopTabOptions={[]}
      refreshShop={vi.fn()}
      refreshAuction={vi.fn()}
      refreshShopCost={50}
      shopFilterOptions={[]}
      potionShopItems={[]}
      shopDisplayItems={[]}
      auctionDisplayItems={[]}
      hasSellableInventory={false}
      sellListItems={[]}
      sortInventory={vi.fn()}
      sellThreshold="normal"
      onSellThresholdChange={onThresholdChange}
      sellJunk={onSellJunk}
    />,
  );

  fireEvent.change(screen.getByRole("combobox"), { target: { value: "magic" } });
  expect(onThresholdChange).toHaveBeenCalledWith("magic");

  fireEvent.click(screen.getByRole("button", { name: "🗑 一鍵賣出" }));
  expect(onSellJunk).toHaveBeenCalledTimes(1);
});
