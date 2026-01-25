# 📚 API Documentatie

## Overzicht

De Archon Dashboard API bestaat uit Vercel Serverless Functions die Firebase gebruiken voor authenticatie en data opslag.

## Authenticatie

Alle API endpoints vereisen Firebase Authentication. Stuur de Firebase ID token in de `Authorization` header:

```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Klanten (Customers)

#### `GET /api/klanten`
Haal alle klanten op voor de ingelogde gebruiker.

**Response:**
```json
{
  "klanten": [
    {
      "id": "klant-id",
      "naam": "John Doe",
      "email": "john@example.com",
      "telefoon": "+31612345678",
      "type": "zakelijk",
      "status": "actief",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/klanten`
Maak een nieuwe klant aan.

**Request Body:**
```json
{
  "naam": "John Doe",
  "email": "john@example.com",
  "telefoon": "+31612345678",
  "type": "zakelijk",
  "status": "actief"
}
```

#### `GET /api/klanten/[id]`
Haal een specifieke klant op.

#### `PUT /api/klanten/[id]`
Update een klant.

#### `DELETE /api/klanten/[id]`
Verwijder een klant.

---

### Facturen (Invoices)

#### `GET /api/facturen`
Haal alle facturen op.

**Response:**
```json
{
  "facturen": [
    {
      "id": "factuur-id",
      "factuurNummer": "F2025-123456",
      "klantId": "klant-id",
      "klantNaam": "John Doe",
      "datum": "2025-01-15",
      "vervaldatum": "2025-02-15",
      "totaal": 1000.00,
      "status": "verzonden"
    }
  ]
}
```

#### `POST /api/facturen`
Maak een nieuwe factuur aan. Factuurnummer wordt automatisch gegenereerd.

#### `GET /api/facturen/[id]`
Haal een specifieke factuur op.

#### `PUT /api/facturen/[id]`
Update een factuur.

#### `DELETE /api/facturen/[id]`
Verwijder een factuur.

---

### Projecten (Projects)

#### `GET /api/projecten`
Haal alle projecten op.

#### `POST /api/projecten`
Maak een nieuw project aan.

#### `GET /api/projecten/[id]`
Haal een specifiek project op.

#### `PUT /api/projecten/[id]`
Update een project.

#### `DELETE /api/projecten/[id]`
Verwijder een project.

---

### Offertes (Quotes)

#### `GET /api/offertes`
Haal alle offertes op.

#### `POST /api/offertes`
Maak een nieuwe offerte aan. Offertenummer wordt automatisch gegenereerd.

#### `GET /api/offertes/[id]`
Haal een specifieke offerte op.

#### `PUT /api/offertes/[id]`
Update een offerte.

#### `DELETE /api/offertes/[id]`
Verwijder een offerte.

---

### Email

#### `POST /api/email/send`
Verstuur een email.

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Factuur #123",
  "html": "<h1>Uw factuur</h1><p>...</p>",
  "text": "Uw factuur\n\n..."
}
```

**Ondersteunde providers:**
- Resend (via `RESEND_API_KEY`)
- SendGrid (via `SENDGRID_API_KEY`)
- Stub mode (als geen provider geconfigureerd)

---

### Files

#### `POST /api/files/upload`
Upload een bestand.

**Request Body:**
```json
{
  "name": "factuur.pdf",
  "contentType": "application/pdf",
  "data": "base64-encoded-file-data"
}
```

**Response:**
```json
{
  "id": "file-id",
  "name": "factuur.pdf",
  "contentType": "application/pdf",
  "size": 12345,
  "url": "https://storage.googleapis.com/...",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### `GET /api/files/[id]`
Haal bestandsinformatie op.

#### `DELETE /api/files/[id]`
Verwijder een bestand.

---

### Billing

#### `POST /api/billing/checkout`
Maak een Stripe checkout sessie.

**Request Body:**
```json
{
  "planId": "pro",
  "isYearly": false
}
```

#### `POST /api/billing/webhook`
Stripe webhook handler (automatisch aangeroepen door Stripe).

---

### AI Assistant

#### `POST /api/assistant`
Chat met de AI assistant.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "text": "Maak een offerte voor klant X"
    }
  ]
}
```

**Response:**
```json
{
  "reply": "Graag. Welke klant, welke werkzaamheden..."
}
```

---

## Environment Variables

Vereiste environment variables voor productie:

```env
# Firebase
FIREBASE_SERVICE_ACCOUNT_KEY=<base64-encoded-service-account-json>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...

# Email (optioneel)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
# OF
SENDGRID_API_KEY=SG....
EMAIL_FROM=noreply@archon.app

# AI (optioneel)
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-pro
```

---

## Error Handling

Alle endpoints retourneren errors in dit formaat:

```json
{
  "error": "Error message"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Firestore Hooks (Frontend)

Voor real-time updates, gebruik de Firestore hooks in `client/src/lib/api-firestore.ts`:

```typescript
import { useKlanten, useFacturen, useProjecten, useOffertes } from '@/lib/api-firestore';

// Real-time klanten met auto-sync
const { klanten, loading, createKlant, updateKlant, deleteKlant } = useKlanten();
```

Deze hooks gebruiken Firestore real-time listeners voor automatische updates.
