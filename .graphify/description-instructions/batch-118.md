# Node Description Batch 119 of 139

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "public_pdf_worker_min_output_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Output]
- "public_pdf_worker_min_outputbin_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[OutputBin]
- "public_pdf_worker_min_outputxsl_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[OutputXSL]
- "public_pdf_worker_min_overflow_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Overflow]
- "public_pdf_worker_min_overprint_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Overprint]
- "public_pdf_worker_min_p_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[P]
- "public_pdf_worker_min_pa": "pA" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_packets_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Packets]
- "public_pdf_worker_min_packets_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Packets]
- "public_pdf_worker_min_page_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page]
- "public_pdf_worker_min_page_loadresources": ".loadResources()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page]
- "public_pdf_worker_min_pagearea_ar": ".[Ar]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageArea]
- "public_pdf_worker_min_pagearea_cr": ".[Cr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageArea]
- "public_pdf_worker_min_pagearea_yr": ".[Yr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageArea]
- "public_pdf_worker_min_pagerange_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageRange]
- "public_pdf_worker_min_pagerange_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageRange]
- "public_pdf_worker_min_pageset_yr": ".[Yr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PageSet]
- "public_pdf_worker_min_pagination_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Pagination]
- "public_pdf_worker_min_paginationoverride_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PaginationOverride]
- "public_pdf_worker_min_parsereofexception_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ParserEOFException]
- "public_pdf_worker_min_part_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Part]
- "public_pdf_worker_min_partialevaluator_parsingtype3font": ".parsingType3Font()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator]
- "public_pdf_worker_min_passwordexception_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PasswordException]
- "public_pdf_worker_min_patterncs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PatternCS]
- "public_pdf_worker_min_pcl_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Pcl]
- "public_pdf_worker_min_pdf_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Pdf]
- "public_pdf_worker_min_pdfa_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Pdfa]
- "public_pdf_worker_min_pdfdocument_fontfallback": ".fontFallback()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument]
- "public_pdf_worker_min_pdfdocument_version": ".version()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFDocument]
- "public_pdf_worker_min_pdffunctionfactory_cache": "._cache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunctionFactory]
- "public_pdf_worker_min_pdffunctionfactory_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFFunctionFactory]
- "public_pdf_worker_min_pdfimage_drawheight": ".drawHeight()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage]
- "public_pdf_worker_min_pdfimage_drawwidth": ".drawWidth()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage]
- "public_pdf_worker_min_pdfimage_n": ".#N()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFImage]
- "public_pdf_worker_min_pdfworkerstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStream]
- "public_pdf_worker_min_pdfworkerstreamrangereader_cancel": ".cancel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamRangeReader]
- "public_pdf_worker_min_pdfworkerstreamrangereader_isstreamingsupported": ".isStreamingSupported()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamRangeReader]
- "public_pdf_worker_min_pdfworkerstreamrangereader_read": ".read()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamRangeReader]
- "public_pdf_worker_min_pdfworkerstreamreader_cancel": ".cancel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamReader]
- "public_pdf_worker_min_pdfworkerstreamreader_contentlength": ".contentLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PDFWorkerStreamReader]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-118.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
