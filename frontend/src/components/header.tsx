"use client";
import React from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";


export default function Header() {
  return (
    <div className="w-full h-[72px] flex justify-end items-center px-16 z-20">
      <Link href={"/create-order"}>
        <Button className="mr-2" color="secondary">
          Create Order
        </Button>
      </Link>
      <ConnectButton></ConnectButton>
    </div>
  );
}
