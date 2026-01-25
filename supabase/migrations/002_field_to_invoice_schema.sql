-- Migration: Field-to-Invoice Workflow Schema
-- Adds support for mobile-first field-to-invoice workflow similar to Renalto
-- with native invoicing and automatic project management

-- New Enums
CREATE TYPE site_status AS ENUM ('planning', 'active', 'completed', 'cancelled');
CREATE TYPE media_label AS ENUM ('binnen', 'buiten', 'detail', 'schade', 'overzicht');
CREATE TYPE quote_line_source AS ENUM ('manual', 'ai_suggested');
CREATE TYPE modifier_rule_type AS ENUM ('add', 'percent', 'multiply');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed', 'cancelled');
CREATE TYPE audit_actor_type AS ENUM ('user', 'ai');
CREATE TYPE pricebook_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE audit_action AS ENUM (
    'approve_quote',
    'create_invoice',
    'update_totals',
    'ai_suggestion_apply',
    'ai_suggestion_remove',
    'create_draft',
    'update_draft'
);

-- Update existing enums
DROP TYPE IF EXISTS offerte_status CASCADE;
CREATE TYPE offerte_status AS ENUM ('draft', 'ready', 'approved', 'sent', 'archived');

DROP TYPE IF EXISTS factuur_status CASCADE;
CREATE TYPE factuur_status AS ENUM ('draft', 'sent', 'paid', 'overdue');

-- Draft Sessions (Wizard state persistence)
CREATE TABLE draft_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 1,
    payload_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sites (Werf/Locatie)
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    customer_id UUID REFERENCES klanten(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    type TEXT NOT NULL,
    urgency BOOLEAN DEFAULT FALSE,
    preferred_date DATE,
    status site_status DEFAULT 'planning',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Measurement Items (Templates for repeatable measurements)
CREATE TABLE measurement_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    work_type TEXT NOT NULL,
    unit TEXT NOT NULL,
    template BOOLEAN DEFAULT FALSE,
    options JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Measurements (Actual measurements linked to site)
CREATE TABLE site_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    measurement_item_id UUID REFERENCES measurement_items(id) ON DELETE CASCADE,
    value DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Assets (Foto's/Bestanden)
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    measurement_id UUID REFERENCES site_measurements(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    mime_type TEXT NOT NULL,
    file_size BIGINT,
    labels TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price Books (Prijsbibliotheek)
CREATE TABLE price_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    status pricebook_status DEFAULT 'draft',
    currency TEXT DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, version)
);

-- Price Items (Prijzen)
CREATE TABLE price_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    price_book_id UUID REFERENCES price_books(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    naam TEXT NOT NULL,
    categorie TEXT,
    eenheid TEXT NOT NULL,
    basisprijs DECIMAL(10,2) NOT NULL,
    btw_tarief DECIMAL(5,2) DEFAULT 0.21,
    actief BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(price_book_id, sku)
);

-- Price Modifiers (Prijswijzigingen)
CREATE TABLE price_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    price_item_id UUID REFERENCES price_items(id) ON DELETE CASCADE,
    naam TEXT NOT NULL,
    regel_type modifier_rule_type NOT NULL,
    waarde DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote Lines (Offerte Regels)
CREATE TABLE quote_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES offertes(id) ON DELETE CASCADE,
    sku TEXT,
    beschrijving TEXT NOT NULL,
    aantal DECIMAL(10,2) NOT NULL,
    eenheid TEXT NOT NULL,
    eenheidsprijs DECIMAL(10,2) NOT NULL,
    btw_tarief DECIMAL(5,2) DEFAULT 0.21,
    source quote_line_source DEFAULT 'manual',
    confidence DECIMAL(3,2),
    reden TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals (Goedkeuring)
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES offertes(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    snapshot_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table (update existing facturen structure)
ALTER TABLE facturen ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES offertes(id) ON DELETE SET NULL;
ALTER TABLE facturen ADD COLUMN IF NOT EXISTS betaald_datum DATE;

-- Projects table (update existing projecten structure)
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES offertes(id) ON DELETE SET NULL;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS start_datum DATE;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS eind_datum DATE;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS fases JSONB DEFAULT '[]';

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projecten(id) ON DELETE CASCADE,
    titel TEXT NOT NULL,
    beschrijving TEXT,
    vervaldatum DATE,
    status task_status DEFAULT 'todo',
    voltooid_op TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_type audit_actor_type NOT NULL,
    action audit_action NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    before_state JSONB,
    after_state JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Update offertes table for new workflow
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS aannames JSONB DEFAULT '[]';
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS vragen JSONB DEFAULT '[]';

-- Indexes for performance
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_customer_id ON sites(customer_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_measurement_items_site_id ON measurement_items(site_id);
CREATE INDEX idx_site_measurements_site_id ON site_measurements(site_id);
CREATE INDEX idx_media_assets_site_id ON media_assets(site_id);
CREATE INDEX idx_media_assets_measurement_id ON media_assets(measurement_id);
CREATE INDEX idx_price_books_user_id ON price_books(user_id);
CREATE INDEX idx_price_books_status ON price_books(status);
CREATE INDEX idx_price_items_price_book_id ON price_items(price_book_id);
CREATE INDEX idx_price_items_sku ON price_items(sku);
CREATE INDEX idx_price_items_actief ON price_items(actief);
CREATE INDEX idx_price_modifiers_price_item_id ON price_modifiers(price_item_id);
CREATE INDEX idx_quote_lines_quote_id ON quote_lines(quote_id);
CREATE INDEX idx_approvals_quote_id ON approvals(quote_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own sites" ON sites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own measurement_items" ON measurement_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own site_measurements" ON site_measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own media_assets" ON media_assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own price_books" ON price_books FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own price_items" ON price_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own price_modifiers" ON price_modifiers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own quote_lines" ON quote_lines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own approvals" ON approvals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own audit_logs" ON audit_logs FOR ALL USING (auth.uid() = user_id);

-- Updated triggers for new tables
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_measurement_items_updated_at BEFORE UPDATE ON measurement_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_measurements_updated_at BEFORE UPDATE ON site_measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_books_updated_at BEFORE UPDATE ON price_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_items_updated_at BEFORE UPDATE ON price_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_modifiers_updated_at BEFORE UPDATE ON price_modifiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quote_lines_updated_at BEFORE UPDATE ON quote_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
