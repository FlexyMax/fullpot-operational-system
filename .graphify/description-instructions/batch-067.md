# Node Description Batch 68 of 139

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

- "public_pdf_worker_min_confignamespace_copies": ".copies()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Copies]
- "public_pdf_worker_min_confignamespace_creator": ".creator()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Creator]
- "public_pdf_worker_min_confignamespace_currentpage": ".currentPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, CurrentPage]
- "public_pdf_worker_min_confignamespace_data": ".data()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Data]
- "public_pdf_worker_min_confignamespace_debug": ".debug()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Debug]
- "public_pdf_worker_min_confignamespace_defaulttypeface": ".defaultTypeface()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, DefaultTypeface]
- "public_pdf_worker_min_confignamespace_destination": ".destination()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Destination]
- "public_pdf_worker_min_confignamespace_documentassembly": ".documentAssembly()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, DocumentAssembly]
- "public_pdf_worker_min_confignamespace_driver": ".driver()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Driver]
- "public_pdf_worker_min_confignamespace_duplexoption": ".duplexOption()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, DuplexOption]
- "public_pdf_worker_min_confignamespace_dynamicrender": ".dynamicRender()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, DynamicRender]
- "public_pdf_worker_min_confignamespace_embed": ".embed()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Embed]
- "public_pdf_worker_min_confignamespace_encrypt": ".encrypt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Encrypt]
- "public_pdf_worker_min_confignamespace_encryption": ".encryption()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Encryption]
- "public_pdf_worker_min_confignamespace_encryptionlevel": ".encryptionLevel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, EncryptionLevel]
- "public_pdf_worker_min_confignamespace_enforce": ".enforce()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Enforce]
- "public_pdf_worker_min_confignamespace_equate": ".equate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Equate]
- "public_pdf_worker_min_confignamespace_equaterange": ".equateRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, EquateRange]
- "public_pdf_worker_min_confignamespace_exclude": ".exclude()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Exclude]
- "public_pdf_worker_min_confignamespace_excludens": ".excludeNS()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, ExcludeNS]
- "public_pdf_worker_min_confignamespace_fliplabel": ".flipLabel()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, FlipLabel]
- "public_pdf_worker_min_confignamespace_fontinfo": ".fontInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_FontInfo]
- "public_pdf_worker_min_confignamespace_formfieldfilling": ".formFieldFilling()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, FormFieldFilling]
- "public_pdf_worker_min_confignamespace_groupparent": ".groupParent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, GroupParent]
- "public_pdf_worker_min_confignamespace_ifempty": ".ifEmpty()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, IfEmpty]
- "public_pdf_worker_min_confignamespace_includexdpcontent": ".includeXDPContent()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, IncludeXDPContent]
- "public_pdf_worker_min_confignamespace_incrementalload": ".incrementalLoad()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, IncrementalLoad]
- "public_pdf_worker_min_confignamespace_incrementalmerge": ".incrementalMerge()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, IncrementalMerge]
- "public_pdf_worker_min_confignamespace_interactive": ".interactive()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Interactive]
- "public_pdf_worker_min_confignamespace_jog": ".jog()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Jog]
- "public_pdf_worker_min_confignamespace_labelprinter": ".labelPrinter()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, LabelPrinter]
- "public_pdf_worker_min_confignamespace_layout": ".layout()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Layout]
- "public_pdf_worker_min_confignamespace_level": ".level()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Level]
- "public_pdf_worker_min_confignamespace_linearized": ".linearized()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Linearized]
- "public_pdf_worker_min_confignamespace_locale": ".locale()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Locale]
- "public_pdf_worker_min_confignamespace_localeset": ".localeSet()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, LocaleSet]
- "public_pdf_worker_min_confignamespace_map": ".map()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, MapElement]
- "public_pdf_worker_min_confignamespace_mediuminfo": ".mediumInfo()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, MediumInfo]
- "public_pdf_worker_min_confignamespace_message": ".message()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Message]
- "public_pdf_worker_min_confignamespace_messaging": ".messaging()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Messaging]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-067.json

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
