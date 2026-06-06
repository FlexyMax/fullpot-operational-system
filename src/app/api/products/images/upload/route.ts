import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const BUCKET   = process.env.DO_SPACES_BUCKET   || "flexymax";
const REGION   = process.env.DO_SPACES_REGION   || "nyc3";
const ENDPOINT = process.env.DO_SPACES_ENDPOINT || "https://nyc3.digitaloceanspaces.com";
const PREFIX   = "Fullpot/Product_Images/";

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

// POST /api/products/images/upload — multipart/form-data: file, product_uq
// Uploads to Fullpot/Product_Images/{UQ}-1.{ext} with public-read ACL
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const formData  = await req.formData();
        const file      = formData.get("file") as File | null;
        const productUq = String(formData.get("product_uq") || "").trim().toUpperCase();

        if (!file)       return NextResponse.json({ error: "No file provided" },       { status: 400 });
        if (!productUq)  return NextResponse.json({ error: "No product_uq provided" }, { status: 400 });

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type))
            return NextResponse.json({ error: "Only JPG, PNG, WEBP allowed" }, { status: 400 });

        const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
        const key = `${PREFIX}${productUq}-1.${ext}`;

        const bytes = await file.arrayBuffer();
        const body  = Buffer.from(bytes);

        const { PutObjectCommand } = await import("@aws-sdk/client-s3");
        const s3 = await getS3();
        await s3.send(new PutObjectCommand({
            Bucket:      BUCKET,
            Key:         key,
            Body:        body,
            ContentType: file.type,
            ACL:         "public-read",
        }));

        const publicUrl = `https://${BUCKET}.${REGION}.digitaloceanspaces.com/${key}`;
        return NextResponse.json({ url: publicUrl });
    } catch (err: any) {
        console.error("[products/images/upload]", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
