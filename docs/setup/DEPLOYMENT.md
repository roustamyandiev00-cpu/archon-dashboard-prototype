# ARCHON.AI Dashboard - Deployment Guide

## 🚀 Deploy naar Vercel

### Optie 1: Via Vercel Dashboard (Aanbevolen)

1. **Ga naar [vercel.com](https://vercel.com)** en log in
2. Klik op **"Add New Project"**
3. **Import je Git repository** (GitHub/GitLab/Bitbucket)
4. **Project instellingen:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (laat leeg)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/client`
   - **Install Command:** `npm install`

5. **Environment Variables** (optioneel):
   - Klik op "Environment Variables"
   - Voeg toe indien nodig:
     - `OPENAI_API_KEY` - Voor AI assistant functionaliteit
     - `OPENAI_MODEL` - Model naam (bijv. `gpt-4o-mini`)

6. Klik op **"Deploy"**
7. Wacht 2-3 minuten tot de deployment klaar is
8. Je app is nu live! 🎉

### Optie 2: Via Vercel CLI

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login bij Vercel
vercel login

# Deploy naar production
vercel --prod
```

## 📁 Project Structuur

```
archon-dashboard-prototype/
├── client/              # Frontend React applicatie
│   ├── src/
│   ├── public/
│   └── index.html
├── api/                 # Vercel Serverless Functions
│   └── assistant.ts     # AI Assistant API endpoint
├── server/              # Local development server (niet gebruikt in productie)
├── dist/
│   └── client/          # Build output voor Vercel
├── vercel.json          # Vercel configuratie
└── package.json
```

## 🔧 Lokale Development

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Open browser naar http://localhost:3004
```

## 🌐 API Endpoints

- `GET /` - Frontend applicatie
- `POST /api/assistant` - AI Assistant chat endpoint

## ⚙️ Environment Variables

Optioneel (alleen voor AI functionaliteit):

- `OPENAI_API_KEY` - Je OpenAI API key
- `OPENAI_MODEL` - OpenAI model (default: `gpt-4o-mini`)

## 🎨 Features

- ✅ Dark/Light mode toggle
- ✅ Responsive design (mobile + desktop)
- ✅ Dashboard met metrics en charts
- ✅ AI Assistant integratie
- ✅ Modern glassmorphism UI
- ✅ Smooth animations met Framer Motion

## 📝 Na Deployment

1. **Test de live URL** die Vercel geeft
2. **Voeg een custom domain toe** (optioneel):
   - Ga naar Project Settings > Domains
   - Voeg je domein toe
   - Update DNS records volgens Vercel instructies

3. **Monitor je deployment:**
   - Vercel Dashboard > Deployments
   - Bekijk logs en analytics

## 🐛 Troubleshooting

### Build fails
- Check of alle dependencies in `package.json` staan
- Zorg dat Node version ≥ 18

### API niet bereikbaar
- Vercel Functions draaien op `/api/*`
- Check of `vercel.json` correct is geconfigureerd

### 404 op routes
- Single Page Application routing wordt afgehandeld door `vercel.json` rewrites
- Alle routes worden naar `/index.html` gerewrite

## 🆘 Support

Bij problemen:
1. Check Vercel deployment logs
2. Test lokaal met `npm run dev`
3. Verifieer `vercel.json` configuratie

---

**Gemaakt met ❤️ voor bouwprofessionals**
