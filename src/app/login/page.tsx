"use client";

import { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, User, AlertCircle, Loader2, ShieldCheck, KeyRound, Power, Mail, RotateCcw, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

type Step = "access" | "verify";

export default function LoginPage() {
    const [step,        setStep]        = useState<Step>("access");
    const [username,    setUsername]    = useState("");
    const [password,    setPassword]    = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [code,        setCode]        = useState(["", "", "", "", "", ""]);
    const [error,       setError]       = useState("");
    const [loading,     setLoading]     = useState(false);
    const [resending,   setResending]   = useState(false);

    const codeRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    const router      = useRouter();
    const setUser     = useAuthStore((state) => state.setUser);
    const queryClient = useQueryClient();

    /* ── Step 1: validate credentials + send email code (or bypass if U2FA off) ── */
    const handleAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res  = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Authentication failed"); return; }

            // U2FA disabled: preAuthToken returned directly — skip step 2
            if (!data.u2faRequired && data.preAuthToken) {
                const result = await signIn("credentials", {
                    username,
                    preAuthToken: data.preAuthToken,
                    redirect: false,
                });
                if (result?.error) { setError("Sign-in failed. Please try again."); return; }
                queryClient.clear();
                const sRes    = await fetch("/api/auth/session");
                const session = await sRes.json();
                if (session?.user) { setUser(session.user); router.push("/menu"); }
                return;
            }

            // U2FA enabled: go to code verification step
            setMaskedEmail(data.maskedEmail);
            setCode(["", "", "", "", "", ""]);
            setStep("verify");
            setTimeout(() => codeRefs[0].current?.focus(), 50);
        } catch {
            setError("Server connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Step 2: verify code + sign in ──────────────────────────────── */
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");
        if (fullCode.length < 6) { setError("Please enter the complete 6-digit code"); return; }
        setError("");
        setLoading(true);
        try {
            // Verify the code
            const vRes  = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, code: fullCode }),
            });
            const vData = await vRes.json();
            if (!vRes.ok) { setError(vData.error || "Invalid code"); return; }

            // Complete sign-in with the pre-auth token
            const result = await signIn("credentials", {
                username,
                preAuthToken: vData.preAuthToken,
                redirect: false,
            });
            if (result?.error) { setError("Sign-in failed. Please try again."); return; }

            // Clear any cached queries from a previous user session
            queryClient.clear();
            const sRes     = await fetch("/api/auth/session");
            const session  = await sRes.json();
            if (session?.user) { setUser(session.user); router.push("/menu"); }
        } catch {
            setError("Server connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Resend code ─────────────────────────────────────────────────── */
    const handleResend = async () => {
        setResending(true);
        setError("");
        try {
            const res  = await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to resend"); return; }
            setCode(["", "", "", "", "", ""]);
            setTimeout(() => codeRefs[0].current?.focus(), 50);
        } catch {
            setError("Failed to resend. Please try again.");
        } finally {
            setResending(false);
        }
    };

    /* ── 6-box code input handlers ───────────────────────────────────── */
    const handleCodeChange = (idx: number, val: string) => {
        const digit = val.replace(/\D/g, "").slice(-1);
        const next  = [...code];
        next[idx]   = digit;
        setCode(next);
        if (digit && idx < 5) codeRefs[idx + 1].current?.focus();
    };

    const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[idx] && idx > 0) {
            codeRefs[idx - 1].current?.focus();
        }
    };

    const handleCodePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
        const next   = [...code];
        digits.forEach((d, i) => { next[i] = d; });
        setCode(next);
        codeRefs[Math.min(digits.length, 5)].current?.focus();
    };

    return (
        <>
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
                .code-box {
                    background: rgba(34,31,31,0.9);
                    border: 1px solid rgba(88,66,54,0.35);
                    color: #FB7506;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 22px;
                    font-weight: 900;
                    text-align: center;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    caret-color: #FB7506;
                }
                .code-box:focus {
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

                {/* ── Background ──────────────────────────────────────────── */}
                <div className="fixed inset-0 pointer-events-none">
                    <img
                        src="https://flexymax.nyc3.cdn.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/BackgroundFlexyLoginWarehouseArm.png"
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'rgba(10,8,8,0.45)' }} />
                    <div className="absolute inset-0 login-grid-bg" />
                </div>

                {/* ── Ambient glow ─────────────────────────────────────────── */}
                <div className="fixed top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: 'rgba(251,117,6,0.07)', filter: 'blur(90px)' }} />

                {/* ── Header ───────────────────────────────────────────────── */}
                <header className="fixed top-0 z-50 w-full h-16 bg-[#333030] flex items-center justify-between px-4 md:px-6 lg:px-12">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center"
                            style={{ background: '#FB7506' }}>
                            <span className="text-white font-black text-[10px] md:text-xs leading-none">FOS</span>
                        </div>
                        <div className="w-px h-4 md:h-5 bg-white/20" />
                        <span className="font-bold text-white text-xl md:text-2xl uppercase tracking-tight hidden md:inline">FullPot Operational System</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">System Online</span>
                        </div>
                        <button title="Power"
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FB7506] hover:bg-[#ff8c2a] text-white transition-all shadow-sm hover:shadow-md">
                            <Power size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                {/* ── Main panel ───────────────────────────────────────────── */}
                <main className="flex-1 flex items-center justify-center lg:justify-end px-4 lg:pr-20 xl:pr-32 pt-16 pb-16 md:pt-20 md:pb-24">
                    <div className="w-full max-w-[420px]">
                        <div className="glass-panel corner-tl corner-br relative p-8 md:p-10 overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none"
                                style={{ background: 'rgba(251,117,6,0.08)', filter: 'blur(50px)' }} />

                            <div className="relative z-10 flex flex-col items-center">

                                {/* Brand */}
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

                                {/* Step indicator */}
                                <div className="flex items-center gap-3 mb-7 w-full justify-center">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${step === "access" ? "bg-[#FB7506] text-white" : "bg-[#FB7506]/20 text-[#FB7506]"}`}>1</div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${step === "access" ? "text-[#FB7506]" : "text-[#584236]"}`}>Access</span>
                                    </div>
                                    <div className="h-px flex-1 max-w-[40px]" style={{ background: 'rgba(251,117,6,0.25)' }} />
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${step === "verify" ? "bg-[#FB7506] text-white" : "bg-[#2a2727] text-[#584236]"}`}>2</div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${step === "verify" ? "text-[#FB7506]" : "text-[#584236]"}`}>Verify</span>
                                    </div>
                                </div>

                                {/* ── STEP 1: ACCESS ────────────────────────────────── */}
                                {step === "access" && (
                                    <form onSubmit={handleAccess} className="w-full space-y-5">
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

                                        {error && <ErrorBox message={error} />}

                                        <button type="submit" disabled={loading}
                                            className="login-btn w-full py-3.5 text-white font-black text-xs uppercase tracking-[0.18em] rounded flex items-center justify-center gap-2.5 mt-2">
                                            {loading
                                                ? <><Loader2 className="animate-spin" size={14} /> Verifying...</>
                                                : <><Lock size={13} /> Authorize Access</>}
                                        </button>
                                    </form>
                                )}

                                {/* ── STEP 2: VERIFY ────────────────────────────────── */}
                                {step === "verify" && (
                                    <form onSubmit={handleVerify} className="w-full space-y-5">

                                        {/* Email hint */}
                                        <div className="flex items-center gap-2 p-3 rounded"
                                            style={{ background: 'rgba(251,117,6,0.08)', border: '1px solid rgba(251,117,6,0.2)' }}>
                                            <Mail size={13} className="text-[#FB7506] shrink-0" />
                                            <p className="text-[11px] font-bold text-[#a78b7c] leading-tight">
                                                A 6-digit code was sent to <span className="text-[#FB7506]">{maskedEmail}</span>
                                            </p>
                                        </div>

                                        {/* 6-digit code boxes */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#a78b7c] uppercase tracking-[0.12em] ml-0.5">
                                                Verification Code
                                            </label>
                                            <div className="flex gap-2 justify-between">
                                                {code.map((digit, idx) => (
                                                    <input
                                                        key={idx}
                                                        ref={codeRefs[idx]}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={e => handleCodeChange(idx, e.target.value)}
                                                        onKeyDown={e => handleCodeKeyDown(idx, e)}
                                                        onPaste={idx === 0 ? handleCodePaste : undefined}
                                                        className="code-box w-[14%] aspect-square rounded"
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {error && <ErrorBox message={error} />}

                                        <button type="submit" disabled={loading}
                                            className="login-btn w-full py-3.5 text-white font-black text-xs uppercase tracking-[0.18em] rounded flex items-center justify-center gap-2.5">
                                            {loading
                                                ? <><Loader2 className="animate-spin" size={14} /> Verifying...</>
                                                : <><ShieldCheck size={13} /> Confirm Access</>}
                                        </button>

                                        {/* Back + Resend */}
                                        <div className="flex items-center justify-between pt-1">
                                            <button type="button" onClick={() => { setStep("access"); setError(""); }}
                                                className="flex items-center gap-1 text-[10px] font-bold text-[#584236] hover:text-[#a78b7c] uppercase tracking-wider transition-colors">
                                                <ArrowLeft size={11} /> Back
                                            </button>
                                            <button type="button" onClick={handleResend} disabled={resending}
                                                className="flex items-center gap-1 text-[10px] font-bold text-[#584236] hover:text-[#FB7506] uppercase tracking-wider transition-colors disabled:opacity-50">
                                                <RotateCcw size={11} className={resending ? "animate-spin" : ""} />
                                                {resending ? "Sending..." : "Resend Code"}
                                            </button>
                                        </div>
                                    </form>
                                )}

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
                <footer className="fixed bottom-0 z-50 w-full h-10 bg-[#333030] flex items-center justify-center px-6">
                    <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.14em]">
                        FlexyMax ® {new Date().getFullYear()}
                    </span>
                </footer>
            </div>
        </>
    );
}

function ErrorBox({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-2 p-3 rounded"
            style={{ background: 'rgba(147,0,10,0.2)', border: '1px solid rgba(255,180,171,0.2)' }}>
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={14} />
            <p className="text-[11px] font-bold text-red-400 leading-tight">{message}</p>
        </div>
    );
}
