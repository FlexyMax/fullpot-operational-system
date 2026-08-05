# Node Description Batch 83 of 139

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

- "public_pdf_worker_min_xfafactory_appendfonts": ".appendFonts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.loadXfaFonts(), XFAFactory]
- "public_pdf_worker_min_xfafactory_createdocument": "._createDocument()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAFactory, .constructor()]
- "public_pdf_worker_min_xfafactory_getboundingbox": ".getBoundingBox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.xfaData(), XFAFactory]
- "public_pdf_worker_min_xfafactory_isvalid": ".isValid()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.isPureXfa(), XFAFactory]
- "public_pdf_worker_min_xfafactory_setimages": ".setImages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.loadXfaImages(), XFAFactory]
- "public_pdf_worker_min_xfaobject_lr": ".[Lr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, Qr]
- "public_pdf_worker_min_xfaobject_mn": ".[mn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, shadow()]
- "public_pdf_worker_min_xfaobject_or": ".[Or]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, warn()]
- "public_pdf_worker_min_xfaobject_pr": ".[Pr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, fr]
- "public_pdf_worker_min_xfaobject_rr": ".[Rr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, rr]
- "public_pdf_worker_min_xfaobject_ur": ".[Ur]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, wr]
- "public_pdf_worker_min_xfaobject_wn": ".[wn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, .assign()]
- "public_pdf_worker_min_xfaobject_xr": ".[Xr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, .pop()]
- "public_pdf_worker_min_xfaobject_yr": ".[yr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, wr]
- "public_pdf_worker_min_xfaobjectarray_dump": ".dump()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObjectArray, rr]
- "public_pdf_worker_min_xfaobjectarray_push": ".push()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObjectArray, warn()]
- "public_pdf_worker_min_xfaparser_getnameandprefix": "._getNameAndPrefix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAParser, .onBeginElement()]
- "public_pdf_worker_min_xfaparser_ontext": ".onText()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAParser, Zs]
- "public_pdf_worker_min_xhtmlnamespace_b": ".b()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, B]
- "public_pdf_worker_min_xhtmlnamespace_html": ".html()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, Html]
- "public_pdf_worker_min_xhtmlnamespace_ol": ".ol()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, Ol]
- "public_pdf_worker_min_xhtmlnamespace_p": ".p()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, P]
- "public_pdf_worker_min_xhtmlnamespace_span": ".span()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, Span]
- "public_pdf_worker_min_xhtmlnamespace_sub": ".sub()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, Sub]
- "public_pdf_worker_min_xhtmlnamespace_sup": ".sup()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, Sup]
- "public_pdf_worker_min_xhtmlnamespace_ul": ".ul()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlNamespace, Ul]
- "public_pdf_worker_min_xmlobject_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, XFAAttribute]
- "public_pdf_worker_min_xmlobject_dr": ".[dr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, dr]
- "public_pdf_worker_min_xmlobject_er": ".[Er]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, sn]
- "public_pdf_worker_min_xmlobject_hr": ".[hr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, fr]
- "public_pdf_worker_min_xmlobject_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, .success()]
- "public_pdf_worker_min_xmlobject_qr": ".[Qr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, Qr]
- "public_pdf_worker_min_xmlobject_rr": ".[rr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, rr]
- "public_pdf_worker_min_xmlparserbase_oncomment": ".onComment()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XMLParserBase, .parseXml()]
- "public_pdf_worker_min_xmlparserbase_ondoctype": ".onDoctype()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XMLParserBase, .parseXml()]
- "public_pdf_worker_min_xmlparserbase_onpi": ".onPi()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XMLParserBase, .parseXml()]
- "public_pdf_worker_min_xmlparserbase_parseprocessinginstruction": "._parseProcessingInstruction()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XMLParserBase, .parseXml()]
- "public_pdf_worker_min_xref_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, RefSet]
- "public_pdf_worker_min_xref_getcatalogobj": ".getCatalogObj()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), XRef]
- "public_pdf_worker_min_xref_getentry": ".getEntry()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XRef, .fetch()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-082.json

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
