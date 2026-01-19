# Cursor Chat Modus Gebruiksgids

Dit document helpt je bij het effectief gebruiken van Cursor's chat-functionaliteit voor het Archon Dashboard project.

## Wat is Cursor Chat Modus?

Cursor is een AI-gebaseerde code-editor met ingebouwde chat-functionaliteit. Je kunt vragen stellen over je code, hulp vragen bij debugging, en zelfs code laten genereren of aanpassen.

## Basisgebruik

### 1. Chat Openen
- **Windows/Linux**: `Ctrl + L` of klik op het chat-icoon in de sidebar
- **Mac**: `Cmd + L` of klik op het chat-icoon in de sidebar

### 2. Soorten Vragen die je Kunt Stellen

**Code-uitleg:**
```
"Leg me uit hoe de Dashboard component werkt"
```

**Debugging:**
```
"Waarom werkt de authenticatie niet?"
```

**Code genereren:**
```
"Maak een nieuwe pagina voor klantbeheer"
```

**Refactoring:**
```
"Verbeter de performance van de API routes"
```

**Best practices:**
```
"Hoe kan ik de TypeScript types verbeteren?"
```

## Specifiek voor dit Project

### Belangrijke Bestanden om te Begrijpen

**Frontend (Vite + React):**
- `client/src/App.tsx` - Hoofdt applicatie
- `client/src/pages/` - Alle pagina's
- `client/src/components/` - Reusable components
- `client/src/lib/` - Utility functies

**Backend:**
- `server/` - Express server
- `api/` - API endpoints
- `functions/` - Firebase Cloud Functions

**Configuratie:**
- `vite.config.ts` - Vite configuratie
- `tsconfig.json` - TypeScript instellingen
- `package.json` - Dependencies

### Veelvoorkomende Vragen voor dit Project

**Authenticatie:**
```
"Hoe werkt de authenticatie flow in dit project?"
"Leg me uit hoe AuthContext wordt gebruikt"
```

**Firebase:**
```
"Wat zijn alle Firebase functies die worden gebruikt?"
"Hoe is Firestore geconfigureerd?"
```

**Styling:**
```
"Welk UI library wordt gebruikt?"
"Hoe kan ik een nieuw component met shadcn/ui maken?"
```

**API:**
```
"Leg me uit hoe de API routing werkt"
"Wat zijn alle beschikbare endpoints?"
```

## Handige Shortcuts

- `Cmd/Ctrl + L` - Open chat
- `Cmd/Ctrl + I` - AI inline bewerken
- `Cmd/Ctrl + K` - AI command palette
- `Cmd/Ctrl + Enter` - Stel chat vraag
- `Tab` - Accepteer AI suggestie

## Tips voor Effectief Gebruik

### 1. Wees Specifiek
❌ Slecht: "Maak dit beter"
✅ Goed: "Verbeter de error handling in de billing module"

### 2. Geef Context
❌ Slecht: "Fix de bug"
✅ Goed: "De login pagina laadt niet na klikken op submit. De error verschijnt in de browser console"

### 3. Gebruik Bestandsreferenties
❌ Slecht: "Wat doet dit?"
✅ Goed: "Wat doet client/src/lib/api.ts?"
```
# Of selecteer de code en vraag:
"Leg deze functie uit:"
```

### 4. Vraag om Best Practices
```
"Toon me hoe ik dit component zou moeten refactoren volgens React best practices"
"Wat is de beste manier om async operations te handling?"
```

## Geavanceerd Gebruik

### Code Analyse
```
"Analyseer de hele codebase en vind mogelijke performance issues"
"Zoek naar niet-gebruikte dependencies"
```

### Documentatie Generatie
```
"Maak documentation voor de API endpoints"
"Voeg JSDoc comments toe aan alle functies in api/billing/"
```

### Tests Schrijven
```
"Schrijf unit tests voor de AuthContext"
"Maak integration tests voor de API routes"
```

## Voorbeeldsessies

### Sessie 1: Een Nieuw Feature Toevoegen
```
Jij: "Ik wil een nieuwe pagina toevoegen voor rapportages. Hoe begin ik?"

Cursor: "Je moet een nieuw bestand aanmaken in client/src/pages/ genaamd Rapportages.tsx. Laat me dat voor je maken..."

Jij: "Top, nu wil ik daar een chart toevoegen"

Cursor: "Ik zie dat je al EnhancedCharts.tsx hebt. Ik kan die gebruiken in je nieuwe Rapportages pagina..."
```

### Sessie 2: Bug Fixing
```
Jij: "De Stripe webhook werkt niet. Kijk naar api/billing/webhook.ts"

Cursor: [leest het bestand] "Ik zie dat je de secret niet valideert. Dat is een beveiligingsrisico. Je moet..."

Jij: "Kan je dat fixen en ook een test toevoegen?"

Cursor: "Zeker, hier is de fix en een test..."
```

## Project-specifieke Tips

### Firebase
Vraag altijd om hulp met Firebase specifieke problemen:
```
"Hoe debug ik Firebase rules?"
"Waarom werkt de Firestore query niet?"
```

### TypeScript
Dit project gebruikt uitgebreid TypeScript. Vraag om:
```
"Voeg types toe voor deze functie"
"Fix alle TypeScript errors in dit bestand"
"Wat is het return type van deze functie?"
```

### Performance
Het project heeft performance optimalisaties nodig. Vraag om:
```
"Vind bottlenecks in de render performance"
"Optimaliseer deze component voor large datasets"
```

## Waarschuwingen

1. **Test Always** - AI kan fouten maken. Test code altijd voordat je commit
2. **Security** - Wees voorzichtig met credentials. De AI kan ze per ongeluk onthullen
3. **Context Limits** - Te veel context kan de reacties vertragen

## Meer Hulp?

Als je hulp nodig hebt, kun je ook:
- De officiële Cursor documentatie bekijken
- Vragen stellen in de Cursor community
- Deze project README en documentatie lezen

---

**Pro Tip:** Start elk gesprek met context over wat je wilt bereiken. Hoe meer context, hoe beter het antwoord!
