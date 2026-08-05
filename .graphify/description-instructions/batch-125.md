# Node Description Batch 126 of 139

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

- "public_pdf_worker_min_word64_rotateright": ".rotateRight()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Word64]
- "public_pdf_worker_min_word64_shiftleft": ".shiftLeft()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Word64]
- "public_pdf_worker_min_word64_shiftright": ".shiftRight()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Word64]
- "public_pdf_worker_min_word64_xor": ".xor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Word64]
- "public_pdf_worker_min_workertask_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WorkerTask]
- "public_pdf_worker_min_workertask_finish": ".finish()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WorkerTask]
- "public_pdf_worker_min_workertask_finished": ".finished()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WorkerTask]
- "public_pdf_worker_min_workertask_terminate": ".terminate()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WorkerTask]
- "public_pdf_worker_min_ws": "ws" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_wsdladdress_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WsdlAddress]
- "public_pdf_worker_min_wsdlconnection_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[WsdlConnection]
- "public_pdf_worker_min_wt": "wt" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_xa": "xa" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs]
- "public_pdf_worker_min_xdp_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Xdp]
- "public_pdf_worker_min_xdp_xdp_pr": ".[Pr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[xdp_Xdp]
- "public_pdf_worker_min_xdpnamespace_cn": ".[cn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XdpNamespace]
- "public_pdf_worker_min_xfaattribute_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAAttribute]
- "public_pdf_worker_min_xfaattribute_er": ".[Er]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAAttribute]
- "public_pdf_worker_min_xfaattribute_sn": ".[sn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAAttribute]
- "public_pdf_worker_min_xfaattribute_tn": ".[tn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAAttribute]
- "public_pdf_worker_min_xfaattribute_ur": ".[Ur]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAAttribute]
- "public_pdf_worker_min_xfaattribute_wr": ".[wr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAAttribute]
- "public_pdf_worker_min_xfaattribute_xr": ".[xr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAAttribute]
- "public_pdf_worker_min_xfaobject_an": ".[An]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_cr": ".[Cr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_dr": ".[Dr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_en": ".[en]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_fr": ".[Fr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_gr": ".[Gr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_hr": ".[Hr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_isxfaobject": ".isXFAObject()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_isxfaobjectarray": ".isXFAObjectArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_jr": ".[Jr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_kn": ".[kn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_kr": ".[kr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_mr": ".[Mr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_nn": ".[nn]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_nr": ".[Nr]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]
- "public_pdf_worker_min_xfaobject_on": ".[on]()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[XFAObject]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-125.json

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
