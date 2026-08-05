# Node Description Batch 131 of 139

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

- "scratch_extractsistema_results": "results" | kind=code-symbol | source=scratch/extractSistema.js:L10 | neighbors=[extractSistema.js]
- "scratch_extractvfp_files": "files" | kind=code-symbol | source=scratch/extractVfp.js:L5 | neighbors=[extractVfp.js]
- "scratch_extractvfp_fs": "fs" | kind=code-symbol | source=scratch/extractVfp.js:L1 | neighbors=[extractVfp.js]
- "scratch_extractvfp_path": "path" | kind=code-symbol | source=scratch/extractVfp.js:L2 | neighbors=[extractVfp.js]
- "scratch_extractvfp_results": "results" | kind=code-symbol | source=scratch/extractVfp.js:L7 | neighbors=[extractVfp.js]
- "scratch_findsps_files": "files" | kind=code-symbol | source=scratch/findSps.js:L5 | neighbors=[findSps.js]
- "scratch_findsps_fs": "fs" | kind=code-symbol | source=scratch/findSps.js:L1 | neighbors=[findSps.js]
- "scratch_findsps_path": "path" | kind=code-symbol | source=scratch/findSps.js:L2 | neighbors=[findSps.js]
- "scratch_findsps_results": "results" | kind=code-symbol | source=scratch/findSps.js:L6 | neighbors=[findSps.js]
- "scratch_freights_rewrite_fs": "fs" | kind=code-symbol | source=scratch/freights_rewrite.js:L1 | neighbors=[freights_rewrite.js]
- "scratch_freights_rewrite_path": "path" | kind=code-symbol | source=scratch/freights_rewrite.js:L2 | neighbors=[freights_rewrite.js]
- "scratch_rewrite_setupmodal_content": "content" | kind=code-symbol | source=scratch/rewrite_setupmodal.js:L5 | neighbors=[rewrite_setupmodal.js]
- "scratch_rewrite_setupmodal_filepath": "filePath" | kind=code-symbol | source=scratch/rewrite_setupmodal.js:L4 | neighbors=[rewrite_setupmodal.js]
- "scratch_rewrite_setupmodal_fs": "fs" | kind=code-symbol | source=scratch/rewrite_setupmodal.js:L1 | neighbors=[rewrite_setupmodal.js]
- "scratch_rewrite_setupmodal_path": "path" | kind=code-symbol | source=scratch/rewrite_setupmodal.js:L2 | neighbors=[rewrite_setupmodal.js]
- "scratch_rewrite_setupmodal2_content": "content" | kind=code-symbol | source=scratch/rewrite_setupmodal2.js:L5 | neighbors=[rewrite_setupmodal2.js]
- "scratch_rewrite_setupmodal2_filepath": "filePath" | kind=code-symbol | source=scratch/rewrite_setupmodal2.js:L4 | neighbors=[rewrite_setupmodal2.js]
- "scratch_rewrite_setupmodal2_fs": "fs" | kind=code-symbol | source=scratch/rewrite_setupmodal2.js:L1 | neighbors=[rewrite_setupmodal2.js]
- "scratch_rewrite_setupmodal2_path": "path" | kind=code-symbol | source=scratch/rewrite_setupmodal2.js:L2 | neighbors=[rewrite_setupmodal2.js]
- "screens_route_get": "GET()" | kind=code-symbol | source=src/app/api/system/modules/[unico]/screens/route.ts:L5 | neighbors=[route.ts]
- "scripts_copy_pdf_worker_dest": "dest" | kind=code-symbol | source=scripts/copy-pdf-worker.mjs:L15 | neighbors=[copy-pdf-worker.mjs]
- "scripts_copy_pdf_worker_destdir": "destDir" | kind=code-symbol | source=scripts/copy-pdf-worker.mjs:L14 | neighbors=[copy-pdf-worker.mjs]
- "scripts_copy_pdf_worker_dirname": "__dirname" | kind=code-symbol | source=scripts/copy-pdf-worker.mjs:L12 | neighbors=[copy-pdf-worker.mjs]
- "scripts_copy_pdf_worker_require": "require" | kind=code-symbol | source=scripts/copy-pdf-worker.mjs:L11 | neighbors=[copy-pdf-worker.mjs]
- "scripts_extract_fpt_strings_buf": "buf" | kind=code-symbol | source=scripts/extract-fpt-strings.mjs:L3 | neighbors=[extract-fpt-strings.mjs]
- "scripts_extract_fpt_strings_text": "text" | kind=code-symbol | source=scripts/extract-fpt-strings.mjs:L4 | neighbors=[extract-fpt-strings.mjs]
- "scripts_inspect_defs": "inspect-defs.mjs" | kind=code-symbol | source=scripts/inspect-defs.mjs:L1 | neighbors=[config]
- "scripts_inspect_defs_config": "config" | kind=code-symbol | source=scripts/inspect-defs.mjs:L2 | neighbors=[inspect-defs.mjs]
- "scripts_inspect_so_calls_callsp": "callSP()" | kind=code-symbol | source=scripts/inspect-so-calls.mjs:L10 | neighbors=[inspect-so-calls.mjs]
- "scripts_inspect_so_calls_config": "config" | kind=code-symbol | source=scripts/inspect-so-calls.mjs:L3 | neighbors=[inspect-so-calls.mjs]
- "scripts_inspect_so_detail": "inspect-so-detail.mjs" | kind=code-symbol | source=scripts/inspect-so-detail.mjs:L1 | neighbors=[config]
- "scripts_inspect_so_detail_config": "config" | kind=code-symbol | source=scripts/inspect-so-detail.mjs:L3 | neighbors=[inspect-so-detail.mjs]
- "scripts_inspect_so_lookups_call": "call()" | kind=code-symbol | source=scripts/inspect-so-lookups.mjs:L9 | neighbors=[inspect-so-lookups.mjs]
- "scripts_inspect_so_lookups_config": "config" | kind=code-symbol | source=scripts/inspect-so-lookups.mjs:L2 | neighbors=[inspect-so-lookups.mjs]
- "scripts_inspect_so_sps_config": "config" | kind=code-symbol | source=scripts/inspect-so-sps.mjs:L4 | neighbors=[inspect-so-sps.mjs]
- "scripts_inspect_so_sps_sp_list": "SP_LIST" | kind=code-symbol | source=scripts/inspect-so-sps.mjs:L13 | neighbors=[inspect-so-sps.mjs]
- "scripts_migrate_customers_tabs_appfooterline": "appFooterLine" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L66 | neighbors=[migrate-customers-tabs.mjs]
- "scripts_migrate_customers_tabs_findline": "findLine()" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L6 | neighbors=[migrate-customers-tabs.mjs]
- "scripts_migrate_customers_tabs_l1": "l1" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L14 | neighbors=[migrate-customers-tabs.mjs]
- "scripts_migrate_customers_tabs_l2": "l2" | kind=code-symbol | source=scripts/migrate-customers-tabs.mjs:L19 | neighbors=[migrate-customers-tabs.mjs]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-130.json

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
