"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Construction, WifiOff } from "lucide-react";

export default function UnderConstructionPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#0a0a0d] text-white flex flex-col items-center justify-center p-8">
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-orange-500/20 blur-[100px] rounded-full"></div>
                <div className="relative bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-3xl">
                    <Construction className="w-24 h-24 text-orange-500 animate-pulse" />
                </div>
            </div>

            <div className="text-center space-y-6 max-w-lg">
                <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                    Module Under <span className="text-orange-500">Construction</span>
                </h1>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] leading-relaxed">
                    The requested system node is currently being decrypted and synchronized.
                    Please return to the main hub for active operations.
                </p>
            </div>

            <div className="mt-12 group">
                <button
                    onClick={() => router.push('/menu')}
                    className="flex items-center gap-4 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-orange-500/20 active:scale-95"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Hub
                </button>
            </div>

            <div className="fixed bottom-12 flex items-center gap-3 text-white/10">
                <WifiOff size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Protocol: Waiting for Implementation</span>
            </div>
        </div>
    );
}
