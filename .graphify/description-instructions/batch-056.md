# Node Description Batch 57 of 139

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

- "public_pdf_worker_min_type2compiled_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Type2Compiled, getSubroutineBias(), xi]
- "public_pdf_worker_min_typeface": "TypeFace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .typeFace(), .constructor()]
- "public_pdf_worker_min_typefaces": "TypeFaces" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .typeFaces(), .constructor()]
- "public_pdf_worker_min_ui_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ui, nn, ur]
- "public_pdf_worker_min_ul": "Ul" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .ul()]
- "public_pdf_worker_min_underlineannotation": "UnderlineAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_unexpectedresponseexception": "UnexpectedResponseException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), wrapReason()]
- "public_pdf_worker_min_unknownerrorexception": "UnknownErrorException" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), wrapReason()]
- "public_pdf_worker_min_uri": "Uri" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .uri(), .constructor()]
- "public_pdf_worker_min_utf8stringtostring": "utf8StringToString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[gn]()]
- "public_pdf_worker_min_util_applytransform": ".applyTransform()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._transformPoint(), Util, .getAxialAlignedBoundingBox()]
- "public_pdf_worker_min_util_getaxialalignedboundingbox": ".getAxialAlignedBoundingBox()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[getTransformMatrix(), Util, .applyTransform()]
- "public_pdf_worker_min_validate": "Validate" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .validate(), .constructor()]
- "public_pdf_worker_min_validatecssfont": "validateCSSFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .loadXfaFonts(), validateFontName()]
- "public_pdf_worker_min_validationmessaging": "ValidationMessaging" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .validationMessaging(), .constructor()]
- "public_pdf_worker_min_value_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Value, getInteger(), getRelevant()]
- "public_pdf_worker_min_value_tn": ".[tn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Value, Image, wr]
- "public_pdf_worker_min_version": "Version" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .version(), .constructor()]
- "public_pdf_worker_min_versioncontrol": "VersionControl" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .versionControl(), .constructor()]
- "public_pdf_worker_min_viewerpreferences": "ViewerPreferences" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .viewerPreferences(), .constructor()]
- "public_pdf_worker_min_webclient": "WebClient" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .webClient(), .constructor()]
- "public_pdf_worker_min_whitespace": "Whitespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .whitespace(), .constructor()]
- "public_pdf_worker_min_workermessagehandler_initializefromport": ".initializeFromPort()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WorkerMessageHandler, MessageHandler, .setup()]
- "public_pdf_worker_min_workermessagehandler_setup": ".setup()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WorkerMessageHandler, .initializeFromPort(), .createDocumentHandler()]
- "public_pdf_worker_min_workertask_ensurenotterminated": ".ensureNotTerminated()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.getOperatorList(), .getTextContent(), WorkerTask]
- "public_pdf_worker_min_writearray": "writeArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, writeValue(), writeObject()]
- "public_pdf_worker_min_writestring": "writeString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, computeIDs(), incrementalUpdate()]
- "public_pdf_worker_min_wsdladdress": "WsdlAddress" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .wsdlAddress(), .constructor()]
- "public_pdf_worker_min_wsdlconnection": "WsdlConnection" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .wsdlConnection(), .constructor()]
- "public_pdf_worker_min_xdc": "Xdc" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .xdc(), .constructor()]
- "public_pdf_worker_min_xdp": "Xdp" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .xdp(), .constructor()]
- "public_pdf_worker_min_xdpnamespace": "XdpNamespace" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[cn](), .xdp()]
- "public_pdf_worker_min_xfafactory_createpageshelper": "._createPagesHelper()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAFactory, ._createPages(), rn]
- "public_pdf_worker_min_xfafactory_getnumpages": ".getNumPages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.numPages(), XFAFactory, ._createPages()]
- "public_pdf_worker_min_xfafactory_getpages": ".getPages()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.htmlForXfa(), XFAFactory, ._createPages()]
- "public_pdf_worker_min_xfafactory_serializedata": ".serializeData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.serializeXfaData(), XFAFactory, .serialize()]
- "public_pdf_worker_min_xfaobject_createnodes": ".createNodes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[createDataNode(), XFAObject, XmlObject]
- "public_pdf_worker_min_xfaobject_s": ".[$s]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, .clean(), nn]
- "public_pdf_worker_min_xfaobject_un": ".[Un]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject, fn, _r]
- "public_pdf_worker_min_xfaparser_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAParser, Builder, .buildRoot()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-056.json

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
