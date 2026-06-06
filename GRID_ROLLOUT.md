# Grid Rollout Plan — FlexyMax Operational System

## Objetivo
Reemplazar todos los headers/tabla de paneles internos por los componentes unificados `PanelGrid` + `PanelGridTable` con el estilo aprobado en el prototipo de `/standing-orders`.

---

## Estilo aprobado (NO cambiar)

### PanelGrid header
- **Fondo**: `#4F4F4F` (FlexyMax gris oscuro)
- **Altura**: `h-10`
- **Icono**: Naranja `#FB7506`, size 16
- **Título**: Blanco, `text-[13px] font-bold uppercase tracking-[0.1em]`
- **Contador**: junto al título → `Title (N)`
- **Search**: solo si no hay barra de filtros superior. Input blanco translúcido, se expande en focus.
- **Iconos derecha**:
  - Log (`History`): solo figura, blanco → naranja hover, tooltip
  - Refresh (`RefreshCcw`): solo figura, blanco → naranja hover + `rotate-180 duration-500`, tooltip
- **Menú hamburguesa** (`Menu`):
  - Fondo naranja `#FB7506`, icono blanco
  - Al abrir rota 90° (horizontal → vertical)
  - Si solo hay **1 item real**, NO usar menú; renderizar botón directo con color e icono
  - Items del menú: sin flechas (`ChevronRight`), hover naranja visible `bg-[#FB7506]/10`
  - Colores de items:
    - **Verde `#009B4D`**: acciones seguras (add, save, edit, approve)
    - **Naranja `#FB7506`**: acciones destructivas/importantes (void, delete, change date)
    - **Gris**: acciones neutras (refresh, search, reports, print)
- **`headerRight`**: slot para widgets extra (ej. `AuditLogModal bareButton`)

### Record count bar
- `bg-white border-b p-1 text-right text-[10px] text-gray-400 font-bold italic pr-4`
- Texto: `N Records`

### Tabla (PanelGridTable)
- Bordes sutiles: `border-black/5`
- Header: `bg-white`, texto `gray-500`, `font-black uppercase text-[10px]`, sticky top, `border-b-2 border-gray-200`
- Filas: `h-8`, hover `bg-blue-50/50`, zebra `even:bg-black/[0.02]`
- Fila seleccionada: `!bg-blue-100 ring-2 ring-inset ring-blue-300`
- Celdas: `text-[11px] text-gray-700`
- Colores de datos:
  - Números/totales: `text-blue-700` o `text-[#FB7506]` (según tipo)
  - Balance/positivo: `text-green-600`
  - Créditos/débitos/negativo: `text-red-500`
  - Fechas/texto secundario: `text-gray-500`

---

## Componentes a usar

```tsx
import PanelGrid from "@/components/ui/PanelGrid";
import {
  PanelGridTable, PanelGridThead, PanelGridTh,
  PanelGridTbody, PanelGridTr, PanelGridTd,
} from "@/components/ui/PanelGridTable";
```

### Props clave de PanelGrid
| Prop | Uso |
|---|---|
| `title` | Título del panel |
| `icon` | Icono Lucide (naranja automático) |
| `recordCount` | Muestra `(N)` en título + barra records |
| `onSearchChange` / `searchValue` | Solo si NO hay barra de filtros arriba |
| `onRefresh` / `refreshing` | Icono refresh animado |
| `menuItems` | Array de `PanelMenuItem`. Si 1 item → botón directo. Si 0 → nada. |
| `headerRight` | Nodo React extra (ej. `<AuditLogModal bareButton ... />`) |
| `className` | Layout externo (width, flex, etc.) |

### Props de tabla
```tsx
<PanelGridTable>
  <PanelGridThead>
    <PanelGridTh align="left|right|center">Label</PanelGridTh>
  </PanelGridThead>
  <PanelGridTbody>
    <PanelGridTr selected={isSelected} onClick={...}>
      <PanelGridTd align="left|right|center" className="...">Value</PanelGridTd>
    </PanelGridTr>
  </PanelGridTbody>
</PanelGridTable>
```

---

## Lista de páginas a migrar

### Fase 1 — Listas simples (1 tabla, fácil)
- [x] `masters/customers` — Customer list + 5 sub-grids (Ship-to, Carriers, Statement, Web Users, Messages) ✅
- [ ] `masters/items` — Items list (tabs en componentes separados Tab1/Tab2/Tab3 — muchos grids)
- [x] `sales-reps` — Sales Reps list (grid principal migrado a PanelGrid) ✅
- [ ] `vendors` — Vendors list (dual panel, múltiples grids)
- [ ] `system/users` — Users list
- [ ] `system/companies` — Companies list
- [ ] `system/modules` — Modules list
- [ ] `system/access` — Access list

### Fase 2 — Paneles con tabs/detail (dual panel)
- [ ] `accounts-payable` — Dates panel + Invoices panel + Tabs
- [ ] `pbook2invoice` — Dates + Customers + Bottom tabs
- [ ] `payment-authorizations` — Vendors + Invoices + Payments tabs
- [ ] `sales/customer-payments` — Customer tabs + grids
- [ ] `inventory-entry` — AWB Packings + tabs múltiples
- [ ] `masters/freights` — Freight list + detail
- [ ] `masters/carriers` — Carrier list

### Fase 3 — Especializadas / Complejas
- [ ] `sales` (POS) — Grids de Sales by Customer + Orders (ya tienen el estilo POS interno, evaluar si aplica)
- [ ] `scan` — Múltiples tabs con tablas (pending, transit, scanned, sys-not, etc.)
- [ ] `qc` — Tabs: Stock List, Transit, Cancellations, Credits, History
- [ ] `awbs` — AWB list + tabs
- [ ] `flexy2qb` — Tablas de sync
- [ ] `standing-orders` — ✅ **YA HECHO** (prototipo aprobado)

---

## Reglas por tipo de página

### Si la página YA tiene barra superior de filtros/search
- **NO** poner `searchValue` / `onSearchChange` en `PanelGrid`
- **NO** poner botón "Add" en el menú del grid si ya existe arriba
- Solo: título, contador, refresh, log, y menú con acciones específicas del grid

### Si la página NO tiene barra superior
- Sí incluir `searchValue` / `onSearchChange` en `PanelGrid`
- Menú puede incluir "Add" si es la única forma de crear registros

### AuditLogModal
- Usar `<AuditLogModal recordId={selectedId} disabled={!selectedId} bareButton />` dentro de `headerRight`
- Solo en páginas que ya tienen audit log configurado

### AppFooter
- Verificar que cada página tenga `<AppFooter areaLabel="..." />` al final del layout
- Si falta, agregarlo al mismo tiempo que el grid

---

## Ejemplo mínimo de conversión

### Antes
```tsx
<div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    <div className="h-10 bg-[#374151] flex items-center ...">
        <Building2 size={16} className="text-[#FB7506]" />
        <span className="font-black text-[10px] ...">Vendors</span>
        {loading && <RefreshCcw size={12} className="animate-spin" />}
    </div>
    <div className="flex-1 overflow-auto">
        <table className="min-w-full text-left">
            <thead className="bg-gray-100 border-b ...">...</thead>
            <tbody>...</tbody>
        </table>
    </div>
</div>
```

### Después
```tsx
<PanelGrid
    title="Vendors"
    icon={Building2}
    recordCount={rows.length}
    onRefresh={refetch}
    refreshing={loading}
    menuItems={[...]}
>
    <PanelGridTable>
        <PanelGridThead>
            <PanelGridTh>Name</PanelGridTh>
            <PanelGridTh align="right">Code</PanelGridTh>
        </PanelGridThead>
        <PanelGridTbody>
            {rows.map(r => (
                <PanelGridTr key={r.id} selected={sel === r.id} onClick={() => setSel(r.id)}>
                    <PanelGridTd>{r.name}</PanelGridTd>
                    <PanelGridTd align="right">{r.code}</PanelGridTd>
                </PanelGridTr>
            ))}
        </PanelGridTbody>
    </PanelGridTable>
</PanelGrid>
```

---

## Notas técnicas

- **No modificar** la lógica de fetching, mutations, modales, ni permisos. Solo el layout del grid.
- Si una tabla usa `<div>` con CSS grid en vez de `<table>`, convertir a `<PanelGridTable>`.
- Preservar todas las clases responsive (`hidden sm:table-cell`, etc.) en los `<PanelGridTh>` / `<PanelGridTd>`.
- Si hay loaders inline dentro de la tabla (ej. `<Loader2>` en una celda), mantenerlos.
