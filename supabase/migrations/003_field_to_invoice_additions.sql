-- Migration: Field-to-Invoice Additions
-- Adds missing tables, columns, and fixes for the field-to-invoice workflow

-- Add missing draft_sessions table
CREATE TABLE IF NOT EXISTS draft_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 1,
    payload_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to sites table
ALTER TABLE sites ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE sites ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES klanten(id) ON DELETE SET NULL;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS urgency BOOLEAN DEFAULT FALSE;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS preferred_date DATE;

-- Update measurement_items table
ALTER TABLE measurement_items ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE measurement_items ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;
ALTER TABLE measurement_items ADD COLUMN IF NOT EXISTS work_type TEXT NOT NULL;
ALTER TABLE measurement_items ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL;
ALTER TABLE measurement_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update site_measurements table
ALTER TABLE site_measurements ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);
ALTER TABLE site_measurements ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update media_assets table
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS public_url TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update price_books table
ALTER TABLE price_books ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE price_books ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Update price_items table
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0.21;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Update price_modifiers table
ALTER TABLE price_modifiers ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE price_modifiers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE price_modifiers ADD COLUMN IF NOT EXISTS rule_type modifier_rule_type;
ALTER TABLE price_modifiers ADD COLUMN IF NOT EXISTS value DECIMAL(10,2);
ALTER TABLE price_modifiers ADD COLUMN IF NOT EXISTS effective_date DATE;

-- Update quote_lines table
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS price_item_id UUID REFERENCES price_items(id) ON DELETE SET NULL;
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2);
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0.21;
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE quote_lines ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update approvals table
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update facturen (invoices) table
ALTER TABLE facturen ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;
ALTER TABLE facturen ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE facturen ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE facturen ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE facturen ADD COLUMN IF NOT EXISTS paid_date DATE;

-- Create invoice_lines table
CREATE TABLE IF NOT EXISTS invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES facturen(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 0.21,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update projecten (projects) table
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS project_number TEXT;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS estimated_end_date DATE;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS actual_end_date DATE;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2);
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS spent DECIMAL(12,2) DEFAULT 0;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE projecten ADD COLUMN IF NOT EXISTS phases JSONB DEFAULT '[]';

-- Update tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Update audit_logs table
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS changes JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update offertes (quotes) table
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS tenant_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS quote_number TEXT;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS work_type TEXT;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS total_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0.21;
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS assumptions JSONB DEFAULT '[]';
ALTER TABLE offertes ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]';

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_draft_sessions_user_id ON draft_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_sessions_tenant_id ON draft_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sites_tenant_id ON sites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sites_customer_id ON sites(customer_id);
CREATE INDEX IF NOT EXISTS idx_measurement_items_work_type ON measurement_items(work_type);
CREATE INDEX IF NOT EXISTS idx_price_books_tenant_id ON price_books(tenant_id);
CREATE INDEX IF NOT EXISTS idx_price_books_is_active ON price_books(is_active);
CREATE INDEX IF NOT EXISTS idx_price_items_name ON price_items(name);
CREATE INDEX IF NOT EXISTS idx_price_items_category ON price_items(category);
CREATE INDEX IF NOT EXISTS idx_price_items_active ON price_items(active);
CREATE INDEX IF NOT EXISTS idx_quote_lines_price_item_id ON quote_lines(price_item_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS on new tables
ALTER TABLE draft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY IF NOT EXISTS "Users can manage own draft_sessions" ON draft_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can manage own invoice_lines" ON invoice_lines FOR ALL USING (auth.uid() = user_id);

-- Triggers for new tables
CREATE TRIGGER IF NOT EXISTS update_draft_sessions_updated_at BEFORE UPDATE ON draft_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_invoice_lines_updated_at BEFORE UPDATE ON invoice_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
