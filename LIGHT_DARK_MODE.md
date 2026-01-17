# 🌞🌙 Light/Dark Mode - Implementation Guide

## ✨ Wat is er toegevoegd?

Je dashboard heeft nu een **volledig werkende Light/Dark mode** met een mooie toggle button!

---

## 🎯 Wat werkt nu?

### 1. **Theme Toggle Button** 🔘
- **Locatie**: Rechtsboven in de header (naast Command Menu)
- **Icon**: 
  - ☀️ **Sun** = Light mode actief (klik voor Dark)
  - 🌙 **Moon** = Dark mode actief (klik voor Light)
- **Animatie**: Smooth rotate en fade tussen icons
- **Label**: "Light" of "Dark" (verborgen op mobiel)

### 2. **Automatische Persistentie** 💾
- Je theme keuze wordt opgeslagen in `localStorage`
- Blijft bewaard na refresh/herstarten browser
- Key: `archon-theme` (waarde: "light" of "dark")

### 3. **Smooth Transitions** ⚡
- Alle kleuren transities duren 500ms
- Vloeiende overgang tussen themes
- Geen flikkering of flashing

---

## 🎨 Theme Details

### **Light Mode** ☀️
```css
Background: #FFFFFF (Pure white)
Cards: #F8FAFC (Subtle gray-blue)
Text: #0F172A (Dark slate)
Borders: #E2E8F0 (Light gray)
Accent: #06B6D4 (Cyan - unchanged)
```

**Kenmerken:**
- Clean, modern, professional
- Subtle schaduwen
- Hoge contrast voor leesbaarheid
- Glassmorphism met witte tint
- Grid pattern met lichte lijnen

### **Dark Mode** 🌙
```css
Background: #0B0D12 (Obsidian)
Cards: #0F1520 (Dark slate)
Text: #F3F4F6 (Light gray)
Borders: rgba(255,255,255,0.1)
Accent: #06B6D4 (Cyan - unchanged)
```

**Kenmerken:**
- Luxury automotive feel
- Deep shadows met glow effects
- Glassmorphism met donkere tint
- Grid pattern met subtiele lijnen

---

## 🔧 Hoe te Gebruiken

### **Als Gebruiker:**
1. Open dashboard (`/dashboard`)
2. Klik op de Sun/Moon button rechtsboven
3. Theme wisselt instant!
4. Refresh pagina → theme blijft behouden

### **Als Developer:**

#### **Theme gebruiken in components:**
```typescript
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Huidig theme: {theme}</p>
      <button onClick={toggleTheme}>
        Wissel Theme
      </button>
    </div>
  );
}
```

#### **Conditionele styling:**
```typescript
// Met className
<div className={cn(
  "p-4",
  theme === "dark" ? "bg-slate-900" : "bg-white"
)}>
  Content
</div>

// Met Tailwind dark: variant
<div className="bg-white dark:bg-slate-900">
  Auto-switching!
</div>
```

---

## 📁 Nieuwe/Gewijzigde Bestanden

### **Nieuw:**
1. **`/components/ThemeToggle.tsx`** ⭐
   - Toggle button component
   - Animated icon transitions
   - Responsive labels

### **Gewijzigd:**
2. **`/index.css`** 🎨
   - Dual theme variables
   - Light mode colors
   - Theme-specific selectors (`.dark`)
   - Smooth transitions everywhere

3. **`/App.tsx`** ⚙️
   - Changed `defaultTheme="light"`
   - Enabled `switchable={true}`

4. **`/pages/Dashboard.tsx`** 📊
   - Imports ThemeToggle
   - Renders button in header

5. **`/contexts/ThemeContext.tsx`** 
   - Already had theme logic
   - No changes needed!

---

## 🎯 CSS Classes met Theme Support

Alle onderstaande classes passen automatisch aan:

```css
/* Automatisch theme-aware */
.glass-card          /* Different glass effect per theme */
.grid-background-subtle  /* Different grid color */
.glow-cyan          /* Different glow intensity */
.stat-card:hover    /* Different hover shadows */
.premium-card       /* Theme-specific borders */

/* Manual theme control */
.dark .glass-card   /* Dark mode specific */
```

---

## 🐛 Troubleshooting

### **Theme switch werkt niet?**
```bash
# Check console voor errors
# Verify ThemeProvider in App.tsx

# Hard refresh browser
Cmd/Ctrl + Shift + R
```

### **Kleuren niet zichtbaar?**
```bash
# Rebuild CSS
pnpm dev --force

# Clear localStorage
localStorage.clear()
```

### **Theme reset bij refresh?**
```bash
# Check App.tsx:
# Moet zijn: switchable={true}
# Niet: switchable={false}
```

### **Icons animeren niet?**
```bash
# Check framer-motion versie
pnpm list framer-motion

# Update als nodig
pnpm add framer-motion@latest
```

---

## 💡 Tips & Best Practices

### **1. Nieuwe Components Maken:**
```typescript
// Gebruik Tailwind dark: variant
<div className="bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10">
  Auto theme support!
</div>
```

### **2. Custom Kleuren:**
```typescript
// Gebruik CSS variabelen
<div style={{ color: 'var(--foreground)' }}>
  Volgt theme automatisch
</div>
```

### **3. Charts & Visualisaties:**
```typescript
// Charts gebruiken dezelfde accent kleuren
// Alleen background/border passen aan
<CashflowChart 
  data={data}
  // Cyan blijft cyan in beide themes
/>
```

### **4. Glassmorphism Behouden:**
```css
/* Gebruik .glass-card class */
/* Deze past automatisch aan per theme */
<Card className="glass-card">
  ...
</Card>
```

---

## 🎨 Design Systeem

### **Gedeelde Elementen (Beide Themes):**
- ✅ Accent Cyan: `#06B6D4`
- ✅ Accent Purple: `#8B5CF6`
- ✅ Accent Blue: `#3B82F6`
- ✅ Success Green: `#10B981`
- ✅ Warning Amber: `#F59E0B`
- ✅ Error Red: `#EF4444`

### **Theme-Specifieke Elementen:**

| Element | Light | Dark |
|---------|-------|------|
| Background | `#FFFFFF` | `#0B0D12` |
| Card | `#F8FAFC` | `#0F1520` |
| Text | `#0F172A` | `#F3F4F6` |
| Border | `#E2E8F0` | `rgba(255,255,255,0.1)` |
| Muted Text | `#64748B` | `#9CA3AF` |

---

## 📸 Screenshots Maken

### **Aanbevolen Views:**
1. Dashboard in Light mode
2. Dashboard in Dark mode
3. Theme toggle animation (GIF)
4. AI Panel beide modes
5. Charts beide modes
6. Mobile view beide modes

---

## 🚀 Volgende Stappen

### **Optionele Verbeteringen:**

1. **System Preference Detection:**
```typescript
// Auto-detect OS theme
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
defaultTheme={prefersDark ? 'dark' : 'light'}
```

2. **Scheduled Theme Switching:**
```typescript
// Auto dark mode na 20:00
const hour = new Date().getHours();
const autoTheme = hour >= 20 || hour < 6 ? 'dark' : 'light';
```

3. **Custom Theme Colors:**
```typescript
// Laat users eigen accent color kiezen
<ThemeProvider 
  accentColor="#06B6D4"  // Custom cyan
/>
```

4. **Theme Presets:**
```typescript
// Multiple themes: light, dark, auto, high-contrast
type Theme = "light" | "dark" | "auto" | "high-contrast";
```

---

## ✅ Test Checklist

- [ ] Toggle button visible rechtsboven
- [ ] Click op button wisselt theme
- [ ] Icons animeren smooth (rotate + fade)
- [ ] Alle kleuren passen aan
- [ ] Glassmorphism werkt in beide modes
- [ ] Charts blijven leesbaar
- [ ] Text contrast is goed (WCAG AA)
- [ ] Theme blijft na refresh
- [ ] Geen flashing bij laden
- [ ] Mobile responsive
- [ ] Animaties smooth (500ms)
- [ ] LocalStorage werkt
- [ ] Geen console errors

---

## 🎉 Klaar!

Je dashboard heeft nu een **premium dual-theme systeem**:

- ☀️ **Light Mode**: Clean, modern, professional
- 🌙 **Dark Mode**: Luxury, atmospheric, elegant
- 🔄 **Smooth Transitions**: Vloeiende overgangen
- 💾 **Persistent**: Onthoud je keuze
- 🎨 **Consistent**: Beide themes zien er premium uit

**Geniet van je nieuwe theme systeem!** ✨

---

## 📚 Resources

- **Tailwind Dark Mode**: https://tailwindcss.com/docs/dark-mode
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **Local Storage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Framer Motion**: https://www.framer.com/motion/

**Questions? Check ENHANCEMENTS.md voor meer info!**
