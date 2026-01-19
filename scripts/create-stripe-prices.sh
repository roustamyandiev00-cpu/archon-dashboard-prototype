#!/bin/bash

# Stripe Prices Setup Script
# Dit script maakt alle benodigde prijzen aan voor de 3 producten

echo "🔧 Stripe Prices Setup"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is niet geïnstalleerd!"
    echo ""
    echo "Installeer met:"
    echo "  brew install stripe/stripe-cli/stripe"
    echo ""
    echo "Of download van: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Check if logged in
if ! stripe config --list &> /dev/null; then
    echo "⚠️  Je bent niet ingelogd bij Stripe CLI"
    echo "Run: stripe login"
    exit 1
fi

echo "✅ Stripe CLI gevonden"
echo ""

# Product IDs (vul deze in met jouw product IDs)
STARTER_PRODUCT="prod_Tp18HNIdsA9LEw"
GROWTH_PRODUCT="prod_Tp1BSrNJqQFvxM"
ENTERPRISE_PRODUCT="prod_Tp1CaXyrI6yIin"

echo "📦 Producten:"
echo "  Starter: $STARTER_PRODUCT"
echo "  Growth: $GROWTH_PRODUCT"
echo "  Enterprise: $ENTERPRISE_PRODUCT"
echo ""

# Maak prijzen aan
echo "💰 Prijzen aanmaken..."
echo ""

# Starter Plan - Monthly
echo "1/6 Starter Monthly (€29)..."
STARTER_MONTHLY=$(stripe prices create \
  --product=$STARTER_PRODUCT \
  --unit-amount=2900 \
  --currency=eur \
  --recurring[interval]=month \
  --nickname="Starter Monthly" \
  | grep "^id" | awk '{print $2}')
echo "    ✅ $STARTER_MONTHLY"

# Starter Plan - Yearly
echo "2/6 Starter Yearly (€290)..."
STARTER_YEARLY=$(stripe prices create \
  --product=$STARTER_PRODUCT \
  --unit-amount=29000 \
  --currency=eur \
  --recurring[interval]=year \
  --nickname="Starter Yearly" \
  | grep "^id" | awk '{print $2}')
echo "    ✅ $STARTER_YEARLY"

# Growth Plan - Monthly
echo "3/6 Growth Monthly (€79)..."
GROWTH_MONTHLY=$(stripe prices create \
  --product=$GROWTH_PRODUCT \
  --unit-amount=7900 \
  --currency=eur \
  --recurring[interval]=month \
  --nickname="Growth Monthly" \
  | grep "^id" | awk '{print $2}')
echo "    ✅ $GROWTH_MONTHLY"

# Growth Plan - Yearly
echo "4/6 Growth Yearly (€790)..."
GROWTH_YEARLY=$(stripe prices create \
  --product=$GROWTH_PRODUCT \
  --unit-amount=79000 \
  --currency=eur \
  --recurring[interval]=year \
  --nickname="Growth Yearly" \
  | grep "^id" | awk '{print $2}')
echo "    ✅ $GROWTH_YEARLY"

# Enterprise Plan - Monthly
echo "5/6 Enterprise Monthly (€199)..."
ENTERPRISE_MONTHLY=$(stripe prices create \
  --product=$ENTERPRISE_PRODUCT \
  --unit-amount=19900 \
  --currency=eur \
  --recurring[interval]=month \
  --nickname="Enterprise Monthly" \
  | grep "^id" | awk '{print $2}')
echo "    ✅ $ENTERPRISE_MONTHLY"

# Enterprise Plan - Yearly
echo "6/6 Enterprise Yearly (€1990)..."
ENTERPRISE_YEARLY=$(stripe prices create \
  --product=$ENTERPRISE_PRODUCT \
  --unit-amount=199000 \
  --currency=eur \
  --recurring[interval]=year \
  --nickname="Enterprise Yearly" \
  | grep "^id" | awk '{print $2}')
echo "    ✅ $ENTERPRISE_YEARLY"

echo ""
echo "✅ Alle prijzen aangemaakt!"
echo ""
echo "📋 Kopieer deze naar .env.local:"
echo ""
echo "VITE_STRIPE_PRICE_STARTER_MONTHLY=$STARTER_MONTHLY"
echo "VITE_STRIPE_PRICE_STARTER_YEARLY=$STARTER_YEARLY"
echo "VITE_STRIPE_PRICE_GROWTH_MONTHLY=$GROWTH_MONTHLY"
echo "VITE_STRIPE_PRICE_GROWTH_YEARLY=$GROWTH_YEARLY"
echo "VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY=$ENTERPRISE_MONTHLY"
echo "VITE_STRIPE_PRICE_ENTERPRISE_YEARLY=$ENTERPRISE_YEARLY"
echo ""
