# Node Description Batch 48 of 139

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

- "public_pdf_worker_min_connect": "Connect" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .connect()]
- "public_pdf_worker_min_connection_set_uri": "connection_set_Uri" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .uri()]
- "public_pdf_worker_min_connectionset": "ConnectionSet" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .connectionSet()]
- "public_pdf_worker_min_contentarea_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ContentArea, getMeasurement(), getRelevant()]
- "public_pdf_worker_min_contentcopy": "ContentCopy" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .contentCopy(), .constructor()]
- "public_pdf_worker_min_contextcache": "ContextCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getContexts(), .contextCache()]
- "public_pdf_worker_min_contour": "Contour" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parse()]
- "public_pdf_worker_min_convertblackandwhitetorgba": "convertBlackAndWhiteToRGBA()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, convertToRGBA(), .createMask()]
- "public_pdf_worker_min_converttorgba": "convertToRGBA()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, convertBlackAndWhiteToRGBA(), .createBitmap()]
- "public_pdf_worker_min_copies": "Copies" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .copies(), .constructor()]
- "public_pdf_worker_min_corner_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Corner, measureToString(), toStyle()]
- "public_pdf_worker_min_createline": "createLine()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, addHTML(), flushHTML()]
- "public_pdf_worker_min_creator": "Creator" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .creator(), .constructor()]
- "public_pdf_worker_min_currencysymbol": "CurrencySymbol" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .currencySymbol()]
- "public_pdf_worker_min_currencysymbols": "CurrencySymbols" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .currencySymbols()]
- "public_pdf_worker_min_currentpage": "CurrentPage" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .currentPage(), .constructor()]
- "public_pdf_worker_min_data": "Data" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .data(), .constructor()]
- "public_pdf_worker_min_datepattern": "DatePattern" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .datePattern()]
- "public_pdf_worker_min_datepatterns": "DatePatterns" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .datePatterns()]
- "public_pdf_worker_min_datetimesymbols": "DateTimeSymbols" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .dateTimeSymbols()]
- "public_pdf_worker_min_day": "Day" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .day()]
- "public_pdf_worker_min_daynames": "DayNames" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .dayNames()]
- "public_pdf_worker_min_daynames_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DayNames, getInteger(), XFAObjectArray]
- "public_pdf_worker_min_debug": "Debug" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .debug(), .constructor()]
- "public_pdf_worker_min_decodingcontext_contextcache": ".contextCache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodingContext, ContextCache, shadow()]
- "public_pdf_worker_min_decodingcontext_decoder": ".decoder()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodingContext, ArithmeticDecoder, shadow()]
- "public_pdf_worker_min_defaulttypeface": "DefaultTypeface" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .defaultTypeface(), .constructor()]
- "public_pdf_worker_min_defaultui": "DefaultUi" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .defaultUi()]
- "public_pdf_worker_min_desc": "Desc" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .desc()]
- "public_pdf_worker_min_destination": "Destination" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .destination(), .constructor()]
- "public_pdf_worker_min_digestmethod": "DigestMethod" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .digestMethod()]
- "public_pdf_worker_min_digestmethods": "DigestMethods" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .digestMethods()]
- "public_pdf_worker_min_digestmethods_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DigestMethods, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_documentassembly": "DocumentAssembly" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .documentAssembly(), .constructor()]
- "public_pdf_worker_min_driver": "Driver" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .driver(), .constructor()]
- "public_pdf_worker_min_dummyshading": "DummyShading" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getIR(), .parseShading()]
- "public_pdf_worker_min_duplexoption": "DuplexOption" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .duplexOption(), .constructor()]
- "public_pdf_worker_min_dynamicrender": "DynamicRender" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .dynamicRender(), .constructor()]
- "public_pdf_worker_min_edge_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Edge, getMeasurement(), getStringOption()]
- "public_pdf_worker_min_effectiveinputpolicy": "EffectiveInputPolicy" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .effectiveInputPolicy(), .constructor()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-047.json

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
