# Node Description Batch 49 of 139

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

- "public_pdf_worker_min_effectiveoutputpolicy": "EffectiveOutputPolicy" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .effectiveOutputPolicy(), .constructor()]
- "public_pdf_worker_min_embed": "Embed" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .embed(), .constructor()]
- "public_pdf_worker_min_encodetoxmlstring": "encodeToXmlString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .dump(), .[gn]()]
- "public_pdf_worker_min_encoding": "Encoding" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encoding()]
- "public_pdf_worker_min_encodings": "Encodings" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encodings()]
- "public_pdf_worker_min_encodings_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Encodings, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_encrypt": "Encrypt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encrypt()]
- "public_pdf_worker_min_encryptdata": "EncryptData" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encryptData()]
- "public_pdf_worker_min_encryption": "Encryption" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encryption()]
- "public_pdf_worker_min_encryption_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Encryption, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_encryptionlevel": "EncryptionLevel" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .encryptionLevel(), .constructor()]
- "public_pdf_worker_min_encryptionmethod": "EncryptionMethod" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encryptionMethod()]
- "public_pdf_worker_min_encryptionmethods": "EncryptionMethods" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .encryptionMethods()]
- "public_pdf_worker_min_encryptionmethods_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EncryptionMethods, getStringOption(), XFAObjectArray]
- "public_pdf_worker_min_enforce": "Enforce" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .enforce(), .constructor()]
- "public_pdf_worker_min_equate": "Equate" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .equate(), .constructor()]
- "public_pdf_worker_min_era": "Era" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .era()]
- "public_pdf_worker_min_eranames": "EraNames" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .eraNames()]
- "public_pdf_worker_min_evaluatorpreprocessor_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EvaluatorPreprocessor, Lexer, Parser]
- "public_pdf_worker_min_evaluatorpreprocessor_opmap": ".opMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EvaluatorPreprocessor, shadow(), .assign()]
- "public_pdf_worker_min_evaluatorpreprocessor_preprocesscommand": ".preprocessCommand()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[EvaluatorPreprocessor, .restore(), .read()]
- "public_pdf_worker_min_event": "Event" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .event()]
- "public_pdf_worker_min_exclgroup_tn": ".[tn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExclGroup, tn, Value]
- "public_pdf_worker_min_excludens": "ExcludeNS" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .excludeNS(), .constructor()]
- "public_pdf_worker_min_exdata_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ExData, getInteger(), getStringOption()]
- "public_pdf_worker_min_execute": "Execute" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .execute()]
- "public_pdf_worker_min_exobject": "ExObject" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .exObject()]
- "public_pdf_worker_min_extendcmap": "extendCMap()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, createBuiltInCMap(), parseCMap()]
- "public_pdf_worker_min_extras": "Extras" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .extras()]
- "public_pdf_worker_min_fakeunicodefont_basefontref": ".baseFontRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, Dict, .getNewPersistentRef()]
- "public_pdf_worker_min_fakeunicodefont_createcontext": "._createContext()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, .createAppearance(), .createFontResources()]
- "public_pdf_worker_min_fakeunicodefont_createfontresources": ".createFontResources()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, ._createContext(), ._getAppearance()]
- "public_pdf_worker_min_fakeunicodefont_descendantfontref": ".descendantFontRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, Dict, .getNewPersistentRef()]
- "public_pdf_worker_min_fakeunicodefont_fontdescriptorref": ".fontDescriptorRef()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FakeUnicodeFont, Dict, .getNewPersistentRef()]
- "public_pdf_worker_min_fileattachmentannotation": "FileAttachmentAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor()]
- "public_pdf_worker_min_fileattachmentannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FileAttachmentAnnotation, FileSpec, stringToPDFString()]
- "public_pdf_worker_min_filespec_description": ".description()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[FileSpec, shadow(), stringToPDFString()]
- "public_pdf_worker_min_filter": "Filter" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .filter()]
- "public_pdf_worker_min_filter_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Filter, getInteger(), getStringOption()]
- "public_pdf_worker_min_findblock": "findBlock()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, isWhiteSpace(), .constructor()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-048.json

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
