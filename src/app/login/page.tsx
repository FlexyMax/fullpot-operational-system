"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]    = useState("");
    const [loading,  setLoading]  = useState(false);
    const router  = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await signIn("credentials", { username, password, redirect: false });
            if (result?.error) {
                setError(result.error);
            } else {
                const res     = await fetch("/api/auth/session");
                const session = await res.json();
                if (session?.user) { setUser(session.user); router.push("/menu"); }
            }
        } catch {
            setError("Server connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* ── Global styles for this page ─────────────────────────────── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
                .login-grid-bg {
                    background-image:
                        linear-gradient(rgba(127,126,125,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(127,126,125,0.06) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
                .glass-panel {
                    background: rgba(18,16,16,0.72);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(167,139,124,0.18);
                }
                .corner-tl::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 22px; height: 22px;
                    border-top: 2px solid #FB7506;
                    border-left: 2px solid #FB7506;
                }
                .corner-br::after {
                    content: '';
                    position: absolute;
                    bottom: 0; right: 0;
                    width: 22px; height: 22px;
                    border-bottom: 2px solid #FB7506;
                    border-right: 2px solid #FB7506;
                }
                .dark-input {
                    background: rgba(34,31,31,0.9);
                    border: 1px solid rgba(88,66,54,0.35);
                    color: #e8e1e0;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .dark-input::placeholder { color: rgba(167,139,124,0.5); }
                .dark-input:focus {
                    outline: none;
                    border-color: #FB7506;
                    box-shadow: 0 0 0 2px rgba(251,117,6,0.15);
                }
                .login-btn {
                    background: #FB7506;
                    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
                    box-shadow: 0 8px 24px rgba(251,117,6,0.25);
                }
                .login-btn:hover:not(:disabled) { background: #e06a05; }
                .login-btn:active:not(:disabled) { transform: scale(0.98); }
                .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>

            <div className="min-h-screen bg-[#151313] flex flex-col overflow-hidden relative">

                {/* ── Background image + overlays ─────────────────────────── */}
                <div className="fixed inset-0 pointer-events-none">
                    {/* Photo — full bleed */}
                    <img
                        src="https://flexymax.nyc3.cdn.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/BackgroundFlexyLoginWarehouseArm.png"
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                    />
                    {/* Global dark veil so the whole photo is moody */}
                    <div className="absolute inset-0" style={{ background: 'rgba(10,8,8,0.45)' }} />
                    {/* Right-side gradient → darkens where the panel sits */}
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to left, rgba(12,10,10,0.82) 0%, rgba(12,10,10,0.55) 35%, rgba(12,10,10,0.10) 65%, transparent 100%)' }} />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 login-grid-bg" />
                </div>

                {/* ── Ambient glow behind panel ─────────────────────────────── */}
                <div className="fixed top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: 'rgba(251,117,6,0.07)', filter: 'blur(90px)' }} />

                {/* ── Header ───────────────────────────────────────────────── */}
                <header className="fixed top-0 z-50 w-full flex items-center justify-between px-6 md:px-12 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded flex items-center justify-center"
                            style={{ background: '#FB7506' }}>
                            <span className="text-white font-black text-[11px] leading-none">FOS</span>
                        </div>
                        <div>
                            <span className="font-black text-[#FB7506] text-xs uppercase tracking-widest">FullPot</span>
                            <span className="font-bold text-[#e8e1e0]/60 text-xs uppercase tracking-widest ml-2">Operational System</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(34,31,31,0.8)', border: '1px solid rgba(88,66,54,0.3)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-[#c8c6c5] uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </header>

                {/* ── Main: right-aligned panel ────────────────────────────── */}
                <main className="flex-1 flex items-center justify-center lg:justify-end px-4 lg:pr-20 xl:pr-32 pt-20 pb-24">
                    <div className="w-full max-w-[420px]">

                        {/* Glass card with corner brackets */}
                        <div className="glass-panel corner-tl corner-br relative p-8 md:p-10 overflow-hidden">

                            {/* Subtle top glow inside card */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
                                style={{ background: 'rgba(251,117,6,0.08)', filter: 'blur(50px)' }} />

                            <div className="relative z-10 flex flex-col items-center">

                                {/* FlexyMax logo / brand */}
                                <div className="mb-7 flex flex-col items-center">
                                    <div className="flex items-baseline gap-0 mb-2 leading-none">
                                        <span className="font-black text-[#FB7506] uppercase tracking-tight"
                                            style={{ fontSize: '34px', letterSpacing: '-0.02em' }}>Flexy</span>
                                        <span className="font-black text-[#e8e1e0] uppercase tracking-tight"
                                            style={{ fontSize: '34px', letterSpacing: '-0.02em' }}>Max</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-px w-8" style={{ background: 'rgba(167,139,124,0.4)' }} />
                                        <p className="text-[9px] font-bold text-[#a78b7c] uppercase tracking-[0.22em]">
                                            Flower Operational System
                                        </p>
                                        <div className="h-px w-8" style={{ background: 'rgba(167,139,124,0.4)' }} />
                                    </div>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleLogin} className="w-full space-y-5">

                                    {/* Username */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#a78b7c] uppercase tracking-[0.12em] ml-0.5">
                                            Corporate ID
                                        </label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#584236] group-focus-within:text-[#FB7506] transition-colors z-10" size={15} />
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                className="dark-input w-full pl-11 pr-4 py-3.5 rounded"
                                                placeholder="Username"
                                                required
                                                autoComplete="username"
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-[#a78b7c] uppercase tracking-[0.12em] ml-0.5">
                                            Security Key
                                        </label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#584236] group-focus-within:text-[#FB7506] transition-colors z-10" size={15} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="dark-input w-full pl-11 pr-4 py-3.5 rounded"
                                                placeholder="••••••••"
                                                required
                                                autoComplete="current-password"
                                            />
                                        </div>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="flex items-start gap-2 p-3 rounded"
                                            style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.2)' }}>
                                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={14} />
                                            <p className="text-[11px] font-bold text-red-400 leading-tight">{error}</p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button type="submit" disabled={loading}
                                        className="login-btn w-full py-3.5 text-white font-black text-xs uppercase tracking-[0.18em] rounded flex items-center justify-center gap-2.5 mt-2">
                                        {loading ? (
                                            <><Loader2 className="animate-spin" size={14} /> Verifying...</>
                                        ) : (
                                            <><Lock size={13} /> Authorize Access</>
                                        )}
                                    </button>
                                </form>

                                {/* Security badge */}
                                <div className="mt-8 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                        style={{ background: 'rgba(44,41,41,0.8)', border: '1px solid rgba(88,66,54,0.25)' }}>
                                        <ShieldCheck size={13} className="text-[#efc054]" />
                                        <span className="text-[10px] font-bold text-[#a78b7c] uppercase tracking-[0.12em]">
                                            System Secured
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-[#584236] uppercase tracking-[0.2em]">
                                        Authorized Personnel Only
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <footer className="fixed bottom-0 z-50 w-full flex items-center justify-center px-6 py-4"
                    style={{ background: 'rgba(34,31,31,0.5)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(88,66,54,0.2)' }}>
                    <span className="text-[10px] font-bold text-[#584236] uppercase tracking-[0.12em]">
                        © 2026 FullPot Of Flowers — FOS. Flexymax ® All rights reserved.
                    </span>
                </footer>
            </div>
        </>
    );
}
