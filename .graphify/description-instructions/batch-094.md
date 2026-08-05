# Node Description Batch 95 of 139

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

- "eslint_config": "eslint.config.mjs" | kind=code-symbol | source=eslint.config.mjs:L1 | neighbors=[eslintConfig]
- "eslint_config_eslintconfig": "eslintConfig" | kind=code-symbol | source=eslint.config.mjs:L5 | neighbors=[eslint.config.mjs]
- "extract_cp_componentsdir": "componentsDir" | kind=code-symbol | source=extract_cp.js:L23 | neighbors=[extract_cp.js]
- "extract_cp_content": "content" | kind=code-symbol | source=extract_cp.js:L5 | neighbors=[extract_cp.js]
- "extract_cp_fs": "fs" | kind=code-symbol | source=extract_cp.js:L1 | neighbors=[extract_cp.js]
- "extract_cp_modals": "modals" | kind=code-symbol | source=extract_cp.js:L7 | neighbors=[extract_cp.js]
- "extract_cp_path": "path" | kind=code-symbol | source=extract_cp.js:L2 | neighbors=[extract_cp.js]
- "extract_cp_srcfile": "srcFile" | kind=code-symbol | source=extract_cp.js:L4 | neighbors=[extract_cp.js]
- "fix_empty_arr_dir": "dir" | kind=code-symbol | source=fix_empty_arr.js:L4 | neighbors=[fix_empty_arr.js]
- "fix_empty_arr_files": "files" | kind=code-symbol | source=fix_empty_arr.js:L5 | neighbors=[fix_empty_arr.js]
- "fix_empty_arr_fs": "fs" | kind=code-symbol | source=fix_empty_arr.js:L1 | neighbors=[fix_empty_arr.js]
- "fix_empty_arr_path": "path" | kind=code-symbol | source=fix_empty_arr.js:L2 | neighbors=[fix_empty_arr.js]
- "fix_freights_c": "c" | kind=code-symbol | source=_fix-freights.mjs:L46 | neighbors=[_fix-freights.mjs]
- "fix_freights_lines": "lines" | kind=code-symbol | source=_fix-freights.mjs:L4 | neighbors=[_fix-freights.mjs]
- "fix_freights_verify": "verify" | kind=code-symbol | source=_fix-freights.mjs:L61 | neighbors=[_fix-freights.mjs]
- "fix_freights_vl": "vl" | kind=code-symbol | source=_fix-freights.mjs:L62 | neighbors=[_fix-freights.mjs]
- "fix_imports_content": "content" | kind=code-symbol | source=fix_imports.js:L5 | neighbors=[fix_imports.js]
- "fix_imports_file": "file" | kind=code-symbol | source=fix_imports.js:L4 | neighbors=[fix_imports.js]
- "fix_imports_fs": "fs" | kind=code-symbol | source=fix_imports.js:L1 | neighbors=[fix_imports.js]
- "fix_imports_path": "path" | kind=code-symbol | source=fix_imports.js:L2 | neighbors=[fix_imports.js]
- "fix_tags_close_content": "content" | kind=code-symbol | source=fix_tags_close.js:L5 | neighbors=[fix_tags_close.js]
- "fix_tags_close_file": "file" | kind=code-symbol | source=fix_tags_close.js:L4 | neighbors=[fix_tags_close.js]
- "fix_tags_close_fs": "fs" | kind=code-symbol | source=fix_tags_close.js:L1 | neighbors=[fix_tags_close.js]
- "fix_tags_close_path": "path" | kind=code-symbol | source=fix_tags_close.js:L2 | neighbors=[fix_tags_close.js]
- "fix_tags_content": "content" | kind=code-symbol | source=fix_tags.js:L5 | neighbors=[fix_tags.js]
- "fix_tags_file": "file" | kind=code-symbol | source=fix_tags.js:L4 | neighbors=[fix_tags.js]
- "fix_tags_fs": "fs" | kind=code-symbol | source=fix_tags.js:L1 | neighbors=[fix_tags.js]
- "fix_tags_path": "path" | kind=code-symbol | source=fix_tags.js:L2 | neighbors=[fix_tags.js]
- "flexy2qb_page_flexy2qbpage": "Flexy2QBPage()" | kind=code-symbol | source=src/app/flexy2qb/page.tsx:L38 | neighbors=[page.tsx]
- "flexy2qb_page_tabs": "TABS" | kind=code-symbol | source=src/app/flexy2qb/page.tsx:L27 | neighbors=[page.tsx]
- "flexy2qb_useflexy2qbstore_flexy2qbstate": "Flexy2QBState" | kind=code-symbol | source=src/store/flexy2qb/useFlexy2QBStore.ts:L3 | neighbors=[useFlexy2QBStore.ts]
- "freights_page_empty_al": "EMPTY_AL" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L39 | neighbors=[page.tsx]
- "freights_page_empty_arr": "EMPTY_ARR" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L26 | neighbors=[page.tsx]
- "freights_page_empty_at": "EMPTY_AT" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L36 | neighbors=[page.tsx]
- "freights_page_empty_ci": "EMPTY_CI" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L38 | neighbors=[page.tsx]
- "freights_page_empty_fr": "EMPTY_FR" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L34 | neighbors=[page.tsx]
- "freights_page_empty_ha": "EMPTY_HA" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L35 | neighbors=[page.tsx]
- "freights_page_empty_se": "EMPTY_SE" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L37 | neighbors=[page.tsx]
- "freights_page_empty_wh": "EMPTY_WH" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L33 | neighbors=[page.tsx]
- "freights_page_ff": "ff()" | kind=code-symbol | source=src/app/masters/freights/page.tsx:L30 | neighbors=[page.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\EIS-Data\AppSmith\Antigravity\fullpot-operational-system\.graphify\description-instructions\batch-094.json

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
