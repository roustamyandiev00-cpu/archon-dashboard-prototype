# 🚀 Quick Start - Authenticatie Activeren

## ✅ Status Check
Alle authenticatie code is correct geïmplementeerd! Je hoeft alleen nog Firebase Authentication te activeren.

## 📝 Snelle Setup (5 minuten)

### Stap 1: Open Firebase Console
```bash
open https://console.firebase.google.com/project/ai-agent-5fab0/authentication
```

Of handmatig:
1. Ga naar https://console.firebase.google.com
2. Klik op project "ai-agent-5fab0"
3. Klik op "Authentication" in het linkermenu
4. Als je "Get Started" ziet, klik daarop

### Stap 2: Activeer Email/Password
1. Klik op tab "Sign-in method"
2. Klik op "Email/Password" in de lijst
3. Schakel de toggle IN bij "Email/Password"
4. Klik "Save"

✅ **Dat is alles! Minimale setup is klaar.**

### Optioneel: Activeer Google Login
1. Klik op "Google" in de lijst
2. Schakel de toggle IN
3. Vul je email in bij "Project support email"
4. Klik "Save"

### Optioneel: Activeer GitHub Login
1. Ga eerst naar: https://github.com/settings/developers
2. Klik "New OAuth App"
3. Vul in:
   - Name: "ARCHON Dashboard"  
   - Homepage: `https://ai-agent-5fab0.firebaseapp.com`
   - Callback: `https://ai-agent-5fab0.firebaseapp.com/__/auth/handler`
4. Klik "Register application"
5. Kopieer Client ID en Client Secret
6. Terug in Firebase Console:
   - Klik "GitHub" 
   - Schakel IN
   - Plak Client ID en Client Secret
   - Klik "Save"

## 🧪 Test de Authenticatie

```bash
# Start de development server
npm run dev

# Of met pnpm
pnpm dev
```

Open in je browser:
- Registratie: http://localhost:5173/register
- Login: http://localhost:5173/login

## 🎯 Wat werkt nu?

### ✅ Registratie
- Email + wachtwoord registratie
- Wachtwoord sterkte indicator
- Automatische account aanmaak in Firebase
- Redirect naar dashboard na registratie

### ✅ Login  
- Email + wachtwoord login
- Social login (Google, GitHub, Apple)
- Redirect naar dashboard na login
- "Onthoud mij" functionaliteit

### ✅ Beveiliging
- Protected routes (alleen voor ingelogde gebruikers)
- Automatic logout bij inactiviteit
- Secure password hashing (Firebase)
- CSRF bescherming

### ✅ User Experience
- Responsive design (mobile-first)
- Loading states
- Error handling met duidelijke meldingen
- Wachtwoord tonen/verbergen toggle

## 🔧 Troubleshooting

### "Email already in use" error
✅ Normaal - betekent dat de email al geregistreerd is

### "auth/configuration-not-found" bij social login
❌ Provider niet geactiveerd in Firebase Console - volg stap 2 hierboven

### "Invalid email" error
✅ Firebase validatie werkt - vul een geldig email adres in

### Pagina laadt niet
1. Check of de dev server draait: `npm run dev`
2. Check console voor errors: F12 > Console tab
3. Verifieer Firebase credentials in `.env.local`

## 📊 Check Geregistreerde Users

Firebase Console > Authentication > Users tab

Hier zie je alle geregistreerde gebruikers met:
- Email
- Registratie datum
- Provider (email, google.com, github.com)
- UID (unieke identifier)

## 🎉 Klaar!

De authenticatie is nu volledig werkend. Iedereen kan:
1. Een account aanmaken op /register
2. Inloggen op /login  
3. De dashboard gebruiken
4. Uitloggen

## 📚 Meer Info

Zie `AUTHENTICATIE_SETUP.md` voor uitgebreide documentatie.

