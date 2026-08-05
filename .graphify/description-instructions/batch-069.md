# Node Description Batch 70 of 139

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

- "public_pdf_worker_min_confignamespace_silentprint": ".silentPrint()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, SilentPrint]
- "public_pdf_worker_min_confignamespace_staple": ".staple()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Staple]
- "public_pdf_worker_min_confignamespace_startnode": ".startNode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, StartNode]
- "public_pdf_worker_min_confignamespace_startpage": ".startPage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, StartPage]
- "public_pdf_worker_min_confignamespace_submitformat": ".submitFormat()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, SubmitFormat]
- "public_pdf_worker_min_confignamespace_submiturl": ".submitUrl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, SubmitUrl]
- "public_pdf_worker_min_confignamespace_subsetbelow": ".subsetBelow()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, SubsetBelow]
- "public_pdf_worker_min_confignamespace_suppressbanner": ".suppressBanner()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, SuppressBanner]
- "public_pdf_worker_min_confignamespace_tagged": ".tagged()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Tagged]
- "public_pdf_worker_min_confignamespace_template": ".template()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Template]
- "public_pdf_worker_min_confignamespace_templatecache": ".templateCache()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, TemplateCache]
- "public_pdf_worker_min_confignamespace_threshold": ".threshold()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Threshold]
- "public_pdf_worker_min_confignamespace_to": ".to()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, To]
- "public_pdf_worker_min_confignamespace_trace": ".trace()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Trace]
- "public_pdf_worker_min_confignamespace_transform": ".transform()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Transform]
- "public_pdf_worker_min_confignamespace_type": ".type()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Type]
- "public_pdf_worker_min_confignamespace_uri": ".uri()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Uri]
- "public_pdf_worker_min_confignamespace_validate": ".validate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, config_Validate]
- "public_pdf_worker_min_confignamespace_validateapprovalsignatures": ".validateApprovalSignatures()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, ValidateApprovalSignatures]
- "public_pdf_worker_min_confignamespace_validationmessaging": ".validationMessaging()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, ValidationMessaging]
- "public_pdf_worker_min_confignamespace_version": ".version()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Version]
- "public_pdf_worker_min_confignamespace_versioncontrol": ".versionControl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, VersionControl]
- "public_pdf_worker_min_confignamespace_viewerpreferences": ".viewerPreferences()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, ViewerPreferences]
- "public_pdf_worker_min_confignamespace_webclient": ".webClient()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, WebClient]
- "public_pdf_worker_min_confignamespace_whitespace": ".whitespace()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Whitespace]
- "public_pdf_worker_min_confignamespace_window": ".window()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Window]
- "public_pdf_worker_min_confignamespace_xdc": ".xdc()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Xdc]
- "public_pdf_worker_min_confignamespace_xdp": ".xdp()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Xdp]
- "public_pdf_worker_min_confignamespace_xsl": ".xsl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Xsl]
- "public_pdf_worker_min_confignamespace_zpl": ".zpl()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConfigNamespace, Zpl]
- "public_pdf_worker_min_connect_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Connect, getStringOption()]
- "public_pdf_worker_min_connectionset_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSet, XFAObjectArray]
- "public_pdf_worker_min_connectionsetnamespace_connectionset": ".connectionSet()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, ConnectionSet]
- "public_pdf_worker_min_connectionsetnamespace_effectiveinputpolicy": ".effectiveInputPolicy()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, EffectiveInputPolicy]
- "public_pdf_worker_min_connectionsetnamespace_effectiveoutputpolicy": ".effectiveOutputPolicy()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, EffectiveOutputPolicy]
- "public_pdf_worker_min_connectionsetnamespace_operation": ".operation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, Operation]
- "public_pdf_worker_min_connectionsetnamespace_rootelement": ".rootElement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, RootElement]
- "public_pdf_worker_min_connectionsetnamespace_soapaction": ".soapAction()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, SoapAction]
- "public_pdf_worker_min_connectionsetnamespace_soapaddress": ".soapAddress()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, SoapAddress]
- "public_pdf_worker_min_connectionsetnamespace_uri": ".uri()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ConnectionSetNamespace, connection_set_Uri]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-069.json

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
