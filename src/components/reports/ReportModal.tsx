"use client";
import dynamic from "next/dynamic";

// pdfjs-dist touches browser-only globals at module-load time, which crashes
// during Next.js's SSR pass even inside a "use client" component — load it
// client-side only.
export const ReportModal = dynamic(() => import("./ReportModalInner"), { ssr: false });
