import { NextRequest, NextResponse } from "next/server";

const DEFAULT_IMAGE = "https://flexymax.nyc3.digitaloceanspaces.com/FlexyMaxApp/FlexyMaxImages/NoImageAvailable2.png";

// In-memory cache of product_uq → storage keys (30-min TTL)
let keysCache: Map<string, string[]> | null = null;
let cacheAt = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function getS3Client() {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
        region:   process.env.DO_SPACES_REGION   || "nyc3",
        endpoint: process.env.DO_SPACES_ENDPOINT || "https://nyc3.digitaloceanspaces.com",
        credentials: {
            accessKeyId:     process.env.DO_SPACES_KEY    || "",
            secretAccessKey: process.env.DO_SPACES_SECRET || "",
        },
        forcePathStyle: false,
    });
}

async function buildCache(): Promise<Map<string, string[]>> {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const s3     = await getS3Client();
    const BUCKET = process.env.DO_SPACES_BUCKET || "flexymax";
    const cache  = new Map<string, string[]>();
    let token: string | undefined;

    do {
        const cmd = new ListObjectsV2Command({
            Bucket: BUCKET, Prefix: "Fullpot/Product_Images/",
            ContinuationToken: token, MaxKeys: 1000,
        });
        const res: any = await s3.send(cmd);
        for (const obj of res.Contents ?? []) {
            const key = obj.Key as string;
            if (!key || key.length < 31) continue;
            const fileName  = key.substring(23); // strip "Fullpot/Product_Images/"
            const productUq = fileName.split(/[-.]/)[0].trim().toUpperCase();
            if (!cache.has(productUq)) cache.set(productUq, []);
            cache.get(productUq)!.push(key);
        }
        token = res.NextContinuationToken;
    } while (token);

    // Sort: prefer -1.ext files first
    const mainRe = /-1\.(jpg|jpeg|png|webp)$/i;
    for (const keys of cache.values()) {
        keys.sort((a, b) => {
            const aMain = mainRe.test(a); const bMain = mainRe.test(b);
            if (aMain && !bMain) return -1;
            if (!aMain && bMain)  return  1;
            return a.localeCompare(b);
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

async function signedUrl(key: string): Promise<string> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl }    = await import("@aws-sdk/s3-request-presigner");
    const s3     = await getS3Client();
    const BUCKET = process.env.DO_SPACES_BUCKET || "flexymax";
    const cmd    = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, cmd, { expiresIn: 3600 });
}

// POST /api/products/images  { productUqs: string[] }
// Returns { images: { [product_uq]: url } }
export async function POST(req: NextRequest) {
    try {
        const { productUqs = [] }: { productUqs: string[] } = await req.json();
        if (!productUqs.length) return NextResponse.json({ images: {} });

        const cache     = await ensureCache();
        const imageMap: Record<string, string> = {};

        await Promise.all(productUqs.map(async (uq) => {
            if (!uq) return;
            const norm = uq.trim().toUpperCase();
            const keys = cache.get(norm);
            if (keys?.length) {
                try { imageMap[uq] = await signedUrl(keys[0]); }
                catch { imageMap[uq] = DEFAULT_IMAGE; }
            } else {
                imageMap[uq] = DEFAULT_IMAGE;
            }
        }));

        return NextResponse.json({ images: imageMap });
    } catch (err: any) {
        console.error("[products/images]", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
