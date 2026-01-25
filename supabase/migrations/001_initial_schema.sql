-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE billing_status AS ENUM ('none', 'pending', 'trialing', 'active', 'past_due', 'canceled');
CREATE TYPE klant_type AS ENUM ('particulier', 'zakelijk');
CREATE TYPE klant_status AS ENUM ('actief', 'inactief');
CREATE TYPE factuur_status AS ENUM ('concept', 'verzonden', 'betaald', 'vervallen');
CREATE TYPE offerte_status AS ENUM ('concept', 'verzonden', 'bekeken', 'onderhandelen', 'geaccepteerd', 'afgewezen', 'verlopen', 'verloren');
CREATE TYPE transactie_type AS ENUM ('inkomst', 'uitgave');
CREATE TYPE appointment_type AS ENUM ('meeting', 'site_visit', 'call', 'deadline');
CREATE TYPE appointment_status AS ENUM ('confirmed', 'pending', 'cancelled');
CREATE TYPE platform_type AS ENUM ('google_meet', 'zoom', 'teams');
CREATE TYPE ai_feedback_type AS ENUM ('offerte', 'factuur', 'advies', 'algemeen');
CREATE TYPE user_feedback AS ENUM ('positive', 'negative', 'corrected');
CREATE TYPE knowledge_status AS ENUM ('indexing', 'trained', 'error');

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    company_name TEXT,
    phone TEXT,
    address TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'Nederland',
    kvk_number TEXT,
    btw_number TEXT,
    billing_status billing_status DEFAULT 'none',
    stripe_customer_id TEXT,
    subscription_id TEXT,
    plan_id TEXT,
    trial_ends_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Klanten (Customers) table
CREATE TABLE klanten (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    naam TEXT NOT NULL,
    email TEXT,
    telefoon TEXT,
    adres TEXT,
    postcode TEXT,
    plaats TEXT,
    land TEXT DEFAULT 'Nederland',
    bedrijf TEXT,
    kvk_nummer TEXT,
    btw_nummer TEXT,
    contactpersoon TEXT,
    notities TEXT,
    type klant_type DEFAULT 'particulier',
    status klant_status DEFAULT 'actief',
    totaal_omzet DECIMAL(10,2) DEFAULT 0,
    laatste_factuur DATE,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facturen (Invoices) table
CREATE TABLE facturen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    factuur_nummer TEXT UNIQUE,
    klant_id UUID REFERENCES klanten(id) ON DELETE SET NULL,
    klant_naam TEXT,
    datum DATE NOT NULL,
    vervaldatum DATE NOT NULL,
    regels JSONB NOT NULL DEFAULT '[]',
    subtotaal DECIMAL(10,2) NOT NULL,
    btw_bedrag DECIMAL(10,2) NOT NULL,
    totaal DECIMAL(10,2) NOT NULL,
    status factuur_status DEFAULT 'concept',
    notities TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projecten (Projects) table
CREATE TABLE projecten (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    client TEXT,
    client_name TEXT,
    location TEXT,
    budget DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    deadline DATE,
    image TEXT,
    payment_milestones JSONB DEFAULT '[]',
    team JSONB DEFAULT '[]',
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offertes (Quotes) table
CREATE TABLE offertes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nummer TEXT UNIQUE NOT NULL,
    klant TEXT NOT NULL,
    bedrag DECIMAL(10,2) NOT NULL,
    datum DATE NOT NULL,
    geldig_tot DATE NOT NULL,
    status offerte_status DEFAULT 'concept',
    beschrijving TEXT NOT NULL,
    items INTEGER DEFAULT 1,
    win_probability INTEGER DEFAULT 50 CHECK (win_probability >= 0 AND win_probability <= 100),
    win_factors TEXT[],
    ai_insight TEXT,
    images TEXT[],
    dimensions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transacties (Transactions) table
CREATE TABLE transacties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titel TEXT NOT NULL,
    beschrijving TEXT,
    bedrag DECIMAL(10,2) NOT NULL,
    type transactie_type NOT NULL,
    categorie TEXT NOT NULL,
    datum DATE NOT NULL,
    icon_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (Agenda) table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type appointment_type NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration TEXT,
    client TEXT NOT NULL,
    location TEXT,
    platform platform_type,
    join_url TEXT,
    attendees TEXT[],
    status appointment_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Feedback table
CREATE TABLE ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type ai_feedback_type NOT NULL,
    context TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_feedback user_feedback NOT NULL,
    correction TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Knowledge Base table
CREATE TABLE ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    status knowledge_status DEFAULT 'indexing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_klanten_user_id ON klanten(user_id);
CREATE INDEX idx_klanten_status ON klanten(status);
CREATE INDEX idx_facturen_user_id ON facturen(user_id);
CREATE INDEX idx_facturen_status ON facturen(status);
CREATE INDEX idx_facturen_datum ON facturen(datum);
CREATE INDEX idx_projecten_user_id ON projecten(user_id);
CREATE INDEX idx_projecten_status ON projecten(status);
CREATE INDEX idx_offertes_user_id ON offertes(user_id);
CREATE INDEX idx_offertes_status ON offertes(status);
CREATE INDEX idx_offertes_datum ON offertes(datum);
CREATE INDEX idx_transacties_user_id ON transacties(user_id);
CREATE INDEX idx_transacties_datum ON transacties(datum);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE klanten ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturen ENABLE ROW LEVEL SECURITY;
ALTER TABLE projecten ENABLE ROW LEVEL SECURITY;
ALTER TABLE offertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacties ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Klanten
CREATE POLICY "Users can manage own klanten" ON klanten FOR ALL USING (auth.uid() = user_id);

-- Facturen
CREATE POLICY "Users can manage own facturen" ON facturen FOR ALL USING (auth.uid() = user_id);

-- Projecten
CREATE POLICY "Users can manage own projecten" ON projecten FOR ALL USING (auth.uid() = user_id);

-- Offertes
CREATE POLICY "Users can manage own offertes" ON offertes FOR ALL USING (auth.uid() = user_id);

-- Transacties
CREATE POLICY "Users can manage own transacties" ON transacties FOR ALL USING (auth.uid() = user_id);

-- Appointments
CREATE POLICY "Users can manage own appointments" ON appointments FOR ALL USING (auth.uid() = user_id);

-- AI Feedback
CREATE POLICY "Users can manage own ai_feedback" ON ai_feedback FOR ALL USING (auth.uid() = user_id);

-- AI Knowledge
CREATE POLICY "Users can manage own ai_knowledge" ON ai_knowledge FOR ALL USING (auth.uid() = user_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_klanten_updated_at BEFORE UPDATE ON klanten FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facturen_updated_at BEFORE UPDATE ON facturen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projecten_updated_at BEFORE UPDATE ON projecten FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offertes_updated_at BEFORE UPDATE ON offertes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacties_updated_at BEFORE UPDATE ON transacties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_feedback_updated_at BEFORE UPDATE ON ai_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_knowledge_updated_at BEFORE UPDATE ON ai_knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();