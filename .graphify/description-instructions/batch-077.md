# Node Description Batch 78 of 139

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

- "public_pdf_worker_min_rename_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Rename, warn()]
- "public_pdf_worker_min_resizeimagemask": "resizeImageMask()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .fillOpacity()]
- "public_pdf_worker_min_reversevalues": "reverseValues()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, bidi()]
- "public_pdf_worker_min_rn": "rn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._createPagesHelper()]
- "public_pdf_worker_min_run": "run()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .shift()]
- "public_pdf_worker_min_safestring16": "safeString16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .convert()]
- "public_pdf_worker_min_script_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Script, getStringOption()]
- "public_pdf_worker_min_setvalues": "setValues()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, bidi()]
- "public_pdf_worker_min_signature_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Signature, getStringOption()]
- "public_pdf_worker_min_signaturenamespace_signature": ".signature()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SignatureNamespace, signature_Signature]
- "public_pdf_worker_min_signdata_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SignData, getStringOption()]
- "public_pdf_worker_min_signedint16": "signedInt16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair()]
- "public_pdf_worker_min_simpledomnode_searchnode": ".searchNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleDOMNode, .pop()]
- "public_pdf_worker_min_simplesegmentvisitor_onimmediatelosslessgenericregion": ".onImmediateLosslessGenericRegion()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, .onImmediateGenericRegion()]
- "public_pdf_worker_min_simplesegmentvisitor_onimmediatelosslesshalftoneregion": ".onImmediateLosslessHalftoneRegion()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, .onImmediateHalftoneRegion()]
- "public_pdf_worker_min_simplesegmentvisitor_onimmediatelosslesstextregion": ".onImmediateLosslessTextRegion()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, .onImmediateTextRegion()]
- "public_pdf_worker_min_simplesegmentvisitor_onpageinformation": ".onPageInformation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, .fill()]
- "public_pdf_worker_min_simplexmlparser_onbeginelement": ".onBeginElement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleXMLParser, SimpleDOMNode]
- "public_pdf_worker_min_simplexmlparser_oncdata": ".onCdata()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleXMLParser, SimpleDOMNode]
- "public_pdf_worker_min_simplexmlparser_onendelement": ".onEndElement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleXMLParser, .pop()]
- "public_pdf_worker_min_simplexmlparser_ontext": ".onText()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleXMLParser, SimpleDOMNode]
- "public_pdf_worker_min_staple_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Staple, getStringOption()]
- "public_pdf_worker_min_stipple_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Stipple, getInteger()]
- "public_pdf_worker_min_stipple_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Stipple, .makeHexColor()]
- "public_pdf_worker_min_streamssequencestream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StreamsSequenceStream, .shift()]
- "public_pdf_worker_min_stringobject": "StringObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[gr]()]
- "public_pdf_worker_min_stringstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StringStream, stringToBytes()]
- "public_pdf_worker_min_stringtoutf16hexstring": "stringToUTF16HexString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createAppearance()]
- "public_pdf_worker_min_structelementnode_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructElementNode, .parseKids()]
- "public_pdf_worker_min_structtreepage_addtoplevelnode": ".addTopLevelNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreePage, .addNode()]
- "public_pdf_worker_min_structtreeroot_addannotationidtopage": ".addAnnotationIdToPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.constructor(), StructTreeRoot]
- "public_pdf_worker_min_structtreeroot_readrolemap": ".readRoleMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, .init()]
- "public_pdf_worker_min_structtreeroot_t": ".#T()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, stringToAsciiOrUTF16BE()]
- "public_pdf_worker_min_structtreeroot_y": ".#Y()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, RefSetCache]
- "public_pdf_worker_min_stylesheetnamespace_stylesheet": ".stylesheet()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StylesheetNamespace, Stylesheet]
- "public_pdf_worker_min_subform_cr": ".[Cr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, getAvailableSpace()]
- "public_pdf_worker_min_subform_hr": ".[Hr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, wr]
- "public_pdf_worker_min_subform_lr": ".[Lr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, yr]
- "public_pdf_worker_min_subform_or": ".[or]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, flushHTML()]
- "public_pdf_worker_min_subform_vs": ".[Vs]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, addHTML()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-077.json

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
