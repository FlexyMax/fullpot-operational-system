# FOS — Missing Stored Procedures

> **Verified:** 2026-05-16 against `flexymaxfpsql / fullpot` (production DB)
> **Updated:** 2026-05-16 after Tab 3 implementation — corrected varieties CRUD status.

---

## Summary

| Tab | Missing SPs | Impact |
|-----|-------------|--------|
| **Tab 1** | Grades CRUD (3), Colors CRUD (3), Packs (4) | Add uses direct SQL; Edit/Delete disabled; Bouquet/Box Composition blocked |
| **Tab 2** | Prebook actions (5), Composition reports (2) | 7 toolbar buttons show "Coming soon" |
| **Tab 3** | ✅ None | All SPs present and working |

**Total missing: 13 SPs** (down from 20 — varieties CRUD turned out to exist with correct plural name)

---

## Status Legend
- ❌ Not found — button/feature shows "Coming soon" message
- ✅ Found — SP is in the DB and working
- 🔧 Workaround — direct SQL used instead (needs SP when available)

---

## Group 1 — Prebook Actions (Tab 2 toolbar)

These 5 SPs are called from the **Tab 2 → Toolbar Row 2** buttons.
Once added, remove the "Coming soon" message in `Tab2.tsx` → `handlePrebook()` and `handleDirectAction()`.

| SP | Called from | Parameters (expected) |
|----|-------------|----------------------|
| `sp_flower_products_recipe_to_prebook` | Recipe→Prebook button | `@product_uq, @date_from, @date_to, @delete_prior, @change_case` |
| `sp_flower_products_upc_to_prebook` | UPC→Prebook button | `@product_uq, @date_from, @date_to` |
| `sp_flower_products_sales_info_to_prebook` | Sales→Prebook button | `@product_uq, @date_from, @date_to` |
| `sp_flower_products_default_charge` | Default Charge button | `@product_uq` (or `@unico`) — verify |
| `sp_flower_products_extended_recipe` | Extended Recipe button | `@product_uq` (or `@unico`) — verify |

**File to update:** `src/app/masters/items/Tab2.tsx`
- Find `handlePrebook()` → replace "Coming soon" with real API call
- Find `handleDirectAction()` → replace "Coming soon" with real API call

**API routes needed** (files don't exist yet — create after verifying params):
```
POST /api/masters/items/products/[unico]/recipe-to-prebook
POST /api/masters/items/products/[unico]/upc-to-prebook
POST /api/masters/items/products/[unico]/sales-info-to-prebook
POST /api/masters/items/products/[unico]/default-charge
POST /api/masters/items/products/[unico]/extended-recipe
```

---

## Group 2 — Composition Reports (Tab 2 Print menu)

The **Bouquet** report already works (`sp_flower_products_composition_report` ✅).
Only Box and Extended are missing.

| SP | Called from | Parameters (expected) |
|----|-------------|----------------------|
| `sp_flower_products_composition_cajas_report` | Print Composition → Box | `@lcproduct_uq varchar(8)` |
| `sp_flower_products_extended_composition_report` | Print Composition → Extended | `@lcproduct_uq varchar(8)` |

**File to update:** `src/app/masters/items/Tab2.tsx` → `handlePrint()` — remove "Coming soon" guard for `box` and `extended`.

**API route to update:** `src/app/api/masters/items/products/[unico]/print-composition/route.ts` — add `type === "box"` and `type === "extended"` cases.

---

## Group 3 — Grades CRUD (Tab 1, Grades sub-tab)

Currently using **direct SQL** on `flower_clases_grados` as workaround. Add only works; Edit/Delete are disabled.

| SP | Called from | Parameters (expected — verify) |
|----|-------------|----------------------|
| `sp_flower_grades_insert` | Grades → Add | `@lcgrade, @lcgrade_sh, @lldisplay, @llfnational` |
| `sp_flower_grades_update` | Grades → Edit | `@lcunico, @lcgrade, @lcgrade_sh, @lldisplay, @llfnational` |
| `sp_flower_grades_delete` | Grades → Delete | `@lcunico` |

**Files to update after adding SPs:**
- `src/app/api/masters/items/grades/route.ts` → POST: replace direct SQL
- `src/app/api/masters/items/grades/[unico]/route.ts` → PUT/DELETE: replace direct SQL

**Also needs:** `selGrade` state in Tab 1 page.tsx — currently Edit/Delete buttons have `disabled:true`.

---

## Group 4 — Colors CRUD (Tab 1, Colors sub-tab)

Currently using **direct SQL** on `flower_varieties_colors` as workaround. Add only works; Edit/Delete are disabled.

| SP | Called from | Parameters (expected — verify) |
|----|-------------|----------------------|
| `sp_flower_colors_insert` | Colors → Add | `@lccolor, @lccolor_sh, @lldisplay, @llmix` |
| `sp_flower_colors_update` | Colors → Edit | `@lcunico, @lccolor, @lccolor_sh, @lldisplay, @llmix` |
| `sp_flower_colors_delete` | Colors → Delete | `@lcunico` |

**Files to update after adding SPs:**
- `src/app/api/masters/items/colors/route.ts` → POST
- `src/app/api/masters/items/colors/[unico]/route.ts` → PUT/DELETE

**Also needs:** `selColor` state in Tab 1 page.tsx — Edit/Delete buttons currently disabled.

---

## Group 5 — Packs / Bouquet & Box Composition (Tabs 1 and 2)

These SPs manage the **pack composition** inside a product (ingredient list for bouquets/boxes).
Bouquet/Box Composition buttons show "Coming soon" in both Tab 1 and Tab 2.

| SP | Purpose | Parameters (expected — verify) |
|----|---------|----------------------|
| `sp_flower_varieties_packs_list` | List ingredient packs for a product | `@lcproduct_uq` |
| `sp_flower_varieties_packs_insert` | Add an ingredient | `@lcproduct_uq, @lcpack_uq, @lnquantity, ...` |
| `sp_flower_varieties_packs_update` | Edit an ingredient | `@lcunico, ...` |
| `sp_flower_varieties_packs_delete` | Delete an ingredient | `@lcunico` |

**After adding:** implement Bouquet/Box Composition modals in Tab 1 (`page.tsx`) and Tab 2 (`Tab2.tsx`).

---

## ✅ Previously Thought Missing — Actually Present

These SPs were listed as missing due to a name mismatch (searched singular, actual name is plural):

| SP (searched) | Actual SP | Status |
|---------------|-----------|--------|
| `sp_flower_variety_insert` | `sp_flower_varieties_insert` | ✅ Working since Tab 3 |
| `sp_flower_variety_update` | `sp_flower_varieties_update` | ✅ Working since Tab 3 |
| `sp_flower_variety_delete` | `sp_flower_varieties_delete` | ✅ Working since Tab 3 |

---

## How to Integrate After Adding SPs

1. Run `node check_tab2_sps.js` (add new SP names to the list) to verify exact parameter names
2. Update the relevant API route files with the correct `executeProcedure()` call
3. Remove "Coming soon" placeholders in the UI
4. For Groups 3 and 4: also add `selGrade` / `selColor` selection state in `page.tsx`

---

## Quick Reference — Current Status

| Feature | Tab | Status | Notes |
|---------|-----|--------|-------|
| Classes CRUD | 1 | ✅ | `sp_flower_class_insert/update/delete` |
| Subclasses CRUD | 1 | ✅ | `sp_flower_subclass_insert/update/delete` |
| Grades — List | 1 | ✅ | `sp_flower_grades_list` |
| Grades — Add | 1 | 🔧 | Direct SQL (SP missing) |
| Grades — Edit/Delete | 1 | ❌ | Disabled — needs SP + selGrade state |
| Colors — List | 1 | ✅ | `sp_flower_colors_list` |
| Colors — Add | 1 | 🔧 | Direct SQL (SP missing) |
| Colors — Edit/Delete | 1 | ❌ | Disabled — needs SP + selColor state |
| Cases CRUD | 1 | ✅ | `sp_flower_cases_insert/update/delete` |
| Varieties CRUD | 1+3 | ✅ | `sp_flower_varieties_insert/update/delete` |
| Products CRUD | 1+2 | ✅ | `sp_flower_products_insert/update/delete_from_varieties` |
| Bouquet/Box Composition | 1+2 | ❌ | `sp_flower_varieties_packs_*` missing |
| Alt. Products modal | 2 | ✅ | |
| Season Recipes modal | 2 | ✅ | |
| Buyers Quotas modal | 2 | ✅ | |
| PO Prices modal | 2 | ✅ | |
| Update Stock modal | 2 | ✅ | |
| Bouquet print | 2 | ✅ | `sp_flower_products_composition_report` |
| Box / Extended print | 2 | ❌ | SPs missing |
| Recipe/UPC/Sales→Prebook | 2+3 | ❌ | SPs missing |
| Default Charge | 2 | ❌ | SP missing |
| Extended Recipe | 2 | ❌ | SP missing |
| Components search | 3 | ✅ | `sp_flower_varieties_search` |
| Variety CRUD | 3 | ✅ | Full form with all fields |
| SubClass BOGO | 3 | ✅ | `sp_flower_subclass_update_bogo` |
| BOGO Cleaner | 3 | ✅ | `sp_flower_subclass_update_clean_bogo` |
| Warehouse BOGO | 3 | ✅ | `sp_flower_warehouses_bogo_*` |
