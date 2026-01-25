# Field-to-Invoice Backend Implementation

## Overview

This document describes the complete backend implementation for the field-to-invoice workflow, similar to Renalto, with native invoicing and automatic project management.

## Architecture

### Data Flow

```
Wizard (UI) → Draft Sessions → Quote → Approval → Invoice → Project → Tasks
                ↓              ↓           ↓           ↓          ↓
              Measurements    Quote Lines  Invoice Lines  Phases
                ↓
              Media Assets
```

### Key Components

1. **Draft Session System** - Server-side wizard state persistence
2. **Supabase Storage** - Media upload with signed URLs
3. **PriceBook Import Pipeline** - CSV/XLSX import with normalization
4. **Quote Approval Workflow** - With snapshot for audit trail
5. **Invoice Generation** - Per-tenant numbering
6. **Project Auto-Create** - With default tasks
7. **AI Service** - Tool-calling with guardrails
8. **Audit Logging** - Complete audit trail

## Database Schema

### Tables

#### draft_sessions
Wizard state persistence with autosave
- `id` - UUID primary key
- `user_id` - Reference to auth.users
- `tenant_id` - Multi-tenant support
- `current_step` - Current wizard step (1-6)
- `payload_json` - JSONB payload for each step
- `created_at`, `updated_at` - Timestamps

#### sites
Work locations (Werf/Locatie)
- `id` - UUID primary key
- `user_id`, `tenant_id` - Ownership
- `customer_id` - Reference to klanten
- `name`, `address`, `postal_code`, `city` - Location info
- `type` - Site type (roofing, solar, etc.)
- `urgency`, `preferred_date` - Scheduling
- `status` - planning/active/completed/cancelled
- `notes` - Additional notes

#### measurement_items
Templates for repeatable measurements
- `id` - UUID primary key
- `user_id`, `tenant_id` - Ownership
- `site_id` - Optional site reference
- `name`, `work_type`, `unit` - Item definition
- `template` - Is this a template?
- `options` - JSONB options
- `sort_order` - Display order

#### site_measurements
Actual measurements linked to site
- `id` - UUID primary key
- `user_id` - Ownership
- `site_id` - Reference to sites
- `measurement_item_id` - Reference to templates
- `value` - Measured value
- `notes` - Additional notes

#### media_assets
Photos and files
- `id` - UUID primary key
- `user_id`, `tenant_id` - Ownership
- `site_id`, `measurement_id` - References
- `storage_path` - Supabase Storage path
- `public_url` - Public URL
- `mime_type`, `file_size` - File info
- `labels` - TEXT[] labels (binnen, buiten, detail, schade, overzicht)
- `description` - Description

#### price_books
Price libraries with versioning
- `id` - UUID primary key
- `user_id`, `tenant_id` - Ownership
- `name` - Price book name
- `version` - Version number (unique per tenant)
- `is_active` - Active flag
- `currency` - Currency code

#### price_items
Individual price items
- `id` - UUID primary key
- `user_id`, `tenant_id` - Ownership
- `price_book_id` - Reference to price_books
- `sku` - Stock keeping unit (unique per book)
- `name`, `description`, `category` - Item info
- `unit` - Unit of measure
- `unit_price`, `vat_rate` - Pricing
- `active` - Active flag

#### price_modifiers
Price adjustments
- `id` - UUID primary key
- `user_id`, `tenant_id` - Ownership
- `price_item_id` - Reference to price_items
- `name` - Modifier name
- `rule_type` - add/percent/multiply
- `value` - Modifier value
- `effective_date` - When it applies

#### quote_lines
Quote line items
- `id` - UUID primary key
- `user_id` - Ownership
- `quote_id` - Reference to offertes
- `price_item_id` - Reference to price_items
- `sku`, `description` - Item info
- `quantity`, `unit`, `unit_price` - Quantity and pricing
- `vat_rate`, `total_price` - VAT and total
- `source` - manual/ai_suggested
- `confidence` - AI confidence (for ai_suggested)
- `reason` - Reason for suggestion
- `sort_order` - Display order

#### approvals
Quote approval with snapshot
- `id` - UUID primary key
- `user_id` - Ownership
- `quote_id` - Reference to offertes
- `approved_by` - Reference to auth.users
- `approved_at` - Approval timestamp
- `snapshot_hash` - SHA-256 hash of quote state
- `notes` - Approval notes

#### invoice_lines
Invoice line items
- `id` - UUID primary key
- `invoice_id` - Reference to facturen
- `description`, `quantity`, `unit_price` - Line details
- `vat_rate`, `total_price` - VAT and total
- `sort_order` - Display order

#### tasks
Project tasks
- `id` - UUID primary key
- `user_id` - Ownership
- `project_id` - Reference to projecten
- `name`, `description` - Task info
- `status` - todo/in_progress/completed/cancelled
- `sort_order` - Display order
- `estimated_hours`, `actual_hours` - Time tracking
- `assigned_to` - Reference to auth.users
- `due_date`, `completed_at` - Dates

#### audit_logs
Complete audit trail
- `id` - UUID primary key
- `user_id`, `tenant_id` - Ownership
- `actor_type` - user/ai
- `action` - approve_quote/create_invoice/etc.
- `entity_type`, `entity_id` - Entity reference
- `changes`, `metadata` - JSONB data
- `created_at` - Timestamp

## API Functions

### Draft Sessions

```typescript
createDraftSession(currentStep, payload) -> DraftSession
updateDraftSession(sessionId, currentStep, payload) -> DraftSession
getDraftSession(sessionId) -> DraftSession | null
getActiveDraftSessions() -> DraftSession[]
deleteDraftSession(sessionId) -> void
```

### Sites

```typescript
createSite(siteData) -> Site
getSites(customerId?) -> Site[]
getSite(siteId) -> Site | null
updateSite(siteId, siteData) -> Site
```

### Measurements

```typescript
createMeasurementItem(itemData) -> MeasurementItem
getMeasurementItems(workType?) -> MeasurementItem[]
createSiteMeasurements(measurements) -> SiteMeasurement[]
getSiteMeasurements(siteId) -> SiteMeasurement[]
```

### Media Assets

```typescript
getUploadUrl(fileName, contentType) -> { url, path }
uploadMedia(file, labels?) -> MediaAsset
getMediaAssets(siteId?) -> MediaAsset[]
updateMediaAsset(assetId, updates) -> MediaAsset
deleteMediaAsset(assetId) -> void
```

### Price Books

```typescript
createPriceBook(priceBookData) -> PriceBook
getPriceBooks() -> PriceBook[]
getActivePriceBook() -> PriceBook | null
createPriceItems(items) -> PriceItem[]
getPriceItems(priceBookId?) -> PriceItem[]
searchPriceItems(query, priceBookId?) -> PriceItem[]
updatePriceItem(itemId, updates) -> PriceItem
```

### Quotes

```typescript
createQuote(quoteData) -> Quote
getQuote(quoteId) -> Quote | null
getQuotes(customerId?) -> Quote[]
updateQuote(quoteId, updates) -> Quote
```

### Quote Lines

```typescript
createQuoteLines(lines) -> QuoteLine[]
getQuoteLines(quoteId) -> QuoteLine[]
updateQuoteLine(lineId, updates) -> QuoteLine
deleteQuoteLine(lineId) -> void
```

### Approvals

```typescript
approveQuote(quoteId, approvedBy, notes?) -> Approval
getApprovals(quoteId?) -> Approval[]
```

### Invoices

```typescript
createInvoiceFromQuote(quoteId, dueDays?) -> Invoice
getInvoice(invoiceId) -> Invoice | null
getInvoices(customerId?) -> Invoice[]
updateInvoice(invoiceId, updates) -> Invoice
```

### Projects

```typescript
createProjectFromQuote(quoteId, projectData?) -> Project
getProject(projectId) -> Project | null
getProjects(customerId?) -> Project[]
updateProject(projectId, updates) -> Project
```

### Tasks

```typescript
getTasks(projectId) -> Task[]
createTask(taskData) -> Task
updateTask(taskId, updates) -> Task
```

### Audit Logs

```typescript
createAuditLog(entityType, entityId, action, userId, changes?, metadata?) -> AuditLog
getAuditLogs(entityType?, entityId?, limit?) -> AuditLog[]
```

### Complete Workflow

```typescript
completeWizard(draftSession, approveQuote?) -> { quote, project? }
```

## AI Service

### Tools

#### SearchPriceItems
Search price items by keyword, SKU, category, or description
- **Parameters:** `query`, `priceBookId?`
- **Returns:** `PriceItem[]`
- **Guardrails:** Min 2 chars, max 200 chars

#### DraftScopeFromTranscript
Draft scope document from voice transcript
- **Parameters:** `transcript`, `context?`
- **Returns:** `{ scopeText, assumptions, questions }`
- **Guardrails:** Min 10 chars, max 5000 chars

#### SummarizeMedia
Summarize media assets (photos)
- **Parameters:** `mediaAssets[]`
- **Returns:** `{ summary, visibleElements, missingData }`
- **Guardrails:** Max 20 assets

#### ProposeQuoteLines
Propose quote line items based on scope and measurements
- **Parameters:** `scope`, `measurements?`, `matchedItems?`
- **Returns:** `{ suggestions[] }` (without prices)
- **Guardrails:** Min 10 chars, max 2000 chars

#### RecommendNextActions
Recommend next actions based on dashboard state
- **Parameters:** `dashboardState`
- **Returns:** `{ actions[] }`
- **Guardrails:** Required state object

## PriceBook Import Pipeline

### Steps

1. **Upload File** - User selects CSV/XLSX file
2. **Parse File** - Extract headers and rows
3. **Detect Columns** - Auto-detect column mapping (Dutch/English)
4. **Normalize Data** - Convert decimals, currency, units, VAT
5. **Validate Data** - Check for duplicates, empty prices, invalid units
6. **Preview** - Show first N rows for review
7. **Commit** - Create new PriceBook version with items
8. **Index** - Items are indexed for search

### Column Mapping

**Dutch:**
- SKU → SKU
- Name → Naam
- Description → Beschrijving
- Category → Categorie
- Unit → Eenheid
- Price → Prijs
- VAT Rate → BTW tarief

**English:**
- SKU → SKU
- Name → Name
- Description → Description
- Category → Category
- Unit → Unit
- Price → Price
- VAT Rate → VAT rate

### Validation Rules

- SKU: Required, unique per price book
- Name: Required
- Unit: Required
- Price: Must be > 0
- VAT Rate: Must be between 0 and 1 (or 0-100 as percentage)

## Numbering

### Quote Numbers
Format: `Q{YYYY}-{NNNN}`
- Example: `Q2026-0001`
- Per-tenant sequence

### Invoice Numbers
Format: `INV{YYYY}-{NNNN}`
- Example: `INV2026-0001`
- Per-tenant sequence
- Reset each year

### Project Numbers
Format: `PRJ{YYYY}-{NNNN}`
- Example: `PRJ2026-0001`
- Per-tenant sequence
- Reset each year

## Row Level Security (RLS)

All tables have RLS enabled with policies:
- `Users can manage own [table]` - Users can CRUD their own data
- Filtered by `user_id` and `tenant_id`

## Indexes

Performance indexes on:
- Foreign keys
- Search fields (name, sku, category)
- Status fields
- Date fields
- Tenant fields

## Triggers

Auto-update `updated_at` timestamp on all tables.

## Storage

### Bucket: `field-to-invoice-media`

Path format: `{tenant_id}/{user_id}/{timestamp}-{filename}`

### Upload Flow

1. Call `getUploadUrl()` to get signed URL
2. Upload file directly to Supabase Storage
3. Create `media_assets` record with `storage_path`
4. Get `public_url` from storage

## Default Task Templates

### Work Types

**Roofing:**
- Materialen bestellen
- Daken inspecteren
- Dakbedekking verwijderen
- Nieuwe dakbedekking installeren
- Afwerking en schoonmaak

**Solar:**
- Site survey
- Materialen bestellen
- Panelen installeren
- Omvormer aansluiten
- Keuring en oplevering

**Insulation:**
- Isolatiemateriaal bestellen
- Voorbereiding
- Isolatie aanbrengen
- Afwerking
- Eindcontrole

**Windows:**
- Metingen bevestigen
- Kozijnen bestellen
- Oude kozijnen verwijderen
- Nieuwe kozijnen plaatsen
- Afwerking

**Default:**
- Project kickoff
- Materialen bestellen
- Uitvoering werkzaamheden
- Kwaliteitscontrole
- Oplevering

## Usage Examples

### Complete Wizard Workflow

```typescript
import { completeWizard } from '@/lib/api-field-to-invoice'

// Load draft session
const draftSession = await getDraftSession(sessionId)

// Complete wizard
const { quote, project } = await completeWizard(draftSession, true)

// Quote created with lines
// Project created with default tasks
```

### Import Price Book

```typescript
import {
  parsePriceBookFile,
  detectColumns,
  normalizePriceItem,
  validatePriceItem,
  importPriceBook
} from '@/lib/pricebook-import'

// Parse file
const { headers, rows } = await parsePriceBookFile(file)

// Detect columns
const { mapping } = detectColumns(headers)

// Normalize and validate
const items = rows
  .map(row => normalizePriceItem(row, mapping))
  .filter(item => item !== null)

// Validate
const existingSKUs = new Set<string>()
const validItems = items.filter((item, index) => {
  const { valid, errors } = validatePriceItem(item, index, existingSKUs)
  return valid
})

// Import
const result = await importPriceBook('Prijsboek 2024', validItems, {
  deactivatePrevious: true
})
```

### AI Search

```typescript
import { aiSearchPriceItems } from '@/lib/ai-field-to-invoice'

// Search price items
const { success, data, error } = await aiSearchPriceItems('zonnepaneel')

if (success && data) {
  console.log(`Found ${data.length} items`)
}
```

## Migration Files

### 002_field_to_invoice_schema.sql
Initial schema with all tables, indexes, RLS policies, and triggers.

### 003_field_to_invoice_additions.sql
Additional columns and tables for:
- Draft sessions
- Tenant support
- Invoice lines
- Enhanced project and task fields
- Updated audit logs

## Files

### Backend API
- `client/src/lib/api-field-to-invoice.ts` - Main API client (600+ lines)

### AI Service
- `client/src/lib/ai-field-to-invoice.ts` - AI tools and guardrails (400+ lines)

### PriceBook Import
- `client/src/lib/pricebook-import.ts` - Import pipeline (400+ lines)

### Database Migrations
- `supabase/migrations/002_field_to_invoice_schema.sql` - Initial schema
- `supabase/migrations/003_field_to_invoice_additions.sql` - Additions

### Types
- `client/src/types/field-to-invoice.ts` - TypeScript types (320 lines)

## Next Steps

1. Run migrations on Supabase
2. Create Supabase Storage bucket `field-to-invoice-media`
3. Update wizard components to use real API
4. Implement PDF export for quotes
5. Add real AI service integration (replace heuristic functions)
6. Add comprehensive tests
7. Add API documentation
