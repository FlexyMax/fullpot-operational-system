import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BUCKET, REGION, PREFIX, getS3, resetCache } from "../_cache";

// POST /api/products/images/upload — multipart/form-data: file (Blob), product_uq (string)
// Auto-numbers: finds highest existing -{n} for this product, uploads as -{n+1}
// Sets ACL public-read so images are accessible without signed URL too
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData  = await req.formData();
        const file      = formData.get("file") as File | null;
        const productUq = String(formData.get("product_uq") || "").trim().toUpperCase();

        if (!file)      return NextResponse.json({ error: "No file provided" },       { status: 400 });
        if (!productUq) return NextResponse.json({ error: "No product_uq provided" }, { status: 400 });

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type))
            return NextResponse.json({ error: "Only JPG, PNG, WEBP allowed" }, { status: 400 });

        const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";

        const { ListObjectsV2Command, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const s3 = await getS3();

        // Find next available number
        const listed = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: `${PREFIX}${productUq}-`,
        }));
        const numRe = /-(\d+)\.[^.]+$/;
        let maxNum = 0;
        for (const obj of listed.Contents ?? []) {
            const m = (obj.Key as string).match(numRe);
            if (m) maxNum = Math.max(maxNum, parseInt(m[1]));
        }
        const nextNum = maxNum + 1;
        const key = `${PREFIX}${productUq}-${nextNum}.${ext}`;

        const bytes = await file.arrayBuffer();
        await s3.send(new PutObjectCommand({
            Bucket:      BUCKET,
            Key:         key,
            Body:        Buffer.from(bytes),
            ContentType: file.type,
            ACL:         "public-read",
        }));

        resetCache();

        const publicUrl = `https://${BUCKET}.${REGION}.digitaloceanspaces.com/${key}`;
        return NextResponse.json({ url: publicUrl, number: nextNum });
    } catch (err: any) {
        console.error("[products/images/upload]", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
