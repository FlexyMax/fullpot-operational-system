# Node Description Batch 79 of 139

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

- "public_pdf_worker_min_subformset_yr": ".[yr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubformSet, wr]
- "public_pdf_worker_min_template_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Template, warn()]
- "public_pdf_worker_min_template_pattern_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[template_Pattern, getStringOption()]
- "public_pdf_worker_min_templatecache_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateCache, getInteger()]
- "public_pdf_worker_min_templatenamespace_appearancefilter": ".appearanceFilter()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, AppearanceFilter]
- "public_pdf_worker_min_templatenamespace_arc": ".arc()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Arc]
- "public_pdf_worker_min_templatenamespace_area": ".area()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Area]
- "public_pdf_worker_min_templatenamespace_assist": ".assist()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Assist]
- "public_pdf_worker_min_templatenamespace_barcode": ".barcode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Barcode]
- "public_pdf_worker_min_templatenamespace_bind": ".bind()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Bind]
- "public_pdf_worker_min_templatenamespace_binditems": ".bindItems()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, BindItems]
- "public_pdf_worker_min_templatenamespace_bookend": ".bookend()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Bookend]
- "public_pdf_worker_min_templatenamespace_boolean": ".boolean()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, BooleanElement]
- "public_pdf_worker_min_templatenamespace_border": ".border()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Border]
- "public_pdf_worker_min_templatenamespace_break": ".break()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Break]
- "public_pdf_worker_min_templatenamespace_breakafter": ".breakAfter()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, BreakAfter]
- "public_pdf_worker_min_templatenamespace_breakbefore": ".breakBefore()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, BreakBefore]
- "public_pdf_worker_min_templatenamespace_button": ".button()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Button]
- "public_pdf_worker_min_templatenamespace_calculate": ".calculate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Calculate]
- "public_pdf_worker_min_templatenamespace_caption": ".caption()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Caption]
- "public_pdf_worker_min_templatenamespace_certificate": ".certificate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Certificate]
- "public_pdf_worker_min_templatenamespace_certificates": ".certificates()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Certificates]
- "public_pdf_worker_min_templatenamespace_checkbutton": ".checkButton()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, CheckButton]
- "public_pdf_worker_min_templatenamespace_choicelist": ".choiceList()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, ChoiceList]
- "public_pdf_worker_min_templatenamespace_cn": ".[cn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, en]
- "public_pdf_worker_min_templatenamespace_color": ".color()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Color]
- "public_pdf_worker_min_templatenamespace_comb": ".comb()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Comb]
- "public_pdf_worker_min_templatenamespace_connect": ".connect()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Connect]
- "public_pdf_worker_min_templatenamespace_contentarea": ".contentArea()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, ContentArea]
- "public_pdf_worker_min_templatenamespace_corner": ".corner()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Corner]
- "public_pdf_worker_min_templatenamespace_date": ".date()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, DateElement]
- "public_pdf_worker_min_templatenamespace_datetime": ".dateTime()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, DateTime]
- "public_pdf_worker_min_templatenamespace_datetimeedit": ".dateTimeEdit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, DateTimeEdit]
- "public_pdf_worker_min_templatenamespace_decimal": ".decimal()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Decimal]
- "public_pdf_worker_min_templatenamespace_defaultui": ".defaultUi()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, DefaultUi]
- "public_pdf_worker_min_templatenamespace_desc": ".desc()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Desc]
- "public_pdf_worker_min_templatenamespace_digestmethod": ".digestMethod()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, DigestMethod]
- "public_pdf_worker_min_templatenamespace_digestmethods": ".digestMethods()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, DigestMethods]
- "public_pdf_worker_min_templatenamespace_draw": ".draw()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Draw]
- "public_pdf_worker_min_templatenamespace_edge": ".edge()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TemplateNamespace, Edge]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-078.json

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
