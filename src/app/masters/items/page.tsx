"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import Tab1 from "./Tab1";
import Tab2 from "./Tab2";
import Tab3 from "./Tab3";

export default function ItemsSetupPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab,    setActiveTab]    = useState<1|2|3>(1);
    const [selSubclass,  setSelSubclass]  = useState<any>(null);
    const [selVariety,   setSelVariety]   = useState<any>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    if (status === "loading") return null;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] overflow-hidden font-sans text-[#333]">

            {/* Header */}
            <div className="h-10 bg-[#374151] flex items-center justify-between px-4 shrink-0 text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/menu")} className="hover:bg-white/10 p-1 rounded">
                        <ArrowLeft size={15}/>
                    </button>
                    <Package size={13} className="text-[#FB7506]"/>
                    <span className="font-black text-xs uppercase tracking-widest">Items Setup</span>
                </div>
                <span className="text-gray-400 text-[10px]">User: <span className="text-white">{session?.user?.name}</span></span>
            </div>

            {/* Tab bar — below header */}
            <div className="h-9 bg-gray-800 flex items-center px-2 gap-0.5 shrink-0 border-b border-black/20">
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

            {/* Footer */}
            <div className="h-7 bg-gray-100 border-t px-4 flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-tight shrink-0">
                <div className="flex gap-4">
                    <span>Server: Production</span>
                    <span className="text-gray-300">|</span>
                    <span>Database: FullPot</span>
                </div>
                <span className="text-[#FB7506]">FOS Masters V.2.0.1</span>
            </div>
        </div>
    );
}
