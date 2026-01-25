# Dashboard Data Contracts (Draft)

## Endpoints

### GET /dashboard/summary
- **Purpose**: Fetch KPI summary values.
- **Response**: { kpis: KPIData[] }

### GET /dashboard/charts
- **Purpose**: Fetch chart datasets with filters.
- **Query**: timeRange, filter, compareTo
- **Response**: { charts: ChartConfiguration[] }

### POST /dashboard/preferences
- **Purpose**: Save user dashboard preferences.
- **Body**: UserPreferences
- **Response**: { status: "ok" }

## Notes
- These contracts map to Supabase queries or RPCs.
- CSV export is client-side (no API required).
