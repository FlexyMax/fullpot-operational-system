# Node Description Batch 56 of 139

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

- "public_pdf_worker_min_stylesheet": "Stylesheet" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .stylesheet()]
- "public_pdf_worker_min_stylesheetnamespace": "StylesheetNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[cn](), .stylesheet()]
- "public_pdf_worker_min_sub": "Sub" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .sub()]
- "public_pdf_worker_min_subform_yr": ".[yr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Subform, wr, yr]
- "public_pdf_worker_min_subjectdns": "SubjectDNs" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .subjectDNs()]
- "public_pdf_worker_min_subjectdns_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubjectDNs, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_submit": "Submit" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .submit()]
- "public_pdf_worker_min_submitformat": "SubmitFormat" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .submitFormat(), .constructor()]
- "public_pdf_worker_min_submiturl": "SubmitUrl" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .submitUrl(), .constructor()]
- "public_pdf_worker_min_subsetbelow": "SubsetBelow" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .subsetBelow(), .constructor()]
- "public_pdf_worker_min_sup": "Sup" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .sup()]
- "public_pdf_worker_min_suppressbanner": "SuppressBanner" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .suppressBanner(), .constructor()]
- "public_pdf_worker_min_tagged": "Tagged" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .tagged(), .constructor()]
- "public_pdf_worker_min_template_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Template, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_templatecache": "TemplateCache" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .templateCache(), .constructor()]
- "public_pdf_worker_min_textannotation": "TextAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_textedit_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextEdit, getInteger(), getStringOption()]
- "public_pdf_worker_min_textmeasure_addpara": ".addPara()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.[jr](), TextMeasure, .topFont()]
- "public_pdf_worker_min_textstate_carriagereturn": ".carriageReturn()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getTextContent(), TextState, .translateTextLineMatrix()]
- "public_pdf_worker_min_textstate_translatetextlinematrix": ".translateTextLineMatrix()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getTextContent(), TextState, .carriageReturn()]
- "public_pdf_worker_min_textwidgetannotation_splitline": "._splitLine()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextWidgetAnnotation, ._getMultilineAppearance(), .getCharPositions()]
- "public_pdf_worker_min_threshold": "Threshold" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .threshold(), .constructor()]
- "public_pdf_worker_min_timepattern": "TimePattern" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .timePattern(), .constructor()]
- "public_pdf_worker_min_timepatterns": "TimePatterns" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .timePatterns(), .constructor()]
- "public_pdf_worker_min_timeslotmanager_check": ".check()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getOperatorList(), .getTextContent(), TimeSlotManager]
- "public_pdf_worker_min_timestamp": "TimeStamp" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .timeStamp(), .constructor()]
- "public_pdf_worker_min_to": "To" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .to(), .constructor()]
- "public_pdf_worker_min_tohexdigit": "toHexDigit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getHexString(), .getName()]
- "public_pdf_worker_min_tooltip": "ToolTip" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .toolTip(), .constructor()]
- "public_pdf_worker_min_toromannumerals": "toRomanNumerals()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._readPageLabels(), assert()]
- "public_pdf_worker_min_trace": "Trace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .trace(), .constructor()]
- "public_pdf_worker_min_transform": "Transform" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .transform(), .constructor()]
- "public_pdf_worker_min_translatedfont_fallback": ".fallback()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.fontFallback(), TranslatedFont, .buildFontPaths()]
- "public_pdf_worker_min_traversal": "Traversal" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .traversal(), .constructor()]
- "public_pdf_worker_min_type": "Type" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .type(), .constructor()]
- "public_pdf_worker_min_type1parser_gettoken": ".getToken()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser, isSpecial(), isWhiteSpace()]
- "public_pdf_worker_min_type1parser_prevchar": ".prevChar()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser, .extractFontProgram(), .skip()]
- "public_pdf_worker_min_type1parser_readcharstrings": ".readCharStrings()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser, .extractFontProgram(), decrypt()]
- "public_pdf_worker_min_type1parser_readint": ".readInt()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser, .extractFontHeader(), .extractFontProgram()]
- "public_pdf_worker_min_type1parser_readnumberarray": ".readNumberArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1Parser, .extractFontHeader(), .extractFontProgram()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-055.json

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
