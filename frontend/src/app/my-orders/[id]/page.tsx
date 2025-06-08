"use client";
import { Card, Tabs, Tab } from "@heroui/react";
import { MyOrdersListComponent } from "./components/ordersTable";

export default function MyOrders() {
  return (
    <div className="h-full w-full flex justify-center text-white py-10 px-16 overflow-y-scroll">
      <Card className="p-4 w-[1000px]">
        <Tabs aria-label="Options" variant="underlined" color="secondary">
          <Tab key="buyOrder" title="Buy Orders">
            <MyOrdersListComponent orderType="buy"></MyOrdersListComponent>
          </Tab>
          <Tab key="sellOrder" title="Sell Orders">
            <MyOrdersListComponent orderType="sell"></MyOrdersListComponent>
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
}
