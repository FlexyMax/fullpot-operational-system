import { NextRequest, NextResponse } from "next/server";
import { ensureCache, getS3, signKey } from "./_cache";

export const maxDuration = 60;

const DEFAULT_IMAGE = "https://flexymax.nyc3.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/NoImageAvailable2.png";

// POST /api/products/images { productUqs: string[] }
// Returns { images: { [uq]: signedUrl | DEFAULT_IMAGE } } — first image per product
export async function POST(req: NextRequest) {
    try {
        const { productUqs = [] }: { productUqs: string[] } = await req.json();
        if (!productUqs.length) return NextResponse.json({ images: {} });

        const [cache, s3] = await Promise.all([ensureCache(), getS3()]);
        const images: Record<string, string> = {};

        await Promise.all(productUqs.map(async (uq) => {
            if (!uq) return;
            const norm = uq.trim().toUpperCase();
            const keys = cache.get(norm);
            if (keys?.length) {
                try   { images[uq] = await signKey(s3, keys[0]); }
                catch { images[uq] = DEFAULT_IMAGE; }
            } else {
                images[uq] = DEFAULT_IMAGE;
            }
        }));

        return NextResponse.json({ images });
    } catch (err: any) {
        console.error("[products/images]", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
