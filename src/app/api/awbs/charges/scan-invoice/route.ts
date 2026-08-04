import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const s3 = new S3Client({
    region:   process.env.DO_INVOICES_REGION!,
    endpoint: process.env.DO_INVOICES_ENDPOINT!,
    credentials: {
        accessKeyId:     process.env.DO_INVOICES_KEY!,
        secretAccessKey: process.env.DO_INVOICES_SECRET!,
    },
    forcePathStyle: false,
});

const EXTRACT_PROMPT = `You are an invoice data extractor. Analyze this PDF invoice and extract exactly these fields:
- vendor_name: the company or person issuing the invoice (string)
- amount: the total amount due as a plain decimal number, no currency symbols or commas (number)
- invoice_no: the invoice number or reference code (string)
- invoice_date: the invoice date in YYYY-MM-DD format (string)
- description: a short description of what the charge is for, max 80 characters (string)

Return ONLY a raw JSON object with no markdown, no explanation, no code fences. Example:
{"vendor_name":"ACME FREIGHT INC","amount":1250.00,"invoice_no":"INV-2026-001","invoice_date":"2026-07-29","description":"Air freight charges"}
Use null for any field you cannot find.`;

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file    = formData.get("file") as File | null;
        const awbcode = (formData.get("awbcode") as string ?? "").trim();

        if (!file)    return NextResponse.json({ success: false, error: "No file provided" },  { status: 400 });
        if (!awbcode) return NextResponse.json({ success: false, error: "AWB code required" }, { status: 400 });
        if (file.type !== "application/pdf")
            return NextResponse.json({ success: false, error: "Only PDF files are accepted" }, { status: 400 });

        const bytes  = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");

        // ── Upload to DO Spaces (Fullpot/Vendor_Invoices/{awbcode}/) ──────────
        const ts       = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key      = `Fullpot/Vendor_Invoices/${awbcode}/${ts}-${safeName}`;

        await s3.send(new PutObjectCommand({
            Bucket:      process.env.DO_INVOICES_BUCKET!,
            Key:         key,
            Body:        buffer,
            ContentType: "application/pdf",
            ACL:         "private",
        }));

        // ── Extract data with Gemini ──────────────────────────────────────────
        const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model  = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            { inlineData: { data: base64, mimeType: "application/pdf" } },
            EXTRACT_PROMPT,
        ]);

        const raw   = result.response.text().trim();
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse invoice data from PDF");

        const extracted = JSON.parse(match[0]);

        return NextResponse.json({
            success:  true,
            file_key: key,
            data: {
                vendor_name:  extracted.vendor_name  ?? null,
                amount:       extracted.amount       ?? null,
                invoice_no:   extracted.invoice_no   ?? null,
                invoice_date: extracted.invoice_date ?? null,
                description:  extracted.description  ?? null,
            },
        });

    } catch (err: any) {
        console.error("[scan-invoice]", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
