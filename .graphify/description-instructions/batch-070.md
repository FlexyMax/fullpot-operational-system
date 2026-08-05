# Node Description Batch 71 of 139

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

- "public_pdf_worker_min_connectionsetnamespace_wsdladdress": ".wsdlAddress()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, WsdlAddress]
- "public_pdf_worker_min_connectionsetnamespace_wsdlconnection": ".wsdlConnection()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, WsdlConnection]
- "public_pdf_worker_min_connectionsetnamespace_xmlconnection": ".xmlConnection()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, XmlConnection]
- "public_pdf_worker_min_connectionsetnamespace_xsdconnection": ".xsdConnection()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, XsdConnection]
- "public_pdf_worker_min_cr": "cr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .serialize()]
- "public_pdf_worker_min_createbiditext": "createBidiText()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, bidi()]
- "public_pdf_worker_min_createpostscriptname": "createPostscriptName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createNameTable()]
- "public_pdf_worker_min_currencysymbol_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CurrencySymbol, getStringOption()]
- "public_pdf_worker_min_currencysymbols_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CurrencySymbols, XFAObjectArray]
- "public_pdf_worker_min_data_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Data, XFAObjectArray]
- "public_pdf_worker_min_datasetsnamespace_data": ".data()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatasetsNamespace, datasets_Data]
- "public_pdf_worker_min_datasetsnamespace_datasets": ".datasets()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatasetsNamespace, Datasets]
- "public_pdf_worker_min_dateelement_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateElement, valueToHtml()]
- "public_pdf_worker_min_datepattern_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatePattern, getStringOption()]
- "public_pdf_worker_min_datepatterns_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatePatterns, XFAObjectArray]
- "public_pdf_worker_min_datetime_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateTime, valueToHtml()]
- "public_pdf_worker_min_datetimeedit_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateTimeEdit, getStringOption()]
- "public_pdf_worker_min_decimal_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Decimal, getInteger()]
- "public_pdf_worker_min_decimal_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Decimal, valueToHtml()]
- "public_pdf_worker_min_decodeandclamp": "decodeAndClamp()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .decodeBuffer()]
- "public_pdf_worker_min_decodestream_makesubstream": ".makeSubStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream, Stream]
- "public_pdf_worker_min_decryptstream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecryptStream, decrypt()]
- "public_pdf_worker_min_defaultappearanceevaluator_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DefaultAppearanceEvaluator, StringStream]
- "public_pdf_worker_min_defaultappearanceevaluator_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DefaultAppearanceEvaluator, warn()]
- "public_pdf_worker_min_defaulttypeface_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DefaultTypeface, getStringOption()]
- "public_pdf_worker_min_desc_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Desc, XFAObjectArray]
- "public_pdf_worker_min_dict_assignxref": ".assignXref()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict, .parse()]
- "public_pdf_worker_min_dict_clone": ".clone()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict, .getKeys()]
- "public_pdf_worker_min_dict_empty": ".empty()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict, shadow()]
- "public_pdf_worker_min_dict_get": ".get()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Dict, .fetch()]
- "public_pdf_worker_min_dnlmarkererror": "DNLMarkerError" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_draw_tn": ".[tn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Draw, _setValue()]
- "public_pdf_worker_min_ea": "ea" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fallbackToSystemFont()]
- "public_pdf_worker_min_en": "en" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[cn]()]
- "public_pdf_worker_min_encryptdata_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EncryptData, getStringOption()]
- "public_pdf_worker_min_eoimarkererror": "EOIMarkerError" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_equate_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Equate, getInteger()]
- "public_pdf_worker_min_equaterange_unicoderange": ".unicodeRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EquateRange, shadow()]
- "public_pdf_worker_min_eranames_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EraNames, XFAObjectArray]
- "public_pdf_worker_min_event_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Event, getStringOption()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-070.json

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
