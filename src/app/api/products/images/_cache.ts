// Shared S3 cache for product images — imported by images/route.ts, images/product/route.ts, images/upload/route.ts

export const BUCKET   = process.env.DO_SPACES_BUCKET   || "flexymax";
export const REGION   = process.env.DO_SPACES_REGION   || "nyc3";
export const ENDPOINT = process.env.DO_SPACES_ENDPOINT || "https://nyc3.digitaloceanspaces.com";
export const PREFIX   = "Fullpot/Product_Images/";
export const PREFIX_LEN = PREFIX.length;

// Module-level cache — persists across warm Vercel invocations
let keysCache: Map<string, string[]> | null = null;
let cacheAt   = 0;
const CACHE_TTL = 30 * 60 * 1000;

export function resetCache() {
    keysCache = null;
    cacheAt   = 0;
}

export async function getS3() {
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
            const key       = obj.Key as string;
            if (!key || key.length <= PREFIX_LEN) continue;
            const fileName  = key.substring(PREFIX_LEN);
            const productUq = fileName.split(/[-.]/, 1)[0].trim().toUpperCase();
            if (!productUq) continue;
            if (!cache.has(productUq)) cache.set(productUq, []);
            cache.get(productUq)!.push(key);
        }
        token = res.NextContinuationToken;
    } while (token);

    // Sort: -1.ext first, then ascending by number
    const numRe = /-(\d+)\.[^.]+$/;
    for (const keys of cache.values()) {
        keys.sort((a, b) => {
            const na = parseInt(a.match(numRe)?.[1] ?? "99999");
            const nb = parseInt(b.match(numRe)?.[1] ?? "99999");
            return na - nb;
        });
    }
    return cache;
}

export async function ensureCache(): Promise<Map<string, string[]>> {
    if (!keysCache || Date.now() - cacheAt > CACHE_TTL) {
        keysCache = await buildCache();
        cacheAt   = Date.now();
    }
    return keysCache;
}

export async function signKey(s3: any, key: string): Promise<string> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl }    = await import("@aws-sdk/s3-request-presigner");
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
}
