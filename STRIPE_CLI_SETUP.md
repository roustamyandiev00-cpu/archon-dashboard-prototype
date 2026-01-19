# 🔧 Stripe Prijzen Aanmaken via CLI

## Stap 1: Installeer Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Of download van:
# https://stripe.com/docs/stripe-cli
```

## Stap 2: Login bij Stripe

```bash
stripe login
```

Dit opent je browser om in te loggen.

## Stap 3: Run het script

```bash
./scripts/create-stripe-prices.sh
```

Dit script maakt automatisch alle 6 prijzen aan:
- ✅ Starter Monthly (€29)
- ✅ Starter Yearly (€290)
- ✅ Growth Monthly (€79)
- ✅ Growth Yearly (€790)
- ✅ Enterprise Monthly (€199)
- ✅ Enterprise Yearly (€1990)

## Stap 4: Kopieer de output

Het script geeft je de Price IDs. Kopieer ze naar `.env.local`:

```env
VITE_STRIPE_PRICE_STARTER_MONTHLY=price_...
VITE_STRIPE_PRICE_STARTER_YEARLY=price_...
VITE_STRIPE_PRICE_GROWTH_MONTHLY=price_...
VITE_STRIPE_PRICE_GROWTH_YEARLY=price_...
VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
VITE_STRIPE_PRICE_ENTERPRISE_YEARLY=price_...
```

## Troubleshooting

### "stripe: command not found"
→ Installeer Stripe CLI eerst

### "You are not logged in"
→ Run: `stripe login`

### "Invalid product ID"
→ Check of de Product IDs in het script correct zijn

## Alternatief: Handmatig via Dashboard

Als je de CLI niet wilt gebruiken, kun je de prijzen ook handmatig aanmaken:

1. Ga naar: https://dashboard.stripe.com/products
2. Klik op elk product
3. Klik "Add another price"
4. Selecteer "Recurring"
5. Vul bedrag en periode in
6. Kopieer de Price ID
