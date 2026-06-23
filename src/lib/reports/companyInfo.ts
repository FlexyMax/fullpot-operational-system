import { executeQuery } from "@/lib/db";

export interface CompanyInfo {
    name: string;
    address: string;
    cityStateZip: string;
    phone: string;
    fax: string;
    email: string;
}

let cached: CompanyInfo | null = null;
let cachedAt = 0;
const TTL_MS = 10 * 60 * 1000;

const t = (v: any) => String(v ?? "").trim();

export async function getCompanyInfo(): Promise<CompanyInfo> {
    if (cached && Date.now() - cachedAt < TTL_MS) return cached;
    const r = await executeQuery(
        `SELECT TOP 1 d_company, d_iaddress, d_icity, d_istate, d_izip, d_iphone, d_ifax, d_iemail1 FROM flower_definitions`
    );
    const row = r.recordset?.[0] ?? {};
    cached = {
        name: t(row.d_company) || "FullPot",
        address: t(row.d_iaddress),
        cityStateZip: [t(row.d_icity), t(row.d_istate)].filter(Boolean).join(", ") + (t(row.d_izip) ? ` ${t(row.d_izip)}` : ""),
        phone: t(row.d_iphone),
        fax: t(row.d_ifax),
        email: t(row.d_iemail1),
    };
    cachedAt = Date.now();
    return cached;
}
