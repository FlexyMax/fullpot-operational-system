# FOS — Missing Stored Procedures

> **Verified:** 2026-05-16 against `flexymaxfpsql / fullpot` (production DB)
> These 20 SPs are referenced in the app but **NOT FOUND** in the current database.
> Source: retrieved from another DB and need to be scripted here.

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
| `sp_flower_products_default_charge` | Default Charge button | `@product_uq` (or `@unico`) |
| `sp_flower_products_extended_recipe` | Extended Recipe button | `@product_uq` (or `@unico`) |

**File to update:** `src/app/masters/items/Tab2.tsx`
- Find `handlePrebook()` → replace "Coming soon" with real API call
- Find `handleDirectAction()` → replace "Coming soon" with real API call

**API routes (already created, just need the SP to exist):**
```
POST /api/masters/items/products/[unico]/recipe-to-prebook    ← create this route
POST /api/masters/items/products/[unico]/upc-to-prebook       ← create this route
POST /api/masters/items/products/[unico]/sales-info-to-prebook ← create this route
POST /api/masters/items/products/[unico]/default-charge        ← create this route
POST /api/masters/items/products/[unico]/extended-recipe       ← create this route
```
> These route files do NOT exist yet — need to be created after SP params are verified.

---

## Group 2 — Composition Reports (Tab 2 Print menu)

The **Bouquet** report already works (`sp_flower_products_composition_report` ✅).
Only Box and Extended are missing.

| SP | Called from | Parameters (expected) |
|----|-------------|----------------------|
| `sp_flower_products_composition_cajas_report` | Print Composition → Box | `@lcproduct_uq varchar(8)` |
| `sp_flower_products_extended_composition_report` | Print Composition → Extended | `@lcproduct_uq varchar(8)` |

**File to update:** `src/app/masters/items/Tab2.tsx`
- Find `handlePrint()` → remove the "Coming soon" guard for `box` and `extended`

**API route to update:** `src/app/api/masters/items/products/[unico]/print-composition/route.ts`
- Add cases for `type === "box"` and `type === "extended"`

---

## Group 3 — Grades CRUD (Tab 1, Grades sub-tab)

Currently using **direct SQL** on `flower_clases_grados` as workaround.

| SP | Called from | Parameters (expected) |
|----|-------------|----------------------|
| `sp_flower_grades_insert` | Grades → Add | `@lcgrade, @lcgrade_sh, @lldisplay, @llfnational` (verify) |
| `sp_flower_grades_update` | Grades → Edit | `+ @lcunico` |
| `sp_flower_grades_delete` | Grades → Delete | `@lcunico` |

**Files to update:**
- `src/app/api/masters/items/grades/route.ts` → POST: replace direct SQL with SP
- `src/app/api/masters/items/grades/[unico]/route.ts` → PUT/DELETE: replace direct SQL

**Also needs:** selected grade state in Tab 1 — currently Edit/Delete are disabled
(`src/app/masters/items/page.tsx` → Grades tab has `disabled:true` on Edit/Delete menu items).

---

## Group 4 — Colors CRUD (Tab 1, Colors sub-tab)

Currently using **direct SQL** on `flower_varieties_colors` as workaround.

| SP | Called from | Parameters (expected) |
|----|-------------|----------------------|
| `sp_flower_colors_insert` | Colors → Add | `@lccolor, @lccolor_sh, @lldisplay, @llmix` (verify) |
| `sp_flower_colors_update` | Colors → Edit | `+ @lcunico` |
| `sp_flower_colors_delete` | Colors → Delete | `@lcunico` |

**Files to update:**
- `src/app/api/masters/items/colors/route.ts` → POST
- `src/app/api/masters/items/colors/[unico]/route.ts` → PUT/DELETE

**Also needs:** selected color state in Tab 1 — Edit/Delete currently disabled.

---

## Group 5 — Varieties CRUD (Tab 1, Varieties panel)

Currently using **direct SQL** on `flower_varieties` as workaround.

| SP | Called from | Parameters (expected) |
|----|-------------|----------------------|
| `sp_flower_variety_insert` | Varieties → Add | `@lcvariety, @lcvariety_sh, @lcsubclass_uq, @lldisplay, @llchangecolor, @llactive` (verify) |
| `sp_flower_variety_update` | Varieties → Edit | `+ @lcunico` |
| `sp_flower_variety_delete` | Varieties → Delete | `@lcunico` |

**Files to update:**
- `src/app/api/masters/items/varieties/route.ts` → POST
- `src/app/api/masters/items/varieties/[unico]/route.ts` → PUT/DELETE

---

## Group 6 — Packs (Tab 1 — Bouquet/Box Composition)

These SPs are for the **Packs** sub-panel inside products (composition detail).
Buttons currently show "Coming soon" in Tab 1 products panel.

| SP | Purpose | Parameters (expected) |
|----|---------|----------------------|
| `sp_flower_varieties_packs_list` | List packs for a product | `@lcproduct_uq` |
| `sp_flower_varieties_packs_insert` | Add a pack | `@lcproduct_uq, @lcpack_uq, @lnquantity, ...` (verify) |
| `sp_flower_varieties_packs_update` | Edit a pack | `+ @lcunico` |
| `sp_flower_varieties_packs_delete` | Delete a pack | `@lcunico` |

**After adding:** implement the Bouquet/Box Composition modals in Tab 1 and Tab 2.

---

## How to Integrate After Adding SPs

1. Verify exact parameter names: `node check_sp_params.js` (or add SPs to the list in `check_tab2_sps.js`)
2. Update the relevant API route files with the correct `executeProcedure()` call
3. Remove "Coming soon" placeholders in the UI
4. For Groups 3/4/5: also add `selGrade`, `selColor`, `selVariety` selection state so Edit/Delete work

---

## Quick Reference — What Currently Works

| Feature | Status | Notes |
|---------|--------|-------|
| Classes CRUD | ✅ | `sp_flower_class_insert/update/delete` |
| Subclasses CRUD | ✅ | `sp_flower_subclass_insert/update/delete` |
| Grades list | ✅ | `sp_flower_grades_list` |
| Grades Add | 🔧 | Direct SQL (SP missing) |
| Grades Edit/Delete | ❌ | Disabled — needs SP + selection state |
| Colors list | ✅ | `sp_flower_colors_list` |
| Colors Add | 🔧 | Direct SQL (SP missing) |
| Colors Edit/Delete | ❌ | Disabled — needs SP + selection state |
| Cases CRUD | ✅ | `sp_flower_cases_insert/update/delete` |
| Varieties list | ✅ | `sp_flower_subclass_varieties` |
| Varieties Add | 🔧 | Direct SQL (SP missing) |
| Varieties Edit/Delete | ✅ | Direct SQL (works) |
| Products CRUD | ✅ | `sp_flower_products_insert/update/delete_from_varieties` |
| Alt. Products modal | ✅ | |
| Season Recipes modal | ✅ | |
| Buyers Quotas modal | ✅ | |
| PO Prices modal | ✅ | |
| Update Stock modal | ✅ | |
| Bouquet print | ✅ | `sp_flower_products_composition_report` |
| Box / Extended print | ❌ | SPs missing |
| Recipe/UPC/Sales→Prebook | ❌ | SPs missing |
| Default Charge | ❌ | SP missing |
| Extended Recipe | ❌ | SP missing |
| Packs (Bouquet/Box comp.) | ❌ | SPs missing |
