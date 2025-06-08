"use client";

import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import Providers from "@/app/providers";
import Header from "@/components/header";
import { useEffect, useMemo, useState } from "react";
import { PreMarketTokenProvider } from "@/providers/preMarketTokenProvider";

// assets
import { usePathname } from "next/navigation";
import { TokenProvider } from "@/providers/tokenInfoProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


enum SidebarTab {
  PREMARKET = "preMarket",
  MYORDERS = "myOrders",
  MYTRADES = "myTrades",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState<SidebarTab>();

  const sidebarItem = useMemo(
    () => [

      {
        name: "preMarket",
        icon: '',
        content: "Pre Markets",
        link: "/pre-markets",
        tooltip: "",
        id: SidebarTab.PREMARKET,
      },
      {
        name: "myOrders",
        content: "My Orders",
        icon: '',
        link: "/my-orders",
        tooltip: "",
        id: SidebarTab.MYORDERS,
      },
      {
        name: "myTrades",
        content: "My Trades",
        icon: '',
        link: "/my-trades",
        tooltip: "",
        id: SidebarTab.MYTRADES,
      },
      // {
      //   name: "faucet",
      //   content: "Faucet",
      //   icon: IconDrip,
      //   link: "/faucet",
      //   tooltip: "",
      //   id: SidebarTab.FAUCET,
      // },
    ],
    []
  );

  useEffect(() => {
    const targetTab = sidebarItem.find((item) => {
      return item.link === pathname;
    });
    if (targetTab) {
      setCurrentTab(targetTab.id);
    }
  }, [pathname, sidebarItem]);

  return (
    <html className="bg-black" lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PreMarketTokenProvider>
            <TokenProvider>
              {pathname === "/" ? (
                <div className="w-full h-full">{children}</div>
              ) : (
                <div className="relative h-screen w-screen flex bg-gradient-to-b from-[#221531] to-black">
                  <div className="relative w-[220px] min-w-[220px] h-full top-0 left-0 flex flex-col items-center bg-[#1C1F24] px-3 py-4">
                    <div className="w-full flex items-center justify-start mb-4">
                 
                      <div className="text-white text-medium font-bold">
                        Simple Market
                      </div>
                    </div>
                    {sidebarItem.map((item) => {
                      return (
                        <div
                          key={item.name}
                          className="relative flex justify-between items-center h-[36px] w-full hover:cursor-pointer my-3"
                          onClick={() => setCurrentTab(item.id)}
                        >
                          <Link href={item.link} className="flex w-ful">
                            {currentTab === item.id && (
                              // bg-gradient-to-r from-purple-500/30 to-transparent
                              <div className="absolute z-0 left-[-12px] top-0 w-full h-full">
                                <div className="absolute top-0 left-0 w-[2px] h-full bg-purple-500"></div>
                              </div>
                            )}
                            <div className="flex items-center w-full z-10 text-[rgba(255,255,255,0.5)] text-base hover:text-white duration-150">
                              <Image
                                className=" h-4 w-4 ml-2 mr-2"
                                src={item.icon}
                                alt={item.name}
                              ></Image>
                              {item.content}
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  <div className="relative flex flex-1 h-full flex-col">
                    <div className="absolute z-10 left-0 top-0 w-full border-b-1 border-white/10">
                      <Header></Header>
                    </div>
                    <div className="w-full h-full pt-[72px]">{children}</div>
                  </div>
                </div>
              )}
            </TokenProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              theme="light"
              hideProgressBar={true}
              newestOnTop={false}
              closeOnClick={false}
              closeButton={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </PreMarketTokenProvider>
        </Providers>
      </body>
    </html>
  );
}
