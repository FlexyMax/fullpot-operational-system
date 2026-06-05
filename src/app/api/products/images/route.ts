import { NextRequest, NextResponse } from "next/server";

// Tell Vercel this function can run up to 60 seconds (Pro plan)
export const maxDuration = 60;

const DEFAULT_IMAGE = "https://flexymax.nyc3.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/NoImageAvailable2.png";
const BUCKET   = process.env.DO_SPACES_BUCKET   || "flexymax";
const REGION   = process.env.DO_SPACES_REGION   || "nyc3";
const ENDPOINT = process.env.DO_SPACES_ENDPOINT || "https://nyc3.digitaloceanspaces.com";
const PREFIX   = "Fullpot/Product_Images/";
const PREFIX_LEN = PREFIX.length; // 23

// Module-level cache — persists across warm Vercel invocations (same as customer portal)
let keysCache: Map<string, string[]> | null = null;
let cacheAt   = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 min

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

// Build full key cache by listing all objects under Fullpot/Product_Images/
// Same approach as customer portal — ~5 pagination pages for 5k files, takes ~2s
async function buildCache(): Promise<Map<string, string[]>> {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const s3     = await getS3();
    const cache  = new Map<string, string[]>();
    let   token: string | undefined;

    do {
        const res: any = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET, Prefix: PREFIX,
            ContinuationToken: token, MaxKeys: 1000,
        }));
        for (const obj of res.Contents ?? []) {
            const key      = obj.Key as string;
            if (!key || key.length <= PREFIX_LEN) continue;
            const fileName = key.substring(PREFIX_LEN);
            // Extract product_uq: everything before the first '-' or '.'
            const productUq = fileName.split(/[-.]/, 1)[0].trim().toUpperCase();
            if (!productUq) continue;
            if (!cache.has(productUq)) cache.set(productUq, []);
            cache.get(productUq)!.push(key);
        }
        token = res.NextContinuationToken;
    } while (token);

    // Prioritise -1.ext files (same as customer portal)
    const mainRe = /-1\.(jpg|jpeg|png|webp)$/i;
    for (const keys of cache.values()) {
        keys.sort((a, b) => {
            const am = mainRe.test(a), bm = mainRe.test(b);
            return am === bm ? a.localeCompare(b) : am ? -1 : 1;
        });
    }
    return cache;
}

async function ensureCache() {
    if (!keysCache || Date.now() - cacheAt > CACHE_TTL) {
        keysCache = await buildCache();
        cacheAt   = Date.now();
    }
    return keysCache;
}

async function signKey(s3: any, key: string): Promise<string> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl }    = await import("@aws-sdk/s3-request-presigner");
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
}

// POST /api/products/images { productUqs: string[] }
// Returns { images: { [uq]: signedUrl | DEFAULT_IMAGE } }
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
                try {
                    images[uq] = await signKey(s3, keys[0]);
                } catch {
                    images[uq] = DEFAULT_IMAGE;
                }
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
