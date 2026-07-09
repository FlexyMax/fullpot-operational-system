// Server-side in-memory stores for 2-step login (module-level singletons per process)
import { randomUUID } from "crypto";

interface CodeEntry {
    code: string;
    unico: string;
    name: string;
    email: string;
    expires: number;
}

interface PreAuthEntry {
    token: string;
    unico: string;
    name: string;
    email: string;
    expires: number;
}

const codeStore    = new Map<string, CodeEntry>();
const preAuthStore = new Map<string, PreAuthEntry>();

function cleanup() {
    const now = Date.now();
    for (const [k, v] of codeStore)    if (v.expires < now) codeStore.delete(k);
    for (const [k, v] of preAuthStore) if (v.expires < now) preAuthStore.delete(k);
}

export function storeCode(username: string, code: string, unico: string, name: string, email: string) {
    cleanup();
    codeStore.set(username.toLowerCase(), {
        code, unico, name, email,
        expires: Date.now() + 10 * 60 * 1000,
    });
}

export function verifyAndConsumeCode(username: string, code: string): CodeEntry | null {
    cleanup();
    const key   = username.toLowerCase();
    const entry = codeStore.get(key);
    if (!entry || entry.expires < Date.now() || entry.code !== code.trim()) return null;
    codeStore.delete(key);
    return entry;
}

export function storePreAuth(username: string, unico: string, name: string, email: string): string {
    const token = randomUUID();
    preAuthStore.set(username.toLowerCase(), {
        token, unico, name, email,
        expires: Date.now() + 90 * 1000, // 90 seconds to complete signIn
    });
    return token;
}

export function consumePreAuth(username: string, token: string): PreAuthEntry | null {
    cleanup();
    const key   = username.toLowerCase();
    const entry = preAuthStore.get(key);
    if (!entry || entry.expires < Date.now() || entry.token !== token) return null;
    preAuthStore.delete(key);
    return entry;
}
