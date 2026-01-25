# Authenticatie Setup Guide

## ✅ Status
De registratie en login functionaliteit is al volledig geïmplementeerd in de code:

### Beschikbare Features:
- ✅ Email/wachtwoord registratie
- ✅ Email/wachtwoord login
- ✅ Google OAuth login/registratie
- ✅ GitHub OAuth login/registratie
- ✅ Apple OAuth login/registratie
- ✅ Wachtwoord sterkte indicator
- ✅ Protected routes
- ✅ Auth state management

## 🔧 Firebase Authentication Setup

### Stap 1: Open Firebase Console
1. Ga naar https://console.firebase.google.com
2. Selecteer project: **ai-agent-5fab0**
3. Klik op "Authentication" in het linkermenu
4. Klik op "Get Started" als Authentication nog niet is geactiveerd

### Stap 2: Activeer Email/Password Authentication
1. Ga naar tabblad "Sign-in method"
2. Klik op "Email/Password"
3. Schakel beide toggles in:
   - ✅ Email/Password
   - ✅ Email link (passwordless sign-in) - OPTIONEEL
4. Klik "Save"

### Stap 3: Activeer Google OAuth (Optioneel maar aanbevolen)
1. Klik op "Google" in de Sign-in providers lijst
2. Schakel in: "Enable"
3. Vul in:
   - Project support email: jouw email
   - Project public-facing name: "ARCHON Dashboard"
4. Klik "Save"

### Stap 4: Activeer GitHub OAuth (Optioneel)
1. Ga naar https://github.com/settings/developers
2. Klik "New OAuth App"
3. Vul in:
   - Application name: "ARCHON Dashboard"
   - Homepage URL: https://ai-agent-5fab0.firebaseapp.com
   - Authorization callback URL: https://ai-agent-5fab0.firebaseapp.com/__/auth/handler
4. Klik "Register application"
5. Kopieer de Client ID en Client Secret
6. Terug in Firebase Console, klik op "GitHub" en plak de credentials

## 🧪 Test de Authenticatie

Start de development server:
```bash
cd ~/Downloads/archon-dashboard-prototype
npm run dev
```

Test registratie op: http://localhost:5173/register
Test login op: http://localhost:5173/login

## 📋 Verificatie Checklist

- [ ] Firebase Authentication is geactiveerd
- [ ] Email/Password provider is ingeschakeld
- [ ] App draait op localhost
- [ ] Registratie werkt
- [ ] Login werkt
- [ ] Protected routes werken

