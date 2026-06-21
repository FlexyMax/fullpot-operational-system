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
        <div className="flex flex-col h-[100dvh] bg-[#FBF9F8] overflow-hidden font-sans text-[#333]">

            <AppHeader title="Items" />

            {/* Tab bar — below header */}
            <div className="h-10 bg-[#F5F3F3] border-b border-[#DBD9D9] flex items-end px-2 gap-0.5 shrink-0">
                {([1,2,3] as const).map(tab => (
                    <button key={tab} onClick={()=>setActiveTab(tab)}
                        className={cn("flex items-center px-4 h-8 text-xs font-black uppercase tracking-wider rounded-t transition-all",
                            activeTab===tab
                                ? "bg-white text-[#FB7506] border-b-2 border-[#FB7506]"
                                : "text-gray-500 hover:text-[#FB7506] hover:bg-white/60")}>
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
