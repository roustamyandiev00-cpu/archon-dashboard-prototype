# 💳 Stripe Setup - Stap voor Stap

## Status
✅ Firebase is al geconfigureerd!
⏳ Stripe moet nog worden ingevuld

## Stap 1: Stripe API Keys

1. **Ga naar Stripe Dashboard:**
   ```
   https://dashboard.stripe.com/test/apikeys
   ```

2. **Kopieer de keys:**
   - **Publishable key** (begint met `pk_test_...`)
     → Vul in bij: `VITE_STRIPE_PUBLISHABLE_KEY`
   
   - **Secret key** (begint met `sk_test_...`)
     → Klik op "Reveal test key"
     → Vul in bij: `STRIPE_SECRET_KEY`

## Stap 2: Stripe Producten Aanmaken

1. **Ga naar Products:**
   ```
   https://dashboard.stripe.com/test/products
   ```

2. **Maak 3 producten aan:**

### Product 1: Starter Plan
- Naam: `Starter Plan`
- Beschrijving: `Perfect voor kleine bouwbedrijven`
- Maak 2 prijzen aan:
  - **Maandelijks**: €29/maand
    → Kopieer Price ID naar: `VITE_STRIPE_PRICE_STARTER_MONTHLY`
  - **Jaarlijks**: €290/jaar (€24.17/maand)
    → Kopieer Price ID naar: `VITE_STRIPE_PRICE_STARTER_YEARLY`

### Product 2: Growth Plan
- Naam: `Growth Plan`
- Beschrijving: `Voor groeiende bouwbedrijven`
- Maak 2 prijzen aan:
  - **Maandelijks**: €79/maand
    → Kopieer Price ID naar: `VITE_STRIPE_PRICE_GROWTH_MONTHLY`
  - **Jaarlijks**: €790/jaar (€65.83/maand)
    → Kopieer Price ID naar: `VITE_STRIPE_PRICE_GROWTH_YEARLY`

### Product 3: Enterprise Plan
- Naam: `Enterprise Plan`
- Beschrijving: `Voor grote bouwbedrijven`
- Maak 2 prijzen aan:
  - **Maandelijks**: €199/maand
    → Kopieer Price ID naar: `VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY`
  - **Jaarlijks**: €1990/jaar (€165.83/maand)
    → Kopieer Price ID naar: `VITE_STRIPE_PRICE_ENTERPRISE_YEARLY`

## Stap 3: Webhook Setup

1. **Ga naar Webhooks:**
   ```
   https://dashboard.stripe.com/test/webhooks
   ```

2. **Klik op "Add endpoint"**

3. **Vul in:**
   - Endpoint URL: `http://localhost:3000/api/billing/webhook`
     (Voor productie: `https://jouw-domain.com/api/billing/webhook`)
   
   - Events selecteren:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Kopieer Signing Secret:**
   - Begint met `whsec_...`
   - Vul in bij: `STRIPE_WEBHOOK_SECRET`

## Stap 4: Test de Setup

1. **Start de app:**
   ```bash
   pnpm dev
   ```

2. **Ga naar pricing pagina:**
   ```
   http://localhost:3000/pricing
   ```

3. **Klik op een plan**

4. **Test met Stripe test card:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Elke datum in de toekomst (bijv. 12/34)
   - CVC: Elke 3 cijfers (bijv. 123)
   - ZIP: Elke 5 cijfers (bijv. 12345)

## Stap 5: Webhook Testing (Lokaal)

Voor lokale webhook testing heb je Stripe CLI nodig:

```bash
# Installeer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks naar localhost
stripe listen --forward-to localhost:3000/api/billing/webhook

# Kopieer de webhook signing secret die je ziet
# Vul deze in bij STRIPE_WEBHOOK_SECRET
```

## Checklist

- [ ] Stripe API keys ingevuld
- [ ] 3 producten aangemaakt in Stripe
- [ ] 6 price IDs gekopieerd (2 per product)
- [ ] Webhook endpoint aangemaakt
- [ ] Webhook secret gekopieerd
- [ ] Test betaling gedaan met test card
- [ ] Webhook events ontvangen

## Troubleshooting

### "Invalid API key"
→ Check of je `sk_test_...` gebruikt (niet `sk_live_...`)

### "No such price"
→ Check of de Price IDs correct zijn gekopieerd

### "Webhook signature verification failed"
→ Check of `STRIPE_WEBHOOK_SECRET` correct is ingevuld

### Betalingen werken niet
→ Check browser console voor errors
→ Check of alle env vars zijn ingevuld
→ Herstart de dev server na het aanpassen van .env.local

## Volgende Stappen

Na het invullen van alle Stripe credentials:

1. **Herstart de dev server:**
   ```bash
   # Stop de server (Ctrl+C)
   pnpm dev
   ```

2. **Test de volledige flow:**
   - Registreer een account
   - Kies een plan
   - Voer test betaling uit
   - Check of je toegang hebt tot modules

3. **Check Stripe Dashboard:**
   - Ga naar "Payments" om betalingen te zien
   - Ga naar "Customers" om klanten te zien
   - Ga naar "Subscriptions" om abonnementen te zien

## Kosten

**Test Mode:**
- ✅ Gratis
- ✅ Geen echte betalingen
- ✅ Onbeperkt testen

**Live Mode:**
- 2.9% + €0.25 per transactie (Europese kaarten)
- Geen maandelijkse kosten
- Betaal alleen voor succesvolle transacties

## Support

Stripe documentatie: https://stripe.com/docs
Stripe support: https://support.stripe.com
