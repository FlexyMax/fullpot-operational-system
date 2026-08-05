# Node Description Batch 12 of 139

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

- "inventory_entry_modaldeletepackingdetails": "ModalDeletePackingDetails.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalDeletePackingDetails.tsx:L1 | neighbors=[bbc39ac feat(inventory-entry): migrate …, fmt2(), ModalDeletePackingDetails(), Props, t(), utils.ts]
- "inventory_entry_modaleditbox": "ModalEditBox.tsx" | kind=code-symbol | source=src/components/inventory-entry/ModalEditBox.tsx:L1 | neighbors=[6285dc8 fix(qc+inventory-entry): Scan O…, calc(), EMPTY, fmt2(), fmt4(), ModalEditBox()]
- "invoice_email_route": "route.ts" | kind=code-symbol | source=src/app/api/customer-payments/invoice-email/route.ts:L1 | neighbors=[7841f8d fix(ar): invoice search navigat…, ba40c73 feat(ar): fix invoice print/ema…, bffba33 fix(ar): use correct InvoiceHTM…, createTransporter(), POST(), db.ts]
- "lib_dates_todayest": "todayEST()" | kind=code-symbol | source=src/lib/dates.ts:L12 | neighbors=[page.tsx, Shared.tsx, route.ts, page.tsx, dates.ts, route.ts]
- "line_route": "route.ts" | kind=code-symbol | source=src/app/api/standing-orders/line/route.ts:L1 | neighbors=[5c9b4e0 feat(standing-orders): register…, 821d7d5 feat(standing-orders): audit lo…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog()]
- "notes_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/notes/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), GET()]
- "outcome_details_route": "route.ts" | kind=code-symbol | source=src/app/api/payment-authorizations/outcome-details/route.ts:L1 | neighbors=[ce6710b feat(audit+ux): serverAuditLog …, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), DELETE()]
- "pob_route": "route.ts" | kind=code-symbol | source=src/app/api/accounts-payable/pob/route.ts:L1 | neighbors=[5949fec feat(audit): server-side bitaco…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), DELETE()]
- "price_route": "route.ts" | kind=code-symbol | source=src/app/api/inventory-entry/boxes/[unico]/price/route.ts:L1 | neighbors=[3b0d9e6 feat(inventory-entry): add serv…, db.ts, executeProcedure(), serverAudit.ts, serverAuditLog(), num()]
- "public_pdf_worker_min_arcfourcipher": "ARCFourCipher" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .decryptBlock(), .encrypt(), .encryptBlock(), .createCipherTransform()]
- "public_pdf_worker_min_area": "Area" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .[Cr](), .[Gr](), .[Jr](), .[nn]()]
- "public_pdf_worker_min_basepdfmanager_ensuredoc": ".ensureDoc()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.createGlobals(), ._getPageIndex(), BasePdfManager, .getOperatorList(), .checkLastPage(), .fieldObjects()]
- "public_pdf_worker_min_bidi": "bidi()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._parseStringHelper(), createBidiText(), findUnequal(), isEven(), isOdd()]
- "public_pdf_worker_min_cffcompiler_compileprivatedicts": ".compilePrivateDicts()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFCompiler, .compile(), .compileDict(), .compileIndex(), .hasName(), CFFOffsetTracker]
- "public_pdf_worker_min_cfffont": "CFFFont" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), ._createBuiltInEncoding(), .getCharset(), .getGlyphMapping(), .hasGlyphId()]
- "public_pdf_worker_min_cffparser_parseprivatedict": ".parsePrivateDict()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[CFFParser, .parse(), .hasName(), .removeByName(), .setByName(), .createDict()]
- "public_pdf_worker_min_cffstrings": "CFFStrings" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .parseStringIndex(), .add(), .constructor(), .count()]
- "public_pdf_worker_min_ciphertransformfactory": "CipherTransformFactory" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .createCipherTransform(), .#H(), .#J(), .#L()]
- "public_pdf_worker_min_colorspace_getrgb": ".getRgb()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[._readDocumentOutline(), ColorSpace, .constructor(), .readComponents(), .buildFormXObject(), .getOperatorList()]
- "public_pdf_worker_min_compilecharstring": "compileCharString()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getFDIndex(), FormatError, getSubroutineBias(), lookupCmap(), .shift()]
- "public_pdf_worker_min_decodingcontext": "DecodingContext" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .contextCache(), .decoder(), .onImmediateGenericRegion(), .onImmediateHalftoneRegion()]
- "public_pdf_worker_min_dict_delete": ".delete()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.onReceiveData(), Dict, .createNewDict(), .checkFirstPage(), .checkLastPage(), .remove()]
- "public_pdf_worker_min_filespec": "FileSpec" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .attachments(), .parseDestDictionary(), .constructor(), .constructor(), .content()]
- "public_pdf_worker_min_lineannotation_constructor": ".constructor()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[LineAnnotation, .setLineEndings(), .getArray(), getPdfColorArray(), getRgbColor(), lookupRect()]
- "public_pdf_worker_min_meshstreamreader": "MeshStreamReader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructor(), .align(), .constructor(), .hasData(), .readBits()]
- "public_pdf_worker_min_objectloader_walk": "._walk()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[ObjectLoader, .load(), addChildren(), .requestAllChunks(), .requestRanges(), .pop()]
- "public_pdf_worker_min_opentypefilebuilder_toarray": ".toArray()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[.checkAndRepair(), .convert(), OpenTypeFileBuilder, .getSearchParams(), readUint32(), string32()]
- "public_pdf_worker_min_parser_findascii85decodeinlinestreamend": ".findASCII85DecodeInlineStreamEnd()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .peekByte(), .peekBytes(), .skip(), isWhiteSpace(), .findDefaultInlineStreamEnd()]
- "public_pdf_worker_min_parser_getobj": ".getObj()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .decryptString(), Dict, info(), isCmd(), .makeInlineImage()]
- "public_pdf_worker_min_parser_makestream": ".makeStream()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[Parser, .getObj(), .createStream(), FormatError, info(), isCmd()]
- "public_pdf_worker_min_partialevaluator_preevaluatefont": ".preEvaluateFont()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .loadFont(), .peekBytes(), .getRawValues(), FormatError, MurmurHash3_64]
- "public_pdf_worker_min_partialevaluator_setgstate": ".setGState()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[PartialEvaluator, .getOperatorList(), .getKeys(), info(), isName(), normalizeBlendMode()]
- "public_pdf_worker_min_pdffunctionfactory": "PDFFunctionFactory" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._pdfFunctionFactory(), ._pdfFunctionFactory(), ._cache(), .constructor(), .create()]
- "public_pdf_worker_min_pdfworkerstreamreader": "PDFWorkerStreamReader" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getFullReader(), .cancel(), .constructor(), .contentLength(), .headersReady()]
- "public_pdf_worker_min_postscriptparser": "PostScriptParser" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .constructPostScript(), .accept(), .constructor(), .expect(), .nextToken()]
- "public_pdf_worker_min_postscripttoken": "PostScriptToken" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getToken(), .constructor(), .getOperator(), .IF(), .IFELSE()]
- "public_pdf_worker_min_simplesegmentvisitor_onimmediatehalftoneregion": ".onImmediateHalftoneRegion()" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[SimpleSegmentVisitor, decodeBitmap(), decodeMMRBitmap(), DecodingContext, Jbig2Error, log2()]
- "public_pdf_worker_min_structtreepage": "StructTreePage" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, ._parseStructTree(), .addNode(), .addTopLevelNode(), .collectObjects(), .constructor()]
- "public_pdf_worker_min_textstate": "TextState" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .getTextContent(), .carriageReturn(), .clone(), .constructor(), .setTextLineMatrix()]
- "public_pdf_worker_min_textwidgetannotation": "TextWidgetAnnotation" | kind=code-symbol | source=public/pdf.worker.min.mjs:L21 | neighbors=[pdf.worker.min.mjs, .create(), .constructor(), .extractTextContent(), ._getCombAppearance(), .getFieldObject()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-011.json

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
