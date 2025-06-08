
"use client";

import { useRouter } from "next/navigation";

// assets
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the pre-market page on initial load
    router.push("/pre-markets");
  }, [router]);

  return (
    <div className="relative h-screen w-screen bg-[#09101C]">
      homepage
    </div>
  );
}
