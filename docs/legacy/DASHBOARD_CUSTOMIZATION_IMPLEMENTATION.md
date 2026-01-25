# Dashboard Customization - Implementation Guide

## ✅ Status: COMPONENT CREATED

De `DashboardCustomizer` component is gemaakt en klaar voor gebruik. Hieronder vind je de implementatie instructies.

---

## 🎯 Features

1. **Hide/Show Widgets** - Verberg widgets die je niet wilt zien
2. **Drag & Drop Reordering** - Versleep widgets om de volgorde te wijzigen
3. **Persistent Storage** - Instellingen worden opgeslagen in localStorage
4. **Reset to Default** - Herstel standaard layout met één klik
5. **Categorized View** - Widgets gegroepeerd per type (KPI, Charts, Lists, Actions)

---

## 📁 Files Created

### 1. DashboardCustomizer Component
**Location**: `client/src/components/dashboard/DashboardCustomizer.tsx`

**Features**:
- Dialog met widget lijst
- Drag & drop interface
- Toggle switches voor visibility
- Category grouping
- Reset functionaliteit

---

## 🔧 Implementation Steps

### Step 1: Import Component (DONE)
```tsx
import { DashboardCustomizer, type DashboardWidget } from "@/components/dashboard/DashboardCustomizer";
```

### Step 2: Add State Management (DONE)
```tsx
const [dashboardWidgets, setDashboardWidgets] = useStoredState<DashboardWidget[]>(
  "dashboard_widgets_config",
  [
    { id: "action-card", label: "Volgende beste actie", visible: true, order: 0, category: "action" },
    { id: "kpi-revenue", label: "Totale omzet", visible: true, order: 1, category: "kpi" },
    { id: "kpi-outstanding", label: "Openstaand", visible: true, order: 2, category: "kpi" },
    { id: "kpi-clients", label: "Klanten", visible: true, order: 3, category: "kpi" },
    { id: "kpi-costs", label: "Kosten", visible: true, order: 4, category: "kpi" },
    { id: "chart-cashflow", label: "Cashflow", visible: true, order: 5, category: "chart" },
    { id: "chart-projects", label: "Project voortgang", visible: true, order: 6, category: "chart" },
    { id: "list-projects", label: "Actieve projecten", visible: true, order: 7, category: "list" },
    { id: "list-today", label: "Vandaag", visible: true, order: 8, category: "list" },
    { id: "list-pipeline", label: "Pipeline & Acquisitie", visible: true, order: 9, category: "list" },
    { id: "list-activity", label: "Recente activiteit", visible: true, order: 10, category: "list" },
    { id: "list-cashflow-forecast", label: "Cashflow forecast", visible: true, order: 11, category: "list" },
    { id: "list-agenda", label: "Agenda", visible: true, order: 12, category: "list" },
  ]
);

const isWidgetVisible = (id: string) => {
  const widget = dashboardWidgets.find(w => w.id === id);
  return widget?.visible ?? true;
};

const handleSaveWidgets = (widgets: DashboardWidget[]) => {
  setDashboardWidgets(widgets);
  toast.success("Dashboard aangepast", {
    description: "Je wijzigingen zijn opgeslagen"
  });
};
```

### Step 3: Add Button to Header (DONE)
```tsx
<div className="flex gap-2">
  <DashboardCustomizer
    widgets={dashboardWidgets}
    onSave={handleSaveWidgets}
  />
  <Button className="bg-cyan-500 hover:bg-cyan-600">
    Start dag
  </Button>
</div>
```

### Step 4: Wrap Widgets with Visibility Checks (TODO)

#### Action Card
```tsx
{isWidgetVisible("action-card") && !isBestActionSnoozed ? (
  <ActionCard ... />
) : isWidgetVisible("action-card") ? (
  <Card>... snoozed state ...</Card>
) : null}
```

#### KPI Cards
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {isWidgetVisible("kpi-revenue") && <KpiCard title="Totale omzet" ... />}
  {isWidgetVisible("kpi-outstanding") && <KpiCard title="Openstaand" ... />}
  {isWidgetVisible("kpi-clients") && <KpiCard title="Klanten" ... />}
  {isWidgetVisible("kpi-costs") && <KpiCard title="Kosten" ... />}
</div>
```

#### Charts
```tsx
<div className="grid gap-6 lg:grid-cols-2">
  {isWidgetVisible("chart-cashflow") && (
    <ChartCard title="Cashflow" ... />
  )}
  {isWidgetVisible("chart-projects") && (
    <ChartCard title="Project voortgang" ... />
  )}
</div>
```

#### Lists (Right Sidebar)
```tsx
{isWidgetVisible("list-projects") && (
  <Card>... Actieve projecten ...</Card>
)}

{isWidgetVisible("list-today") && (
  <Card>... Vandaag ...</Card>
)}

{isWidgetVisible("list-pipeline") && (
  <Card>... Pipeline & Acquisitie ...</Card>
)}

{isWidgetVisible("list-activity") && (
  <Card>... Recente activiteit ...</Card>
)}

{isWidgetVisible("list-cashflow-forecast") && (
  <Card>... Cashflow forecast ...</Card>
)}

{isWidgetVisible("list-agenda") && (
  <Card>... Agenda ...</Card>
)}
```

---

## 🎨 UI/UX Details

### Dialog Design
- **Background**: `bg-[#0F1520]` (surface-1)
- **Border**: `border-white/10`
- **Max Height**: `max-h-[80vh]` with scroll
- **Sections**: Grouped by category (Action, KPI, Charts, Lists)

### Widget Item
- **Drag Handle**: `GripVertical` icon (zinc-500)
- **Label**: White text, truncated
- **Description**: Zinc-500, smaller text
- **Toggle**: Switch component (cyan when active)
- **Visibility Icon**: Eye/EyeOff

### States
- **Dragging**: `opacity-50 scale-95`
- **Hidden**: `opacity-60`
- **Hover**: Subtle highlight

---

## 💾 Data Structure

### DashboardWidget Interface
```typescript
interface DashboardWidget {
  id: string;              // Unique identifier
  label: string;           // Display name
  description?: string;    // Optional description
  visible: boolean;        // Show/hide state
  order: number;           // Display order
  category: "kpi" | "chart" | "list" | "action";  // Widget type
}
```

### Storage
- **Key**: `dashboard_widgets_config`
- **Location**: localStorage
- **Format**: JSON array of DashboardWidget objects

---

## 🔄 Drag & Drop Flow

1. User clicks and holds on widget item
2. `onDragStart` sets `draggedItem` state
3. User drags over other items
4. `onDragOver` reorders array in real-time
5. `onDragEnd` clears `draggedItem` state
6. User clicks "Opslaan" to persist changes

---

## ✨ User Experience

### Opening Customizer
1. Click "Aanpassen" button in header
2. Dialog opens with current configuration
3. Widgets grouped by category

### Hiding Widget
1. Toggle switch next to widget
2. Eye icon changes to EyeOff
3. Widget becomes semi-transparent
4. Click "Opslaan" to apply

### Reordering Widgets
1. Click and hold on grip handle
2. Drag to desired position
3. Other widgets shift automatically
4. Release to drop
5. Click "Opslaan" to apply

### Resetting
1. Click "Reset naar standaard"
2. All widgets become visible
3. Order resets to default
4. Click "Opslaan" to apply

---

## 🎯 Benefits

### For Users
- **Personalization**: Customize dashboard to their workflow
- **Focus**: Hide irrelevant widgets
- **Efficiency**: Quick access to important metrics
- **Flexibility**: Change layout as needs evolve

### For Product
- **Engagement**: Users invest time in customization
- **Retention**: Personalized experience increases stickiness
- **Insights**: Track which widgets are most/least used
- **Scalability**: Easy to add new widgets

---

## 🚀 Future Enhancements

### Phase 2 (Optional)
1. **Widget Sizing** - Small/Medium/Large options
2. **Custom Widgets** - User-created widgets
3. **Templates** - Pre-configured layouts
4. **Export/Import** - Share configurations
5. **Multi-Dashboard** - Different layouts for different roles

### Phase 3 (Advanced)
1. **Drag & Drop Grid** - Full 2D grid layout
2. **Widget Settings** - Per-widget configuration
3. **Conditional Visibility** - Show/hide based on data
4. **Widget Marketplace** - Community widgets

---

## 📊 Analytics Opportunities

Track these events:
- `dashboard_customizer_opened`
- `widget_hidden` (with widget_id)
- `widget_shown` (with widget_id)
- `widgets_reordered`
- `dashboard_reset`
- `customization_saved`

Use data to:
- Identify most/least valuable widgets
- Optimize default layout
- Guide feature development
- Improve onboarding

---

## ✅ Testing Checklist

- [ ] Open customizer dialog
- [ ] Toggle widget visibility
- [ ] Drag and drop to reorder
- [ ] Save changes
- [ ] Refresh page (persistence check)
- [ ] Reset to default
- [ ] Cancel without saving
- [ ] Hide all KPI cards (grid adapts)
- [ ] Hide all charts (layout adapts)
- [ ] Hide all lists (sidebar empty)

---

## 🎉 Conclusion

De Dashboard Customizer is een enterprise-grade feature die:
1. **Gebruikers controle geeft** over hun dashboard
2. **Persistent opslaat** in localStorage
3. **Intuïtief is** met drag & drop
4. **Schaalbaar is** voor toekomstige widgets
5. **Professioneel oogt** met consistent design

**Next Step**: Wrap alle widgets in Dashboard.tsx met `isWidgetVisible()` checks.
