# Node Description Batch 75 of 139

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

- "public_pdf_worker_min_locale_set_localeset_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[locale_set_LocaleSet, XFAObjectArray]
- "public_pdf_worker_min_localesetnamespace_calendarsymbols": ".calendarSymbols()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, CalendarSymbols]
- "public_pdf_worker_min_localesetnamespace_currencysymbol": ".currencySymbol()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, CurrencySymbol]
- "public_pdf_worker_min_localesetnamespace_currencysymbols": ".currencySymbols()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, CurrencySymbols]
- "public_pdf_worker_min_localesetnamespace_datepattern": ".datePattern()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, DatePattern]
- "public_pdf_worker_min_localesetnamespace_datepatterns": ".datePatterns()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, DatePatterns]
- "public_pdf_worker_min_localesetnamespace_datetimesymbols": ".dateTimeSymbols()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, DateTimeSymbols]
- "public_pdf_worker_min_localesetnamespace_day": ".day()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, Day]
- "public_pdf_worker_min_localesetnamespace_daynames": ".dayNames()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, DayNames]
- "public_pdf_worker_min_localesetnamespace_era": ".era()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, Era]
- "public_pdf_worker_min_localesetnamespace_eranames": ".eraNames()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, EraNames]
- "public_pdf_worker_min_localesetnamespace_locale": ".locale()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, locale_set_Locale]
- "public_pdf_worker_min_localesetnamespace_localeset": ".localeSet()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, locale_set_LocaleSet]
- "public_pdf_worker_min_localesetnamespace_meridiem": ".meridiem()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, Meridiem]
- "public_pdf_worker_min_localesetnamespace_meridiemnames": ".meridiemNames()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, MeridiemNames]
- "public_pdf_worker_min_localesetnamespace_month": ".month()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, Month]
- "public_pdf_worker_min_localesetnamespace_monthnames": ".monthNames()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, MonthNames]
- "public_pdf_worker_min_localesetnamespace_numberpattern": ".numberPattern()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, NumberPattern]
- "public_pdf_worker_min_localesetnamespace_numberpatterns": ".numberPatterns()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, NumberPatterns]
- "public_pdf_worker_min_localesetnamespace_numbersymbol": ".numberSymbol()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, NumberSymbol]
- "public_pdf_worker_min_localesetnamespace_numbersymbols": ".numberSymbols()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, NumberSymbols]
- "public_pdf_worker_min_localesetnamespace_timepattern": ".timePattern()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, TimePattern]
- "public_pdf_worker_min_localesetnamespace_timepatterns": ".timePatterns()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, TimePatterns]
- "public_pdf_worker_min_localesetnamespace_typeface": ".typeFace()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, TypeFace]
- "public_pdf_worker_min_localesetnamespace_typefaces": ".typeFaces()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LocaleSetNamespace, TypeFaces]
- "public_pdf_worker_min_lockdocument_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LockDocument, getStringOption()]
- "public_pdf_worker_min_lockdocument_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LockDocument, getStringOption()]
- "public_pdf_worker_min_lzwstream_readblock": ".readBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LZWStream, .log()]
- "public_pdf_worker_min_mapelement_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MapElement, XFAObjectArray]
- "public_pdf_worker_min_margin_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Margin, getMeasurement()]
- "public_pdf_worker_min_margin_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Margin, measureToString()]
- "public_pdf_worker_min_markupannotation_createnewprintannotation": ".createNewPrintAnnotation()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.printNewAnnotations(), MarkupAnnotation]
- "public_pdf_worker_min_markupannotation_setcreationdate": ".setCreationDate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MarkupAnnotation, .constructor()]
- "public_pdf_worker_min_meridiemnames_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeridiemNames, XFAObjectArray]
- "public_pdf_worker_min_meshshading_getir": ".getIR()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, FormatError]
- "public_pdf_worker_min_meshshading_packdata": "._packData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, .constructor()]
- "public_pdf_worker_min_meshshading_updatebounds": "._updateBounds()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MeshShading, .constructor()]
- "public_pdf_worker_min_meshstreamreader_align": ".align()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._decodeType4Shading(), MeshStreamReader]
- "public_pdf_worker_min_message_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Message, XFAObjectArray]
- "public_pdf_worker_min_messagehandler_z": ".#z()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[MessageHandler, wrapReason()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-074.json

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
