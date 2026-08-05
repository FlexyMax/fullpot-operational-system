# Graph Report - .  (2026-08-01)

## Corpus Check
- Large corpus: 704 files · ~518,396 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 5542 nodes · 11924 edges · 333 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: calls: 3397 · contains: 2632 · method: 2117 · imports: 1332 · imports_from: 1010 · MODIFIES: 750 · ON_BRANCH: 400 · PARENT_OF: 268 · reads_from: 18


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 704 · Candidates: 741
- Excluded: 0 untracked · 56552 ignored · 0 sensitive · 0 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `f035be9`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `executeProcedure()` - 254 edges
2. `warn()` - 150 edges
3. `ConfigNamespace` - 141 edges
4. `TemplateNamespace` - 115 edges
5. `shadow()` - 92 edges
6. `FormatError` - 86 edges
7. `getStringOption()` - 85 edges
8. `authOptions` - 83 edges
9. `serverAuditLog()` - 80 edges
10. `cn()` - 80 edges

## Surprising Connections (you probably didn't know these)
- `PUT()` --calls--> `bit()`  [EXTRACTED]
  src/app/api/vendors/groups/[unico]/route.ts → src/app/api/vendors/[unico]/route.ts
- `PUT()` --calls--> `num()`  [EXTRACTED]
  src/app/api/vendors/groups/[unico]/route.ts → src/app/api/vendors/[unico]/route.ts
- `POST()` --calls--> `genUq()`  [EXTRACTED]
  src/app/api/sales-reps/cities/route.ts → src/app/api/freights/cities/route.ts
- `POST()` --calls--> `txt()`  [EXTRACTED]
  src/app/api/sales-reps/cities/route.ts → src/app/api/freights/cities/route.ts
- `POST()` --calls--> `txt()`  [EXTRACTED]
  src/app/api/system/access/copy/route.ts → src/app/api/freights/rates/copy/route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.01
Nodes (160): a, ADBE_JSConsole, ADBE_JSDebugger, Ag, Ai, As, Ba, bi (+152 more)

### Community 1 - "Community 1"
Cohesion: 0.01
Nodes (55): Acrobat7, AddSilentPrint, AddViewerPreferences, AdjustData, AdobeExtensionLevel, AlwaysEmbed, Amd, Attributes (+47 more)

### Community 2 - "Community 2"
Cohesion: 0.02
Nodes (97): 68885a9 fix(menu+scan-out): disable Scan IN tile; responsive mobile layout for Scan Out, CheckField, EntityFormModalProps, FormField, EntityListModalProps, GridMenu(), GridMenuItem, ITEM_COLORS (+89 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (136): master, worktree-agent-a59e3078904cba68a, 01eeb75 fix(users): remove invalid Event type on select onChange handler, 085a822 fix(accounts-payable): mobile toolbar wrap, orange codes, SP-only CRDB route, 0b1681d feat(ap): add multi-invoice checkbox payment to Vendor Invoices tab, 0bfb1d7 fix(auth): use first email only when DB field has comma-separated addresses, 0d80aaa fix(log): use History icon + add log to AP sub-tabs (PO, Prebooks, CrDb), 11c8872 fix(users): fix filter bar layout - select fixed width, search flex-1 (+128 more)

### Community 4 - "Community 4"
Cohesion: 0.01
Nodes (10): nullIfEmpty(), POST(), P, P, P, P, executeProcedure(), P (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.01
Nodes (52): Arc, Area, Assist, Barcode, Bind, BindItems, Bookend, Border (+44 more)

### Community 6 - "Community 6"
Cohesion: 0.02
Nodes (43): Acrobat, Agent, BatchOutput, Common, Compress, Config, config_Area, config_FontInfo (+35 more)

### Community 7 - "Community 7"
Cohesion: 0.03
Nodes (15): 1857d90 feat(scan-in): add confirm dialogs for Batch/Confirm buttons + refresh totals button, 624fb9b fix(scan-in): map all SP column names to lowercase to match SQL Server output, 6ea09a8 fix(physical-scan): quickfixes — auth, audit log, orange codes, gray bars, menu label, 7772f1b feat(scan-in): add AWB Reception / Scan IN screen, a54e0fd fix(scan-in): correct SP error/message column reading across all CRUD routes, a5dce9a fix(scan-in): pass lcUser_uq from session to sp_NC_packing_awb_insert_pkbox_control, ea21633 fix(scan-in): rename SPs to NC_ convention for insert_in_all and insert_pkbox_control, f4ad8b5 fix(scan-in): correct all SP parameter names from DB introspection (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (70): 3c0001a feat(flexy2qb): add CSV download to all 7 Ready to QB sub-tabs, 3d34448 feat(flexy2qb): comprehensive tab fixes across all 7 modules, 3ed1d77 fix(flexy2qb): correctly pass record unico to audit log after CRUD, 50212fd style(flexy2qb): taller sub-tab bar on mobile (h-11 vs h-9) + bigger text, 6e51a97 fix(flexy2qb): show real SP error message in all 6 tabs, 6e70d68 fix(flexy2qb): remove extra date params from OCharges/Credits SP calls, 7448ff1 fix(flexy2qb): Mark as Not Ready By Date uses row date not panel date, 80a4735 fix(flexy2qb): refresh dates panel after mutations in Purchases2QB (+62 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (23): ButtonWidgetAnnotation, ChoiceWidgetAnnotation, DefaultAppearanceEvaluator, Dict, escapeString(), FakeUnicodeFont, FileAttachmentAnnotation, FreeTextAnnotation (+15 more)

### Community 10 - "Community 10"
Cohesion: 0.03
Nodes (53): EMPTY_ARR, PERM_FIELDS, PERM_LABELS, PermField, SA_PANTA, CrdbForm, crdbSchema, DAYS (+45 more)

### Community 11 - "Community 11"
Cohesion: 0.04
Nodes (19): addLocallyCachedImageOps(), getTilingPatternIR(), getXfaFontDict(), getXfaFontName(), hs, ia, isPDFFunction(), LocalGStateCache (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.05
Nodes (20): Catalog, collectActions(), convertCidString(), createValidAbsoluteUrl(), DatasetReader, decodeString(), FeatureTest, fetchDest() (+12 more)

### Community 13 - "Community 13"
Cohesion: 0.04
Nodes (20): num(), POST(), txt(), ALLOWED, 15b09b1 feat(items): PanelGrid for Tab1 grids, orange codes, badges, serverAuditLog in routes, 1afc81e fix(masters/items/grades): correct table name to flower_products_grades, 5949fec feat(audit): server-side bitacora logging for all AP CRUD routes, 5c9b4e0 feat(standing-orders): register SCREEN_PANTA (XD6Z7064) (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.03
Nodes (13): AnnotationFactory, clearGlobalCaches(), cr, DataHandler, getNewAnnotationsMap(), getVerbosityLevel(), isDict(), isRefsEqual() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (38): applyAssist(), ariaLabel(), Body, CheckButton, checkDimensions(), ChoiceList, computeBbox(), Corner (+30 more)

### Community 16 - "Community 16"
Cohesion: 0.05
Nodes (48): 1ac6172 style(qc): unify StockListTab grid headers, remove duplicate search bars, larger QC buttons, 1f53c31 fix(ar/mobile): 4 mobile fixes for Customer Payments, 3091e96 feat(qc/panelgrid): Download as header icon, row selection in Transit+Cancellations, 605e4e2 feat(qc): paginate QC stock search via sp_NC_inventory_quality_control, 75a1bd0 feat(qc): AuditLogModal uses PanelGrid + add design standards to CLAUDE.md, 7c0d5ac feat(qc): infinite scroll, auto-select dates, responsive, QC History redesign, 843b4b7 fix(qc): restore useQuery import alongside useInfiniteQuery in QualityCreditsTab, 8b150b9 fix(qc): add onLog/onRefresh to all PanelGrids, fix QCHistory alignment, add month calendar (+40 more)

### Community 17 - "Community 17"
Cohesion: 0.03
Nodes (25): CalendarSymbols, CurrencySymbol, CurrencySymbols, DatePattern, DatePatterns, DateTimeSymbols, Day, DayNames (+17 more)

### Community 18 - "Community 18"
Cohesion: 0.05
Nodes (36): 080dacf feat(auth): SUPERADMIN level restrictions, U2FA toggle, multi-email 2FA, 3322075 fix(users): close unico mismatch, missing fields, and raw SQL, 8e92481 feat(system-access): convert to SPs, PanelGrid, and full CRUD audit trail, ce6710b feat(audit+ux): serverAuditLog on System/PaymentAuth routes; replace confirm() dialogs, bit(), POST(), txt(), GET() (+28 more)

### Community 19 - "Community 19"
Cohesion: 0.05
Nodes (39): 331a363 style(standing-orders): white header above gray action bar, 4c79670 feat(standing-orders): Zustand store for shared state, 505c1d8 feat(standing-orders): PDF print report via sp_flower_standing_order_report, 597add0 feat(standing-orders): Change Season modal + pbseason_uq in detail SP, 8042468 perf(standing-orders): dirty tracking in SetWeeksModal cuts PUT calls on save, c23f0a7 fix(standing-orders): auto-select first line + show all columns on mobile, d741461 style(standing-orders): gray action bar above white panel header, fa8bf19 fix(standing-orders): Add Line opens Products modal; remove Products from menu (+31 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (11): CipherTransform, find(), InvalidPDFException, isWhiteSpace(), Lexer, Parser, run(), toHexDigit() (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.07
Nodes (13): FlateStream, FormatError, getB(), isNumberArray(), lookupNormalRect(), lookupRect(), MeshShading, MeshStreamReader (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.04
Nodes (22): MUTATION_ACTIONS, P, QB_TABLE, P, 3b0d9e6 feat(inventory-entry): add server-side audit logging to all CRUD API routes, f982d3e fix(inventory-entry+qc): modal footer buttons, toast confirms, scroll, audit logs, P, P (+14 more)

### Community 23 - "Community 23"
Cohesion: 0.06
Nodes (34): Aa, adjustMapping(), adjustWidths(), amendFallbackToUnicode(), applyStandardFontGlyphMap(), buildToFontChar(), bytesToString(), CFFFont (+26 more)

### Community 24 - "Community 24"
Cohesion: 0.06
Nodes (23): addHex(), BinaryCMapReader, BinaryCMapStream, CMap, CMapFactory, createBuiltInCMap(), expectInt(), expectString() (+15 more)

### Community 25 - "Community 25"
Cohesion: 0.07
Nodes (30): COLUMNS, fmtDate(), GET(), t(), COLUMNS, GET(), t(), COLUMNS (+22 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (23): 081d28f fix(payment-auth): payments PDF reports — vendor info to header, remove GROWER from table, 0b02d04 fix(payment-auth): 4 issues — VFP modal filter, vendor header in PDF, print buttons, drill-down, 37b7727 fix(payment-auth): payments-by-date PDF — drop hardcoded columns, use buildColumns, 657dacf fix(ap-reports): filter VFP metadata columns + fix datetime format + add CSV download, a61433b fix(ap-reports): normalize column key comparison in VFP_SKIP, bd0afde fix(payment-auth): blank PDF (ASCII subtitles), detail modal vendor cols, date format, cc2daff debug(ap-reports): add format=columns to pending route to inspect SP column names, ecf4fd3 fix(reports): fix blank print + extract shared reportUtils to eliminate duplication (+15 more)

### Community 27 - "Community 27"
Cohesion: 0.07
Nodes (32): 1e63937 fix(items): Tab1 description field — conditional on auto_description, uppercase, validation, 3f5ad89 fix(tab3): trim Varieties menu to 3 (Insert/Update/Delete); move BOGO to Components, 43ad896 style(items): stack Grades, Colors, Cases vertically on mobile, 64d7480 fix(tab3): components grid now loads data — fix SP extra params + standalone CRUD, 984655c fix(items): 4 UI fixes — tab labels, toolbar above grid, button height, Tab3 PanelGrid, 9d52dd6 style(items): show Item Hierarchy first on mobile in Tab1, ae15318 fix(tab3): remove duplicate prebook buttons (already in Tab2), ce221ab fix(tab3): align panels, fix Varieties grid height, move Components search to header (+24 more)

### Community 28 - "Community 28"
Cohesion: 0.05
Nodes (13): addHTML(), Caption, createLine(), Draw, ExclGroup, Field, flushHTML(), getAvailableSpace() (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (7): DatasetXMLParser, MetadataParser, parseXFAPath(), SimpleDOMNode, SimpleXMLParser, updateXFA(), XMLParserBase

### Community 30 - "Community 30"
Cohesion: 0.07
Nodes (10): escapePDFName(), NumberTree, RefSetCache, StructTreePage, StructTreeRoot, writeArray(), writeDict(), writeObject() (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.08
Nodes (20): buildComponentData(), decodeScan(), findNextFileMarker(), getBlockBufferOffset(), Jbig2Image, Jbig2Stream, JpegError, JpegImage (+12 more)

### Community 32 - "Community 32"
Cohesion: 0.09
Nodes (5): Annotation, AnnotationBorderStyle, getRgbColor(), MarkupAnnotation, PopupAnnotation

### Community 33 - "Community 33"
Cohesion: 0.08
Nodes (28): AwbsBoxesModal(), AwbsChargesModal(), AwbsFreightsModal(), AwbsInvoiceChargesModal(), AwbsPage(), ChangeDateModal(), EMPTY_ARR, fmt() (+20 more)

### Community 34 - "Community 34"
Cohesion: 0.09
Nodes (6): CalGrayCS, CCITTFaxDecoder, CCITTFaxStream, IndexedCS, info(), LabCS

### Community 35 - "Community 35"
Cohesion: 0.05
Nodes (13): connection_set_Uri, ConnectionSet, ConnectionSetNamespace, EffectiveInputPolicy, EffectiveOutputPolicy, Operation, RootElement, SoapAction (+5 more)

### Community 36 - "Community 36"
Cohesion: 0.08
Nodes (22): genUq(), POST(), txt(), genUq(), POST(), txt(), 4cb57ca feat(freights): eliminate direct SQL, add serverAuditLog, PanelGrid modal standard, num() (+14 more)

### Community 37 - "Community 37"
Cohesion: 0.10
Nodes (9): Binder, createText(), dr, fr, Items, kr, tr, XmlObject (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.07
Nodes (8): AppearanceStreamEvaluator, buildHuffmanTable(), EvaluatorPreprocessor, LocalColorSpaceCache, LocalFunctionCache, PDFFunctionFactory, PostScriptEvaluator, PostScriptStack

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (8): BooleanElement, DateElement, DateTime, Decimal, Float, Integer, Time, valueToHtml()

### Community 40 - "Community 40"
Cohesion: 0.06
Nodes (11): ca478bf perf(customer-payments): standardize AR routes, fix SPs, orange code columns, fac809c perf(modules): eliminate raw SQL, add SP audit trail, standardize error handling, P, todayEST(), getEmpresaUq(), POST(), bit(), GET() (+3 more)

### Community 41 - "Community 41"
Cohesion: 0.09
Nodes (6): addChildren(), _collectJS(), isName(), MurmurHash3_64, ObjectLoader, RefSet

### Community 42 - "Community 42"
Cohesion: 0.10
Nodes (9): AES128Cipher, AES256Cipher, ARCFourCipher, CipherTransformFactory, isArrayEqual(), NullCipher, PDF17, PDF20 (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.08
Nodes (12): AstArgument, AstBinaryOperation, AstLiteral, AstMin, AstVariable, AstVariableDefinition, buildAddOperation(), buildMinOperation() (+4 more)

### Community 44 - "Community 44"
Cohesion: 0.07
Nodes (13): CFFFDSelect, Commands, compileCharString(), CompiledFont, FontRendererFactory, getSubroutineBias(), getUint32(), GlyfTable (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.06
Nodes (2): wn, XFAObject

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (7): Btn(), cpFetch(), EMPTY_ARR, fmt(), fmtDate(), Modal(), t()

### Community 47 - "Community 47"
Cohesion: 0.13
Nodes (4): CFFCompiler, CFFIndex, CFFOffsetTracker, stringToBytes()

### Community 48 - "Community 48"
Cohesion: 0.06
Nodes (6): DecodeStream, decrypt(), DecryptStream, isHexDigit(), LocalPdfManager, Stream

### Community 49 - "Community 49"
Cohesion: 0.10
Nodes (23): 232afb7 fix(payment-auth): safer paFetch for non-JSON error responses, 5d9ddbd feat(payment-authorizations): edit/delete payment + remove orphaned routes, 6b863f3 fix(payment-authorizations): history modal generates PDF via sp_flower_growers_pending_invoices_report2, 8364803 feat(payment-authorizations): implement Credits/Debits (CRDB) management, e1517a2 fix(payment-auth): 4 Months View shows in modal instead of replacing vendor table, e612ffd feat(payment-auth): 4 Months Detail as drill-down inside 4 Months View modal, CONTACT_SKIP_DET, EMPTY_ARR (+15 more)

### Community 50 - "Community 50"
Cohesion: 0.15
Nodes (14): decodeBitmap(), decodeIAID(), decodeInteger(), decodeMMRBitmap(), decodeRefinement(), decodeTextRegion(), getCustomHuffmanTable(), getStandardTable() (+6 more)

### Community 51 - "Community 51"
Cohesion: 0.10
Nodes (18): bit(), POST(), txt(), 4a1017f fix(customers): replace direct SQL with SPs + serverAuditLog + Sonner toasts, bit(), num(), POST(), txt() (+10 more)

### Community 52 - "Community 52"
Cohesion: 0.07
Nodes (4): Ascii85Stream, JpegStream, JpxStream, LZWStream

### Community 53 - "Community 53"
Cohesion: 0.11
Nodes (21): 165c3d0 feat(inventory-entry): update mobile card image style to full-height flush panel, 3d2b0df feat(inventory-entry): full-cell image in Boxes Detail desktop table, 3f09764 feat: sticky AP totals, IE Products tab restructure, images + mobile cards, 74dd6c2 fix(inventory-entry): restore mobile card height with min-h + h-full on image, b457960 fix(ie): correct image fetch format, fix mobile heights, restructure Products bars, d5423ca feat(inventory-entry): make product image fill full cell in desktop table, AUDIT_MAP, colorFromInt() (+13 more)

### Community 54 - "Community 54"
Cohesion: 0.11
Nodes (11): CircleAnnotation, getPdfColorArray(), getQuadPoints(), HighlightAnnotation, LineAnnotation, LinkAnnotation, PolylineAnnotation, SquareAnnotation (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.10
Nodes (13): bit(), num(), POST(), txt(), SPS, getEmpresaUq(), POST(), getEmpresaUq() (+5 more)

### Community 56 - "Community 56"
Cohesion: 0.12
Nodes (21): 1c0ea4a fix(permissions): wire correct panta_uq for users, access and companies screens, 3ab71d6 feat(scan-out): add full Scan Out screen with dual-label scan loop, 75b26c7 feat(physical-scan): add useScanStore Zustand store for currentRack, activeTab, viewKey, 8f4f4aa fix(permissions): replace all 52961702 fallbacks with verified panta_uq values, 923e449 feat(physical-scan): convert all 5 tab grids to PanelGrid standard, c12e586 feat(physical-scan): add 2 missing tabs + CSV export on all grids, d645c42 fix(permissions): assign correct panta_uq to scan screens, FULL_ACCESS (+13 more)

### Community 57 - "Community 57"
Cohesion: 0.09
Nodes (8): compileGlyf(), CompositeGlyph, Contour, getFloat214(), getInt16(), getInt8(), GlyphHeader, SimpleGlyph

### Community 58 - "Community 58"
Cohesion: 0.12
Nodes (15): 1da1d3f feat(ar): inline email editor in Send All modal + PUT contact route, 3907ed7 feat(customer-payments): default BAL>0, full totals footer, customer info bar, wider dates grid, 9ef9c8a fix(customer-payments): correct date display and CR/DB filter for NY timezone, b16e699 fix(customer-payments): add missing Unapply field to customer info bar, d74492b fix(customer-payments): sticky invoice totals row aligned to columns, fad3cb1 fix(ar): send-all shows all 122 email customers + disable checkbox with no email, fcafe0d feat(ar): wire statement email via mailer + add ap_email to customer list SP, ConfirmDelete() (+7 more)

### Community 59 - "Community 59"
Cohesion: 0.09
Nodes (4): Color, getTransformMatrix(), Stipple, Util

### Community 60 - "Community 60"
Cohesion: 0.15
Nodes (7): assert(), convertBlackAndWhiteToRGBA(), convertToRGBA(), decodeAndClamp(), PDFImage, resizeImageMask(), toRomanNumerals()

### Community 61 - "Community 61"
Cohesion: 0.16
Nodes (4): CFFCharset, CFFEncoding, CFFHeader, CFFParser

### Community 62 - "Community 62"
Cohesion: 0.12
Nodes (16): applyConfigToGrid(), BIConfigJson, BIReport, BIReportData, BISavedConfig, BIValueCol, BusinessIntelligencePage(), cleanColumnState() (+8 more)

### Community 63 - "Community 63"
Cohesion: 0.12
Nodes (16): 2fb1952 fix(vendors): handleOpenWs was calling itself instead of setWsModal(true), 5cdc4a2 fix(vendors): Web Settings modal uses sp_flower_growers_update_web, f1ce20c feat(vendors): Web Settings modal is now editable, ModalVendorTab, useVendorsStore, VendorsState, ActiveTab, EMPTY_ARR (+8 more)

### Community 64 - "Community 64"
Cohesion: 0.13
Nodes (2): BaseStream, unreachable()

### Community 65 - "Community 65"
Cohesion: 0.12
Nodes (9): COLUMNS, fmtDate(), GET(), GROUP, t(), Props, ReportGroup, styles (+1 more)

### Community 66 - "Community 66"
Cohesion: 0.14
Nodes (10): ReportModal, EMPTY_ARR, EMPTY_FORM, fmtDate(), PERM_LABELS, SalesRepsPage(), t(), ActiveTab (+2 more)

### Community 67 - "Community 67"
Cohesion: 0.19
Nodes (12): 72a649b fix(ap): remove 'use client' from PaymentAuthPDF — renderToBuffer runs server-side, 7d048ed fix(payment-authorizations): 7 UI/report fixes from live review, d8a9f3c feat(ap): add proper Payment Authorization PDF (PaymentAuthPDF component), dc1c19d feat(payment-auth): PDF reports, orange codes, ReportModal standard, CompanyInfo, c(), flex(), fmtD() (+4 more)

### Community 68 - "Community 68"
Cohesion: 0.21
Nodes (13): 7dac8f6 fix(ar): pass date range + mode to statement email, cfe2d43 feat(ar): send statement as PDF attachment + new StatementPDF component, eeffe24 feat(ar): logo + fix balance totals in StatementPDF, createTransporter(), sendStatementEmail(), sendVerificationCode(), c(), flex() (+5 more)

### Community 69 - "Community 69"
Cohesion: 0.15
Nodes (5): An, gr, Root, XFAParser, Zs

### Community 70 - "Community 70"
Cohesion: 0.16
Nodes (4): Builder, cn, Empty, UnknownNamespace

### Community 71 - "Community 71"
Cohesion: 0.15
Nodes (4): CFFPrivateDict, CFFTopDict, findBlock(), Type1Font

### Community 72 - "Community 72"
Cohesion: 0.17
Nodes (9): EMPTY_ARR, fmt(), fmtDate(), fmtI(), parseMoney(), SalesPage(), t(), POSState (+1 more)

### Community 73 - "Community 73"
Cohesion: 0.21
Nodes (12): 7350a1a feat(auth): implement 2-step login with email verification (Mandrill), cleanup(), CodeEntry, codeStore, consumePreAuth(), PreAuthEntry, preAuthStore, storeCode() (+4 more)

### Community 74 - "Community 74"
Cohesion: 0.13
Nodes (1): BasePdfManager

### Community 75 - "Community 75"
Cohesion: 0.21
Nodes (1): ChunkedStreamManager

### Community 76 - "Community 76"
Cohesion: 0.18
Nodes (2): ImageResizer, RegionalImageCache

### Community 77 - "Community 77"
Cohesion: 0.19
Nodes (3): isSpecial(), Type1CharString, Type1Parser

### Community 78 - "Community 78"
Cohesion: 0.24
Nodes (15): module, modulo, pantalla, pantalla_reportes, report, screen, sp_sistema_modulos_delete(), sp_sistema_modulos_insert() (+7 more)

### Community 79 - "Community 79"
Cohesion: 0.21
Nodes (11): 4c69f8a fix(ar): replace orange header border with subtle gray line, 4d6d80d feat(ar): white header + aging/monthly strips in statement PDF, 581b42b fix(ar): remove gray separator line from statement PDF header, 89816c3 feat(ar): PDF preview in modal + Send All uses balance mode, flx(), fmt(), fmtD(), LOGO (+3 more)

### Community 80 - "Community 80"
Cohesion: 0.16
Nodes (7): blankForm(), EMPTY_ARR, fromCredit(), QCForm, QCModalProps, toDateStr(), today()

### Community 81 - "Community 81"
Cohesion: 0.15
Nodes (8): 6285dc8 fix(qc+inventory-entry): Scan OUT mobile modal + replace all inline errors with Sonner toasts, ModalAvailableDate(), Props, today(), ModalBoxNotes(), Props, ModalSendToWhouse(), Props

### Community 82 - "Community 82"
Cohesion: 0.14
Nodes (7): bbc39ac feat(inventory-entry): migrate all modal grids to PanelGrid standard, ModalDeletePackingDetails(), Props, ModalScanHistory(), Props, ModalSelectPWarehouse(), Props

### Community 83 - "Community 83"
Cohesion: 0.16
Nodes (8): bodySchema, P, POST(), t(), getFullpotPool(), nullIfEmpty(), PUT(), P

### Community 84 - "Community 84"
Cohesion: 0.14
Nodes (1): CalRGBCS

### Community 85 - "Community 85"
Cohesion: 0.21
Nodes (2): ChunkedStream, MissingDataException

### Community 86 - "Community 86"
Cohesion: 0.14
Nodes (3): Jr, Qr, XFAAttribute

### Community 87 - "Community 87"
Cohesion: 0.24
Nodes (9): 0eba280 feat(ar): increase totals row height and font size in customer grid, 7841f8d fix(ar): invoice search navigation, print, and email, ba40c73 feat(ar): fix invoice print/email — modal + PDF attachment via puppeteer, bffba33 fix(ar): use correct InvoiceHTML column from sp_NC_HTML_Invoice_Report_New, f035be9 fix(ar): use invoice_uq (flower_invoice.unico) for invoice print/email, createTransporter(), POST(), P (+1 more)

### Community 88 - "Community 88"
Cohesion: 0.21
Nodes (9): 1d76b42 fix(flexy2qb): pass first record unico for By Date actions in Customer Payments, 91438b4 feat(bi): persist saved pivot/grid configurations in SQL Server, aa8bab8 fix(payment-auth): use sp_NC_accounts_outcome_insert to store pay_doc as out_document, GET(), POST(), postSchema, t(), userUq() (+1 more)

### Community 89 - "Community 89"
Cohesion: 0.28
Nodes (5): buildCache(), ensureCache(), getS3(), resetCache(), signKey()

### Community 90 - "Community 90"
Cohesion: 0.18
Nodes (5): getSistemaPool(), extractJpeg(), GET(), extractJpeg(), GET()

### Community 91 - "Community 91"
Cohesion: 0.17
Nodes (4): Ar, mr, PageArea, PageSet

### Community 92 - "Community 92"
Cohesion: 0.15
Nodes (3): B, Html, XhtmlNamespace

### Community 93 - "Community 93"
Cohesion: 0.15
Nodes (2): NullOptimizer, QueueOptimizer

### Community 94 - "Community 94"
Cohesion: 0.26
Nodes (8): bit(), COLUMNS, fmtDate(), GET(), num(), POST(), t(), txt()

### Community 95 - "Community 95"
Cohesion: 0.17
Nodes (6): AbortException, MissingPDFException, PasswordException, UnexpectedResponseException, UnknownErrorException, wrapReason()

### Community 96 - "Community 96"
Cohesion: 0.17
Nodes (5): getCurrentPara(), selectFont(), setFontFamily(), stripQuotes(), XhtmlObject

### Community 97 - "Community 97"
Cohesion: 0.23
Nodes (3): layoutText(), P, TextMeasure

### Community 98 - "Community 98"
Cohesion: 0.21
Nodes (1): GlobalImageCache

### Community 99 - "Community 99"
Cohesion: 0.17
Nodes (1): IdentityCMap

### Community 100 - "Community 100"
Cohesion: 0.22
Nodes (6): CompaniesPage(), EMPTY_ARR, EMPTY_COMPANY, t(), CompanyState, useCompanyStore

### Community 101 - "Community 101"
Cohesion: 0.20
Nodes (6): FIELD_KEYS, FieldProps, ModalUpdateLine(), Props, t(), TextFieldProps

### Community 102 - "Community 102"
Cohesion: 0.18
Nodes (1): ColorSpace

### Community 103 - "Community 103"
Cohesion: 0.18
Nodes (1): Word64

### Community 104 - "Community 104"
Cohesion: 0.20
Nodes (6): d78faa6 fix(flexy2qb): dashboard defaults to Sales (S) instead of All, CLASSES, CUSTOMER_TYPES, EMPTY_ARR, SUB_TABS, SubTab

### Community 105 - "Community 105"
Cohesion: 0.24
Nodes (3): ArithmeticDecoder, ContextCache, DecodingContext

### Community 106 - "Community 106"
Cohesion: 0.20
Nodes (2): CFF, CFFStrings

### Community 107 - "Community 107"
Cohesion: 0.20
Nodes (3): Datasets, datasets_Data, DatasetsNamespace

### Community 108 - "Community 108"
Cohesion: 0.20
Nodes (1): PDFWorkerStreamReader

### Community 109 - "Community 109"
Cohesion: 0.31
Nodes (4): COLUMNS, fmtDate(), GET(), t()

### Community 110 - "Community 110"
Cohesion: 0.22
Nodes (3): EMPTY_ROW, ModalBoxComposition(), Props

### Community 111 - "Community 111"
Cohesion: 0.22
Nodes (7): appFooterLine, l1, l2, l3, l4, lines, tabsAreaStart

### Community 112 - "Community 112"
Cohesion: 0.36
Nodes (6): EMPTY, fmt2(), fmt4(), ModalEditBox(), Props, t()

### Community 113 - "Community 113"
Cohesion: 0.29
Nodes (3): bit(), P, PUT()

### Community 114 - "Community 114"
Cohesion: 0.36
Nodes (2): HuffmanTable, HuffmanTreeNode

### Community 115 - "Community 115"
Cohesion: 0.25
Nodes (1): IdentityToUnicodeMap

### Community 116 - "Community 116"
Cohesion: 0.32
Nodes (2): MessageHandler, WorkerMessageHandler

### Community 117 - "Community 117"
Cohesion: 0.57
Nodes (1): PostScriptParser

### Community 118 - "Community 118"
Cohesion: 0.25
Nodes (1): Text

### Community 119 - "Community 119"
Cohesion: 0.25
Nodes (1): ToUnicodeMap

### Community 120 - "Community 120"
Cohesion: 0.32
Nodes (3): bit(), num(), POST()

### Community 121 - "Community 121"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, Providers()

### Community 122 - "Community 122"
Cohesion: 0.38
Nodes (4): COLUMNS, fmtDate(), GET(), t()

### Community 123 - "Community 123"
Cohesion: 0.33
Nodes (3): COLUMNS, GET(), t()

### Community 124 - "Community 124"
Cohesion: 0.38
Nodes (3): bit(), num(), POST()

### Community 125 - "Community 125"
Cohesion: 0.33
Nodes (3): num(), P, POST()

### Community 126 - "Community 126"
Cohesion: 0.33
Nodes (3): num(), P, PUT()

### Community 127 - "Community 127"
Cohesion: 0.29
Nodes (6): componentsDir, content, fs, modals, path, srcFile

### Community 128 - "Community 128"
Cohesion: 0.33
Nodes (5): EMPTY_FORM, fmtDate(), ModalAWBSetup(), Props, t()

### Community 129 - "Community 129"
Cohesion: 0.29
Nodes (4): EMPTY, EMPTY_INFO, ModalBoxWHControl(), Props

### Community 130 - "Community 130"
Cohesion: 0.33
Nodes (3): Step, AuthState, useAuthStore

### Community 131 - "Community 131"
Cohesion: 0.43
Nodes (4): COLUMNS, fmtDate(), GET(), t()

### Community 132 - "Community 132"
Cohesion: 0.29
Nodes (2): ModalInvoicesByCustomer(), Props

### Community 133 - "Community 133"
Cohesion: 0.33
Nodes (1): AESBaseCipher

### Community 134 - "Community 134"
Cohesion: 0.33
Nodes (2): JpxError, JpxImage

### Community 135 - "Community 135"
Cohesion: 0.29
Nodes (1): NetworkPdfManager

### Community 136 - "Community 136"
Cohesion: 0.29
Nodes (1): PDFWorkerStream

### Community 137 - "Community 137"
Cohesion: 0.38
Nodes (4): fn, kn, pr, _r

### Community 138 - "Community 138"
Cohesion: 0.33
Nodes (1): FontFinder

### Community 139 - "Community 139"
Cohesion: 0.38
Nodes (2): StructElement, StructElementNode

### Community 140 - "Community 140"
Cohesion: 0.43
Nodes (4): bit(), num(), POST(), txt()

### Community 141 - "Community 141"
Cohesion: 0.48
Nodes (6): caseBreakdown(), COLUMNS, fmt2(), fmtI(), GET(), t()

### Community 142 - "Community 142"
Cohesion: 0.33
Nodes (5): 113d989 fix(payment-auth): fix date update timezone bug + payments default to 1yr ALL, 2e367ec feat(inventory-entry): vertical tab strip + full-bleed card images, defaults, PaymentAuthorizationsState, usePaymentAuthorizationsStore

### Community 143 - "Community 143"
Cohesion: 0.33
Nodes (3): 9e70e94 refactor(ar): replace raw UPDATE with sp_NC_customer_email_update, c3897b7 docs(standards): require SP authorization before any CREATE/ALTER/DROP, e5fdd2c docs(standards): SP return format standard + AR SQL documentation

### Community 144 - "Community 144"
Cohesion: 0.33
Nodes (3): LABELS, SKIP, WIDTHS

### Community 145 - "Community 145"
Cohesion: 0.40
Nodes (3): ModalAddProductToPacking(), Props, t()

### Community 146 - "Community 146"
Cohesion: 0.40
Nodes (3): ModalBoxPO(), Props, t()

### Community 147 - "Community 147"
Cohesion: 0.33
Nodes (2): ModalBoxRepacking(), Props

### Community 148 - "Community 148"
Cohesion: 0.33
Nodes (3): EMPTY, ModalHeader2(), Props

### Community 149 - "Community 149"
Cohesion: 0.40
Nodes (3): ModalWarehouseTransfer(), Props, t()

### Community 150 - "Community 150"
Cohesion: 0.40
Nodes (2): LabelGridPDF(), styles

### Community 151 - "Community 151"
Cohesion: 0.47
Nodes (4): COLUMNS, fmtDate(), GET(), t()

### Community 152 - "Community 152"
Cohesion: 0.47
Nodes (5): BOUQUET_COLS, COMBO_COLS, GET(), n(), t()

### Community 153 - "Community 153"
Cohesion: 0.33
Nodes (1): PDFWorkerStreamRangeReader

### Community 154 - "Community 154"
Cohesion: 0.33
Nodes (1): DeviceCmykCS

### Community 155 - "Community 155"
Cohesion: 0.33
Nodes (1): DeviceRgbCS

### Community 156 - "Community 156"
Cohesion: 0.40
Nodes (2): FontInfo, FontSelector

### Community 157 - "Community 157"
Cohesion: 0.33
Nodes (1): Template

### Community 158 - "Community 158"
Cohesion: 0.33
Nodes (2): xdp_Xdp, XdpNamespace

### Community 159 - "Community 159"
Cohesion: 0.60
Nodes (5): company, empresas, sp_sistema_empresas_delete(), sp_sistema_empresas_insert(), sp_sistema_empresas_update()

### Community 160 - "Community 160"
Cohesion: 0.40
Nodes (3): num(), P, POST()

### Community 161 - "Community 161"
Cohesion: 0.40
Nodes (4): dir, files, fs, path

### Community 162 - "Community 162"
Cohesion: 0.40
Nodes (2): Flexy2QBContext, Flexy2QBState

### Community 163 - "Community 163"
Cohesion: 0.40
Nodes (4): dir, files, fs, path

### Community 164 - "Community 164"
Cohesion: 0.40
Nodes (4): c, lines, verify, vl

### Community 165 - "Community 165"
Cohesion: 0.40
Nodes (4): content, file, fs, path

### Community 166 - "Community 166"
Cohesion: 0.40
Nodes (4): content, file, fs, path

### Community 167 - "Community 167"
Cohesion: 0.40
Nodes (4): content, file, fs, path

### Community 168 - "Community 168"
Cohesion: 0.40
Nodes (3): config, SPS, sql

### Community 169 - "Community 169"
Cohesion: 0.40
Nodes (2): ModalBoxMove(), Props

### Community 170 - "Community 170"
Cohesion: 0.40
Nodes (2): ModalBoxTransform(), Props

### Community 171 - "Community 171"
Cohesion: 0.60
Nodes (4): ModalHeaderCopy(), Props, t(), today()

### Community 172 - "Community 172"
Cohesion: 0.60
Nodes (4): ModalWhouseTotals(), Props, t(), today()

### Community 173 - "Community 173"
Cohesion: 0.50
Nodes (4): fmtDate(), ModalAttachInvoice(), Props, t()

### Community 174 - "Community 174"
Cohesion: 0.70
Nodes (4): fmtDate(), ModalChangeCustomer(), Props, t()

### Community 175 - "Community 175"
Cohesion: 0.40
Nodes (2): ModalPartialInvoice(), Props

### Community 176 - "Community 176"
Cohesion: 0.40
Nodes (1): AlternateCS

### Community 177 - "Community 177"
Cohesion: 0.40
Nodes (1): br

### Community 178 - "Community 178"
Cohesion: 0.40
Nodes (1): CFFDict

### Community 179 - "Community 179"
Cohesion: 0.40
Nodes (1): DeviceGrayCS

### Community 180 - "Community 180"
Cohesion: 0.40
Nodes (1): DeviceRgbaCS

### Community 181 - "Community 181"
Cohesion: 0.40
Nodes (1): ErrorFont

### Community 182 - "Community 182"
Cohesion: 0.40
Nodes (1): EvalState

### Community 183 - "Community 183"
Cohesion: 0.40
Nodes (1): ExData

### Community 184 - "Community 184"
Cohesion: 0.40
Nodes (2): signature_Signature, SignatureNamespace

### Community 185 - "Community 185"
Cohesion: 0.40
Nodes (2): Stylesheet, StylesheetNamespace

### Community 186 - "Community 186"
Cohesion: 0.40
Nodes (1): SubformSet

### Community 187 - "Community 187"
Cohesion: 0.40
Nodes (1): Traverse

### Community 188 - "Community 188"
Cohesion: 0.40
Nodes (4): content, file, fs, path

### Community 189 - "Community 189"
Cohesion: 0.40
Nodes (4): files, fs, path, results

### Community 190 - "Community 190"
Cohesion: 0.40
Nodes (4): files, fs, path, results

### Community 191 - "Community 191"
Cohesion: 0.40
Nodes (4): files, fs, path, results

### Community 192 - "Community 192"
Cohesion: 0.40
Nodes (4): content, filePath, fs, path

### Community 193 - "Community 193"
Cohesion: 0.40
Nodes (4): content, filePath, fs, path

### Community 194 - "Community 194"
Cohesion: 0.40
Nodes (4): dest, destDir, __dirname, require

### Community 195 - "Community 195"
Cohesion: 0.40
Nodes (4): BottomTabId, DateMode, Pbook2InvoiceState, usePbook2InvoiceStore

### Community 196 - "Community 196"
Cohesion: 0.50
Nodes (4): config, executeProcedure(), run(), sql

### Community 197 - "Community 197"
Cohesion: 0.50
Nodes (4): config, executeProcedure(), run(), sql

### Community 198 - "Community 198"
Cohesion: 0.50
Nodes (4): config, executeProcedure(), run(), sql

### Community 199 - "Community 199"
Cohesion: 0.50
Nodes (4): config, main(), runPositional(), sql

### Community 201 - "Community 201"
Cohesion: 0.50
Nodes (2): config, sps

### Community 202 - "Community 202"
Cohesion: 0.50
Nodes (2): config, sql

### Community 203 - "Community 203"
Cohesion: 0.50
Nodes (2): config, sql

### Community 204 - "Community 204"
Cohesion: 0.50
Nodes (2): config, sql

### Community 205 - "Community 205"
Cohesion: 0.50
Nodes (2): config, sql

### Community 206 - "Community 206"
Cohesion: 0.50
Nodes (2): config, sql

### Community 207 - "Community 207"
Cohesion: 0.50
Nodes (2): config, sql

### Community 208 - "Community 208"
Cohesion: 0.50
Nodes (2): ModalFilterCustomers(), Props

### Community 209 - "Community 209"
Cohesion: 0.50
Nodes (2): ModalFilterGrowers(), Props

### Community 210 - "Community 210"
Cohesion: 0.67
Nodes (3): ModalChangePO(), Props, t()

### Community 211 - "Community 211"
Cohesion: 0.67
Nodes (3): ModalUnassignStock(), Props, t()

### Community 213 - "Community 213"
Cohesion: 0.50
Nodes (1): BaseLocalCache

### Community 214 - "Community 214"
Cohesion: 0.50
Nodes (1): EquateRange

### Community 215 - "Community 215"
Cohesion: 0.50
Nodes (1): Exclude

### Community 216 - "Community 216"
Cohesion: 0.50
Nodes (1): Packets

### Community 217 - "Community 217"
Cohesion: 0.50
Nodes (1): PageRange

### Community 218 - "Community 218"
Cohesion: 0.50
Nodes (1): Range

### Community 219 - "Community 219"
Cohesion: 0.50
Nodes (1): Record

### Community 220 - "Community 220"
Cohesion: 0.50
Nodes (1): Relevant

### Community 221 - "Community 221"
Cohesion: 0.50
Nodes (1): Rename

### Community 222 - "Community 222"
Cohesion: 0.50
Nodes (1): ValidateApprovalSignatures

### Community 223 - "Community 223"
Cohesion: 0.50
Nodes (1): Window

### Community 224 - "Community 224"
Cohesion: 0.50
Nodes (1): ContentObject

### Community 225 - "Community 225"
Cohesion: 0.50
Nodes (1): ImageEdit

### Community 226 - "Community 226"
Cohesion: 0.50
Nodes (1): IntegerObject

### Community 227 - "Community 227"
Cohesion: 0.50
Nodes (1): Linear

### Community 228 - "Community 228"
Cohesion: 0.50
Nodes (1): Margin

### Community 229 - "Community 229"
Cohesion: 0.50
Nodes (1): Occur

### Community 230 - "Community 230"
Cohesion: 0.50
Nodes (1): OptionObject

### Community 231 - "Community 231"
Cohesion: 0.50
Nodes (1): Radial

### Community 232 - "Community 232"
Cohesion: 0.50
Nodes (1): Ref

### Community 233 - "Community 233"
Cohesion: 0.50
Nodes (1): rr

### Community 234 - "Community 234"
Cohesion: 0.50
Nodes (1): Solid

### Community 235 - "Community 235"
Cohesion: 0.50
Nodes (1): StreamsSequenceStream

### Community 236 - "Community 236"
Cohesion: 0.50
Nodes (1): SubjectDN

### Community 237 - "Community 237"
Cohesion: 0.50
Nodes (1): template_Pattern

### Community 238 - "Community 238"
Cohesion: 0.50
Nodes (1): Variables

### Community 240 - "Community 240"
Cohesion: 0.50
Nodes (2): config, sql

### Community 241 - "Community 241"
Cohesion: 0.67
Nodes (2): 27ff929 fix(build): add turbopackUseSystemTlsCerts to fix Geist font TLS failure, nextConfig

### Community 242 - "Community 242"
Cohesion: 1.00
Nodes (2): GET(), t()

### Community 243 - "Community 243"
Cohesion: 1.00
Nodes (2): GET(), t()

### Community 244 - "Community 244"
Cohesion: 1.00
Nodes (2): GET(), t()

### Community 245 - "Community 245"
Cohesion: 1.00
Nodes (2): GET(), t()

### Community 246 - "Community 246"
Cohesion: 0.67
Nodes (1): AppearanceFilter

### Community 247 - "Community 247"
Cohesion: 0.67
Nodes (1): AsciiHexStream

### Community 248 - "Community 248"
Cohesion: 0.67
Nodes (1): AstNode

### Community 249 - "Community 249"
Cohesion: 0.67
Nodes (1): Cmd

### Community 250 - "Community 250"
Cohesion: 0.67
Nodes (1): ModifyAnnots

### Community 251 - "Community 251"
Cohesion: 0.67
Nodes (1): MsgId

### Community 252 - "Community 252"
Cohesion: 0.67
Nodes (1): NameAttr

### Community 253 - "Community 253"
Cohesion: 0.67
Nodes (1): NeverEmbed

### Community 254 - "Community 254"
Cohesion: 0.67
Nodes (1): NumberOfCopies

### Community 255 - "Community 255"
Cohesion: 0.67
Nodes (1): OpenAction

### Community 256 - "Community 256"
Cohesion: 0.67
Nodes (1): OutputBin

### Community 257 - "Community 257"
Cohesion: 0.67
Nodes (1): Output

### Community 258 - "Community 258"
Cohesion: 0.67
Nodes (1): OutputXSL

### Community 259 - "Community 259"
Cohesion: 0.67
Nodes (1): Overprint

### Community 260 - "Community 260"
Cohesion: 0.67
Nodes (1): PaginationOverride

### Community 261 - "Community 261"
Cohesion: 0.67
Nodes (1): Pagination

### Community 262 - "Community 262"
Cohesion: 0.67
Nodes (1): Part

### Community 263 - "Community 263"
Cohesion: 0.67
Nodes (1): Pcl

### Community 264 - "Community 264"
Cohesion: 0.67
Nodes (1): Pdfa

### Community 265 - "Community 265"
Cohesion: 0.67
Nodes (1): Pdf

### Community 266 - "Community 266"
Cohesion: 0.67
Nodes (1): Permissions

### Community 267 - "Community 267"
Cohesion: 0.67
Nodes (1): PickTrayByPDFSize

### Community 268 - "Community 268"
Cohesion: 0.67
Nodes (1): PlaintextMetadata

### Community 269 - "Community 269"
Cohesion: 0.67
Nodes (1): Presence

### Community 270 - "Community 270"
Cohesion: 0.67
Nodes (1): PrinterName

### Community 271 - "Community 271"
Cohesion: 0.67
Nodes (1): PrintHighQuality

### Community 272 - "Community 272"
Cohesion: 0.67
Nodes (1): Print

### Community 273 - "Community 273"
Cohesion: 0.67
Nodes (1): PrintScaling

### Community 274 - "Community 274"
Cohesion: 0.67
Nodes (1): Producer

### Community 275 - "Community 275"
Cohesion: 0.67
Nodes (1): RenderPolicy

### Community 276 - "Community 276"
Cohesion: 0.67
Nodes (1): RunScripts

### Community 277 - "Community 277"
Cohesion: 0.67
Nodes (1): ScriptModel

### Community 278 - "Community 278"
Cohesion: 0.67
Nodes (1): Severity

### Community 279 - "Community 279"
Cohesion: 0.67
Nodes (1): SilentPrint

### Community 280 - "Community 280"
Cohesion: 0.67
Nodes (1): StartNode

### Community 281 - "Community 281"
Cohesion: 0.67
Nodes (1): StartPage

### Community 282 - "Community 282"
Cohesion: 0.67
Nodes (1): SubmitFormat

### Community 283 - "Community 283"
Cohesion: 0.67
Nodes (1): SubmitUrl

### Community 284 - "Community 284"
Cohesion: 0.67
Nodes (1): SubsetBelow

### Community 285 - "Community 285"
Cohesion: 0.67
Nodes (1): SuppressBanner

### Community 286 - "Community 286"
Cohesion: 0.67
Nodes (1): Tagged

### Community 287 - "Community 287"
Cohesion: 0.67
Nodes (1): Threshold

### Community 288 - "Community 288"
Cohesion: 0.67
Nodes (1): To

### Community 289 - "Community 289"
Cohesion: 0.67
Nodes (1): Transform

### Community 290 - "Community 290"
Cohesion: 0.67
Nodes (1): Type

### Community 291 - "Community 291"
Cohesion: 0.67
Nodes (1): Uri

### Community 292 - "Community 292"
Cohesion: 0.67
Nodes (1): ValidationMessaging

### Community 293 - "Community 293"
Cohesion: 0.67
Nodes (1): Version

### Community 294 - "Community 294"
Cohesion: 0.67
Nodes (1): ViewerPreferences

### Community 295 - "Community 295"
Cohesion: 0.67
Nodes (1): WebClient

### Community 296 - "Community 296"
Cohesion: 0.67
Nodes (1): Whitespace

### Community 297 - "Community 297"
Cohesion: 0.67
Nodes (1): Xdp

### Community 298 - "Community 298"
Cohesion: 0.67
Nodes (1): Xsl

### Community 299 - "Community 299"
Cohesion: 0.67
Nodes (1): Zpl

### Community 300 - "Community 300"
Cohesion: 0.67
Nodes (1): Fill

### Community 301 - "Community 301"
Cohesion: 0.67
Nodes (1): i

### Community 302 - "Community 302"
Cohesion: 0.67
Nodes (1): Line

### Community 303 - "Community 303"
Cohesion: 0.67
Nodes (1): LocalTilingPatternCache

### Community 304 - "Community 304"
Cohesion: 0.67
Nodes (1): Name

### Community 305 - "Community 305"
Cohesion: 0.67
Nodes (1): NumericEdit

### Community 306 - "Community 306"
Cohesion: 0.67
Nodes (1): Ol

### Community 307 - "Community 307"
Cohesion: 0.67
Nodes (1): PatternCS

### Community 308 - "Community 308"
Cohesion: 0.67
Nodes (1): RunLengthStream

### Community 309 - "Community 309"
Cohesion: 0.67
Nodes (1): Script

### Community 310 - "Community 310"
Cohesion: 0.67
Nodes (1): Signature

### Community 311 - "Community 311"
Cohesion: 0.67
Nodes (1): SignatureWidgetAnnotation

### Community 312 - "Community 312"
Cohesion: 0.67
Nodes (1): SignData

### Community 313 - "Community 313"
Cohesion: 0.67
Nodes (1): Span

### Community 314 - "Community 314"
Cohesion: 0.67
Nodes (1): Sub

### Community 315 - "Community 315"
Cohesion: 0.67
Nodes (1): Sup

### Community 316 - "Community 316"
Cohesion: 0.67
Nodes (1): template_Font

### Community 317 - "Community 317"
Cohesion: 0.67
Nodes (1): TimeStamp

### Community 318 - "Community 318"
Cohesion: 0.67
Nodes (1): Traversal

### Community 319 - "Community 319"
Cohesion: 0.67
Nodes (1): Validate

### Community 320 - "Community 320"
Cohesion: 0.67
Nodes (1): ui

### Community 321 - "Community 321"
Cohesion: 0.67
Nodes (1): Ul

### Community 322 - "Community 322"
Cohesion: 0.67
Nodes (1): Props

### Community 323 - "Community 323"
Cohesion: 0.67
Nodes (2): fs, path

### Community 324 - "Community 324"
Cohesion: 0.67
Nodes (2): buf, text

### Community 325 - "Community 325"
Cohesion: 0.67
Nodes (1): config

### Community 326 - "Community 326"
Cohesion: 0.67
Nodes (1): config

### Community 327 - "Community 327"
Cohesion: 0.67
Nodes (2): config, SP_LIST

### Community 328 - "Community 328"
Cohesion: 0.67
Nodes (2): c, matches

### Community 331 - "Community 331"
Cohesion: 1.00
Nodes (1): eslintConfig

### Community 333 - "Community 333"
Cohesion: 1.00
Nodes (1): config

### Community 334 - "Community 334"
Cohesion: 1.00
Nodes (1): BaseShading

### Community 335 - "Community 335"
Cohesion: 1.00
Nodes (1): Pattern

### Community 337 - "Community 337"
Cohesion: 1.00
Nodes (1): config

### Community 338 - "Community 338"
Cohesion: 1.00
Nodes (1): config

### Community 339 - "Community 339"
Cohesion: 1.00
Nodes (1): c

## Knowledge Gaps
- **588 isolated node(s):** `lines`, `c`, `verify`, `vl`, `fs` (+583 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 45`** (2 nodes): `wn`, `XFAObject`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (2 nodes): `BaseStream`, `unreachable()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (1 nodes): `BasePdfManager`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (1 nodes): `ChunkedStreamManager`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (2 nodes): `ImageResizer`, `RegionalImageCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (1 nodes): `CalRGBCS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (2 nodes): `ChunkedStream`, `MissingDataException`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (2 nodes): `NullOptimizer`, `QueueOptimizer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 98`** (1 nodes): `GlobalImageCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (1 nodes): `IdentityCMap`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (1 nodes): `ColorSpace`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (1 nodes): `Word64`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (2 nodes): `CFF`, `CFFStrings`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (1 nodes): `PDFWorkerStreamReader`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (2 nodes): `HuffmanTable`, `HuffmanTreeNode`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (1 nodes): `IdentityToUnicodeMap`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (2 nodes): `MessageHandler`, `WorkerMessageHandler`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (1 nodes): `PostScriptParser`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (1 nodes): `Text`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (1 nodes): `ToUnicodeMap`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 132`** (2 nodes): `ModalInvoicesByCustomer()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 133`** (1 nodes): `AESBaseCipher`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 134`** (2 nodes): `JpxError`, `JpxImage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 135`** (1 nodes): `NetworkPdfManager`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 136`** (1 nodes): `PDFWorkerStream`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 138`** (1 nodes): `FontFinder`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 139`** (2 nodes): `StructElement`, `StructElementNode`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 147`** (2 nodes): `ModalBoxRepacking()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 150`** (2 nodes): `LabelGridPDF()`, `styles`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 153`** (1 nodes): `PDFWorkerStreamRangeReader`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 154`** (1 nodes): `DeviceCmykCS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 155`** (1 nodes): `DeviceRgbCS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 156`** (2 nodes): `FontInfo`, `FontSelector`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 157`** (1 nodes): `Template`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 158`** (2 nodes): `xdp_Xdp`, `XdpNamespace`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 162`** (2 nodes): `Flexy2QBContext`, `Flexy2QBState`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 169`** (2 nodes): `ModalBoxMove()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 170`** (2 nodes): `ModalBoxTransform()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 175`** (2 nodes): `ModalPartialInvoice()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 176`** (1 nodes): `AlternateCS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 177`** (1 nodes): `br`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 178`** (1 nodes): `CFFDict`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 179`** (1 nodes): `DeviceGrayCS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 180`** (1 nodes): `DeviceRgbaCS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 181`** (1 nodes): `ErrorFont`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 182`** (1 nodes): `EvalState`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 183`** (1 nodes): `ExData`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 184`** (2 nodes): `signature_Signature`, `SignatureNamespace`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 185`** (2 nodes): `Stylesheet`, `StylesheetNamespace`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 186`** (1 nodes): `SubformSet`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 187`** (1 nodes): `Traverse`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 201`** (2 nodes): `config`, `sps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 202`** (2 nodes): `config`, `sql`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 203`** (2 nodes): `config`, `sql`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 204`** (2 nodes): `config`, `sql`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 205`** (2 nodes): `config`, `sql`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 206`** (2 nodes): `config`, `sql`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 207`** (2 nodes): `config`, `sql`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 208`** (2 nodes): `ModalFilterCustomers()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 209`** (2 nodes): `ModalFilterGrowers()`, `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 213`** (1 nodes): `BaseLocalCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 214`** (1 nodes): `EquateRange`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 215`** (1 nodes): `Exclude`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 216`** (1 nodes): `Packets`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 217`** (1 nodes): `PageRange`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 218`** (1 nodes): `Range`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 219`** (1 nodes): `Record`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 220`** (1 nodes): `Relevant`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 221`** (1 nodes): `Rename`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 222`** (1 nodes): `ValidateApprovalSignatures`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 223`** (1 nodes): `Window`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 224`** (1 nodes): `ContentObject`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 225`** (1 nodes): `ImageEdit`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 226`** (1 nodes): `IntegerObject`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 227`** (1 nodes): `Linear`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 228`** (1 nodes): `Margin`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 229`** (1 nodes): `Occur`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 230`** (1 nodes): `OptionObject`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 231`** (1 nodes): `Radial`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 232`** (1 nodes): `Ref`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 233`** (1 nodes): `rr`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 234`** (1 nodes): `Solid`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 235`** (1 nodes): `StreamsSequenceStream`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 236`** (1 nodes): `SubjectDN`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 237`** (1 nodes): `template_Pattern`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 238`** (1 nodes): `Variables`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 240`** (2 nodes): `config`, `sql`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 241`** (2 nodes): `27ff929 fix(build): add turbopackUseSystemTlsCerts to fix Geist font TLS failure`, `nextConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 242`** (2 nodes): `GET()`, `t()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 243`** (2 nodes): `GET()`, `t()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 244`** (2 nodes): `GET()`, `t()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 245`** (2 nodes): `GET()`, `t()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 246`** (1 nodes): `AppearanceFilter`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 247`** (1 nodes): `AsciiHexStream`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 248`** (1 nodes): `AstNode`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 249`** (1 nodes): `Cmd`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 250`** (1 nodes): `ModifyAnnots`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 251`** (1 nodes): `MsgId`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 252`** (1 nodes): `NameAttr`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 253`** (1 nodes): `NeverEmbed`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 254`** (1 nodes): `NumberOfCopies`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 255`** (1 nodes): `OpenAction`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 256`** (1 nodes): `OutputBin`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 257`** (1 nodes): `Output`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 258`** (1 nodes): `OutputXSL`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 259`** (1 nodes): `Overprint`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 260`** (1 nodes): `PaginationOverride`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 261`** (1 nodes): `Pagination`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 262`** (1 nodes): `Part`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 263`** (1 nodes): `Pcl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 264`** (1 nodes): `Pdfa`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 265`** (1 nodes): `Pdf`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 266`** (1 nodes): `Permissions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 267`** (1 nodes): `PickTrayByPDFSize`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 268`** (1 nodes): `PlaintextMetadata`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 269`** (1 nodes): `Presence`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 270`** (1 nodes): `PrinterName`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 271`** (1 nodes): `PrintHighQuality`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 272`** (1 nodes): `Print`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 273`** (1 nodes): `PrintScaling`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 274`** (1 nodes): `Producer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 275`** (1 nodes): `RenderPolicy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 276`** (1 nodes): `RunScripts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 277`** (1 nodes): `ScriptModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 278`** (1 nodes): `Severity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 279`** (1 nodes): `SilentPrint`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 280`** (1 nodes): `StartNode`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 281`** (1 nodes): `StartPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 282`** (1 nodes): `SubmitFormat`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 283`** (1 nodes): `SubmitUrl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 284`** (1 nodes): `SubsetBelow`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 285`** (1 nodes): `SuppressBanner`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 286`** (1 nodes): `Tagged`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 287`** (1 nodes): `Threshold`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 288`** (1 nodes): `To`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 289`** (1 nodes): `Transform`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 290`** (1 nodes): `Type`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 291`** (1 nodes): `Uri`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 292`** (1 nodes): `ValidationMessaging`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 293`** (1 nodes): `Version`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 294`** (1 nodes): `ViewerPreferences`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 295`** (1 nodes): `WebClient`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 296`** (1 nodes): `Whitespace`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 297`** (1 nodes): `Xdp`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 298`** (1 nodes): `Xsl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 299`** (1 nodes): `Zpl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 300`** (1 nodes): `Fill`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 301`** (1 nodes): `i`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 302`** (1 nodes): `Line`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 303`** (1 nodes): `LocalTilingPatternCache`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 304`** (1 nodes): `Name`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 305`** (1 nodes): `NumericEdit`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 306`** (1 nodes): `Ol`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 307`** (1 nodes): `PatternCS`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 308`** (1 nodes): `RunLengthStream`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 309`** (1 nodes): `Script`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 310`** (1 nodes): `Signature`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 311`** (1 nodes): `SignatureWidgetAnnotation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 312`** (1 nodes): `SignData`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 313`** (1 nodes): `Span`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 314`** (1 nodes): `Sub`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 315`** (1 nodes): `Sup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 316`** (1 nodes): `template_Font`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 317`** (1 nodes): `TimeStamp`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 318`** (1 nodes): `Traversal`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 319`** (1 nodes): `Validate`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 320`** (1 nodes): `ui`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 321`** (1 nodes): `Ul`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 322`** (1 nodes): `Props`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 323`** (2 nodes): `fs`, `path`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 324`** (2 nodes): `buf`, `text`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 325`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 326`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 327`** (2 nodes): `config`, `SP_LIST`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 328`** (2 nodes): `c`, `matches`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 331`** (1 nodes): `eslintConfig`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 333`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 334`** (1 nodes): `BaseShading`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 335`** (1 nodes): `Pattern`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 337`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 338`** (1 nodes): `config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 339`** (1 nodes): `c`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `executeProcedure()` connect `Community 4` to `Community 22`, `Community 7`, `Community 36`, `Community 13`, `Community 40`, `Community 25`, `Community 122`, `Community 123`, `Community 124`, `Community 51`, `Community 55`, `Community 26`, `Community 18`, `Community 3`, `Community 125`, `Community 126`, `Community 144`, `Community 83`, `Community 109`, `Community 88`, `Community 87`, `Community 65`, `Community 150`, `Community 242`, `Community 245`, `Community 243`, `Community 244`, `Community 90`, `Community 151`, `Community 113`, `Community 131`, `Community 67`, `Community 152`, `Community 212`, `Community 94`, `Community 239`, `Community 73`, `Community 68`, `Community 79`, `Community 140`, `Community 160`, `Community 120`, `Community 141`, `Community 329`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `ConfigNamespace` connect `Community 1` to `Community 0`, `Community 6`, `Community 214`, `Community 215`, `Community 52`, `Community 250`, `Community 251`, `Community 252`, `Community 253`, `Community 254`, `Community 255`, `Community 257`, `Community 256`, `Community 258`, `Community 259`, `Community 216`, `Community 217`, `Community 261`, `Community 260`, `Community 262`, `Community 263`, `Community 265`, `Community 264`, `Community 266`, `Community 267`, `Community 268`, `Community 269`, `Community 272`, `Community 270`, `Community 271`, `Community 273`, `Community 274`, `Community 218`, `Community 219`, `Community 220`, `Community 221`, `Community 275`, `Community 276`, `Community 277`, `Community 278`, `Community 279`, `Community 280`, `Community 281`, `Community 282`, `Community 283`, `Community 284`, `Community 285`, `Community 286`, `Community 287`, `Community 288`, `Community 289`, `Community 290`, `Community 291`, `Community 222`, `Community 292`, `Community 293`, `Community 294`, `Community 295`, `Community 296`, `Community 223`, `Community 297`, `Community 298`, `Community 299`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `TemplateNamespace` connect `Community 5` to `Community 0`, `Community 246`, `Community 39`, `Community 28`, `Community 59`, `Community 6`, `Community 183`, `Community 60`, `Community 316`, `Community 225`, `Community 37`, `Community 302`, `Community 227`, `Community 228`, `Community 305`, `Community 229`, `Community 15`, `Community 91`, `Community 237`, `Community 231`, `Community 309`, `Community 310`, `Community 312`, `Community 234`, `Community 186`, `Community 236`, `Community 157`, `Community 118`, `Community 317`, `Community 318`, `Community 187`, `Community 319`, `Community 238`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `lines`, `c`, `verify` to the rest of the system?**
  _588 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.012496367335077013 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.011904761904761904 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.016851441241685146 - nodes in this community are weakly interconnected._