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

---

## Typography scale

| Use | Weight | Size | Case |
|---|---|---|---|
| Panel/section titles (e.g. "USER INFORMATION", "SCREEN PERMISSIONS") | Bold (700) | 14px | Uppercase |
| Data labels (e.g. "CODE", "USERNAME", "LEVEL") and table header row (Access/Create/Screen/...) | Bold (700) | 12px | Uppercase |
| Table content and sidebar list names (e.g. "CUSTOMER PAYMENTS", a user's name in a list) | Regular (400) | 13px | As-is |
| Buttons (Edit, Save, Cancel, Copy From/To, nav actions) | Semibold (600) | 14px | Uppercase |

Implement with explicit Tailwind arbitrary values (`text-[14px] font-bold`, etc.) rather than the legacy `fos-grid-header-text` utility — that utility hardcodes white text for dark header bars and doesn't fit the new light-header panels.

**Button height — use `h-7` (28px fixed), not `py-*` padding.** `py-2`/`py-1.5` at 14px renders taller than 28px and looks oversized next to the reference (`PanelGrid`'s single-action button, e.g. "Print", which is `px-3 h-7`). Every button on the 14px scale should be `h-7` with horizontal padding only (`px-2.5`/`px-3`), not vertical padding.

---

## Component patterns

- **Panel header bar:** `h-10 bg-white flex items-center justify-between pl-3 border-b border-[#DBD9D9] rounded-t-lg`, icon in `#FB7506`, title per the type scale above. A sidebar/list panel (like "Users") may use `bg-[#F5F3F3]` instead of white for its title bar — keep the rest of the page's panels white. **The leading icon is not optional** — every panel/section title across the app has one (`<Icon size={14-16} className="text-[#FB7506] shrink-0"/>` immediately before the `<span>`). QC's tabs shipped several titles with no icon at all ("QC Stock Search", "Quality Credits by Lot", "Boxes in Transit Delivery Date", "Packing List Boxes", the `ScanPanel`/`SubGridHeader` titles in `StockListTab`) — all fixed (2026-06-21), but check for this specifically whenever migrating a hand-rolled panel: a title with no icon is a miss, not a valid variant.
- **Primary action button** (e.g. "Edit"): solid `bg-[#FB7506] hover:bg-orange-500`, white text, `rounded-md`, `h-7`, per the button type scale.
- **Save button:** `bg-green-600 hover:bg-green-700`, white text.
- **Cancel button:** `bg-gray-500 hover:bg-gray-600`, white text.
- **Secondary action button** (e.g. "Copy From/To"): `bg-white border border-[#DBD9D9] text-[#4F4F4F] hover:bg-gray-50` — never solid gray.
- **Selected list row:** `bg-[#FB7506]/10`, no ring/border needed.
- **Active/granted table row:** `bg-[#22C55E]/5 hover:bg-[#22C55E]/10`, with the row's text columns colored `text-[#22C55E]`. Rows without the granted state use `opacity-40` and default gray text — no special background.
- **Filter/search container:** the wrapping `<div>` gets `bg-[#F5F3F3]`; the `<input>`/`<select>` inside stays white (`bg-white` or rely on `.fos-input`'s built-in white default).
- **Standalone filter/search toolbar above a `PanelGrid`** (a page-level bar that isn't inside `PanelGrid`'s own header — e.g. Customer Payments' search+Bal filters row, System Users' search box): `bg-[#F5F3F3] border border-[#DBD9D9] rounded-lg`, with the same horizontal margin as the `PanelGrid` below it (`mx-2`) and a small top margin (`mt-2`) so it doesn't sit flush against `AppHeader` or whatever's above it. Don't leave it full-bleed with just a `border-b` divider — it should read as its own rounded card, same as the reference page's "Filter Bar".
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
