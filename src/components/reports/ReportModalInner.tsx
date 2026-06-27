"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { X, FileText, Download, ExternalLink, RefreshCcw, ZoomIn, ZoomOut, Printer } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Props {
    url: string | null;
    onClose: () => void;
}

export default function ReportModalInner({ url, onClose }: Props) {
    const [numPages, setNumPages] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [containerWidth, setContainerWidth] = useState(800);
    const containerRef = useRef<HTMLDivElement>(null);

    const [prevUrl, setPrevUrl] = useState(url);
    if (url !== prevUrl) {
        setPrevUrl(url);
        setNumPages(0);
        setError(null);
        setZoom(1);
    }

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width;
            if (w) setContainerWidth(w);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // The modal is portaled to <body>, outside #app-shell — toggling this class
    // lets globals.css hide the rest of the app during print so only the report
    // ends up on paper, not whatever tab/grid happens to be open behind it.
    useEffect(() => {
        if (!url) return;
        document.body.classList.add("report-modal-open");
        return () => document.body.classList.remove("report-modal-open");
    }, [url]);

    if (!url) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-6 print:relative print:bg-white print:p-0 print:block" onClick={onClose}>
            <div className="bg-[#3B3B3B] rounded-lg shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden print:bg-white print:shadow-none print:rounded-none print:h-auto print:max-w-none print:overflow-visible" onClick={e => e.stopPropagation()}>
                <div className="h-11 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 print:hidden">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-[#FB7506] shrink-0" />
                        <span className="font-black text-[11px] text-white uppercase tracking-widest truncate">
                            Report{numPages > 0 ? ` — ${numPages} page${numPages > 1 ? "s" : ""}` : ""}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.15))} title="Zoom out"
                            className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><ZoomOut size={15} /></button>
                        <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} title="Zoom in"
                            className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><ZoomIn size={15} /></button>
                        <button onClick={() => window.print()} title="Print" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><Printer size={15} /></button>
                        <a href={url} download title="Download" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><Download size={15} /></a>
                        <a href={url} target="_blank" rel="noreferrer" title="Open in new tab" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><ExternalLink size={15} /></a>
                        <div className="w-px h-5 bg-white/15 mx-1" />
                        <button onClick={onClose} title="Close" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><X size={17} /></button>
                    </div>
                </div>
                <div ref={containerRef} className="flex-1 overflow-auto flex flex-col items-center gap-3 py-4 px-2 print:overflow-visible print:h-auto print:p-0 print:gap-0">
                    {error ? (
                        <div className="text-center text-gray-300 mt-10">
                            <p className="font-bold text-sm mb-1">Could not display this report</p>
                            <p className="text-xs text-gray-400 mb-3">{error}</p>
                            <a href={url} target="_blank" rel="noreferrer" className="text-[#FB7506] text-xs font-bold uppercase hover:underline">Open in new tab instead</a>
                        </div>
                    ) : (
                        <Document
                            file={url}
                            loading={<RefreshCcw size={22} className="text-gray-400 animate-spin mt-10" />}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            onLoadError={(e) => setError(e?.message || "Unknown error loading PDF")}
                        >
                            {Array.from({ length: numPages }, (_, i) => (
                                <Page key={i} pageNumber={i + 1} width={containerWidth * zoom} className="shadow-lg mb-3 print:shadow-none print:mb-0 print:break-after-page" />
                            ))}
                        </Document>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
