# Node Description Batch 52 of 139

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

- "public_pdf_worker_min_meridiemnames": "MeridiemNames" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .meridiemNames(), .constructor()]
- "public_pdf_worker_min_message": "Message" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .message()]
- "public_pdf_worker_min_messagehandler_destroy": ".destroy()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler, .abort(), .createDocumentHandler()]
- "public_pdf_worker_min_messagehandler_sendwithstream": ".sendWithStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler, .constructor(), .constructor()]
- "public_pdf_worker_min_messaging": "Messaging" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .messaging(), .constructor()]
- "public_pdf_worker_min_missingpdfexception": "MissingPDFException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), wrapReason()]
- "public_pdf_worker_min_mode": "Mode" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .mode(), .constructor()]
- "public_pdf_worker_min_modifyannots": "ModifyAnnots" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .modifyAnnots(), .constructor()]
- "public_pdf_worker_min_month": "Month" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .month(), .constructor()]
- "public_pdf_worker_min_monthnames": "MonthNames" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .monthNames(), .constructor()]
- "public_pdf_worker_min_monthnames_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MonthNames, getInteger(), XFAObjectArray]
- "public_pdf_worker_min_msgid": "MsgId" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .msgId(), .constructor()]
- "public_pdf_worker_min_name": "Name" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .get()]
- "public_pdf_worker_min_nameattr": "NameAttr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .nameAttr(), .constructor()]
- "public_pdf_worker_min_nameornumbertree_getraw": ".getRaw()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[NameOrNumberTree, warn(), .fetchIfRef()]
- "public_pdf_worker_min_neverembed": "NeverEmbed" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .neverEmbed(), .constructor()]
- "public_pdf_worker_min_normalizeblendmode": "normalizeBlendMode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, warn(), .setGState()]
- "public_pdf_worker_min_nullstream": "NullStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .makeFilter()]
- "public_pdf_worker_min_numberofcopies": "NumberOfCopies" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .numberOfCopies(), .constructor()]
- "public_pdf_worker_min_numberpattern": "NumberPattern" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .numberPattern(), .constructor()]
- "public_pdf_worker_min_numberpatterns": "NumberPatterns" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .numberPatterns(), .constructor()]
- "public_pdf_worker_min_numbersymbol": "NumberSymbol" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .numberSymbol(), .constructor()]
- "public_pdf_worker_min_numbersymbols": "NumberSymbols" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .numberSymbols(), .constructor()]
- "public_pdf_worker_min_objectsize": "objectSize()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .openAction(), collectActions()]
- "public_pdf_worker_min_oid": "Oid" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .oid()]
- "public_pdf_worker_min_oids": "Oids" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .oids()]
- "public_pdf_worker_min_oids_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Oids, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_ol": "Ol" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .ol()]
- "public_pdf_worker_min_openaction": "OpenAction" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .openAction(), .constructor()]
- "public_pdf_worker_min_opentypefilebuilder_addtable": ".addTable()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.checkAndRepair(), .convert(), OpenTypeFileBuilder]
- "public_pdf_worker_min_opentypefilebuilder_getsearchparams": ".getSearchParams()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[createCmapTable(), OpenTypeFileBuilder, .toArray()]
- "public_pdf_worker_min_operation": "Operation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .operation(), .constructor()]
- "public_pdf_worker_min_operatorlist_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[OperatorList, NullOptimizer, QueueOptimizer]
- "public_pdf_worker_min_output": "Output" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .output(), .constructor()]
- "public_pdf_worker_min_outputbin": "OutputBin" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .outputBin(), .constructor()]
- "public_pdf_worker_min_outputxsl": "OutputXSL" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .outputXSL(), .constructor()]
- "public_pdf_worker_min_overprint": "Overprint" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .overprint(), .constructor()]
- "public_pdf_worker_min_p_jr": ".[jr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[P, .addPara(), .addString()]
- "public_pdf_worker_min_page_annotations": ".annotations()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, ._getInheritableProperty(), shadow()]
- "public_pdf_worker_min_page_cropbox": ".cropBox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Page, ._getBoundingBox(), shadow()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-051.json

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
