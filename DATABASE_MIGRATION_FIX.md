# 🔧 Database Migration Fix

**Datum:** 23 januari 2026  
**Status:** ✅ Gerepareerd

---

## Probleem

Bij het uitvoeren van `supabase db push` kreeg je deze fout:

```
ERROR: column "klant_id" does not exist (SQLSTATE 42703)
At statement: 35
CREATE INDEX idx_sites_klant_id ON sites(klant_id)
```

---

## Oorzaak

In de migratie `002_field_to_invoice_schema.sql` werd een index gemaakt op een kolom die niet bestaat:

### Fout:
```sql
CREATE INDEX idx_sites_klant_id ON sites(klant_id);
```

### Probleem:
- De `sites` tabel heeft een kolom genaamd `customer_id`
- Niet `klant_id`
- Dit veroorzaakte een SQL error

---

## Oplossing

De index naam en kolom naam zijn gecorrigeerd:

### Voor:
```sql
CREATE INDEX idx_sites_klant_id ON sites(klant_id);
```

### Na:
```sql
CREATE INDEX idx_sites_customer_id ON sites(customer_id);
```

---

## Hoe Te Pushen

Nu kun je de migratie opnieuw pushen:

```bash
supabase db push --linked
```

Wanneer gevraagd:
```
Do you want to push these migrations to the remote database?
 • 002_field_to_invoice_schema.sql
 • 003_field_to_invoice_additions.sql
[Y/n]
```

Type: **Y** en druk op Enter

---

## Wat Wordt Toegevoegd

### Nieuwe Tabellen:
1. **sites** - Werven/locaties
2. **measurement_items** - Meetsjablonen
3. **site_measurements** - Metingen
4. **media_assets** - Foto's/bestanden
5. **price_books** - Prijsboeken
6. **price_items** - Prijzen
7. **price_modifiers** - Prijswijzigingen
8. **quote_lines** - Offerte regels
9. **approvals** - Goedkeuringen
10. **tasks** - Taken
11. **audit_logs** - Audit trail
12. **draft_sessions** - Wizard state

### Updates Aan Bestaande Tabellen:
- **offertes** - Nieuwe kolommen voor workflow
- **facturen** - Quote koppeling
- **projecten** - Site en quote koppeling

### Nieuwe Enums:
- `site_status`
- `media_label`
- `quote_line_source`
- `modifier_rule_type`
- `task_status`
- `audit_actor_type`
- `pricebook_status`
- `audit_action`

### Updates Aan Enums:
- `offerte_status` - Nieuwe waarden
- `factuur_status` - Nieuwe waarden

---

## Verificatie

Na succesvolle push, controleer:

```bash
# Check of tabellen zijn aangemaakt
supabase db diff --linked

# Of login in Supabase dashboard
# Ga naar Table Editor
# Verifieer dat alle nieuwe tabellen bestaan
```

---

## Troubleshooting

### Als je nog steeds errors krijgt:

1. **Reset de database** (WAARSCHUWING: Verwijdert alle data!)
   ```bash
   supabase db reset --linked
   ```

2. **Of: Handmatig de foutieve migratie verwijderen**
   ```bash
   # Login in Supabase dashboard
   # Ga naar SQL Editor
   # Run: DROP INDEX IF EXISTS idx_sites_klant_id;
   ```

3. **Dan opnieuw pushen**
   ```bash
   supabase db push --linked
   ```

---

## Belangrijke Notities

⚠️ **Waarschuwingen tijdens push:**
- `WARN: no SMS provider is enabled` - Dit is normaal, SMS is niet geconfigureerd
- `NOTICE: drop cascades to column status` - Dit is verwacht, enums worden opnieuw aangemaakt

✅ **Verwachte output:**
```
Applying migration 002_field_to_invoice_schema.sql...
Applying migration 003_field_to_invoice_additions.sql...
Finished supabase db push.
```

---

## Volgende Stappen

Na succesvolle migratie:

1. ✅ Verifieer tabellen in Supabase dashboard
2. ✅ Test de app: `http://localhost:3000/`
3. ✅ Controleer of offertes nog steeds werken
4. ✅ Test nieuwe features (sites, measurements, etc.)

---

**Status:** ✅ Migratie bestand gerepareerd!

**Actie:** Run `supabase db push --linked` en type **Y** wanneer gevraagd.
