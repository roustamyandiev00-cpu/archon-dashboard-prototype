# Field-to-Invoice Workflow - Data Model Specification

## Overview
Mobile-first field-to-invoice workflow similar to Renalto, with native invoicing and automatic project management.

## New Entities

### 1. Site (Werf/Locatie)
Represents a physical location where work is performed.

```sql
CREATE TYPE site_status AS ENUM ('planning', 'active', 'completed', 'cancelled');

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    klant_id UUID REFERENCES klanten(id) ON DELETE SET NULL,
    naam TEXT NOT NULL,
    adres TEXT,
    postcode TEXT,
    plaats TEXT,
    type TEXT NOT NULL, -- e.g., "Nieuwbouw", "Renovatie", "Onderhoud"
    urgentie BOOLEAN DEFAULT FALSE,
    gewenste_datum DATE,
    status site_status DEFAULT 'planning',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_klant_id ON sites(klant_id);
CREATE INDEX idx_sites_status ON sites(status);
```

### 2. MeasurementItem (Meting)
Represents a repeatable measurement item (windows, doors, etc.).

```sql
CREATE TABLE measurement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g., "Raam", "Deur", "Vloer"
    template BOOLEAN DEFAULT FALSE, -- Is this a "most chosen" template?
    options JSONB DEFAULT '{}', -- e.g., {"glas": "dubbel", "kleur": "helder", "profiel": "standaard"}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_measurement_items_site_id ON measurement_items(site_id);
```

### 3. SiteMeasurement (Site Meting)
Links a measurement item to a specific site with dimensions.

```sql
CREATE TABLE site_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    measurement_item_id UUID REFERENCES measurement_items(id) ON DELETE CASCADE,
    breedte DECIMAL(10,2), -- width
    hoogte DECIMAL(10,2), -- height
    aantal INTEGER DEFAULT 1, -- quantity
    notities TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_measurements_site_id ON site_measurements(site_id);
```

### 4. MediaAsset (Foto's/Bestanden)
Represents uploaded media (photos, documents) linked to sites and optionally measurements.

```sql
CREATE TYPE media_label AS ENUM ('binnen', 'buiten', 'detail', 'schade', 'overzicht');

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    measurement_id UUID REFERENCES site_measurements(id) ON DELETE SET NULL,
    label media_label,
    mime_type TEXT NOT NULL, -- e.g., "image/jpeg", "application/pdf"
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Supabase storage path
    file_size BIGINT,
    width INTEGER, -- For images
    height INTEGER, -- For images
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_assets_site_id ON media_assets(site_id);
CREATE INDEX idx_media_assets_measurement_id ON media_assets(measurement_id);
```

### 5. PriceBook (Prijsbibliotheek)
Represents a versioned price book per tenant.

```sql
CREATE TYPE pricebook_status AS ENUM ('draft', 'active', 'archived');

CREATE TABLE price_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Standaard 2024", "Custom"
    version INTEGER NOT NULL DEFAULT 1,
    status pricebook_status DEFAULT 'draft',
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, version)
);

CREATE INDEX idx_price_books_user_id ON price_books(user_id);
CREATE INDEX idx_price_books_status ON price_books(status);
```

### 6. PriceItem (Prijs)
Individual price items within a price book.

```sql
CREATE TABLE price_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    price_book_id UUID REFERENCES price_books(id) ON DELETE CASCADE,
    sku TEXT NOT NULL, -- Stock Keeping Unit
    naam TEXT NOT NULL,
    categorie TEXT,
    eenheid TEXT NOT NULL, -- e.g., "stuk", "m2", "meter"
    basisprijs DECIMAL(10,2) NOT NULL,
    btw_tarief DECIMAL(5,2) DEFAULT 0.21, -- VAT rate
    actief BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(price_book_id, sku)
);

CREATE INDEX idx_price_items_price_book_id ON price_items(price_book_id);
CREATE INDEX idx_price_items_sku ON price_items(sku);
CREATE INDEX idx_price_items_active ON price_items(actief);
```

### 7. PriceModifier (Prijswijzigingen)
Modifiers for price items (add, percent, multiply).

```sql
CREATE TYPE modifier_rule_type AS ENUM ('add', 'percent', 'multiply');

CREATE TABLE price_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    price_item_id UUID REFERENCES price_items(id) ON DELETE CASCADE,
    naam TEXT NOT NULL,
    regel_type modifier_rule_type NOT NULL,
    waarde DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_modifiers_price_item_id ON price_modifiers(price_item_id);
```

### 8. Quote (Offerte) - Enhanced
Enhanced quote entity with proper workflow support.

```sql
-- Update offerte_status enum to include new states
CREATE TYPE offerte_status AS ENUM ('draft', 'ready', 'approved', 'sent', 'archived');

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    nummer TEXT UNIQUE NOT NULL,
    status offerte_status DEFAULT 'draft',
    titel TEXT,
    beschrijving TEXT,
    aannames JSONB DEFAULT '[]', -- Assumptions
    vragen JSONB DEFAULT '[]', -- Open questions
    subtotaal DECIMAL(10,2) DEFAULT 0,
    btw_bedrag DECIMAL(10,2) DEFAULT 0,
    totaal DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_site_id ON quotes(site_id);
CREATE INDEX idx_quotes_status ON quotes(status);
```

### 9. QuoteLine (Offerte Regel)
Individual quote lines with AI suggestion tracking.

```sql
CREATE TYPE quote_line_source AS ENUM ('manual', 'ai_suggested');

CREATE TABLE quote_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    sku TEXT, -- Optional - links to PriceItem
    beschrijving TEXT NOT NULL,
    aantal DECIMAL(10,2) NOT NULL,
    eenheid TEXT NOT NULL,
    eenheidsprijs DECIMAL(10,2) NOT NULL,
    btw_tarief DECIMAL(5,2) DEFAULT 0.21,
    source quote_line_source DEFAULT 'manual',
    confidence DECIMAL(3,2), -- AI confidence score (0-100)
    reden TEXT, -- AI reasoning
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quote_lines_quote_id ON quote_lines(quote_id);
```

### 10. Approval (Goedkeuring)
Tracks quote approvals with snapshot.

```sql
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    snapshot_hash TEXT NOT NULL, -- Hash of quote state at approval
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approvals_quote_id ON approvals(quote_id);
```

### 11. Invoice (Factuur) - Enhanced
Enhanced invoice entity with quote linkage and proper numbering.

```sql
-- Update factuur_status enum
CREATE TYPE factuur_status AS ENUM ('draft', 'sent', 'paid', 'overdue');

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    klant_id UUID REFERENCES klanten(id) ON DELETE SET NULL,
    nummer TEXT NOT NULL, -- Per-tenant numbering
    datum DATE NOT NULL,
    vervaldatum DATE NOT NULL,
    subtotaal DECIMAL(10,2) DEFAULT 0,
    btw_bedrag DECIMAL(10,2) DEFAULT 0,
    totaal DECIMAL(10,2) DEFAULT 0,
    status factuur_status DEFAULT 'draft',
    betaald_datum DATE,
    regels JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX idx_invoices_klant_id ON invoices(klant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### 12. Project (Project) - Enhanced
Enhanced project entity with phases and tasks.

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    naam TEXT NOT NULL,
    status TEXT NOT NULL, -- Keep existing enum
    voortgang INTEGER DEFAULT 0 CHECK (voortgang >= 0 AND voortgang <= 100),
    start_datum DATE,
    eind_datum DATE,
    budget DECIMAL(10,2) NOT NULL,
    uitgegeven DECIMAL(10,2) DEFAULT 0,
    fases JSONB DEFAULT '[]', -- Phases: [{"naam": "Fase 1", "status": "completed", "start": "2024-01-01", "eind": "2024-01-15"}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_site_id ON projects(site_id);
CREATE INDEX idx_projects_quote_id ON projects(quote_id);
```

### 13. Task (Taak)
Tasks linked to projects.

```sql
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    titel TEXT NOT NULL,
    beschrijving TEXT,
    vervaldatum DATE,
    status task_status DEFAULT 'todo',
    voltooid_op TIMESTAMPTZ, -- Completed at
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### 14. AuditLog (Audit Log)
Tracks all AI and user actions for compliance.

```sql
CREATE TYPE audit_actor_type AS ENUM ('user', 'ai');
CREATE TYPE audit_action AS ENUM (
    'approve_quote',
    'create_invoice',
    'update_totals',
    'ai_suggestion_apply',
    'ai_suggestion_remove',
    'create_draft',
    'update_draft'
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_type audit_actor_type NOT NULL,
    action audit_action NOT NULL,
    entity_type TEXT NOT NULL, -- e.g., "quote", "invoice"
    entity_id UUID NOT NULL,
    before_state JSONB, -- Snapshot before change
    after_state JSONB, -- Snapshot after change
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

## Entity Relationships

```
User (1) ──> (*) Sites
User (1) ──> (*) PriceBooks
User (1) ──> (*) AuditLogs

Klant (1) ──> (*) Sites

Site (1) ──> (*) MeasurementItems
Site (1) ──> (*) SiteMeasurements
Site (1) ──> (*) MediaAssets
Site (1) ──> (*) Quotes
Site (1) ──> (*) Projects

MeasurementItem (1) ──> (*) SiteMeasurements

SiteMeasurement (1) ──> (*) MediaAssets

PriceBook (1) ──> (*) PriceItems
PriceItem (1) ──> (*) PriceModifiers

Quote (1) ──> (*) QuoteLines
Quote (1) ──> (*) Approvals
Quote (1) ──> (*) Invoices
Quote (1) ──> (*) Projects

Project (1) ──> (*) Tasks
```

## Migration Strategy

1. Create new migration file: `002_field_to_invoice_schema.sql`
2. Add new enums first
3. Create new tables with proper indexes
4. Add RLS policies for all new tables
5. Update existing tables (quotes, invoices, projects) with new columns

## Next Steps

1. Create migration file
2. Update TypeScript types
3. Create API contracts
4. Implement mobile wizard UI
