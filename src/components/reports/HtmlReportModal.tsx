"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Download, ExternalLink, Printer } from "lucide-react";

interface Props {
    url: string | null;
    onClose: () => void;
}

export function HtmlReportModal({ url, onClose }: Props) {
    useEffect(() => {
        if (!url) return;
        document.body.classList.add("report-modal-open");
        return () => document.body.classList.remove("report-modal-open");
    }, [url]);

    const handlePrint = () => {
        const iframe = document.getElementById("html-report-iframe") as HTMLIFrameElement | null;
        iframe?.contentWindow?.print();
    };

    if (!url) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-6 print:relative print:bg-white print:p-0 print:block" onClick={onClose}>
            <div className="bg-[#3B3B3B] rounded-lg shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden print:bg-white print:shadow-none print:rounded-none print:h-auto print:max-w-none print:overflow-visible" onClick={e => e.stopPropagation()}>
                <div className="h-11 bg-[#374151] flex items-center justify-between pl-3 pr-2 shrink-0 print:hidden">
                    <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-[#FB7506] shrink-0" />
                        <span className="font-black text-[11px] text-white uppercase tracking-widest truncate">Invoice</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={handlePrint} title="Print" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><Printer size={15} /></button>
                        <a href={url} download title="Download" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><Download size={15} /></a>
                        <a href={url} target="_blank" rel="noreferrer" title="Open in new tab" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><ExternalLink size={15} /></a>
                        <div className="w-px h-5 bg-white/15 mx-1" />
                        <button onClick={onClose} title="Close" className="text-gray-300 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded"><X size={17} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white print:overflow-visible">
                    <iframe id="html-report-iframe" src={url} className="w-full h-full border-0" title="Invoice" />
                </div>
            </div>
        </div>,
        document.body
    );
}
