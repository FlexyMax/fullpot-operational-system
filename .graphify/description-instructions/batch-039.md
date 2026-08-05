# Node Description Batch 40 of 139

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

- "public_pdf_worker_min_setpara": "setPara()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[nn](), .[nn](), getCurrentPara()]
- "public_pdf_worker_min_signaturewidgetannotation": "SignatureWidgetAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), .getFieldObject()]
- "public_pdf_worker_min_simpledomnode_haschildnodes": ".hasChildNodes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._parse(), ._parseArray(), SimpleDOMNode, .dump()]
- "public_pdf_worker_min_skipdata": "skipData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .canUseImageDecoder(), findNextFileMarker(), readUint16()]
- "public_pdf_worker_min_solid": "Solid" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .solid()]
- "public_pdf_worker_min_squigglyannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SquigglyAnnotation, getPdfColorArray(), getQuadPoints(), ._setDefaultAppearance()]
- "public_pdf_worker_min_stampannotation_createnewdict": ".createNewDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StampAnnotation, Dict, getModificationDate(), stringToAsciiOrUTF16BE()]
- "public_pdf_worker_min_statemanager_restore": ".restore()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.preprocessCommand(), .getOperatorList(), StateManager, .pop()]
- "public_pdf_worker_min_stipple": "Stipple" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .stipple()]
- "public_pdf_worker_min_streamssequencestream": "StreamsSequenceStream" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .getBaseStreams(), .readBlock()]
- "public_pdf_worker_min_strikeoutannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StrikeOutAnnotation, getPdfColorArray(), getQuadPoints(), ._setDefaultAppearance()]
- "public_pdf_worker_min_structelementnode_parsekid": ".parseKid()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructElementNode, StructElement, .fetch(), .parseKids()]
- "public_pdf_worker_min_structtreeroot_canupdatestructtree": ".canUpdateStructTree()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, NumberTree, warn(), .createDocumentHandler()]
- "public_pdf_worker_min_structtreeroot_k": ".#K()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, isName(), .fetch(), .fetchIfRef()]
- "public_pdf_worker_min_subformset_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SubformSet, getRelevant(), getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_subjectdn": "SubjectDN" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gr](), .subjectDN()]
- "public_pdf_worker_min_template_font_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[template_Font, measureToString(), setFontFamily(), toStyle()]
- "public_pdf_worker_min_template_pattern": "template_Pattern" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[on](), .pattern()]
- "public_pdf_worker_min_text_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Text, .success(), nn, valueToHtml()]
- "public_pdf_worker_min_textwidgetannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[TextWidgetAnnotation, getInheritableProperty(), warn(), .hasFieldFlag()]
- "public_pdf_worker_min_truetypecompiled": "TrueTypeCompiled" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .compileGlyphImpl(), .constructor()]
- "public_pdf_worker_min_type1charstring_convert": ".convert()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type1CharString, .pop(), .executeCommand(), warn()]
- "public_pdf_worker_min_type2compiled": "Type2Compiled" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .compileGlyphImpl(), .constructor()]
- "public_pdf_worker_min_ui": "ui" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[nn](), .[ur]()]
- "public_pdf_worker_min_underlineannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[UnderlineAnnotation, getPdfColorArray(), getQuadPoints(), ._setDefaultAppearance()]
- "public_pdf_worker_min_util_makehexcolor": ".makeHexColor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.[on](), .constructor(), .[on](), Util]
- "public_pdf_worker_min_validateapprovalsignatures": "ValidateApprovalSignatures" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .validateApprovalSignatures(), .constructor(), .[gr]()]
- "public_pdf_worker_min_validatefontname": "validateFontName()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, getFontSubstitution(), validateCSSFont(), warn()]
- "public_pdf_worker_min_variables": "Variables" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .variables(), .constructor(), .[Jr]()]
- "public_pdf_worker_min_widgetannotation_getsavefieldresources": "._getSaveFieldResources()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WidgetAnnotation, Dict, .merge(), .save()]
- "public_pdf_worker_min_widgetannotation_gettextwidth": "._getTextWidth()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._getAppearance(), WidgetAnnotation, ._computeFontSize(), ._renderText()]
- "public_pdf_worker_min_window": "Window" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .window(), .constructor(), .[gr]()]
- "public_pdf_worker_min_workermessagehandler": "WorkerMessageHandler" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .createDocumentHandler(), .initializeFromPort(), .setup()]
- "public_pdf_worker_min_xdp_xdp": "xdp_Xdp" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Pr](), .xdp()]
- "public_pdf_worker_min_xfafactory_setfonts": ".setFonts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.loadXfaFonts(), XFAFactory, FontFinder, stripQuotes()]
- "public_pdf_worker_min_xfaobject_qr": ".[Qr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, Jr, Qr, XFAAttribute]
- "public_pdf_worker_min_xfaparser_onendelement": ".onEndElement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAParser, An, gr, .pop()]
- "public_pdf_worker_min_xhtmlobject_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XhtmlObject, .success(), mapStyle(), _s]
- "public_pdf_worker_min_xmlobject_gn": ".[gn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XmlObject, encodeToXmlString(), gn, utf8StringToString()]
- "public_pdf_worker_min_xref_fetchifrefasync": ".fetchIfRefAsync()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._getPageIndex(), writeStream(), XRef, .fetchAsync()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-039.json

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
