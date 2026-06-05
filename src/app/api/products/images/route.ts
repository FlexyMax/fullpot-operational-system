import { NextRequest, NextResponse } from "next/server";

const DEFAULT_IMAGE = "https://flexymax.nyc3.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/NoImageAvailable2.png";
const BUCKET  = process.env.DO_SPACES_BUCKET   || "flexymax";
const REGION  = process.env.DO_SPACES_REGION   || "nyc3";
const ENDPOINT = process.env.DO_SPACES_ENDPOINT || "https://nyc3.digitaloceanspaces.com";
const EXTS    = ["jpg", "jpeg", "png", "webp"];
const PREFIX  = "Fullpot/Product_Images/";

// In-memory signed-URL cache: product_uq → { url, expiresAt }
const urlCache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_TTL = 55 * 60 * 1000; // 55 min (signed URLs expire in 60)

async function getS3() {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
        region:   REGION,
        endpoint: ENDPOINT,
        credentials: {
            accessKeyId:     process.env.DO_SPACES_KEY    || "",
            secretAccessKey: process.env.DO_SPACES_SECRET || "",
        },
        forcePathStyle: false,
    });
}

// Find the actual key for a product_uq by trying extensions with HeadObject
// Much faster than listing all 5k files — one HEAD per extension until found
async function resolveKey(s3: any, productUq: string): Promise<string | null> {
    const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
    const norm = productUq.trim().toUpperCase();
    for (const ext of EXTS) {
        const key = `${PREFIX}${norm}-1.${ext}`;
        try {
            await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
            return key;
        } catch { /* try next extension */ }
    }
    return null;
}

// Generate a signed URL for a resolved key
async function signKey(s3: any, key: string): Promise<string> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl }    = await import("@aws-sdk/s3-request-presigner");
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
}

// POST /api/products/images  { productUqs: string[] }
// Returns { images: { [uq]: signedUrl | DEFAULT_IMAGE } }
export async function POST(req: NextRequest) {
    try {
        const { productUqs = [] }: { productUqs: string[] } = await req.json();
        if (!productUqs.length) return NextResponse.json({ images: {} });

        const now    = Date.now();
        const s3     = await getS3();
        const images: Record<string, string> = {};

        await Promise.all(productUqs.map(async (uq) => {
            if (!uq) return;
            const norm = uq.trim().toUpperCase();

            // Return cached URL if still fresh
            const cached = urlCache.get(norm);
            if (cached && cached.expiresAt > now) {
                images[uq] = cached.url;
                return;
            }

            // Find the actual file and sign it
            const key = await resolveKey(s3, norm);
            if (key) {
                const url = await signKey(s3, key);
                urlCache.set(norm, { url, expiresAt: now + CACHE_TTL });
                images[uq] = url;
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
