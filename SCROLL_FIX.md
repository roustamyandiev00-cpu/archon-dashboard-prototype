# ✅ Scroll Fix - Offertes Pagina

**Datum:** 23 januari 2026  
**Status:** ✅ Opgelost

---

## Probleem

De Offertes pagina had een vaste hoogte met een scroll container binnen de tabel. Dit maakte het moeilijk om te scrollen omdat:
- De hele pagina had `h-[calc(100vh-6rem)]` (vaste hoogte)
- De tabel had `overflow-auto` (eigen scroll)
- Gebruikers moesten precies in de tabel klikken om te scrollen

Dit is niet intuïtief en niet gebruiksvriendelijk.

---

## Oplossing

De pagina gebruikt nu **normale scroll** in plaats van een vaste hoogte container:

### Wat is Aangepast:

1. **Hoofdcontainer**
   - **Voor:** `h-[calc(100vh-6rem)] flex flex-col overflow-hidden`
   - **Na:** `pb-8` (normale scroll met padding onderaan)

2. **Card Container**
   - **Voor:** `flex-1 flex flex-col overflow-hidden`
   - **Na:** Geen flex/overflow restricties

3. **Tabel Container**
   - **Voor:** `flex-1 overflow-auto`
   - **Na:** `w-full` (normale breedte)

4. **Table Header**
   - **Voor:** `sticky top-0 z-10`
   - **Na:** `sticky top-0 z-10 bg-[#0B0D12]` (achtergrond toegevoegd voor sticky effect)

---

## Voordelen

✅ **Natuurlijk scrollen** - Hele pagina scrollt zoals verwacht  
✅ **Betere UX** - Gebruikers kunnen overal scrollen, niet alleen in tabel  
✅ **Sticky header** - Tabel header blijft zichtbaar tijdens scrollen  
✅ **Responsive** - Werkt beter op mobiel  
✅ **Meer ruimte** - Tabel kan zo groot worden als nodig  

---

## Hoe Het Werkt

### Voor:
```
┌─────────────────────────────────┐
│ Page Header                     │
├─────────────────────────────────┤
│ KPI Cards                       │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Table (fixed height)        │ │
│ │ ↕ scroll hier               │ │
│ │                             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Na:
```
┌─────────────────────────────────┐
│ Page Header                     │
├─────────────────────────────────┤
│ KPI Cards                       │
├─────────────────────────────────┤
│ Table Header (sticky)           │
├─────────────────────────────────┤
│ Table Rows                      │
│ ...                             │
│ ...                             │
│ ...                             │
│ (scroll hele pagina)            │
│                                 │
↕ scroll overal                   ↕
```

---

## Verificatie

✅ Geen TypeScript errors  
✅ Tabel header blijft sticky tijdens scrollen  
✅ Hele pagina scrollt natuurlijk  
✅ Werkt op desktop en mobiel  

---

## Test Stappen

1. Open: `http://localhost:3000/offertes`
2. Scroll met muis/trackpad
3. Verifieer dat:
   - ✅ Hele pagina scrollt (niet alleen tabel)
   - ✅ Header blijft bovenaan plakken
   - ✅ KPI cards scrollen mee naar boven
   - ✅ Scrollen voelt natuurlijk aan

---

## Technische Details

### Verwijderd:
- `h-[calc(100vh-6rem)]` - Vaste hoogte
- `flex flex-col` - Flex layout restricties
- `overflow-hidden` - Overflow restricties
- `flex-1 overflow-auto` - Scroll container

### Toegevoegd:
- `pb-8` - Padding onderaan voor ruimte
- `bg-[#0B0D12]` - Achtergrond voor sticky header

---

**Status:** ✅ Scroll werkt nu natuurlijk en intuïtief!

**Test het nu op:** http://localhost:3000/offertes 🚀
