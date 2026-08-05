# Node Description Batch 74 of 139

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

- "public_pdf_worker_min_imageresizer_setmaxarea": ".setMaxArea()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ImageResizer, .setOptions()]
- "public_pdf_worker_min_inchex": "incHex()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .process()]
- "public_pdf_worker_min_indexedcs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IndexedCS, FormatError]
- "public_pdf_worker_min_indexedcs_isdefaultdecode": ".isDefaultDecode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IndexedCS, warn()]
- "public_pdf_worker_min_instantiatesync": "instantiateSync()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, tryParseAsDataURI()]
- "public_pdf_worker_min_int16": "int16()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair()]
- "public_pdf_worker_min_integer_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Integer, valueToHtml()]
- "public_pdf_worker_min_integerobject_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[IntegerObject, getInteger()]
- "public_pdf_worker_min_iseven": "isEven()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, bidi()]
- "public_pdf_worker_min_ishexdigit": "isHexDigit()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_isodd": "isOdd()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, bidi()]
- "public_pdf_worker_min_isrefsequal": "isRefsEqual()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._getPageIndex()]
- "public_pdf_worker_min_isspecial": "isSpecial()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getToken()]
- "public_pdf_worker_min_iswinnamerecord": "isWinNameRecord()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .checkAndRepair()]
- "public_pdf_worker_min_jbig2stream_bytes": ".bytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Jbig2Stream, shadow()]
- "public_pdf_worker_min_jpegimage_convertcmyktorgb": "._convertCmykToRgb()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegimage_convertcmyktorgba": "._convertCmykToRgba()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegimage_convertyccktocmyk": "._convertYcckToCmyk()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegimage_convertyccktorgb": "._convertYcckToRgb()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegimage_convertyccktorgba": "._convertYcckToRgba()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegimage_convertycctorgb": "._convertYccToRgb()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegimage_convertycctorgba": "._convertYccToRgba()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegimage_getlinearizedblockdata": "._getLinearizedBlockData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegImage, .getData()]
- "public_pdf_worker_min_jpegstream_bytes": ".bytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegStream, shadow()]
- "public_pdf_worker_min_jpegstream_canuseimagedecoder": ".canUseImageDecoder()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegStream, shadow()]
- "public_pdf_worker_min_jpegstream_decodeimage": ".decodeImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegStream, JpegImage]
- "public_pdf_worker_min_jpegstream_gettransferableimage": ".getTransferableImage()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpegStream, warn()]
- "public_pdf_worker_min_jpximage_decode": ".decode()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpxImage, JpxError]
- "public_pdf_worker_min_jpxstream_bytes": ".bytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[JpxStream, shadow()]
- "public_pdf_worker_min_jr": "Jr" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Qr]()]
- "public_pdf_worker_min_keep_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Keep, getStringOption()]
- "public_pdf_worker_min_keyusage_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[KeyUsage, getStringOption()]
- "public_pdf_worker_min_kn": "kn" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .[Fn]()]
- "public_pdf_worker_min_labcs_useszerotoonerange": ".usesZeroToOneRange()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LabCS, shadow()]
- "public_pdf_worker_min_labelprinter_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LabelPrinter, getStringOption()]
- "public_pdf_worker_min_lexer_skiptonextline": ".skipToNextLine()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Lexer, .makeStream()]
- "public_pdf_worker_min_li": "li" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor()]
- "public_pdf_worker_min_line_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Line, getStringOption()]
- "public_pdf_worker_min_linear_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Linear, getStringOption()]
- "public_pdf_worker_min_linearization": "Linearization" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-073.json

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
