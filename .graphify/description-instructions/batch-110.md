# Node Description Batch 111 of 139

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

- "public_pdf_worker_min_da": "dA" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_datahandler_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DataHandler]
- "public_pdf_worker_min_datasets_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Datasets]
- "public_pdf_worker_min_datasets_data_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[datasets_Data]
- "public_pdf_worker_min_datasets_data_mr": ".[Mr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[datasets_Data]
- "public_pdf_worker_min_datasets_or": ".[Or]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Datasets]
- "public_pdf_worker_min_datasetsnamespace_cn": ".[cn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatasetsNamespace]
- "public_pdf_worker_min_datasetxmlparser_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatasetXMLParser]
- "public_pdf_worker_min_datasetxmlparser_onendelement": ".onEndElement()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DatasetXMLParser]
- "public_pdf_worker_min_dateelement_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateElement]
- "public_pdf_worker_min_dateelement_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateElement]
- "public_pdf_worker_min_datetime_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateTime]
- "public_pdf_worker_min_datetime_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateTime]
- "public_pdf_worker_min_datetimesymbols_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DateTimeSymbols]
- "public_pdf_worker_min_day_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Day]
- "public_pdf_worker_min_debug_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Debug]
- "public_pdf_worker_min_decimal_gr": ".[gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Decimal]
- "public_pdf_worker_min_decodestream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodestream_ensurebuffer": ".ensureBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodestream_getbasestreams": ".getBaseStreams()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodestream_getbyte": ".getByte()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodestream_getbytes": ".getBytes()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodestream_getimagedata": ".getImageData()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodestream_isempty": ".isEmpty()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodestream_reset": ".reset()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodeStream]
- "public_pdf_worker_min_decodingcontext_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecodingContext]
- "public_pdf_worker_min_decryptstream_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DecryptStream]
- "public_pdf_worker_min_defaultui_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DefaultUi]
- "public_pdf_worker_min_destination_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Destination]
- "public_pdf_worker_min_devicecmykcs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceCmykCS]
- "public_pdf_worker_min_devicecmykcs_getoutputlength": ".getOutputLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceCmykCS]
- "public_pdf_worker_min_devicecmykcs_getrgbbuffer": ".getRgbBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceCmykCS]
- "public_pdf_worker_min_devicecmykcs_getrgbitem": ".getRgbItem()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceCmykCS]
- "public_pdf_worker_min_devicecmykcs_t": ".#t()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceCmykCS]
- "public_pdf_worker_min_devicegraycs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceGrayCS]
- "public_pdf_worker_min_devicegraycs_getoutputlength": ".getOutputLength()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceGrayCS]
- "public_pdf_worker_min_devicegraycs_getrgbbuffer": ".getRgbBuffer()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceGrayCS]
- "public_pdf_worker_min_devicegraycs_getrgbitem": ".getRgbItem()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceGrayCS]
- "public_pdf_worker_min_devicergbacs_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbaCS]
- "public_pdf_worker_min_devicergbacs_fillrgb": ".fillRgb()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[DeviceRgbaCS]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-110.json

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
