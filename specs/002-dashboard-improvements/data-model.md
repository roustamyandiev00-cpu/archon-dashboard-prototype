# Data Model: Dashboard UX Improvements

## Entities

### DashboardWidget
- **Represents**: A visible widget on the dashboard.
- **Fields**: id, title, type, position, size, visibility, dataSource, lastUpdated.
- **Relationships**: Links to KPIData or ChartConfiguration.

### KPIData
- **Represents**: Aggregated KPI values shown in cards.
- **Fields**: key, label, value, trend, comparisonValue, timeRange.
- **Relationships**: Used by DashboardWidget.

### ChartConfiguration
- **Represents**: Configuration for chart rendering and filtering.
- **Fields**: chartType, metrics, filters, timeRange, compareTo, exportable.
- **Relationships**: Attached to DashboardWidget.

### UserPreferences
- **Represents**: Persisted dashboard layout and filter preferences.
- **Fields**: userId, widgetLayout, hiddenWidgets, defaultTimeRange, savedFilters.
- **Relationships**: Belongs to User profile.

### RealTimeSubscription
- **Represents**: Live data subscription state.
- **Fields**: channel, status, lastHeartbeat, errorState.
- **Relationships**: Used by KPIData and chart data providers.

## Validation Rules

- Widget positions must not overlap; sizes must fit grid.
- Time ranges must be one of: week, month, quarter, year.
- Filters must map to known data dimensions (status, client, project).

## State Transitions

- Subscription: active → degraded → reconnecting → active.
- Widget: visible → hidden (user action) → visible.
