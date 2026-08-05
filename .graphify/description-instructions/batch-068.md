# Node Description Batch 69 of 139

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

- "public_pdf_worker_min_confignamespace_mode": ".mode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Mode]
- "public_pdf_worker_min_confignamespace_modifyannots": ".modifyAnnots()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, ModifyAnnots]
- "public_pdf_worker_min_confignamespace_msgid": ".msgId()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, MsgId]
- "public_pdf_worker_min_confignamespace_nameattr": ".nameAttr()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, NameAttr]
- "public_pdf_worker_min_confignamespace_neverembed": ".neverEmbed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, NeverEmbed]
- "public_pdf_worker_min_confignamespace_numberofcopies": ".numberOfCopies()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, NumberOfCopies]
- "public_pdf_worker_min_confignamespace_openaction": ".openAction()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, OpenAction]
- "public_pdf_worker_min_confignamespace_output": ".output()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Output]
- "public_pdf_worker_min_confignamespace_outputbin": ".outputBin()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, OutputBin]
- "public_pdf_worker_min_confignamespace_outputxsl": ".outputXSL()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, OutputXSL]
- "public_pdf_worker_min_confignamespace_overprint": ".overprint()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Overprint]
- "public_pdf_worker_min_confignamespace_packets": ".packets()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Packets]
- "public_pdf_worker_min_confignamespace_pageoffset": ".pageOffset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PageOffset]
- "public_pdf_worker_min_confignamespace_pagerange": ".pageRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PageRange]
- "public_pdf_worker_min_confignamespace_pagination": ".pagination()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Pagination]
- "public_pdf_worker_min_confignamespace_paginationoverride": ".paginationOverride()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PaginationOverride]
- "public_pdf_worker_min_confignamespace_part": ".part()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Part]
- "public_pdf_worker_min_confignamespace_pcl": ".pcl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Pcl]
- "public_pdf_worker_min_confignamespace_pdf": ".pdf()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Pdf]
- "public_pdf_worker_min_confignamespace_pdfa": ".pdfa()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Pdfa]
- "public_pdf_worker_min_confignamespace_permissions": ".permissions()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Permissions]
- "public_pdf_worker_min_confignamespace_picktraybypdfsize": ".pickTrayByPDFSize()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PickTrayByPDFSize]
- "public_pdf_worker_min_confignamespace_picture": ".picture()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Picture]
- "public_pdf_worker_min_confignamespace_plaintextmetadata": ".plaintextMetadata()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PlaintextMetadata]
- "public_pdf_worker_min_confignamespace_presence": ".presence()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Presence]
- "public_pdf_worker_min_confignamespace_present": ".present()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Present]
- "public_pdf_worker_min_confignamespace_print": ".print()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Print]
- "public_pdf_worker_min_confignamespace_printername": ".printerName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PrinterName]
- "public_pdf_worker_min_confignamespace_printhighquality": ".printHighQuality()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PrintHighQuality]
- "public_pdf_worker_min_confignamespace_printscaling": ".printScaling()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, PrintScaling]
- "public_pdf_worker_min_confignamespace_producer": ".producer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Producer]
- "public_pdf_worker_min_confignamespace_range": ".range()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Range]
- "public_pdf_worker_min_confignamespace_record": ".record()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Record]
- "public_pdf_worker_min_confignamespace_relevant": ".relevant()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Relevant]
- "public_pdf_worker_min_confignamespace_rename": ".rename()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Rename]
- "public_pdf_worker_min_confignamespace_renderpolicy": ".renderPolicy()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, RenderPolicy]
- "public_pdf_worker_min_confignamespace_runscripts": ".runScripts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, RunScripts]
- "public_pdf_worker_min_confignamespace_script": ".script()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Script]
- "public_pdf_worker_min_confignamespace_scriptmodel": ".scriptModel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, ScriptModel]
- "public_pdf_worker_min_confignamespace_severity": ".severity()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Severity]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-068.json

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
