# 📊 Database Migration Status

**Datum:** 23 januari 2026  
**Status:** ⚠️ Gedeeltelijk Toegepast - Handmatige Fix Nodig

---

## Huidige Situatie

De migratie is **gedeeltelijk** toegepast maar stopte bij een syntax error:

```
ERROR: syntax error at or near "NOT" (SQLSTATE 42601)
At statement: 100
CREATE POLICY IF NOT EXISTS "Users can manageown draft_sessions"
```

### Wat Is Er Gebeurd?

1. ✅ Migratie `002_field_to_invoice_schema.sql` - **Succesvol**
2. ⚠️ Migratie `003_field_to_invoice_additions.sql` - **Gedeeltelijk**
   - Alle tabellen en kolommen zijn aangemaakt
   - Alle indexes zijn aangemaakt
   - RLS policies zijn **NIET** aangemaakt (error)
   - Triggers zijn **NIET** aangemaakt (error)

---

## Oplossing

Je hebt **2 opties**:

### Optie 1: Handmatige Fix (Snelst) ✅

1. **Open Supabase Dashboard**
   - Ga naar: https://supabase.com/dashboard
   - Selecteer je project
   - Ga naar "SQL Editor"

2. **Run de fix script**
   - Open het bestand: `fix_migration.sql`
   - Kopieer de inhoud
   - Plak in SQL Editor
   - Klik "Run"

3. **Verifieer**
   ```sql
   -- Check of policies bestaan
   SELECT * FROM pg_policies 
   WHERE tablename IN ('draft_sessions', 'invoice_lines');
   ```

### Optie 2: Database Reset (Verliest Data!) ⚠️

```bash
# WAARSCHUWING: Dit verwijdert ALLE data!
supabase db reset --linked

# Dan opnieuw pushen
supabase db push --linked
```

---

## Wat Is Gerepareerd

In de migratie bestanden:

### 002_field_to_invoice_schema.sql
✅ **Voor:** `CREATE INDEX idx_sites_klant_id ON sites(klant_id);`  
✅ **Na:** `CREATE INDEX idx_sites_customer_id ON sites(customer_id);`

### 003_field_to_invoice_additions.sql
✅ Alle syntax is correct
✅ Policies hebben correcte namen
✅ Klaar om opnieuw te pushen

---

## Verificatie

Na het toepassen van de fix, controleer:

### 1. Check Tabellen
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'sites', 
    'measurement_items', 
    'site_measurements',
    'media_assets',
    'price_books',
    'price_items',
    'price_modifiers',
    'quote_lines',
    'approvals',
    'tasks',
    'audit_logs',
    'draft_sessions',
    'invoice_lines'
);
```

### 2. Check Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('draft_sessions', 'invoice_lines');
```

### 3. Check Triggers
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('draft_sessions', 'invoice_lines');
```

---

## Verwachte Output

### Tabellen (13 nieuwe):
- ✅ sites
- ✅ measurement_items
- ✅ site_measurements
- ✅ media_assets
- ✅ price_books
- ✅ price_items
- ✅ price_modifiers
- ✅ quote_lines
- ✅ approvals
- ✅ tasks
- ✅ audit_logs
- ✅ draft_sessions
- ✅ invoice_lines

### Policies (2 nieuwe):
- ⚠️ Users can manage own draft_sessions
- ⚠️ Users can manage own invoice_lines

### Triggers (2 nieuwe):
- ⚠️ update_draft_sessions_updated_at
- ⚠️ update_invoice_lines_updated_at

---

## Aanbevolen Actie

**Gebruik Optie 1 (Handmatige Fix):**

1. Open `fix_migration.sql`
2. Kopieer de SQL
3. Run in Supabase SQL Editor
4. Verifieer met de check queries hierboven

Dit is **veiliger** dan een database reset en behoudt je data.

---

## Troubleshooting

### Als je nog steeds errors krijgt:

**Error: "policy already exists"**
```sql
-- Verwijder eerst de oude policy
DROP POLICY IF EXISTS "Users can manage own draft_sessions" ON draft_sessions;
-- Dan opnieuw aanmaken
```

**Error: "function update_updated_at_column does not exist"**
```sql
-- Maak de functie aan
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Status Samenvatting

| Component | Status | Actie Nodig |
|-----------|--------|-------------|
| Tabellen | ✅ Aangemaakt | Geen |
| Kolommen | ✅ Toegevoegd | Geen |
| Indexes | ✅ Aangemaakt | Geen |
| Enums | ✅ Bijgewerkt | Geen |
| RLS Policies | ⚠️ Gedeeltelijk | Run fix_migration.sql |
| Triggers | ⚠️ Gedeeltelijk | Run fix_migration.sql |

---

**Aanbeveling:** Run `fix_migration.sql` in Supabase SQL Editor om de migratie te voltooien! 🚀
