// Keeps the pdf.js worker served from /public in sync with the pdfjs-dist
// version react-pdf actually bundles internally (often a nested copy under
// react-pdf/node_modules, not whatever pdfjs-dist version npm hoists to the
// top level) — a mismatched worker throws "API version does not match
// Worker version" at runtime, so this must run on every install.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const destDir = path.join(__dirname, "..", "public");
const dest = path.join(destDir, "pdf.worker.min.mjs");

let src;
try {
    src = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs", {
        paths: [require.resolve("react-pdf")],
    });
} catch {
    console.warn("[copy-pdf-worker] could not resolve pdfjs-dist worker via react-pdf, skipping");
    process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("[copy-pdf-worker] copied", src, "->", dest);
