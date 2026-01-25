# Enterprise-Grade Refactor - Klanten, Offertes & Facturen

## Status: READY FOR IMPLEMENTATION

Deze refactor bouwt voort op de Dashboard refactor en past dezelfde enterprise-grade principes toe op de drie belangrijkste data-pagina's.

---

## 🎯 Design Principes (Consistent Across All Pages)

### 1. Surface System
```css
--bg: #0A0E1A          /* App background */
--surface-1: #0F1520   /* Section/card surface */
--surface-2: #151B2B   /* Hover/elevated */
```

### 2. Border System
```css
--border: white/10          /* Default subtle */
--border-strong: white/20   /* Focus/selected */
```

### 3. Semantic Colors
- **Primary (Cyan)**: Actions, CTAs, focus states
- **Success (Emerald)**: Betaald, actief, positive
- **Warning (Orange)**: Overtijd, expiring, attention
- **Danger (Red)**: Verloren, overdue, critical
- **Info (Blue)**: Openstaand, neutral status
- **Neutral (Zinc)**: Icons, metadata, disabled

### 4. Typography Scale
```css
Page title: text-2xl font-bold text-white
Section title: text-base font-semibold text-white
Card label: text-xs uppercase tracking-wider text-zinc-400
Value: text-2xl/3xl font-bold text-white
Body: text-sm text-zinc-300
Metadata: text-xs text-zinc-500
```

### 5. Spacing (8px Grid)
- Page padding: `p-4 lg:p-6`
- Card padding: `p-5` (KPI), `p-6` (content)
- Section gaps: `gap-6 lg:gap-8`
- Grid gaps: `gap-4`

---

## 📄 Pagina 1: KLANTEN

### Current Issues
❌ Inconsistente KPI card styling (mix van gradients)
❌ Toolbar te druk (4 buttons naast elkaar)
❌ Table header niet sticky
❌ Empty state te "dood"
❌ Geen result count
❌ Geen clear filters option

### Refactor Plan

#### A) Header
```tsx
<PageHeader
  title="Klanten"
  subtitle="Beheer je klantenbestand en contactgegevens"
  rightSlot={
    <div className="flex gap-2">
      <Button variant="outline" className="border-white/10">
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>
      <Button className="bg-cyan-500 hover:bg-cyan-600">
        <Plus className="w-4 h-4 mr-2" />
        Nieuwe Klant
      </Button>
    </div>
  }
/>
```

#### B) KPI Cards - Gebruik KpiCard Component
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <KpiCard
    title="Totaal Klanten"
    value={String(totaalKlanten)}
    icon={<User className="w-5 h-5" />}
    trend="neutral"
    definition="Alle klanten in je systeem"
  />
  <KpiCard
    title="Actieve Klanten"
    value={String(actieveKlanten)}
    icon={<User className="w-5 h-5" />}
    trend="up"
    change="+5%"
    definition="Klanten met recente activiteit"
  />
  <KpiCard
    title="Zakelijke Klanten"
    value={String(zakelijkeKlanten)}
    icon={<Building2 className="w-5 h-5" />}
    trend="neutral"
    definition="B2B klanten"
  />
</div>
```

#### C) Table Toolbar Component
```tsx
<CustomerTableToolbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  filterType={filterType}
  onFilterChange={setFilterType}
  resultCount={filteredKlanten.length}
  onExport={handleExport}
  onImport={() => setImportDialogOpen(true)}
  hasActiveFilters={filterType !== "all" || searchQuery !== ""}
  onClearFilters={() => {
    setSearchQuery("");
    setFilterType("all");
  }}
/>
```

#### D) Data Table
```tsx
<CustomersDataTable
  customers={filteredKlanten}
  loading={loading}
  onEdit={openEditDialog}
  onDelete={handleDeleteKlant}
  emptyState={
    <CustomerEmptyState
      hasFilters={searchQuery !== "" || filterType !== "all"}
      onCreateNew={openCreateDialog}
      onImport={() => setImportDialogOpen(true)}
    />
  }
/>
```

#### E) Empty State
```tsx
<CustomerEmptyState
  title="Nog geen klanten"
  description="Begin met het toevoegen van je eerste klant of importeer bestaande klanten."
  benefits={[
    "Offertes sneller maken",
    "Facturen automatisch koppelen",
    "Projecten eenvoudig opvolgen"
  ]}
  primaryAction={{
    label: "Nieuwe klant",
    onClick: openCreateDialog
  }}
  secondaryAction={{
    label: "Importeer klanten",
    onClick: () => setImportDialogOpen(true)
  }}
/>
```

### Components Needed
1. `CustomerKpiCard` (extends KpiCard)
2. `CustomerTableToolbar`
3. `CustomersDataTable`
4. `CustomerEmptyState`
5. `CustomerStatusBadge`
6. `CustomerTypeBadge`

---

## 📄 Pagina 2: OFFERTES (Pipeline)

### Current Status
✅ Grotendeels gerefactored in eerdere sessie
✅ KPI cards met KpiCard component
✅ Empty state met OfferteEmptyState
✅ Bulk actions met OfferteBulkActions

### Remaining Improvements

#### A) Header - Simplify CTA Cluster
```tsx
<PageHeader
  title="Pipeline & Offertes"
  subtitle="Beheer je acquisitie pipeline en genereer slimme offertes"
  rightSlot={
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="border-white/10 hover:bg-white/5"
        onClick={() => setShowAdvancedAI(true)}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        AI Wizard
      </Button>
      <Button 
        className="bg-cyan-500 hover:bg-cyan-600"
        onClick={openCreateDialog}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nieuwe Offerte
      </Button>
    </div>
  }
/>
```

#### B) Status Tabs - Enhance Visual Clarity
```tsx
<div className="flex gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
  {['all', 'concept', 'verzonden', 'geaccepteerd'].map(status => (
    <button
      key={status}
      className={cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-all",
        statusFilter === status
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
          : "text-zinc-400 hover:text-white hover:bg-white/5"
      )}
      onClick={() => setStatusFilter(status)}
    >
      {status === 'all' ? 'Alle' : status}
    </button>
  ))}
</div>
```

#### C) Status Badges Component
```tsx
<QuoteStatusBadge status={offerte.status} />

// Component implementation
const statusConfig = {
  concept: { color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20", label: "Concept" },
  verzonden: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Verzonden" },
  bekeken: { color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", label: "Bekeken" },
  onderhandelen: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Onderhandeling" },
  geaccepteerd: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Geaccepteerd" },
  verloren: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Verloren" },
  vervallen: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Vervallen" }
};
```

#### D) Win Chance Badge
```tsx
<WinChanceBadge probability={offerte.winProbability} />

// Component shows progress pill
<div className="flex items-center gap-2">
  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
    <div
      className={cn(
        "h-full transition-all",
        probability > 75 ? "bg-emerald-500" : 
        probability > 50 ? "bg-blue-500" : 
        "bg-zinc-500"
      )}
      style={{ width: `${probability}%` }}
    />
  </div>
  <span className="text-xs font-medium text-zinc-400">
    {probability}%
  </span>
</div>
```

### Components Needed
1. ✅ `QuoteKpiCard` (done - uses KpiCard)
2. `QuoteTableToolbar`
3. `QuoteStatusBadge`
4. `WinChanceBadge`
5. ✅ `OnboardingEmptyState` (done - OfferteEmptyState)

---

## 📄 Pagina 3: FACTUREN

### Current Issues
❌ KPI cards met inconsistente styling
❌ "AI Opvolgadvies" button te prominent (should be secondary)
❌ Table geen sticky header
❌ Overdue rows niet visueel onderscheiden
❌ Empty state te simpel
❌ Geen result count in toolbar

### Refactor Plan

#### A) Header - Fix Button Hierarchy
```tsx
<PageHeader
  title="Facturen"
  subtitle="Beheer je facturen en betalingen"
  rightSlot={
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="border-white/10 hover:bg-white/5"
        onClick={() => navigate("/ai-assistant")}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        AI Opvolgadvies
      </Button>
      <Button 
        className="bg-cyan-500 hover:bg-cyan-600"
        onClick={openCreateDialog}
      >
        <Plus className="w-4 h-4 mr-2" />
        Nieuwe Factuur
      </Button>
    </div>
  }
/>
```

#### B) KPI Cards - Semantic Hints
```tsx
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <KpiCard
    title="Openstaand"
    value={formatCurrency(totaalOpenstaand)}
    icon={<Clock className="w-5 h-5" />}
    trend="neutral"
    definition="Facturen die nog betaald moeten worden"
  />
  <KpiCard
    title="Betaald (Deze maand)"
    value={formatCurrency(totaalBetaald)}
    icon={<CheckCircle2 className="w-5 h-5" />}
    trend="up"
    change="+12%"
    definition="Ontvangen betalingen deze maand"
  />
  <KpiCard
    title="Overtijd"
    value={formatCurrency(totaalOvertijd)}
    icon={<AlertCircle className="w-5 h-5" />}
    trend="down"
    definition="Facturen die de vervaldatum hebben overschreden"
  />
</div>
```

#### C) Invoice Status Badge
```tsx
<InvoiceStatusBadge status={factuur.status} />

const statusConfig = {
  betaald: {
    label: "Betaald",
    icon: CheckCircle2,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  },
  openstaand: {
    label: "Openstaand",
    icon: Clock,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
  },
  overtijd: {
    label: "Overtijd",
    icon: AlertCircle,
    color: "bg-red-500/10 text-red-400 border-red-500/20"
  },
  concept: {
    label: "Concept",
    icon: FileText,
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
  }
};
```

#### D) Table with Overdue Indicator
```tsx
<tr className={cn(
  "border-b border-white/5 hover:bg-white/5 transition-colors group",
  factuur.status === "overtijd" && "border-l-2 border-l-red-500/50"
)}>
  {/* ... table cells ... */}
</tr>
```

#### E) Invoice Table Toolbar
```tsx
<InvoiceTableToolbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  filterStatus={filterStatus}
  onFilterChange={setFilterStatus}
  resultCount={filteredFacturen.length}
  onExport={handleExport}
  hasActiveFilters={filterStatus !== "all" || searchQuery !== ""}
  onClearFilters={() => {
    setSearchQuery("");
    setFilterStatus("all");
  }}
/>
```

#### F) Empty State
```tsx
<InvoiceEmptyState
  title="Nog geen facturen"
  description="Maak je eerste factuur of importeer bestaande facturen."
  benefits={[
    "Koppel aan offertes",
    "Automatische herinneringen",
    "Betaalstatus opvolgen"
  ]}
  primaryAction={{
    label: "Nieuwe factuur",
    onClick: openCreateDialog
  }}
  secondaryAction={{
    label: "Import",
    onClick: () => setImportDialogOpen(true)
  }}
/>
```

### Components Needed
1. `InvoiceKpiCard` (extends KpiCard)
2. `InvoiceStatusBadge`
3. `InvoiceTableToolbar`
4. `InvoicesDataTable`
5. `InvoiceEmptyState`

---

## 🔧 Shared Components (Reusable)

### 1. TableToolbar (Base Component)
```tsx
interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  resultCount?: number;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function TableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Zoeken...",
  filters,
  actions,
  resultCount,
  hasActiveFilters,
  onClearFilters
}: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border-b border-white/10">
      {/* Left: Search + Result Count */}
      <div className="flex-1 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
        {resultCount !== undefined && (
          <span className="text-xs text-zinc-500 whitespace-nowrap">
            {resultCount} resultaten
          </span>
        )}
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Wis filters
          </Button>
        )}
      </div>

      {/* Right: Filters + Actions */}
      <div className="flex items-center gap-2">
        {filters}
        {actions}
      </div>
    </div>
  );
}
```

### 2. EmptyState (Base Component)
```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  benefits?: string[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  hasFilters?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  benefits,
  primaryAction,
  secondaryAction,
  hasFilters
}: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        {icon}
        <h3 className="text-lg font-medium mb-2 text-white">{title}</h3>
        <p className="text-sm text-zinc-500 mb-4">{description}</p>
        {primaryAction && (
          <Button
            variant="outline"
            onClick={primaryAction.onClick}
            className="border-cyan-500/30 text-cyan-400"
          >
            {primaryAction.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Icon */}
        {icon && (
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            {icon}
          </div>
        )}

        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-zinc-400">{description}</p>
        </div>

        {/* Benefits */}
        {benefits && benefits.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="border-white/10 hover:bg-white/5"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 3. StatusBadge (Base Component)
```tsx
interface StatusBadgeProps {
  status: string;
  config: Record<string, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;
}

export function StatusBadge({ status, config }: StatusBadgeProps) {
  const statusInfo = config[status];
  if (!statusInfo) return null;

  const Icon = statusInfo.icon;

  return (
    <Badge
      variant="outline"
      className={cn("border-0", statusInfo.color)}
    >
      <Icon className="w-3 h-3 mr-1" />
      {statusInfo.label}
    </Badge>
  );
}
```

---

## 📊 Implementation Priority

### Phase 1: Shared Components (Week 1)
1. ✅ KpiCard (done)
2. ✅ ChartCard (done)
3. ✅ ActivityList (done)
4. TableToolbar (base)
5. EmptyState (base)
6. StatusBadge (base)

### Phase 2: Klanten Page (Week 2)
1. CustomerKpiCard
2. CustomerTableToolbar
3. CustomersDataTable
4. CustomerEmptyState
5. CustomerStatusBadge
6. CustomerTypeBadge

### Phase 3: Facturen Page (Week 3)
1. InvoiceKpiCard
2. InvoiceStatusBadge
3. InvoiceTableToolbar
4. InvoicesDataTable
5. InvoiceEmptyState

### Phase 4: Offertes Polish (Week 4)
1. QuoteStatusBadge
2. WinChanceBadge
3. QuoteTableToolbar
4. Polish existing components

---

## ✅ Acceptance Criteria

### Visual Consistency
- [ ] All pages use same surface system (#0A0E1A → #0F1520 → #151B2B)
- [ ] All borders are white/10 (white/20 for focus)
- [ ] All KPI cards use KpiCard component
- [ ] All empty states use EmptyState component
- [ ] All status badges use StatusBadge component

### Interaction States
- [ ] Hover states consistent (hover:bg-white/5)
- [ ] Focus states visible (focus:border-cyan-500 focus:ring-1)
- [ ] Active states clear (bg-cyan-500/10 text-cyan-400)
- [ ] Disabled states obvious (opacity-50)

### Typography
- [ ] Page titles: text-2xl font-bold text-white
- [ ] Section titles: text-base font-semibold text-white
- [ ] Labels: text-xs uppercase tracking-wider text-zinc-400
- [ ] Values: text-2xl/3xl font-bold text-white
- [ ] Metadata: text-xs text-zinc-500

### Spacing
- [ ] Page padding: p-4 lg:p-6
- [ ] Card padding: p-5 (KPI), p-6 (content)
- [ ] Section gaps: gap-6 lg:gap-8
- [ ] Grid gaps: gap-4
- [ ] 8px grid throughout

### Functionality
- [ ] Search works instantly
- [ ] Filters are clear and consistent
- [ ] Result count visible
- [ ] Clear filters option when active
- [ ] Sticky table headers
- [ ] Row hover states
- [ ] Empty states convert to action
- [ ] Loading states with skeletons
- [ ] Error states with retry

### Accessibility
- [ ] Focus rings visible
- [ ] Contrast ratios > 4.5:1
- [ ] Aria labels on icon buttons
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### Performance
- [ ] No layout shifts
- [ ] Smooth animations (< 300ms)
- [ ] No jank on scroll
- [ ] Optimistic UI updates
- [ ] Debounced search

---

## 🎉 Expected Outcome

Na deze refactor hebben we:
1. **Consistente design language** across alle data pagina's
2. **Herbruikbare componenten** die makkelijk te onderhouden zijn
3. **Enterprise-grade UX** met duidelijke hiërarchie en interactie states
4. **Betere conversie** door premium empty states
5. **Snellere development** door component library

**De app voelt nu als één coherent, professioneel SaaS product.**
