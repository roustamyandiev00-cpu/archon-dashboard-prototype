# 🔧 Dashboard Fixes - Samenvatting

**Datum:** 20 januari 2026  
**Status:** In Progress

---

## 🚨 Originele Problemen

1. **Na registratie kan niet inloggen** - Users kunnen na account aanmaken niet meer inloggen
2. **Modules kunnen niet geselecteerd worden** - Module selectie pagina werkt niet
3. **Betalingen werken niet** - Users kunnen geen plan kiezen om het dashboard te gebruiken

---

## ✅ Toegepaste Fixes

### 1. **useUserProfile Hook - localStorage Fallback** ✅
**Bestand:** `client/src/hooks/useUserProfile.ts`

**Probleem:**  
De hook laadde alleen data van Firestore. Als Firestore faalde (of niet draaide), had de user geen profile data en werkte niets.

**Oplossing:**
- Hook probeert eerst Firestore
- Bij failure valt terug op localStorage
- Sync tussen Firestore en localStorage voor offline access
- Bij updateProfile() ook localStorage fallback

```typescript
// Voorbeeld van de fix:
const localData = localStorage.getItem('userProfile');
if (localData) {
  const parsedData = JSON.parse(localData);
  if (parsedData.uid === user.uid) {
    setProfile(parsedData);
  }
}
```

---

### 2. **Login Redirect Logic Fix** ✅
**Bestand:** `client/src/pages/Login.tsx`

**Probleem:**  
- Register → `/app/pricing`
- Login → `/dashboard` (zonder plan check)
- Als user uitlogt na registreren en weer inlogt, wordt direct naar dashboard gestuurd zonder plan/modules

**Oplossing:**
Login checkt nu localStorage/Firestore voor user profile en redirect naar:
- `/app/pricing` - Geen plan
- `/modules` - Plan bestaat maar geen modules geselecteerd  
- `/dashboard` - Alles compleet

```typescript
const hasActivePlan = userProfile?.billingStatus === "active" || userProfile?.billingStatus === "trialing";
const hasModules = (userProfile?.modules ?? []).length > 0;

if (!hasActivePlan) {
  targetPath = "/app/pricing";
} else if (!hasModules) {
  targetPath = "/modules";
} else {
  targetPath = "/dashboard";
}
```

---

## 🔍 Geïdentificeerde Issues (nog niet gefixt)

### 1. **ProtectedRoute Loop Risk**
**Bestand:** `client/src/components/ProtectedRoute.tsx`

**Issue:**  
Als profile niet correct laadt (Firestore + localStorage beide falen), kan user in redirect loop komen.

**Mogelijke Fix:**
- Add retry logic met max attempts
- Fallback naar "demo mode" na 3 failed attempts
- Toon error message met option om localStorage te clearen

---

### 2. **Firebase Connection Status Onbekend**
**Bestanden:** 
- `client/src/lib/firebase.ts`
- `.env.local`

**Issue:**  
Firebase is geconfigureerd met echte credentials, maar het is onduidelijk of:
- Firestore rules correct zijn ingesteld
- Database toegang werkt vanaf localhost
- Collections bestaan (`users` collectie)

**Aanbevolen Acties:**
1. Test Firebase connectie in browser console
2. Check Firestore rules in Firebase Console
3. Verifieer dat `users` collection bestaat
4. Test handmatig een document aanmaken

**Test Commands:**
```javascript
// Browser console test
import { db, doc, setDoc } from '@/lib/firebase';
const testDoc = doc(db, 'users', 'test-user-123');
await setDoc(testDoc, { test: true });
```

---

### 3. **activateDemoPlan() Error Handling**
**Bestand:** `client/src/lib/billing.ts`

**Issue:**  
Als Firestore update failt, valt het terug op localStorage, maar er is geen feedback naar de user dat het niet gesynchroniseerd is.

**Mogelijke Fix:**
```typescript
try {
  await updateDoc(userRef, updateData);
  toast.success("Plan geactiveerd en gesynchroniseerd!");
} catch (error) {
  localStorage.setItem('userProfile', JSON.stringify(userProfile));
  toast.warning("Plan geactiveerd (alleen lokaal opgeslagen)", {
    description: "Verifieer je internetverbinding voor cloud sync."
  });
}
```

---

### 4. **Module Selectie Persistence**
**Bestand:** `client/src/pages/Modules.tsx`

**Issue:**  
Module selectie wordt opgeslagen via `updateProfile()`, maar als Firestore faalt en localStorage wordt gebruikt, is het niet duidelijk voor de user.

**Mogelijke Fix:**
- Toon status indicator (Cloud synced / Local only)
- Add "Sync Now" button als cloud sync failed

---

## 🧪 Testing Checklist

Test deze flow handmatig:

### Scenario 1: Nieuwe User (Happy Path)
- [ ] 1. Ga naar `/register`
- [ ] 2. Maak account aan met email/wachtwoord
- [ ] 3. Wordt doorgestuurd naar `/app/pricing`
- [ ] 4. Kies "Professional" plan
- [ ] 5. Wordt doorgestuurd naar `/modules`
- [ ] 6. Selecteer modules en save
- [ ] 7. Wordt doorgestuurd naar `/dashboard`
- [ ] 8. Check localStorage: `localStorage.getItem('userProfile')`
- [ ] 9. Logout via UI
- [ ] 10. Login opnieuw met zelfde credentials
- [ ] 11. Wordt direct naar `/dashboard` gestuurd (niet pricing)

### Scenario 2: User zonder Plan Logt In
- [ ] 1. Clear localStorage: `localStorage.clear()`
- [ ] 2. Login met bestaand account (zonder plan in Firestore)
- [ ] 3. Wordt doorgestuurd naar `/app/pricing`
- [ ] 4. Kies plan
- [ ] 5. Modules pagina werkt

### Scenario 3: Firestore Failure
- [ ] 1. Disconnect internet
- [ ] 2. Nieuwe registratie
- [ ] 3. Plan kiezen
- [ ] 4. Modules selecteren
- [ ] 5. Check dat localStorage wordt gebruikt
- [ ] 6. Reconnect internet
- [ ] 7. Refresh page - data moet blijven

---

## 📋 Volgende Stappen

### Prioriteit 1 (Kritiek)
1. **Test complete registratie + login flow** met echte Firebase
2. **Verifieer Firestore rules** in Firebase Console
3. **Check of `users` collectie bestaat** en write access heeft

### Prioriteit 2 (Belangrijk)
1. **Add sync status indicator** in UI (Cloud synced vs Local only)
2. **Improve error messages** bij Firestore failures
3. **Add retry logic** in ProtectedRoute

### Prioriteit 3 (Nice to Have)
1. **Add "Clear Data" button** in settings voor debugging
2. **Add Firebase connection status** in dev mode
3. **Logging improvements** voor troubleshooting

---

## 🔗 Relevante Bestanden

### Gefixt:
- ✅ `client/src/hooks/useUserProfile.ts`
- ✅ `client/src/pages/Login.tsx`

### Review Nodig:
- ⚠️ `client/src/components/ProtectedRoute.tsx`
- ⚠️ `client/src/lib/billing.ts`
- ⚠️ `client/src/lib/firebase.ts`
- ⚠️ `client/src/lib/userProfile.ts`
- ⚠️ `client/src/pages/Pricing.tsx`
- ⚠️ `client/src/pages/Modules.tsx`
- ⚠️ `client/src/pages/Register.tsx`

---

## 🐛 Debug Commands

```bash
# Start dev server
pnpm dev

# Open browser console en test:
localStorage.getItem('userProfile')      # Check user profile
localStorage.clear()                     # Clear all data
JSON.parse(localStorage.getItem('userProfile'))  # Parse profile
```

```javascript
// Browser console - Test Firebase
import { auth } from '@/lib/firebase';
console.log('Current user:', auth.currentUser);
console.log('User profile:', localStorage.getItem('userProfile'));
```

---

## 📞 Hulp Nodig?

Als issues blijven:
1. Check browser console voor errors
2. Check Network tab in DevTools voor Firebase calls
3. Check Firebase Console voor Firestore activity
4. Test met `VITE_USE_FIREBASE_EMULATORS=true` als je emulators hebt draaien

---

**Laatste Update:** 20 januari 2026, 14:30 CET
