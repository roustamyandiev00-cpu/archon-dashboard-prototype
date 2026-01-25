# Dashboard Refactor - Enterprise Grade SaaS UI

## Status: IN PROGRESS

### Doelstellingen
1. ✅ 3-laags surface systeem (bg → surface → card)
2. ✅ Consistente borders (1px, white/10)
3. ✅ Genormaliseerde accenten (cyan primary, violet secondary)
4. ✅ Duidelijke typografie hiërarchie
5. ✅ 8px grid spacing systeem
6. ✅ Toegankelijke focus states
7. ✅ Responsive design

### Nieuwe Componenten Gemaakt
- ✅ `ActionCard.tsx` - Enterprise action banner
- ✅ `KpiCard.tsx` - Consistent KPI card component
- ✅ `ChartCard.tsx` - Chart container met header
- ✅ `ActivityList.tsx` - Clickable list items
- ✅ `TimeRangeTabs.tsx` - Time range selector

### Design Tokens Applied
```css
--bg: #0A0E1A (app background)
--surface-1: #0F1520 (section surface)
--surface-2: #151B2B (card hover/elevated)
--border: white/10 (subtle)
--border-strong: white/20 (focus/selected)
--primary: cyan-500 (actions only)
--secondary: violet-500 (analytics)
```

### Verbeteringen Per Sectie

#### A) Page Header ✅
- Compacter design
- Betere spacing (gap-4)
- Primary button styling consistent
- Subtitle met betere contrast (zinc-400)

#### B) Action Card ✅
- Left accent bar (cyan/emerald/orange)
- Icon + title + description layout
- Primary + Secondary + Dismiss actions
- Metadata in subtiele kleur
- Geen overload aan glow effects

#### C) KPI Cards ✅
- Uniform template: label + value + trend + drilldown
- Icons in neutral bg (white/5), niet primary
- Sparklines subtieler
- Empty states met duidelijke CTAs
- Hover state zonder glow overload

#### D) Charts
- ChartCard component met consistent header
- TimeRangeTabs voor filtering
- Subtiele gridlines
- Betere padding (p-6)
- Empty states

#### E) Activity Lists
- Clickable rows met hover (bg-white/5)
- Right chevron subtiel (zinc-600 → zinc-400)
- Primary text + muted meta
- Icon in neutral container
- Spacing ipv dikke borders

#### F) Sidebar (niet op deze pagina)
- N/A voor Dashboard

### Kleurgebruik (Semantisch)
- **Primary (Cyan)**: Buttons, links, focus states, actions
- **Success (Emerald)**: Positive trends, cashflow in
- **Warning (Orange)**: Expiring, attention needed
- **Danger (Red)**: Negative trends, overdue
- **Neutral (Zinc)**: Icons, borders, metadata
- **Secondary (Violet)**: Analytics, charts (niet gebruikt voor actions)

### Spacing Systeem
- Page padding: p-4 lg:p-6
- Card padding: p-5 (KPI), p-6 (Charts)
- Gap between sections: gap-6 lg:gap-8
- Grid gaps: gap-4
- Internal spacing: space-y-3, space-y-4

### Typography Hiërarchie
1. Page title: text-2xl font-bold text-white
2. Section title: text-base font-semibold text-white
3. Card title: text-xs uppercase tracking-wider text-zinc-400
4. Value: text-3xl font-bold text-white
5. Body: text-sm text-zinc-300
6. Metadata: text-xs text-zinc-500

### Interactie States
- Default: border-white/10
- Hover: hover:border-white/20, hover:bg-white/5
- Focus: focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50
- Active: bg-cyan-500/10 text-cyan-400
- Disabled: opacity-50 cursor-not-allowed

### Responsive Breakpoints
- Mobile: 1 column, stacked
- Tablet (sm): 2 columns voor KPIs
- Desktop (lg): 4 columns voor KPIs, 2 columns voor charts

### Performance
- Geen zware shadows (max shadow-sm)
- Geen complexe filters
- Framer motion delays geoptimaliseerd (0, 0.1, 0.2, 0.3)
- Lazy loading voor charts

### Accessibility (WCAG)
- Focus rings zichtbaar (ring-1 ring-cyan-500/50)
- Contrast ratios > 4.5:1
- Aria labels op icon buttons
- Keyboard navigation support
- Tooltips voor definities

### Next Steps
1. Refactor Dashboard.tsx met nieuwe componenten
2. Replace chart sections met ChartCard
3. Replace activity sections met ActivityList
4. Test responsive behavior
5. Test keyboard navigation
6. Performance audit

### Files Modified
- ✅ `client/src/components/dashboard/ActionCard.tsx` (NEW)
- ✅ `client/src/components/dashboard/KpiCard.tsx` (NEW)
- ✅ `client/src/components/dashboard/ChartCard.tsx` (NEW)
- ✅ `client/src/components/dashboard/ActivityList.tsx` (NEW)
- ✅ `client/src/components/dashboard/TimeRangeTabs.tsx` (NEW)
- ⏳ `client/src/pages/Dashboard.tsx` (REFACTORING)

### UI QA Checklist
- [ ] Binnen 5 seconden scan: topprioriteit + KPIs duidelijk
- [ ] Contrast en leesbaarheid verbeterd
- [ ] Consistent grid en spacing (geen random margins)
- [ ] Accents semantisch gebruikt
- [ ] Hover/focus states overal aanwezig
- [ ] Responsive op mobile/tablet/desktop
- [ ] Geen breaking changes in data/routes
- [ ] Performance: geen zware effects
- [ ] Accessibility: focus rings, contrast, aria labels
