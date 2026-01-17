# ✅ VERCEL DEPLOYMENT CHECKLIST

## 📋 Pre-Deployment Checklist

- [x] ✅ `vercel.json` configuratie gemaakt
- [x] ✅ API routes naar `/api/` folder verplaatst
- [x] ✅ Vite build output geconfigureerd naar `dist/client`
- [x] ✅ `.env.example` bestand toegevoegd
- [x] ✅ `@vercel/node` dependency toegevoegd
- [x] ✅ `.gitignore` bevat alle nodige excludes
- [x] ✅ `DEPLOYMENT.md` met volledige instructies
- [x] ✅ Theme toggle functionaliteit getest en werkend

## 🚀 Deployment Stappen

### 1. Push naar Git Repository

```bash
# Initialiseer git (als nog niet gedaan)
git init

# Voeg alle bestanden toe
git add .

# Commit je wijzigingen
git commit -m "Prepare for Vercel deployment with theme toggle fix"

# Voeg remote repository toe (vervang met jouw URL)
git remote add origin https://github.com/jouw-username/archon-dashboard.git

# Push naar GitHub/GitLab/Bitbucket
git push -u origin main
```

### 2. Deploy via Vercel Dashboard

1. **Ga naar [vercel.com/new](https://vercel.com/new)**
2. **Selecteer je Git repository**
3. **Vercel detecteert automatisch de instellingen:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist/client`
4. **Klik "Deploy"**
5. **Wacht 2-3 minuten**
6. **✨ Klaar! Je site is live**

### 3. Optionele Environment Variables

In Vercel Dashboard > Project Settings > Environment Variables:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## 🧪 Test na Deployment

- [ ] Homepage laadt correct
- [ ] Dashboard route werkt (`/dashboard`)
- [ ] Dark/Light mode toggle werkt
- [ ] Alle navigatie links werken
- [ ] Responsive design op mobile
- [ ] AI Assistant endpoint bereikbaar (`/api/assistant`)

## 📱 Custom Domain (Optioneel)

1. Ga naar **Project Settings > Domains**
2. Voeg je domein toe (bijv. `archon.yourdomain.com`)
3. Update DNS records:
   ```
   Type: CNAME
   Name: archon (of @)
   Value: cname.vercel-dns.com
   ```
4. Wacht 24-48 uur voor DNS propagatie

## 🔄 Updates Deployen

Elke keer dat je naar je `main` branch pusht, wordt automatisch een nieuwe deployment gestart!

```bash
git add .
git commit -m "Update feature X"
git push
# Vercel deploy automatisch! 🎉
```

## 🎯 Production URL

Na deployment krijg je een URL zoals:
- `https://archon-dashboard-xyz.vercel.app`
- Of je custom domain

## ⚡ Vercel Features

- ✅ Automatische SSL certificaten
- ✅ Global CDN (snelle load times wereldwijd)
- ✅ Serverless Functions voor API routes
- ✅ Automatic preview deployments voor PRs
- ✅ Analytics en performance monitoring
- ✅ Zero-downtime deployments

## 🆘 Problemen Oplossen

### Build Error: "Cannot find module"
```bash
# Lokaal testen
npm install
npm run build
```

### API 500 Error
- Check Vercel Function logs in Dashboard
- Verifieer environment variables

### 404 op alle routes behalve homepage
- Check of `vercel.json` correct is
- Rewrites moeten alle routes naar `/index.html` sturen

### Dark/Light mode werkt niet
- Clear browser cache (Ctrl + Shift + R)
- Check browser console voor errors

## 📊 Performance Tips

- ✅ Images zijn geoptimaliseerd
- ✅ Code splitting door Vite
- ✅ Tree shaking enabled
- ✅ CSS minification

---

**🎉 Je bent klaar om te deployen!**

**Quick Start:**
```bash
vercel --prod
```

**Of gebruik de Vercel Dashboard voor meer controle.**
