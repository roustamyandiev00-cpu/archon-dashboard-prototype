# Firebase naar Supabase Migratie Gids

## Overzicht

Deze gids helpt je bij het migreren van Firebase naar Supabase voor je Archon Dashboard project.

## Wat is veranderd

### 1. Database
- **Van**: Firebase Firestore (NoSQL)
- **Naar**: Supabase PostgreSQL (SQL)
- **Voordelen**: Betere performance, SQL queries, real-time subscriptions, betere type safety

### 2. Authenticatie
- **Van**: Firebase Auth
- **Naar**: Supabase Auth
- **Voordelen**: Meer providers, betere integratie, geen vendor lock-in

### 3. Storage
- **Van**: Firebase Storage
- **Naar**: Supabase Storage
- **Voordelen**: S3-compatible, betere performance, meer controle

## Setup Stappen

### 1. Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com)
2. Maak een nieuw project aan
3. Noteer je project URL en anon key

### 2. Environment Variables Updaten

Update je `.env` bestand:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Schema Migreren

Run de SQL migratie in je Supabase dashboard:

```sql
-- Zie supabase/migrations/001_initial_schema.sql
```

### 4. Data Migreren (Optioneel)

Als je bestaande Firebase data hebt, kun je deze migreren:

1. Export data uit Firebase
2. Transform naar PostgreSQL format
3. Import in Supabase

## Nieuwe Features

### Real-time Subscriptions
```typescript
// Automatische updates wanneer data verandert
const { data, error } = await supabase
  .from('klanten')
  .select('*')
  .eq('user_id', user.id)

// Real-time listener
supabase
  .channel('klanten_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'klanten' }, 
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Row Level Security (RLS)
```sql
-- Automatische beveiliging per gebruiker
CREATE POLICY "Users can only see own data" ON klanten
  FOR ALL USING (auth.uid() = user_id);
```

### Type Safety
```typescript
// Automatische TypeScript types
import { Database } from './types/supabase'

const supabase = createClient<Database>(url, key)
```

## API Veranderingen

### Voor (Firebase)
```typescript
import { auth, db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

const user = auth.currentUser
const docRef = await addDoc(collection(db, 'klanten'), data)
```

### Na (Supabase)
```typescript
import { supabase } from '@/lib/supabase'

const { data: { user } } = await supabase.auth.getUser()
const { data, error } = await supabase
  .from('klanten')
  .insert(data)
```

## Voordelen van Supabase

### 1. Performance
- PostgreSQL is sneller dan Firestore voor complexe queries
- Betere indexing en query optimization
- Minder API calls nodig

### 2. Flexibiliteit
- SQL queries voor complexe data operaties
- Views, functions, en triggers
- Betere data relationships

### 3. Kosten
- Voorspelbare pricing
- Geen per-operatie kosten
- Meer generous free tier

### 4. Developer Experience
- Betere TypeScript support
- SQL is universeel bekend
- Meer debugging tools

## Troubleshooting

### Common Issues

1. **Environment Variables**
   - Zorg dat alle VITE_ prefixes correct zijn
   - Check dat URLs geen trailing slash hebben

2. **RLS Policies**
   - Zorg dat policies correct zijn ingesteld
   - Test met verschillende gebruikers

3. **Real-time**
   - Check dat real-time is enabled in Supabase
   - Verify channel subscriptions

### Migration Checklist

- [ ] Supabase project aangemaakt
- [ ] Environment variables ingesteld
- [ ] Database schema gemigreerd
- [ ] Authentication getest
- [ ] Data CRUD operaties getest
- [ ] Real-time subscriptions getest
- [ ] File uploads getest (indien gebruikt)
- [ ] Production deployment getest

## Support

Voor vragen over de migratie:
1. Check de Supabase documentatie
2. Bekijk de code comments in de nieuwe bestanden
3. Test lokaal met Supabase CLI

## Rollback Plan

Als er problemen zijn, kun je tijdelijk terug naar Firebase:
1. Zet `VITE_USE_FIREBASE=true` in je .env
2. Gebruik de oude api-firestore.ts bestanden
3. Deploy de vorige versie

De nieuwe Supabase code is backwards compatible en kan naast Firebase draaien tijdens de transitie.