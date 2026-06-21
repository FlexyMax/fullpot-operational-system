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

- **Panel header bar:** `h-10 bg-white flex items-center justify-between pl-3 border-b border-[#DBD9D9] rounded-t-lg`, icon in `#FB7506`, title per the type scale above. A sidebar/list panel (like "Users") may use `bg-[#F5F3F3]` instead of white for its title bar — keep the rest of the page's panels white.
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
- `qc` (Quality Control) — `StockListTab` done (2026-06-21): filter bar, panel
  titles (were dark `#374151`, now white per the panel-title rule), the actual
  data-table headers (were light, now dark `#4F4F4F` — this page had the two
  reversed), borders, peach row selection. **Still pending:** `DashboardTab`,
  `TransitBoxesTab`, `CancelledPurchasesTab`, `QualityCreditsTab`,
  `QCHistoryTab`, and the `QCModal`/`BoxTransferModal` modals — none of those
  have been touched yet.
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
  **Still pending:** the mobile-only cards/filter bars (left on the existing
  compact convention) and the modals (New Invoice/CC, Barcode Scan, Edit Line,
  Image Gallery) — all dark headers, out of scope per the gap above.
- `accounts-payable` — detail tab bar (Terms/PO/Prebooks/Credits & Debits)
  moved onto the gray container token, matching POS — done (2026-06-21).
