# TypeScript Fouten Rapport
## Datum: 20 januari 2026

Samenvatting van gevonden TypeScript fouten in het Archon Dashboard project.

---

## Fout 1: Type mismatch in API feedback endpoint

**Bestand:** `api/ai/feedback.ts`
**Locatie:** Regel 84
**Type:** TS2322 - Type error

**Foutmelding:**
```
Type 'DecodedIdToken' is not assignable to type 'string'.
```

**Oorzaak:**
De functie `verifyAuth()` verwacht dat `verifyFirebaseToken()` een string (userId) retourneert, maar het retourneert daadwerkelijk een `DecodedIdToken` object.

**Huidige code (regels 80-85):**
```typescript
async function verifyAuth(req: VercelRequest): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split('Bearer ')[1];
  const userId = await verifyFirebaseToken(token);  // Dit is DecodedIdToken, geen string!
  return userId;
}
```

**Oplossing:**
De `DecodedIdToken` heeft een `uid` property die bevat de gebruiker ID als string:

```typescript
async function verifyAuth(req: VercelRequest): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await verifyFirebaseToken(token);
  return decodedToken.uid;  // Extract de uid uit DecodedIdToken
}
```

---

## Fout 2: Ontbrekende functie referentie in AI Assistant component

**Bestand:** `client/src/components/AIAssistantPanel.tsx`
**Locatie:** Regel 339
**Type:** TS2304 - Cannot find name

**Foutmelding:**
```
Cannot find name 'handleCreateOfferte'.
```

**Oorzaak:**
De functie `handleCreateOfferte` is gedefinieerd binnen de `AIAssistantPanel` component scope, maar wordt gebruikt in de `MessageBubble` component die als aparte functie buiten die scope is gedefinieerd. De functie is niet toegankelijk in de `MessageBubble` scope.

**Huidige code ( relevante regels):**

In `AIAssistantPanel` component (rond regel 132):
```typescript
const handleCreateOfferte = () => {
  navigate("/offertes?ai=1");
};
```

In `MessageBubble` component (rond regel 339):
```typescript
<Button
  size="sm"
  onClick={handleCreateOfferte}  // Functie bestaat niet in deze scope!
  className="..."
>
  <Receipt className="w-3 h-3 mr-2" />
  Open AI Offerte Wizard
</Button>
```

**Oplossing:**
Geef de handler als prop door aan de `MessageBubble` component:

1. Update de `MessageBubbleProps` interface:
```typescript
interface MessageBubbleProps {
  message: Message;
  index: number;
  onCreateOfferte?: () => void;  // Nieuwe prop
}
```

2. Update de `MessageBubble` functie signature:
```typescript
function MessageBubble({ message, index, onCreateOfferte }: MessageBubbleProps) {
```

3. Gebruik de prop in de onClick handler:
```typescript
<Button
  size="sm"
  onClick={onCreateOfferte}
  className="..."
>
```

4. Update de aanroep in `AIAssistantPanel`:
```typescript
<MessageBubble
  key={message.id}
  message={message}
  index={index}
  onCreateOfferte={handleCreateOfferte}  // Geef handler door
/>
```

---

## Aanbevolen acties

1. **Prioriteit Hoog:** Fix fout #1 (api/ai/feedback.ts) - Dit voorkomt runtime errors in de API
2. **Prioriteit Hoog:** Fix fout #2 (client/src/components/AIAssistantPanel.tsx) - Dit voorkomt build errors en runtime errors
3. Na het aanbrengen van de fixes, draai `pnpm run check` om te bevestigen dat alle TypeScript fouten zijn opgelost

---

## Extra observaties

Het project bevat veel TypeScript bestanden en een goede structuur. De gevonden fouten zijn relatief eenvoudig op te lossen maar moeten wel worden aangepakt voordat het project correct kan worden gebouwd en gedeployed.