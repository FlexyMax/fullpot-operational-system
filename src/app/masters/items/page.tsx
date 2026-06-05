"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { cn } from "@/lib/utils";
import Tab1 from "./Tab1";
import Tab2 from "./Tab2";
import Tab3 from "./Tab3";

export default function ItemsSetupPage() {
    const { status } = useSession();
    const router = useRouter();

    const [activeTab,    setActiveTab]    = useState<1|2|3>(1);
    const [selSubclass,  setSelSubclass]  = useState<any>(null);
    const [selVariety,   setSelVariety]   = useState<any>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Items" />

            {/* Tab bar — below header */}
            <div className="h-10 bg-[#374151] flex items-end px-2 gap-0.5 shrink-0">
                {([1,2,3] as const).map(tab => (
                    <button key={tab} onClick={()=>setActiveTab(tab)}
                        className={cn("px-4 h-7 text-xs font-black uppercase tracking-wider rounded transition-all",
                            activeTab===tab
                                ? "bg-[#f4f6f8] text-[#FB7506]"
                                : "text-gray-400 hover:text-white hover:bg-white/10")}>
                        {tab===1 ? "Tab 1 — Hierarchy" : tab===2 ? "Tab 2 — All Products" : "Tab 3 — Varieties / Components"}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 1 && (
                <Tab1
                    selSubclass={selSubclass}
                    setSelSubclass={setSelSubclass}
                    selVariety={selVariety}
                    setSelVariety={setSelVariety}
                />
            )}
            {activeTab === 2 && <Tab2/>}
            {activeTab === 3 && (
                <Tab3
                    selSubclass={selSubclass}
                    selVariety={selVariety}
                    setSelVariety={setSelVariety}
                />
            )}

            <AppFooter areaLabel="Masters" />
        </div>
    );
}
