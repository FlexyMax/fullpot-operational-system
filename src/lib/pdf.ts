import puppeteer from "puppeteer";

export async function htmlToPdfBuffer(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "load" });
        const pdf = await page.pdf({ format: "Letter", printBackground: true });
        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
}
