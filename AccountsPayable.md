# Tarea: Implementar página Accounts Payable

Agrega una nueva página **Accounts Payable** al proyecto React existente. Esta pantalla fue migrada desde Visual FoxPro 8 y ya tiene sus Stored Procedures en SQL Server. Solo necesitas crear el frontend React y los endpoints Node.js.

---

## 1. ESTRUCTURA DE ARCHIVOS A CREAR

```
src/
  pages/
    AccountsPayable/
      index.jsx                        ← página principal
      components/
        DatePickerPanel.jsx            ← panel izquierdo con fechas
        InvoiceList.jsx                ← grilla de facturas
        InvoiceDetailTabs.jsx          ← tabs Terms / PO / Prebooks / Credits & Debits
        modals/
          CreditDebitModal.jsx         ← modal para agregar/editar/eliminar Cr/Db
          POModal.jsx                  ← modal para gestionar POs de la factura

api/routes/
  accountsPayable.js                   ← todos los endpoints de esta pantalla
```

Agrega la ruta en el router principal existente:
```jsx
<Route path="/accounts-payable" element={<AccountsPayable />} />
```

---

## 2. LAYOUT DE LA PANTALLA PRINCIPAL

```
┌─────────────────────────────────────────────────────────────────┐
│  [Year ComboBox]   [Search]  [Refresh]  [Export XLS]  [Delete]  │
├──────────────┬──────────────────────────────────────────────────┤
│              │  INVOICES LIST (grilla)                          │
│  DATE PICKER │  Vendor | Invoice | Estimated | Amount |         │
│  (grilla)    │  Credits | Debits | Balance | Control | APDate   │
│  Date        │──────────────────────────────────────────────────│
│  Invoices    │  DETAIL TABS                                     │
│  Estimated   │  [Terms] [PO] [Prebooks] [Credits and Debits]   │
│  Amount      │                                                  │
│              │  (grilla según tab activo)                       │
└──────────────┴──────────────────────────────────────────────────┘
```

**Comportamiento en cascada (crítico):**
1. Al cambiar el **año** → recarga `vr_dates` (panel izquierdo)
2. Al seleccionar una **fecha** → recarga `vr_invoices` (grilla de facturas)
3. Al seleccionar una **factura** → recarga los 4 tabs simultáneamente:
   - Terms (`vr_accounts_pay_details`)
   - PO (`vr_pobs`)
   - Prebooks (`vr_prebooks`)
   - Credits & Debits (`vr_credits`)

**Estado global del form (variables de VFP → React state):**
```js
const [selectedYear, setSelectedYear]       = useState(new Date().getFullYear())
const [selectedDate, setSelectedDate]       = useState(null)   // lddate
const [selectedUnico, setSelectedUnico]     = useState(null)   // lcunico (PK de factura)
const [selectedGrowerUq, setSelectedGrowerUq] = useState(null) // lcgrower_uq
const [selectedCrdbUq, setSelectedCrdbUq]  = useState(null)   // lccrdb_uq
```

---

## 3. ENDPOINTS NODE.JS

Rutas implementadas en `src/app/api/accounts-payable/`. Parámetros verificados
contra SQL Server con `check_sp_params.js` el 2026-05-13.

```
SP                                    PARÁMETROS REALES (verificados)
─────────────────────────────────────────────────────────────────────
sp_flower_accounts_pay_years          (sin parámetros)
sp_flower_accounts_pay_years_dates    @lnyear          int
sp_flower_accounts_pay_years_dates_list @ldap_Date     datetime
sp_flower_accounts_pay_up             @lcinvoice_uq    varchar(8)
sp_flower_accounts_pay_details        @lcinvoice_uq    varchar(8)
sp_flower_accounts_pay_pobs           @lcap_uq         varchar(8)
sp_flower_prebook_cost                @lcpbook_uq      varchar(8)
                                      @lcaccount_uq    varchar(8)
sp_flower_accounts_pay_credits_debits @lcapayable_uq   varchar(8)
sp_flower_growers_list                @llall           bit
sp_flower_growers_terms               @lcgrower_uq     char
sp_flower_accounts_pay_type_list      (sin parámetros)
sp_flower_terms                       (sin parámetros)
sp_flower_crdb_reasons_list           (sin parámetros)
sp_flower_accounts_pay_insert         @ldap_date         datetime
                                      @lcsupplier_uq     varchar(8)
                                      @lcinvoice_no      varchar(20)
                                      @lcterms_uq        varchar(8)
                                      @lnestimated       numeric(10,2)
                                      @lntaxes           numeric(10,2)
                                      @lnamount          numeric(10,2)
                                      @lnporder_no       int
                                      @lcdescription     varchar(250)
                                      @llautomatic       bit
                                      @llindirect        bit
                                      @llautomatic_cost  bit
sp_flower_accounts_pay_update         @lcunico           varchar(8)  ← PK
                                      (same fields as insert)
sp_flower_accounts_pay_delete         @lcunico           varchar(8)
sp_flower_accounts_pay_total_pobs     @lcap_uq         varchar(8)
sp_flower_accounts_pay_pob_insert     @lcap_uq         varchar(8)
                                      @lcpob_uq        varchar(8)
                                      @lncost          numeric(10,2)
                                      @lcaptype_uq     varchar(8)
sp_flower_accounts_pay_pob_update     @lcunico         varchar(8)
                                      @lcpob_uq        varchar(8)
                                      @lncost          numeric(10,2)
                                      @lcaptype_uq     varchar(8)
sp_flower_accounts_pay_pob_delete     @lcunico         varchar(8)
sp_flower_accounts_pay_approve_cost   @lcunico         varchar(8)
                                      @llapproved      bit
sp_flower_pob_search_no               @lnporder_no     int
```

```js
// Años disponibles
GET /api/accounts-payable/years
→ EXEC sp_flower_accounts_pay_years

// Fechas del año seleccionado
GET /api/accounts-payable/dates?year=2026
→ EXEC sp_flower_accounts_pay_years_dates @lnyear=2026

// Facturas de una fecha (NOTA: parámetro es @ldap_Date, no @lddate)
GET /api/accounts-payable/invoices?date=2026-05-13
→ EXEC sp_flower_accounts_pay_years_dates_list @ldap_Date='2026-05-13'

// Factura activa (header)
GET /api/accounts-payable/invoice?unico=XXXXXXXX
→ EXEC sp_flower_accounts_pay_up @lcinvoice_uq='XXXXXXXX'

// Tab Terms: tramos de pago
GET /api/accounts-payable/details?unico=XXXXXXXX
→ EXEC sp_flower_accounts_pay_details @lcinvoice_uq='XXXXXXXX'

// Tab PO: purchase orders
GET /api/accounts-payable/pobs?unico=XXXXXXXX
→ EXEC sp_flower_accounts_pay_pobs @lcap_uq='XXXXXXXX'

// Tab Prebooks (NOTA: parámetros distintos al doc original de VFP)
GET /api/accounts-payable/prebooks?unico=XXXXXXXX
→ EXEC sp_flower_prebook_cost @lcpbook_uq='%', @lcaccount_uq='XXXXXXXX'

// Tab Credits & Debits
GET /api/accounts-payable/credits?unico=XXXXXXXX
→ EXEC sp_flower_accounts_pay_credits_debits @lcapayable_uq='XXXXXXXX'

// Combos / Lookups
GET /api/accounts-payable/growers
→ EXEC sp_flower_growers_list @llall=1

GET /api/accounts-payable/grower-terms?grower_uq=XXXXXXXX
→ EXEC sp_flower_growers_terms @lcgrower_uq='XXXXXXXX'

GET /api/accounts-payable/ap-types
→ EXEC sp_flower_accounts_pay_type_list

GET /api/accounts-payable/terms
→ EXEC sp_flower_terms

GET /api/accounts-payable/reasons
→ EXEC sp_flower_crdb_reasons_list

// --- MODAL POB ---
GET  /api/accounts-payable/pob?ap_uq=XXXXXXXX
→ EXEC sp_flower_accounts_pay_total_pobs @lcap_uq='XXXXXXXX'

POST /api/accounts-payable/pob
→ EXEC sp_flower_accounts_pay_pob_insert @lcap_uq, @lcpob_uq, @lncost, @lcaptype_uq

PUT  /api/accounts-payable/pob
→ EXEC sp_flower_accounts_pay_pob_update @lcunico, @lcpob_uq, @lncost, @lcaptype_uq

DELETE /api/accounts-payable/pob?unico=XXXXXXXX
→ EXEC sp_flower_accounts_pay_pob_delete @lcunico

POST /api/accounts-payable/pob/approve
→ EXEC sp_flower_accounts_pay_approve_cost @lcunico, @llapproved=1

GET  /api/accounts-payable/pob/search?po_no=12345
→ EXEC sp_flower_pob_search_no @lnporder_no=12345  (int, no varchar)

// --- MODAL CREDIT/DEBIT ---
POST /api/accounts-payable/crdb
PUT  /api/accounts-payable/crdb
DELETE /api/accounts-payable/crdb?unico=XXXXXXXX
→ INSERT/UPDATE/DELETE directo en flower_accounts_pay_crdb
```

---

## 4. COLUMNAS DE CADA GRILLA

### DatePickerPanel (panel izquierdo)
| Campo | Caption |
|-------|---------|
| `ap_date` | Date |
| `records` | Invoices |
| `total_estimated` | Estimated |
| `total_amount` | Amount |

### InvoiceList (grilla principal)
| Campo | Caption |
|-------|---------|
| `grower` | Vendor |
| `invoice_no` | Invoice |
| `estimated` | Estimated |
| `amount` | Amount |
| `credits` | Credits |
| `debits` | Debits |
| `total_balance` | Balance |
| `control_date` | Control |
| `ap_date` | AP Date |
| `phone_1` | Phone |
| `fax_1` | Fax |

### Tab Terms
| Campo | Caption |
|-------|---------|
| `date_due` | Date |
| `days` | Days |
| `percen` | % |
| `ammount` | Amount |
| `out_ammount` | Payments |
| `cre_ammount` | Credits |
| `deb_ammount` | Debits |
| `balance` | Balance |

### Tab PO
| Campo | Caption |
|-------|---------|
| `ap_type` | Acc. Type |
| `ap_date` | AP Date |
| `ammount` | Amount |
| `porder_no` | PO |
| `po_date` | PO Date |
| `cost` | Cost |

### Tab Prebooks
| Campo | Caption |
|-------|---------|
| `grower` | Vendor |
| `ap_type` | Type |
| `invoice_date` | Invoice Date |
| `invoice_no` | Invoice |
| `amount` | Amount |
| `notes` | Notes |
| `customer` | Customer |
| `pbook_no` | PB No |
| `cporder_no` | Cust PO |
| `pb_date` | Delivery Date |

### Tab Credits and Debits
| Campo | Caption |
|-------|---------|
| `type` | Type |
| `cd_date` | Date |
| `reason` | Reason |
| `cd_amount` | Amount |
| `retention_no` | Internal Doc. |
| `cd_no` | Automatic No |
| `cd_details` | Comments |

---

## 5. MODAL: Credit / Debit (`CreditDebitModal`)

**Abre cuando:** usuario hace click en botón Add/Edit/Delete en tab "Credits and Debits"

**Parámetros que recibe:** `(operacion: 'Add'|'Edit'|'Delete', type: 'C'|'D')`

**Campos del formulario:**
| Campo | Control | Notas |
|-------|---------|-------|
| Grower (readonly) | TextBox | `vr_invoices.grower` — solo lectura |
| Invoice No. (readonly) | TextBox | `vr_invoices.invoice_no` — solo lectura |
| No. (readonly) | TextBox | `vr_cr_up.identity_column` — solo lectura |
| Type | ComboBox | Opciones: `C` (Credit), `D` (Debit) — deshabilitado en Edit |
| Credit/Debit Date | DatePicker | No puede ser fecha futura si tarea='Add' |
| Reason | ComboBox | Source: `vr_reasons` (reason, unico) → guarda `reason_uq` |
| Cr/Db Amount | NumberInput | Mínimo 0; requerido |
| Doc. Number | TextInput | `retention_no` — opcional (pregunta si vacío) |
| Details | TextArea | `vr_cr_up.details` |

**Validaciones:**
- Type requerido
- Reason requerido
- Si `tarea='Add'`: fecha no puede ser futura
- Amount requerido y ≥ 0
- Si Doc. Number vacío: confirmar antes de guardar

**Botones:** OK (guarda) / Cancel

---

## 6. MODAL: PO by Account (`POModal`)

**Abre cuando:** usuario hace click en botón "Update" en tab PO

**Parámetros que recibe:** `(operacion: 'Modificar', ap_uq: string)`

**Header del modal (readonly, datos de la factura):**
| Campo | Fuente |
|-------|--------|
| Vendor | `vr_ap.vendor` |
| Invoice No. | `vr_ap.invoice_no` |
| Amount | `vr_ap.ammount` |
| Total PO | `vr_ap.total_cost` |
| Balance | `vr_ap.balance` |

**Grilla de POs existentes:**
| Campo | Caption |
|-------|---------|
| `ap_type` | Acc. Type |
| `ap_date` | AP Date |
| `ammount` | Amount |
| `porder_no` | PO |
| `po_date` | PO Date |
| `cost` | Cost |

**Formulario de edición (debajo de la grilla):**
| Campo | Control | Notas |
|-------|---------|-------|
| PO No. | NumberInput | Busca con `sp_flower_pob_search_no` al perder foco |
| Cost | NumberInput | Requerido |
| Account Type | ComboBox | Source: `vr_ap_types` (ap_type, unico) → guarda `ap_type_uq` |

**Botones de acción:**
- **Add** → toggle a modo "Agregar" (nuevo registro en grilla)
- **Revert** → cancela el agregar, vuelve a modo navegación
- **Modify** → toggle a modo "Editar" el registro seleccionado → cambia a "Save"
- **Save** → llama SP insert o update según modo
- **Delete** → elimina el PO seleccionado con confirmación
- **Approve** → llama `sp_flower_accounts_pay_approve_cost` — solo visible en modo navegación; muestra badge "APPROVED" en verde si ya está aprobado

**Lógica del PO No.:**
Al ingresar un número de PO y salir del campo, llama `sp_flower_pob_search_no` para validar que existe. Si no existe, muestra "PO not found" y resetea a 0.

---

## 7. PERMISOS

Usa el objeto de permisos del usuario que ya existe en el proyecto (`c_user_access` o el equivalente que ya manejes). Bloquea el botón de crear/editar si el usuario no tiene permiso `crear`. Muestra el mensaje:
> "You are not authorized to create new records in this screen."

---

## 8. NOTAS DE IMPLEMENTACIÓN

- Usa el mismo patrón de llamadas a la API que ya existe en el proyecto (axios/fetch, manejo de errores, loading states).
- Las grillas deben tener selección de fila (click) que dispare los efectos en cascada descritos arriba.
- El campo `unico` es la PK universal (string de 8 chars) en todas las tablas.
- Facturas con `automatic = true` no se pueden editar en la tab Prebooks (muestra mensaje: "Automatic invoice, you can't update.").
- Si la factura tiene `approved = true`, mostrar badge/label "APPROVED" en verde en el modal POB.
- Todos los números monetarios: 2 decimales, alineados a la derecha.
- Fechas: formato `MM/DD/YYYY` consistente con el resto del proyecto.