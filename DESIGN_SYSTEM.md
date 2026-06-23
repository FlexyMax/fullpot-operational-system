# FOS — "Industrial Precision" Design System

> Original reference: `src/app/system/access/page.tsx` (approved 2026-06-20).
> Canonical implementation: `src/components/ui/PanelGrid.tsx` + `PanelGridTable.tsx`
> (updated 2026-06-20) — any page using these shared components gets this look
> automatically. Apply these tokens when restyling a page that does **not**
> use PanelGrid — don't invent new values.

---

## Colors

| Token | Hex / value | Used for |
|---|---|---|
| Page background | `#FBF9F8` | Outer page wrapper (`bg-[#FBF9F8]` on the root `<div>`) |
| Panel / card background | `#FFFFFF` (white) | Card surfaces, panel headers, inputs, selects |
| Container gray | `#F5F3F3` | Background of the **container** wrapping a search box or filter bar — never the input/select itself, which stays white |
| Borders / dividers | `#DBD9D9` | All grid/table/panel borders: card outlines, row dividers, column separators, checkbox outlines |
| Table header (dark) | `#4F4F4F` | **Only** the actual data-table header row (`<thead>`), with white text. Panel/section title bars are white with `#4F4F4F` text — they do **not** get this dark fill |
| Accent (brand) | `#FB7506` | Icons, primary action buttons (e.g. "Edit"), focus rings |
| Selected row tint | `#FB7506` at 10% opacity (`bg-[#FB7506]/10`) | Background of the selected row in a list (replaces any blue selection highlight) |
| Active / success | `#22C55E` | "Active" status badge, checked checkboxes, and — for rows that represent a granted/active state — the row's text color and a 5% tint background (`bg-[#22C55E]/5`, hover `/10`) |
| Inactive / danger | `#EF4444` (Tailwind `red-500`) | "Inactive" status badge — unchanged, not part of this redesign |

**Rule of thumb:** if it's a *section title* (panel header bar), it's white with dark text. If it's the *column header row of an actual data table*, it's the dark `#4F4F4F` bar with white text. Don't mix the two up.

**Every grid needs both horizontal AND vertical divider lines — a full grid, not just row separators.** The canonical example is `system/access`'s "Screen Permissions" table: every column (`<th>`/`<td>`) has a `border-r border-[#DBD9D9]` divider in addition to the row's `border-b`, including inside the dark `<thead>` (use `border-r border-[#DBD9D9]/30` there since it's a light line on a dark background — full-opacity `#DBD9D9` in the light tbody). Drop the divider on the last column only (`last:border-r-0`) so it doesn't double up against the table's own outer border. **This was missed for a while** — several migrated tables (`PanelGridTable`'s `PanelGridTh`/`PanelGridTd`, AWBs, QC, Items, Prebook to Invoice) had their column dividers stripped out entirely when the header was darkened, leaving only horizontal lines. Fixed in `PanelGridTable.tsx` (2026-06-22), which auto-fixes every page using the shared component; hand-rolled tables need the divider added back individually.

---

## Font family

**The app font is Inter**, set once in `src/app/globals.css`:

```css
@theme {
  --font-sans: "Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif";
}
body {
  font-family: var(--font-sans);
}
```

This makes Tailwind's `font-sans` utility (and the unstyled default, since it's set on `<body>`) resolve to Inter everywhere. **Don't add a per-page font override** — pages that explicitly set `font-sans` on their root `<div>` (POS, QC, AWBs, Prebook to Invoice, ...) are redundant but harmless, since it resolves to the same Inter stack inherited from `<body>`.

**Known quirk, not a bug to "fix" by adding more fonts:** `src/app/layout.tsx` also loads `Geist`/`Geist Mono` via `next/font/google` and applies their CSS variables (`--font-geist-sans`, `--font-geist-mont`) to `<body>`'s className. **Neither variable is actually referenced by any `font-family` rule** — `globals.css`'s `--font-sans` override (Inter) wins. So the "Failed to download `Geist`/`Geist Mono` from Google Fonts" warnings seen in `next dev` logs are harmless noise, not a rendering problem — the page never tries to render in Geist. If those fonts are ever wired up for real (e.g. a future rebrand), update this section *and* check every page for a stray `font-sans` override fighting the new family.

Monospace (`font-mono`) is intentionally used for alphanumeric codes/IDs (AWB codes, lot numbers, etc.) — that's a deliberate exception, not a font-family inconsistency.

---

## Typography scale

| Use | Weight | Size | Case |
|---|---|---|---|
| Screen titles (the page name in the dark top header bar, e.g. "SYSTEM ACCESS", "PREBOOK TO INVOICE") | Bold (700) | 20px–24px | Uppercase |
| Panel/section titles (e.g. "USER INFORMATION", "SCREEN PERMISSIONS") | Bold (700) | 14px | Uppercase |
| Data labels (e.g. "CODE", "USERNAME", "LEVEL") and table header row (Access/Create/Screen/...) | Bold (700) | 12px | Uppercase |
| Table content and sidebar list names (e.g. "CUSTOMER PAYMENTS", a user's name in a list) | Regular (400) | 13px | As-is |
| Buttons (Edit, Save, Cancel, Copy From/To, nav actions) | Semibold (600) | 14px | Uppercase |

Implement with explicit Tailwind arbitrary values (`text-[14px] font-bold`, etc.) rather than the legacy `fos-grid-header-text` utility — that utility hardcodes white text for dark header bars and doesn't fit the new light-header panels.

**Button height — use `h-7` (28px fixed), not `py-*` padding.** `py-2`/`py-1.5` at 14px renders taller than 28px and looks oversized next to the reference (`PanelGrid`'s single-action button, e.g. "Print", which is `px-3 h-7`). Every button on the 14px scale should be `h-7` with horizontal padding only (`px-2.5`/`px-3`), not vertical padding.

---

## Component patterns

- **A master-detail list page should auto-select the first record once the list loads, not wait for a click.** Standing Orders loaded with the Orders List populated but the detail panel showing a generic "Select an order" placeholder until the user clicked a row — extra, avoidable friction on a page whose whole point is showing order detail. Fixed by selecting `orders[0]` automatically the first time the list query resolves (a `useRef` guard so it only fires once, not on every refilter — if the user's filter later excludes the selected row, the placeholder is allowed to come back rather than force-reselecting something the user didn't ask for). Set the selection state directly rather than routing through the row-click handler, so this doesn't also force a mobile detail modal open on page load — on mobile the row just shows selected/highlighted in the list, same as a real click would, but no modal pops automatically. **Apply this on any other list+detail page that currently waits for a click before showing anything** (Prebook to Invoice's Date/Customer panels are the same shape and should get this treatment too, in a future round).
- **Avoid nesting one grid inside another's table row — prefer side-by-side or stacked sibling panels driven by shared selection state.** Prebook to Invoice (Date → Customer → Lines → detail-tabs master-detail drill-down) went through several iterations before landing here, each one informative:
  1. All three levels nested inside table rows (Date → Customer → Lines → Tabs, 3 levels of `<tr><td>` nesting).
  2. Detail-tabs panel pulled out to a standalone panel below; Lines still nested under Customer.
  3. Lines pulled out too, to its own standalone panel; only Date → Customer nesting remained (1 level).
  4. **Final shape: no nesting at all.** Date Picker and Customers render as two side-by-side panels (`flex gap-2`, each `flex-1 min-w-0`) at the top of the page, each a plain flat list — selecting a date on the left filters the Customers list on the right (`enabled: !!selectedDate` on its query), exactly the same data relationship as before, just without one grid living inside the other's `<tr>`. "Closed Prebook box by date and customer" (Lines) and the detail tabs remain standalone panels stacked below, reading `selectedDate`/`selectedCustUq`/`selectedUnico` the same way.
  Two lessons fall out of this: (a) `flex flex-col` + `flex-1` to split a header strip from a scrollable content area **does not reliably resolve three or more `<table>`s deep** — even with a definite-height ancestor, the content area rendered at 0 height while the header next to it rendered fine; the same flex pattern works fine as a top-level panel or one level deep, just not several `<table>`s deep. If you do nest a grid in a table row, use `max-height` + `overflow-y-auto` instead of flex-grow for its scroll area. (b) Even with the height bug fixed, a `<table>` row is usually the wrong host for another full grid — at every level tested here, the side-by-side/stacked sibling-panel version, reading off shared selection state instead of being rendered inside a table cell, was the one that actually looked right. Default to that; only reach for the nested-row pattern for something genuinely small (a 2-3-column micro-list, not a full grid with its own toolbar).
- **A page with several stacked grids needs page-level (external) scroll, not a `h-[100dvh] overflow-hidden` shell that crams everything into one viewport.** Prebook to Invoice's page root used to be `flex flex-col h-[100dvh] overflow-hidden`, forcing the Date/Customer row, the Lines grid, and the detail-tabs panel to all fight over one fixed viewport height — every panel ended up cramped (`flex-1` panels could shrink to almost nothing). Changed the root to `flex flex-col min-h-screen` (no `overflow-hidden`, no fixed `h-[100dvh]`) so the page grows to its natural content height and the browser/document scrolls externally. Each panel now gets a real, fixed height instead of competing for `flex-1` leftover space (Lines grid is `h-[600px]` instead of `flex-1 min-h-0` — `flex-1` doesn't compute usefully once the parent's height is `auto`/content-based instead of viewport-locked).
  The action button bar (Change PO/Invoice/Pick List/etc.) is `sticky top-0 z-20` so that once you scroll past the Date Picker/Customers row, the bar locks to the top of the viewport instead of scrolling away — the buttons stay reachable while you work in the grids below. `AppHeader` itself is intentionally left non-sticky here so it scrolls out of view first, letting the action bar take over the top edge. This pattern (root: `min-h-screen` no `overflow-hidden`; one `sticky top-0` toolbar; grids get explicit heights, not `flex-1`) is the one to reach for whenever a page has more stacked grids than comfortably fit one viewport.
- **A tabbed panel where each tab swaps in a different table needs a fixed height on the shared content wrapper, not `max-height`.** Prebook to Invoice's 5 detail tabs (Invoiced Prebooks/Assigned Stock/Purchase/Stock OM/Similar Products) each used `max-h-[300px] overflow-y-auto` on their own table wrapper — `max-height` only caps growth, it doesn't force a minimum, so a tab with 2 rows rendered a short panel and a tab with 50 rows rendered a tall one (up to the 300px cap). Switching tabs made the whole panel's height jump around, which read as broken/confusing while navigating. Changed all 5 to `h-[300px]` (fixed, not max) so the panel is always exactly the same height no matter which tab is active or how many rows it has — short tabs just show empty space below their rows instead of shrinking the panel.
- **Panel header bar:** `h-10 bg-white flex items-center justify-between pl-3 border-b border-[#DBD9D9] rounded-t-lg`, icon in `#FB7506`, title per the type scale above. A sidebar/list panel (like "Users") may use `bg-[#F5F3F3]` instead of white for its title bar — keep the rest of the page's panels white. **The leading icon is not optional** — every panel/section title across the app has one (`<Icon size={14-16} className="text-[#FB7506] shrink-0"/>` immediately before the `<span>`). QC's tabs shipped several titles with no icon at all ("QC Stock Search", "Quality Credits by Lot", "Boxes in Transit Delivery Date", "Packing List Boxes", the `ScanPanel`/`SubGridHeader` titles in `StockListTab`) — all fixed (2026-06-21), but check for this specifically whenever migrating a hand-rolled panel: a title with no icon is a miss, not a valid variant.
  **Every panel header on a page should be the same `h-10`, and every button on a page should share one height/font scale (`h-7`/`text-[14px]`) unless there's a deliberate reason for a smaller one.** Prebook to Invoice's 5 detail-tab sub-panels ("Invoiced Prebooks", "Stock Open Market and Similar Products", etc.) had `h-9` headers and a separate `SBtn` button (`h-6`/`text-[12px]`) — both smaller than the rest of the page's `h-10` headers and `h-7`/`text-[14px]` buttons (`TBtn`, the Lines/Customers panel header buttons). Fixed by bumping `SBtn` and the tab headers to match (2026-06-22). A second button scale is only legitimate when there's a real visual hierarchy to express (e.g. a genuinely secondary/inline action) — it shouldn't be an accident of one component getting built before the page's scale was settled.
- **Primary action button** (e.g. "Edit"): solid `bg-[#FB7506] hover:bg-orange-500`, white text, `rounded-md`, `h-7`, per the button type scale.
- **Save button:** `bg-green-600 hover:bg-green-700`, white text.
- **Cancel button:** `bg-gray-500 hover:bg-gray-600`, white text.
- **Secondary action button** (e.g. "Copy From/To"): `bg-white border border-[#DBD9D9] text-[#4F4F4F] hover:bg-gray-50` — never solid gray.
- **Destructive/danger action button** (e.g. "Void Line", "Make Invoices"): use the brand accent, not red — `bg-[#FB7506]/10 hover:bg-[#FB7506]/20 border-[#FB7506]/30 text-[#FB7506]` for a tinted/outlined danger button, or solid `bg-green-600`/`bg-[#FB7506]` for a filled action button regardless of how destructive it reads semantically (Prebook to Invoice's "Make Invoices"/"Make Invoice" buttons are both green, not red, even though one triggers a bulk action). Red (`bg-red-*`/`text-red-*`) on a *button* is a miss to fix on sight — this is different from the **Inactive/danger status badge** color above, which is a separate, still-valid use of `#EF4444` for badges/labels, not buttons.
- **Selected list row:** `bg-[#FB7506]/10`, no ring/border needed.
- **Active/granted table row:** `bg-[#22C55E]/5 hover:bg-[#22C55E]/10`, with the row's text columns colored `text-[#22C55E]`. Rows without the granted state use `opacity-40` and default gray text — no special background.
- **Filter/search container:** the wrapping `<div>` gets `bg-[#F5F3F3]`; the `<input>`/`<select>` inside stays white (`bg-white` or rely on `.fos-input`'s built-in white default).
- **Standalone filter/search toolbar above a `PanelGrid`** (a page-level bar that isn't inside `PanelGrid`'s own header — e.g. Customer Payments' search+Bal filters row, System Users' search box): `bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg`, with the same horizontal margin as the `PanelGrid` below it (`mx-2`) and a small top margin (`mt-2`) so it doesn't sit flush against `AppHeader` or whatever's above it. Don't leave it full-bleed with just a `border-b` divider — it should read as its own rounded card, same as the reference page's "Filter Bar". This same `bg-[#F5F3F3]` container applies to a standalone **action button toolbar** too, not just filter/search bars — Prebook to Invoice's button bar (Change PO/Attach Invoice/Reset Inv./Invoice/Pick List/.../Partial Invoice) shipped on plain white and was fixed to the gray container (2026-06-22); the individual buttons inside stay white/colored pills against that gray background, same as a tab bar's active chip.
- **Checkboxes:** checked = `bg-[#22C55E] text-white`; unchecked = `bg-white border border-[#DBD9D9] text-transparent`.
- **Top-level / detail tab bar** (e.g. POS's Invoice/Available Stock/Invoice History, Accounts Payable's Terms/PO/Prebooks/Credits & Debits): the bar itself sits on `bg-[#F5F3F3] border border-[#DBD9D9]` (same container-gray token as the filter bar) so the tabs read as a distinct toolbar instead of blending into the white page. Active tab gets a `bg-white` chip (or just `text-[#FB7506] border-b-2 border-[#FB7506]` for underline-style tabs) to stand out against the gray bar; inactive tabs use `text-gray-500 hover:text-[#FB7506]`. This supersedes the old "dark hand-rolled tab bars are out of scope" gap below — tab bars now get the light-gray treatment, not dark.
- **Nested tab bars must match their parent tab bar.** If a page has a tab bar inside a tab bar (e.g. QC's top-level Stock List/Transit Boxes/... bar, with a second Warehouse Stock/Invoiced Stock Lots bar nested below it), both get the *same* height (`h-10` bar, `h-8` buttons) and the same `bg-[#F5F3F3] border border-[#DBD9D9]` treatment — don't leave an inner tab bar shorter or on plain white just because it's nested one level deeper.
- **Grid action menu (hamburger dropdown):** use the shared `GridMenu` (`src/components/GridMenu.tsx`) or replicate its pattern in full — both the trigger and the dropdown are standardized, not just the dropdown.
  - **Trigger** — the "3 lines" icon button, exactly like `PanelGrid`'s own hamburger: `h-10 w-10 flex items-center justify-center hover:bg-gray-100`, containing three `2px`-thick `bg-[#FB7506]` line segments that are horizontal when closed and rotate to vertical when open (`flex-col gap-[5px]` ↔ `flex-row gap-[5px]`). **Not** a solid orange square button with a lucide `Menu` (☰) icon — that was the old pattern and is now a known miss to look for (it was wrong in `GridMenu.tsx` itself, QC's `QualityCreditsTab`/`QCHistoryTab` local `ActionMenu`, and Items' `Tab1.tsx` `RightCard` — all fixed 2026-06-21). Width can stay `w-10`/`h-10` even when the trigger docks into a panel's top-right corner (`rounded-tr-lg`, `pr-0` on the parent header) — don't widen it back out to fit a label, the icon-only button is the standard.
  - **Dropdown** — must render through `createPortal(..., document.body)` with `position: fixed` anchored to the trigger's `getBoundingClientRect()`. Without the portal, the dropdown is a descendant of the scrollable grid container and gets visually clipped/hidden behind the rows the moment the list scrolls or the container's `overflow-auto` kicks in. Dropdown items: `px-4 py-2.5 text-[14px] font-semibold uppercase`, `hover:bg-[#FB7506]/10`, `rounded-sm` panel, `border border-gray-200`, `z-[100]` — matching `PanelGrid`'s own `MenuDropdown`. Any page-local copy of this pattern should match the same trigger and item styling.

---

## Known gaps / not yet migrated on the reference page

These exist on `system/access/page.tsx` but were intentionally left out of scope during the redesign — don't treat them as part of the system yet:

- Mobile-only modals (Select User, Copy Access) still use the old dark `#4F4F4F` modal header with `fos-grid-header-text`.
- Input/button borders outside of grids (search inputs, the edit-mode "Toggle column" helper bar, plain modal Cancel buttons) still use Tailwind's default `border-gray-200/100`.
- Mobile action bar icon+label buttons keep the app-wide compact `text-[9px]` convention — don't bump these to the 14px button scale, it would break the established mobile pattern shared with every other page (Customers, Sales, etc.).
- **Modal headers stay dark** (`bg-[#374151]`, `fos-grid-header-text`/white text) — this is the one dark-bar exception that's still intentional. Confirmed across QC's `QCModal`/`BoxTransferModal`, AWBS's `Modal` wrapper (and its internal report/charges tables), and POS's New-Invoice/Scan/Edit-Line/Image-gallery modals.

---

## Rollout

`PanelGrid`/`PanelGridTable` is the canonical implementation now — every page that
imports it (Customers, Vendors, Sales, Accounts Payable, Flexy2QB tabs,
Standing Orders, Sales Reps, Payment Authorizations, Carriers, Freights,
System Users/Modules/Companies, ...) picked up this look the moment the
shared component changed, with no per-page edits needed.

Remaining work:

1. ~~`system/access`~~ — done (2026-06-20), but it's hand-rolled markup, not PanelGrid.
2. ~~Update `PanelGrid`/`PanelGridTable` directly~~ — done (2026-06-20), rolled out app-wide.
3. **Next:** migrate `system/access` itself onto `PanelGrid`/`PanelGridTable` instead of
   its custom markup, so every screen — including the original reference page —
   shares one implementation. Same idea applies to any other page found to be
   hand-rolling grid/panel markup instead of using the shared components.

### Hand-rolled pages migrated so far (not PanelGrid-based, fixed individually)

- `flexy2qb` Dashboard tab — done (2026-06-21).
- `qc` (Quality Control) — fully done (2026-06-21): the page shell's top-level
  tab bar and outer page background, plus all 5 active tabs (`StockListTab`,
  `TransitBoxesTab`, `CancelledPurchasesTab`, `QualityCreditsTab`,
  `QCHistoryTab`) — filter bars, panel titles (were dark `#374151`, now white
  per the panel-title rule), the actual data-table headers (were light, now
  dark `#4F4F4F`), borders, peach row selection, and (in `QualityCreditsTab`/
  `QCHistoryTab`) the local `ActionMenu` dropdown typography aligned to the
  `PanelGrid` `MenuDropdown` standard. `StockListTab`'s nested Warehouse
  Stock/Invoiced Stock Lots sub-tab bar was also resized/recolored to match
  the page's top-level tab bar (see the nested-tab-bar rule above). **Out of
  scope, left untouched:** `QCModal`/`BoxTransferModal` (modals, per the gap
  below) and `DashboardTab.tsx` — this file is dead code, no longer imported
  by `qc/page.tsx` since "Dashboard" was dropped from `TABS`.
- `GridMenu` (`src/components/GridMenu.tsx`, shared by ~12 pages incl. AWBs,
  Vendors, Customers, Freights, Items, Pbook2Invoice, Inventory Entry) — fixed
  (2026-06-21) to render its dropdown through a portal with fixed positioning
  (previously `position: absolute` inside the scrollable grid, so it got
  clipped/hidden once the grid had `overflow-auto`), and restyled its items to
  the `PanelGrid` `MenuDropdown` standard (14px semibold uppercase, peach
  hover, `rounded-sm`). Second pass (2026-06-21): the trigger itself was also
  wrong — solid orange `w-24` square with a lucide `Menu` icon — replaced with
  the real "3 lines" trigger (`h-10 w-10`, transparent/`hover:bg-gray-100`,
  animated horizontal↔vertical orange bars), matching `PanelGrid` exactly.
  Same trigger fix applied to QC's local `ActionMenu` copies
  (`QualityCreditsTab`, `QCHistoryTab`) and Items' `Tab1.tsx` `RightCard`.
- `awbs` (AWBs — Air Waybill Costs) — done (2026-06-21): page background,
  standalone filter toolbar, the `Btn` helper (`h-7`/14px/font-semibold
  regardless of color), the main AWB grid panel + all 5 detail tabs (Vendors,
  Charges, Boxes, Charges by Date, Varieties) — dark→white panel titles, light
  →dark `#4F4F4F` table headers, `#DBD9D9` borders, peach row selection. The
  `Modal` wrapper and its two internal tables (`AwbsInvoiceChargesModal`,
  `ReportModal`) were left dark, per the modal-headers gap above.
- `sales` (POS) — done (2026-06-21): top-level tab bar (Invoice/Available
  Stock/Invoice History) moved onto the gray container token, plus the
  Invoices-list header, Invoice action bar, Invoice Lines action bar, the
  Stock-tab's active-invoice info strip, Available Stock panel header, and the
  History tab's desktop filter bar — all converted dark→white/gray, with the
  `ActionBtn` "bar"/"bar-danger" variants recolored for light backgrounds
  (`bg-gray-100`/`bg-red-50` instead of `bg-white/10`/`bg-red-500/70`). One
  stray blue row-selection (Invoice History desktop list) fixed to peach.
  Second pass (2026-06-21): every desktop panel wrapper in the Invoice/Stock
  tabs was using `border border-black` instead of the `#DBD9D9` token (5
  instances — Invoices list, "no invoice" placeholder, Invoice header card,
  Invoice Lines panel, Available Stock panel) — fixed. `ActionBtn`'s default
  size (used by Open/Print/Pick List/Payment etc.) bumped from
  `px-2.5 py-1 text-[10px] font-black` to the `h-7`/14px/font-semibold button
  standard. "My Invoices"/"All" toggle and "+ New Invoice" bumped the same way,
  and their wrapping containers moved onto `bg-[#F5F3F3] border-[#DBD9D9]`.
  **Still pending:** the mobile-only cards/filter bars (left on the existing
  compact convention) and the modals (New Invoice/CC, Barcode Scan, Edit Line,
  Image Gallery) — all dark headers, out of scope per the gap above.
- `accounts-payable` — detail tab bar (Terms/PO/Prebooks/Credits & Debits)
  moved onto the gray container token, matching POS — done (2026-06-21).
- `vendors` — the desktop Statement/Pending Invoices/Classes/Web buttons in
  `PanelGrid`'s `headerRight` were `h-6 text-[10px] font-black` on solid gray;
  bumped to the secondary-action-button pattern (`h-7`, `bg-white border
  border-[#DBD9D9] text-[#4F4F4F]`, 14px semibold) — done (2026-06-21).
- `masters/items` — fully done (2026-06-21): the page shell (background, tab
  bar onto the gray-container token), `Tab1` (Hierarchy: tree panel + the 3
  `RightCard` panels for Grades/Colors/Cases — dark→white titles, light→dark
  `#4F4F4F` table headers, peach selection, borders; `RightCard`'s own
  hamburger dropdown was `position: absolute` inside the scrollable panel —
  same clipping bug as the old `GridMenu` — fixed with the same portal
  pattern), `Tab2` (All Products: toolbar `Btn` helper bumped to `h-7`/14px,
  product grid thead/borders/selection migrated), and `Tab3` (Varieties/
  Components: toolbar, both panel headers, and the shared `MiniGrid` table).
  Modals across all three tabs were left dark, per the gap below.
  `DualListModal`/quota/PO-prices/stock/prebook/product/image modals are
  numerous in this module — none were touched.
- `inventory-entry` — fully done (2026-06-22), the biggest single-page
  migration so far (1800+ lines, 5 tabs): page shell `#f4f6f8` → `#FBF9F8`,
  top tab bar dark `#374151` → gray-container `#F5F3F3` standard (white
  active chip). Every panel header across all 5 tabs (Date Picker, AWB List,
  Vendors, Boxes Detail, Products List, PL Control, AWB Search, PO List ×2
  table views) went from dark `#374151` titles to white `h-10` headers with
  a leading `#FB7506` icon and `#4F4F4F` title text; every `<thead>` went
  from light `bg-gray-100` to the dark `#4F4F4F`/white standard with full
  horizontal+vertical grid lines; every row selection went from
  `bg-blue-100 ring-2 ring-blue-300` to `!bg-[#FB7506]/10` (no ring); every
  `odd:bg-white even:bg-gray-50` striping was dropped in favor of plain
  `divide-y`/`hover:bg-gray-50`, matching how every other migrated grid in
  the app behaves (this page was the last one still striping rows).
  **Vendors (16 buttons) and Boxes Detail (10 buttons) toolbars** were
  crammed directly into their dark header bars — converted to the
  `GridMenu` dropdown pattern instead (the file already had a dead, unused
  `import { GridMenu }` left over from an earlier incomplete pass at this —
  a sign worth noticing next time an import looks unused on a page that's
  otherwise mid-migration). Grouped related actions with `separator: true`
  and colored by category (orange for the primary/most-used action, blue
  for warehouse-movement actions, purple for filter/setup, gray for
  stubbed/"coming soon" report buttons, red reserved for the one real
  delete action) — mirrors exactly how `awbs/page.tsx` already used
  `GridMenu` for its own AWB/Vendor-Invoice toolbars, which was the
  reference for this conversion. Smaller per-tab toolbars (Products List,
  PL Control, AWB Search, PO List — 2-4 buttons each) stayed inline in the
  white header instead, restyled to the `h-7`/`text-[14px]`/`font-semibold`
  button scale.
  The one red button on the page ("Close" packing, PL Control tab) became
  the tinted-orange danger style, matching Prebook to Invoice's "Void
  Line" precedent — red is for status badges/data flags only, never
  buttons. Data-semantic colors that aren't button chrome (delayed-row red
  tint, WH/CHECK status text, Confirm/Diff/Ship column colors) were left
  alone since they're conveying row/cell state, not UI affordance.
  **Out of scope, left dark per the modal-header exception**: the 3 inline
  modals (Packing, Box Entry, Change AWB) and all 13 standalone
  `components/inventory-entry/Modal*.tsx` files — none of their internals
  were touched this round.
- `login` — (2026-06-22) the photo background had a `linear-gradient(to left, ...)`
  veil stacked on top of the global dark veil, darkening only the right side
  where the glass login card sits; removed so the photo reads the same
  brightness everywhere (it changed to one that no longer needed the extra
  darkening to keep the card legible). The custom top header's title text
  was bumped from `text-xs md:text-sm` to the new Screen-titles scale
  (`text-xl md:text-2xl`, 20–24px Bold) and it now has the same orange
  circular `Power`-icon button as `AppHeader`'s logout button, next to
  "System Online" — purely visual parity here since there's no session to
  sign out of pre-login, so it has no `onClick`. Note this page hand-rolls
  its own `<header>`/`<footer>` instead of using `AppHeader.tsx` — keep
  both in sync if the shared header's title scale or button changes.
- `standing-orders` — (2026-06-22) the Orders List grid itself was already
  on-standard (it's `PanelGrid`/`PanelGridTable`-based, per the Rollout note
  above), but the detail panel (`OrderDetailModal.tsx`, the hand-rolled
  component that renders to its right) was not: dark `#374151` header +
  orange action bar, blue ring row selection, `odd`/`even` striping, light
  `<thead>`. Fully migrated to the standard — white `h-10` header, gray
  `#F5F3F3` action bar (red `Delete`/`SO to Farm` recolored: `SO to Farm` is
  now the solid-orange primary action, `Delete` is the tinted-orange danger
  style), dark `#4F4F4F` `<thead>`s with full grid lines, peach selection.
  The "S.O. Details" sub-panel's 6 buttons were folded into the page-icon +
  `GridMenu` pattern (`Add Line` stays visible as the primary green action
  outside the menu, the other 5 — Edit Line/Box Comp./Products/Future
  Stock/Del. Line — moved into the dropdown), matching how AWBS and
  `inventory-entry` already handle a sub-panel with several actions.
  Also consolidated two separate info cards (Customer Info + Order Fields)
  into one denser card and dropped two fields that were duplicating
  information shown elsewhere on screen: "Order No." (already in the panel
  header as "Order #NNN") and "Day" (already conveyed, with more precision,
  by the Week Day chip row below it — a single order can recur on more than
  one day, so the chip row was always the more complete source of truth).
  The Week Day row itself moved off a `bg-green-800` strip with white
  checkbox squares onto the standard gray-container token with `#FB7506`
  filled chips for active days, matching the orange-chip pattern used
  elsewhere instead of an unrelated one-off green.
