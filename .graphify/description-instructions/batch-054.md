# Node Description Batch 55 of 139

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

- "public_pdf_worker_min_ref_fromstring": ".fromString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.#X(), Ref, .items()]
- "public_pdf_worker_min_refelement": "RefElement" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .ref()]
- "public_pdf_worker_min_renderpolicy": "RenderPolicy" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .renderPolicy(), .constructor()]
- "public_pdf_worker_min_root_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Root, gr, _r]
- "public_pdf_worker_min_rootelement": "RootElement" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .rootElement(), .constructor()]
- "public_pdf_worker_min_runscripts": "RunScripts" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .runScripts(), .constructor()]
- "public_pdf_worker_min_script": "Script" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .script()]
- "public_pdf_worker_min_scriptmodel": "ScriptModel" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .scriptModel(), .constructor()]
- "public_pdf_worker_min_setproperty": "SetProperty" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .setProperty()]
- "public_pdf_worker_min_severity": "Severity" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .severity(), .constructor()]
- "public_pdf_worker_min_signature": "Signature" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .signature()]
- "public_pdf_worker_min_signature_signature": "signature_Signature" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .signature()]
- "public_pdf_worker_min_signaturenamespace": "SignatureNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[cn](), .signature()]
- "public_pdf_worker_min_signdata": "SignData" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .signData()]
- "public_pdf_worker_min_signing": "Signing" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .signing()]
- "public_pdf_worker_min_signing_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Signing, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_silentprint": "SilentPrint" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .silentPrint(), .constructor()]
- "public_pdf_worker_min_simpledomnode_dump": ".dump()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleDOMNode, encodeToXmlString(), .hasChildNodes()]
- "public_pdf_worker_min_simpleglyph_parse": ".parse()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleGlyph, Contour, getInt16()]
- "public_pdf_worker_min_simplesegmentvisitor_onpatterndictionary": ".onPatternDictionary()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, decodeBitmap(), DecodingContext]
- "public_pdf_worker_min_soapaction": "SoapAction" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .soapAction(), .constructor()]
- "public_pdf_worker_min_soapaddress": "SoapAddress" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .soapAddress(), .constructor()]
- "public_pdf_worker_min_span": "Span" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .span()]
- "public_pdf_worker_min_speak": "Speak" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .speak()]
- "public_pdf_worker_min_speak_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Speak, getInteger(), getStringOption()]
- "public_pdf_worker_min_squareannotation": "SquareAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_squigglyannotation": "SquigglyAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_stampannotation_createimage": ".createImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StampAnnotation, Dict, Stream]
- "public_pdf_worker_min_stampannotation_createnewappearancestream": ".createNewAppearanceStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StampAnnotation, Dict, StringStream]
- "public_pdf_worker_min_staple": "Staple" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .staple(), .constructor()]
- "public_pdf_worker_min_startnode": "StartNode" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .startNode(), .constructor()]
- "public_pdf_worker_min_startpage": "StartPage" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .startPage(), .constructor()]
- "public_pdf_worker_min_strikeoutannotation": "StrikeOutAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_stringtoutf16string": "stringToUTF16String()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, stringToAsciiOrUTF16BE(), ._getAppearance()]
- "public_pdf_worker_min_structelement": "StructElement" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parseKid()]
- "public_pdf_worker_min_structelementnode_parsekids": ".parseKids()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructElementNode, .constructor(), .parseKid()]
- "public_pdf_worker_min_structtreepage_collectobjects": ".collectObjects()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreePage, NumberTree, .#v()]
- "public_pdf_worker_min_structtreeroot_cancreatestructuretree": ".canCreateStructureTree()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, warn(), .createDocumentHandler()]
- "public_pdf_worker_min_structtreeroot_init": ".init()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._readStructTreeRoot(), StructTreeRoot, .readRoleMap()]
- "public_pdf_worker_min_structtreeroot_q": ".#q()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[StructTreeRoot, .fetchIfRef(), .getNewTemporaryRef()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-054.json

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
