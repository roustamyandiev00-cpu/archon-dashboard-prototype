# 🏗️ Archon Dashboard - Bouw & Renovatie Platform

Een modern dashboard voor bouwbedrijven met AI-assistentie, klantenbeheer, facturatie en meer.

## 🎉 NEW: Field-to-Invoice Features

✅ **Just Implemented** - Complete mobile workflow voor offertes:
- 📸 **Photo Upload** - Upload bouwfoto's naar Supabase Storage
- 🤖 **AI Analysis** - Google Gemini vision voor automatische analyse
- 📄 **PDF Export** - Professionele offertes en facturen
- 🔄 **Complete Workflow** - Van foto tot factuur in 6 stappen

👉 **[START HERE](START_HERE_FIELD_TO_INVOICE.md)** voor quick start guide!

## 📸 Dashboard Voorbeeld

![Dashboard Screenshot](/client/public/images/dashboard-screenshot.png)

*Dashboard overzicht met omzet, leads, projecten en AI-assistentie*

## 🚀 Quick Start

```bash
# Installeer dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
http://localhost:3000
```

## ✨ Features

### Core Features
- 👥 **Klantenbeheer** - CRUD operaties, import/export CSV
- 📄 **Facturen** - Genereer en beheer facturen
- 📊 **Projecten** - Track bouwprojecten
- 💰 **Financiën** - Uitgaven, bankieren, inzichten
- 🤖 **AI Assistent** - Geïntegreerde AI hulp
- 📱 **Mobile Ready** - Responsive design
- 🌓 **Dark/Light Mode** - Thema ondersteuning

### NEW: Field-to-Invoice Workflow
- 📸 **Media Upload** - Upload foto's en documenten naar Supabase Storage
- 🧠 **AI Image Analysis** - Automatische detectie van afmetingen, materialen, werkzaamheden
- 📝 **AI Scope Generation** - Genereer scope documenten uit spraak transcripties
- 💰 **AI Pricing** - Intelligente prijssuggesties op basis van marktdata
- 💬 **AI Chat Assistant** - Conversationele AI voor hulp bij offertes
- 📄 **PDF Export** - Professionele PDF's voor offertes en facturen
- 🔄 **Complete Workflow** - 6-stappen wizard van klant tot factuur

## 📁 Project Structuur

```
├── client/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/      # Pagina componenten
│   │   ├── components/ # Herbruikbare componenten
│   │   ├── lib/        # Utilities & API
│   │   └── contexts/   # React contexts
├── api/            # Backend API (Vercel Serverless Functions)
│   ├── billing/    # Stripe billing endpoints
│   └── lib/        # Shared backend utilities
├── shared/         # Shared types & schemas
└── docs/           # Documentatie
```

## 🔧 Development

### Demo Mode (Huidige setup)
```bash
pnpm dev
```
- Gebruikt localStorage voor data
- Geen backend nodig
- Perfect voor prototyping

### Met Firebase Emulators
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Start app
VITE_USE_FIREBASE_EMULATORS=true pnpm dev
```

## 📚 Documentatie

### Getting Started
- **[START_HERE_FIELD_TO_INVOICE.md](START_HERE_FIELD_TO_INVOICE.md)** - 🎉 NEW: Field-to-Invoice quick start
- `QUICK_START.md` - Gedetailleerde setup instructies
- `BACKEND_STATUS.md` - Backend implementatie status

### Field-to-Invoice Features
- **[docs/FIELD_TO_INVOICE_IMPLEMENTATION.md](docs/FIELD_TO_INVOICE_IMPLEMENTATION.md)** - Complete technische documentatie
- **[docs/QUICK_TEST_GUIDE.md](docs/QUICK_TEST_GUIDE.md)** - Stap-voor-stap test guide
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Status overzicht

### Other Documentation
- `DEPLOYMENT.md` - Deployment guide
- `PROJECT_STATUS.md` - Project overzicht
- `docs/archive/` - Gearchiveerde documentatie

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- Wouter (routing)
- Framer Motion

**Backend:**
- Supabase (Auth, Database, Storage)
- Express
- Stripe (betalingen)

**AI & ML:**
- Google Gemini API (vision & text)
- jsPDF (PDF generation)

## 🔐 Environment Variables

Kopieer `.env.example` naar `.env.local` en vul de waarden in:

```env
# Supabase (required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (optional - voor AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key

# OpenAI (optioneel - voor AI assistent)
OPENAI_API_KEY=...

# Stripe (optioneel - voor betalingen)
STRIPE_SECRET_KEY=...

# Demo mode
VITE_DEMO_MODE=false
```

## 📦 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build voor productie
pnpm preview      # Preview productie build
pnpm lint         # Run linter
```

## 🚢 Deployment

### Vercel (Aanbevolen)
```bash
vercel deploy
```

### Firebase Hosting
```bash
./scripts/deploy-firebase.sh
```

Zie `DEPLOYMENT.md` voor meer details.

## 🐛 Troubleshooting

**App laadt traag:**
- Check browser console voor errors
- Disable browser extensions
- Clear cache en reload

**Build errors:**
```bash
rm -rf node_modules dist
pnpm install
pnpm build
```

**Firebase errors:**
- Check `.env.local` configuratie
- Verify Firebase project settings

## 📄 License

Proprietary - Alle rechten voorbehouden

## 🤝 Support

Voor vragen of problemen, zie de documentatie in de `docs/` folder.

---

**Status:** ✅ Field-to-Invoice Complete | ✅ Demo mode werkend | 🔄 Firebase integratie in progress

**Latest Update:** January 23, 2026 - Field-to-Invoice features fully implemented
