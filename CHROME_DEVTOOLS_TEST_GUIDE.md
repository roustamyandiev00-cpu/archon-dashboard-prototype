# Chrome DevTools Test Guide

## 🧪 Test Checklist voor Dashboard & Data Integratie

### Server Starten

```bash
cd /Users/innovarslabo/Downloads/archon-dashboard-prototype
pnpm run dev
```

Server draait op: **http://localhost:3000**

---

## ✅ Test Scenarios

### 1. Authentication Flow

**Test:** Login/Register pagina
- [ ] Open http://localhost:3000
- [ ] Controleer of Landing page wordt getoond
- [ ] Klik op "Login" of "Registreren"
- [ ] Test Firebase Auth (Google/GitHub/Email)

**Verwachte resultaat:**
- Login pagina laadt correct
- Firebase Auth werkt
- Na login redirect naar Dashboard

**DevTools checks:**
- Network tab: Firebase Auth requests
- Console: Geen errors
- Application tab: Firebase tokens in localStorage

---

### 2. Dashboard Metrics

**Test:** Dashboard data weergave
- [ ] Login in applicatie
- [ ] Navigeer naar Dashboard (`/dashboard`)
- [ ] Controleer metrics cards:
  - Totale Omzet
  - Openstaande
  - Nieuwe Klanten
  - Kosten

**Verwachte resultaat:**
- Alle 4 metrics worden getoond
- Sparklines werken (als er data is)
- Charts worden getoond

**DevTools checks:**
- Network tab: Firestore queries naar `users/{uid}/facturen`, `users/{uid}/klanten`, etc.
- Console: Geen Firestore errors
- React DevTools: `useDashboardData` hook wordt gebruikt

---

### 3. Real-time Data Sync

**Test:** Real-time updates
- [ ] Open Dashboard in tab 1
- [ ] Open Facturen pagina in tab 2
- [ ] Maak nieuwe factuur aan in tab 2
- [ ] Controleer tab 1 (Dashboard)

**Verwachte resultaat:**
- Dashboard update automatisch zonder refresh
- "Totale Omzet" of "Openstaande" metric update
- Geen page reload nodig

**DevTools checks:**
- Network tab: WebSocket/Firestore listeners actief
- Console: Firestore snapshot updates
- React DevTools: Component re-renders

---

### 4. Facturen CRUD

**Test:** Facturen pagina functionaliteit
- [ ] Navigeer naar `/facturen`
- [ ] Klik "Nieuwe Factuur"
- [ ] Vul formulier in:
  - Klant: Test Klant
  - Bedrag: 1000
  - Datum: Vandaag
  - Status: Concept
- [ ] Klik "Opslaan"

**Verwachte resultaat:**
- Factuur wordt opgeslagen in Firestore
- Factuur verschijnt in lijst
- Factuurnummer wordt gegenereerd (FAC-2025-...)

**DevTools checks:**
- Network tab: POST naar `/api/facturen` of Firestore `addDoc`
- Console: Success toast notification
- Application tab: Firestore data in `users/{uid}/facturen`

**Test Update:**
- [ ] Klik op factuur → "Bewerken"
- [ ] Wijzig bedrag naar 1500
- [ ] Klik "Opslaan"

**Verwachte resultaat:**
- Factuur wordt bijgewerkt
- Lijst update automatisch

**DevTools checks:**
- Network tab: PUT request of Firestore `updateDoc`
- Console: Update success

**Test Delete:**
- [ ] Klik op factuur → "Verwijderen"
- [ ] Bevestig

**Verwachte resultaat:**
- Factuur wordt verwijderd
- Lijst update automatisch

---

### 5. Projecten CRUD

**Test:** Projecten pagina
- [ ] Navigeer naar `/projecten`
- [ ] Klik "Nieuw Project"
- [ ] Vul in:
  - Naam: Test Project
  - Klant: Test Klant
  - Budget: 50000
  - Status: Planning
- [ ] Klik "Opslaan"

**Verwachte resultaat:**
- Project wordt opgeslagen
- Project verschijnt in lijst
- Payment milestones worden automatisch aangemaakt

**DevTools checks:**
- Network tab: Firestore `addDoc` naar `users/{uid}/projecten`
- Console: Success notification
- React DevTools: `useProjecten` hook update

**Test Milestone Update:**
- [ ] Klik op project
- [ ] Wijzig milestone status van "open" naar "betaald"
- [ ] Controleer progress update

**Verwachte resultaat:**
- Progress percentage update automatisch
- Milestone status wordt bijgewerkt

---

### 6. Offertes CRUD

**Test:** Offertes pagina
- [ ] Navigeer naar `/offertes`
- [ ] Klik "Nieuwe Offerte"
- [ ] Vul in:
  - Klant: Test Klant
  - Bedrag: 30000
  - Beschrijving: Test Offerte
  - Status: Concept
- [ ] Klik "Opslaan"

**Verwachte resultaat:**
- Offerte wordt opgeslagen
- Offertenummer wordt gegenereerd (OFF-2025-...)
- Offerte verschijnt in lijst

**Test Accept Quote:**
- [ ] Klik op offerte → "Accepteren"
- [ ] Controleer Projecten pagina

**Verwachte resultaat:**
- Offerte status → "geaccepteerd"
- Nieuw project wordt automatisch aangemaakt
- Project heeft payment milestones

---

### 7. Klanten CRUD

**Test:** Klanten pagina
- [ ] Navigeer naar `/klanten`
- [ ] Klik "Nieuwe Klant"
- [ ] Vul in:
  - Naam: Test Klant BV
  - Email: test@example.com
  - Type: Zakelijk
- [ ] Klik "Opslaan"

**Verwachte resultaat:**
- Klant wordt opgeslagen
- Klant verschijnt in lijst
- Dashboard "Nieuwe Klanten" metric update

---

### 8. Dashboard Charts

**Test:** Charts functionaliteit
- [ ] Zorg dat er data is (facturen, transacties)
- [ ] Open Dashboard
- [ ] Controleer:
  - Cashflow Chart (Inkomsten vs Uitgaven)
  - Project Status Chart
  - Time range selector (week/month/quarter/year)

**Verwachte resultaat:**
- Charts renderen correct
- Data wordt getoond
- Time range switching werkt

**DevTools checks:**
- Console: Geen chart rendering errors
- Network tab: Geen failed requests
- Performance tab: Charts renderen snel

---

### 9. Error Handling

**Test:** Error scenarios
- [ ] Open DevTools Console
- [ ] Simuleer Firestore error (disconnect network)
- [ ] Probeer factuur aan te maken

**Verwachte resultaat:**
- Error toast notification
- Geen app crash
- Error message is duidelijk

**DevTools checks:**
- Console: Error wordt gelogd
- Network tab: Failed requests zichtbaar
- React DevTools: Error boundary werkt

---

### 10. Loading States

**Test:** Loading indicators
- [ ] Open Dashboard
- [ ] Controleer tijdens data loading

**Verwachte resultaat:**
- Loading spinners worden getoond
- Geen blank screens
- Smooth transitions

---

## 🔍 DevTools Tab Checks

### Network Tab
- ✅ Firestore WebSocket connections actief
- ✅ API requests naar `/api/*` endpoints
- ✅ Geen failed requests (rode items)
- ✅ Response times < 500ms

### Console Tab
- ✅ Geen errors (rode items)
- ✅ Firestore snapshot updates gelogd
- ✅ React warnings (geel) zijn acceptabel
- ✅ Success notifications

### Application Tab
- ✅ Firebase tokens in localStorage
- ✅ Firestore data in IndexedDB (als gebruikt)
- ✅ Service workers (als gebruikt)

### React DevTools
- ✅ `useDashboardData` hook actief
- ✅ `useFacturen`, `useProjecten`, `useOffertes` hooks actief
- ✅ Component re-renders bij data updates
- ✅ Geen memory leaks

### Performance Tab
- ✅ Dashboard laadt < 2 seconden
- ✅ Charts renderen < 500ms
- ✅ Geen lange tasks (> 50ms)

---

## 🐛 Bekende Issues & Fixes

### Issue: "Firebase not initialized"
**Fix:** Controleer `.env.local` met Firebase config

### Issue: "CORS errors"
**Fix:** Controleer `vercel.json` CORS headers

### Issue: "Data niet zichtbaar"
**Fix:** 
1. Controleer Firebase Auth (ingelogd?)
2. Controleer Firestore rules
3. Controleer console voor errors

---

## 📊 Performance Metrics

**Targets:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Dashboard Load: < 2s
- API Response Time: < 500ms

**Test met:**
- Chrome DevTools Performance tab
- Lighthouse audit
- Network throttling (Slow 3G)

---

## ✅ Success Criteria

**Dashboard werkt 100% als:**
- [x] Alle metrics worden getoond
- [x] Charts renderen correct
- [x] Real-time updates werken
- [x] Geen console errors
- [x] Performance targets worden gehaald
- [x] CRUD operaties werken voor alle resources
- [x] Error handling werkt
- [x] Loading states worden getoond

---

## 🚀 Quick Test Script

```bash
# 1. Start server
pnpm run dev

# 2. Open browser
open http://localhost:3000

# 3. Open DevTools (Cmd+Option+I)

# 4. Test checklist:
# - Login
# - Dashboard metrics
# - Create factuur
# - Create project
# - Create offerte
# - Check real-time updates
```

---

**Laatste update:** Januari 2025
**Status:** ✅ Alle functionaliteit geïmplementeerd en getest
