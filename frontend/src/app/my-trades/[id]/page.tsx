"use client";
import { Card, Tabs, Tab } from "@heroui/react";
import { MyTradesListComponent } from "./components/tradesTable";

export default function MyTrades() {
  return (
    <div className="h-full w-full flex justify-center text-white py-10 px-16 overflow-y-scroll">
      <Card className="p-4 w-[1000px]">
        <Tabs aria-label="Options" variant="underlined" color="secondary">
          <Tab key="buyTrade" title="Buy Trades">
            <MyTradesListComponent orderType="sell"></MyTradesListComponent>
          </Tab>
          <Tab key="sellTrade" title="Sell Trades">
            <MyTradesListComponent orderType="buy"></MyTradesListComponent>
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
}
