# 🏗️ Archon Dashboard - Bouw & Renovatie Platform

Een modern dashboard voor bouwbedrijven met AI-assistentie, klantenbeheer, facturatie en meer.

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

- 👥 **Klantenbeheer** - CRUD operaties, import/export CSV
- 📄 **Facturen** - Genereer en beheer facturen
- 📊 **Projecten** - Track bouwprojecten
- 💰 **Financiën** - Uitgaven, bankieren, inzichten
- 🤖 **AI Assistent** - Geïntegreerde AI hulp
- 📱 **Mobile Ready** - Responsive design
- 🌓 **Dark/Light Mode** - Thema ondersteuning

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

- `QUICK_START.md` - Gedetailleerde setup instructies
- `BACKEND_STATUS.md` - Backend implementatie status
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
- Express
- Firebase (Auth, Firestore, Functions)
- Stripe (betalingen)

## 🔐 Environment Variables

Kopieer `.env.example` naar `.env.local` en vul de waarden in:

```env
# Firebase (optioneel)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...

# OpenAI (optioneel - voor AI assistent)
OPENAI_API_KEY=...

# Stripe (optioneel - voor betalingen)
STRIPE_SECRET_KEY=...
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

**Status:** ✅ Demo mode werkend | 🔄 Firebase integratie in progress
