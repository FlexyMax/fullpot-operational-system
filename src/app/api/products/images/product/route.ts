import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureCache, getS3, signKey } from "../_cache";

// GET /api/products/images/product?uq=XXXXX
// Returns all signed image URLs for a single product, sorted by number (-1, -2, -3…)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const uq = req.nextUrl.searchParams.get("uq") ?? "";
        if (!uq) return NextResponse.json({ images: [] });

        const norm = uq.trim().toUpperCase();
        const [cache, s3] = await Promise.all([ensureCache(), getS3()]);
        const keys = cache.get(norm) ?? [];
        const images = await Promise.all(keys.map(k => signKey(s3, k).catch(() => null)));
        return NextResponse.json({ images: images.filter(Boolean) });
    } catch (err: any) {
        console.error("[products/images/product]", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
