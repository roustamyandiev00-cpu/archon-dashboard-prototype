# 🔑 Credentials Guide - Waar vind ik wat?

## Overzicht

Je hebt verschillende credentials nodig afhankelijk van welke features je wilt gebruiken.

## 📋 Checklist

### Minimaal (Demo Mode)
- ❌ Geen credentials nodig!
- De app werkt out-of-the-box met localStorage

### Voor Firebase (Optioneel)
- [ ] Firebase Project ID
- [ ] Firebase API Key
- [ ] Firebase Auth Domain
- [ ] Firebase Storage Bucket
- [ ] Firebase Messaging Sender ID
- [ ] Firebase App ID

### Voor Stripe (Optioneel)
- [ ] Stripe Secret Key
- [ ] Stripe Webhook Secret
- [ ] Stripe Price IDs (Starter, Growth, Enterprise)

### Voor AI Assistant (Optioneel)
- [ ] OpenAI API Key

---

## 🔥 Firebase Credentials

### Waar vind ik deze?

1. **Ga naar Firebase Console:**
   ```
   https://console.firebase.google.com
   ```

2. **Selecteer je project** (of maak een nieuw project aan)

3. **Ga naar Project Settings** (tandwiel icoon linksboven)

4. **Scroll naar "Your apps"** → Klik op het web icoon `</>`

5. **Kopieer de config:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",              // ← VITE_FIREBASE_API_KEY
     authDomain: "project.firebaseapp.com",  // ← VITE_FIREBASE_AUTH_DOMAIN
     projectId: "project-id",        // ← VITE_FIREBASE_PROJECT_ID
     storageBucket: "project.appspot.com",   // ← VITE_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "123456",    // ← VITE_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:123:web:abc"          // ← VITE_FIREBASE_APP_ID
   };
   ```

### Invullen in .env.local:
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=jouw-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jouw-project-id
VITE_FIREBASE_STORAGE_BUCKET=jouw-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

---

## 💳 Stripe Credentials

### Waar vind ik deze?

1. **Ga naar Stripe Dashboard:**
   ```
   https://dashboard.stripe.com
   ```

2. **Voor Secret Key:**
   - Klik op "Developers" (rechtsboven)
   - Klik op "API keys"
   - Kopieer de "Secret key" (begint met `sk_test_...` voor test mode)
   
   ⚠️ **LET OP:** Gebruik NOOIT de live key (`sk_live_...`) tijdens development!

3. **Voor Webhook Secret:**
   - Ga naar "Developers" → "Webhooks"
   - Klik op "Add endpoint"
   - URL: `https://jouw-domain.com/api/billing/webhook`
   - Events selecteren: `checkout.session.completed`, `customer.subscription.updated`, etc.
   - Kopieer de "Signing secret" (begint met `whsec_...`)

4. **Voor Price IDs:**
   - Ga naar "Products" in het menu
   - Maak 3 producten aan:
     - Starter Plan
     - Growth Plan  
     - Enterprise Plan
   - Voor elk product, maak een "Price" aan
   - Kopieer de Price ID (begint met `price_...`)

### Invullen in .env.local:
```env
STRIPE_SECRET_KEY=sk_test_51A...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_1A...
STRIPE_PRICE_GROWTH=price_1B...
STRIPE_PRICE_ENTERPRISE=price_1C...
```

### Test Mode vs Live Mode

**Test Mode** (voor development):
- Secret key: `sk_test_...`
- Publishable key: `pk_test_...`
- Test credit cards: `4242 4242 4242 4242`

**Live Mode** (voor productie):
- Secret key: `sk_live_...`
- Publishable key: `pk_live_...`
- Echte betalingen!

---

## 🤖 OpenAI Credentials

### Waar vind ik deze?

1. **Ga naar OpenAI Platform:**
   ```
   https://platform.openai.com
   ```

2. **Maak een account aan** (als je die nog niet hebt)

3. **Ga naar API Keys:**
   - Klik op je profiel (rechtsboven)
   - Klik op "View API keys"
   - Klik op "Create new secret key"
   - Geef het een naam (bijv. "Archon Dashboard")
   - Kopieer de key (begint met `sk-...`)
   
   ⚠️ **LET OP:** Je kunt de key maar 1 keer zien! Bewaar hem veilig.

### Invullen in .env.local:
```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

### Kosten

OpenAI is **niet gratis**. Geschatte kosten:
- GPT-4o-mini: ~$0.15 per 1M input tokens
- GPT-4o: ~$2.50 per 1M input tokens

Voor een dashboard met 100 users: ~$5-20/maand

---

## 📝 .env.local Template

Kopieer dit naar `.env.local` in de root van je project:

```env
# ============================================
# FIREBASE (Optioneel - voor real-time data)
# ============================================
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Emulator mode (development only)
VITE_USE_FIREBASE_EMULATORS=true

# ============================================
# STRIPE (Optioneel - voor betalingen)
# ============================================
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_GROWTH=
STRIPE_PRICE_ENTERPRISE=
STRIPE_TRIAL_DAYS=14

# ============================================
# OPENAI (Optioneel - voor AI assistent)
# ============================================
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# ============================================
# APP CONFIG
# ============================================
APP_BASE_URL=http://localhost:3000
```

---

## 🚀 Quick Start Scenarios

### Scenario 1: Alleen Demo Mode (Geen credentials)
```bash
# Niets invullen!
pnpm dev
```
✅ Werkt direct met localStorage

### Scenario 2: Met Firebase (Real-time data)
```bash
# 1. Vul Firebase credentials in
# 2. Start emulators
firebase emulators:start

# 3. Start app
VITE_USE_FIREBASE_EMULATORS=true pnpm dev
```

### Scenario 3: Met Stripe (Betalingen)
```bash
# 1. Vul Stripe credentials in
# 2. Start app
pnpm dev

# 3. Test met test credit card: 4242 4242 4242 4242
```

### Scenario 4: Alles (Full stack)
```bash
# 1. Vul alle credentials in
# 2. Start Firebase emulators
firebase emulators:start

# 3. Start app
pnpm dev
```

---

## ⚠️ Security Checklist

- [ ] **NOOIT** credentials committen naar Git
- [ ] `.env.local` staat in `.gitignore`
- [ ] Gebruik test keys tijdens development
- [ ] Gebruik environment variables in productie
- [ ] Roteer keys regelmatig
- [ ] Beperk API key permissions waar mogelijk

---

## 🆘 Troubleshooting

### "Firebase not configured"
→ Vul Firebase credentials in `.env.local`

### "Stripe error: Invalid API key"
→ Check of je `sk_test_...` gebruikt (niet `sk_live_...`)

### "OpenAI API error: Incorrect API key"
→ Check of de key begint met `sk-proj-...` of `sk-...`

### "Environment variables not loading"
→ Herstart de dev server na het aanpassen van `.env.local`

---

## 📚 Meer Info

- Firebase Setup: `QUICK_START.md`
- Stripe Setup: Zie Stripe Dashboard → Developers → Documentation
- OpenAI Setup: https://platform.openai.com/docs

---

**Tip:** Begin met demo mode (geen credentials) en voeg features toe wanneer je ze nodig hebt!
