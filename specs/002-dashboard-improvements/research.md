# Research Notes: Dashboard UX Improvements

## Decisions

### Testing approach
- **Decision**: Use existing Vitest + React Testing Library setup where available; add targeted component tests for KPI cards and charts.
- **Rationale**: Aligns with existing project tooling and keeps UI regressions visible without heavy end-to-end overhead.
- **Alternatives considered**: Cypress/Playwright for full UI flows (deferred for later once core UI stabilizes).

### Real-time data handling
- **Decision**: Use Supabase subscriptions where already configured; fallback to cached data when websocket fails.
- **Rationale**: Preserves responsiveness even under unstable network conditions.
- **Alternatives considered**: Polling only (rejected due to higher latency).

### Export behavior
- **Decision**: Provide client-side CSV export for chart datasets; PDF export deferred to later phase.
- **Rationale**: Fast to implement and keeps scope minimal while enabling quick data extraction.
- **Alternatives considered**: Server-side PDF generation (deferred).

## Open Questions (resolved)

- **Testing**: Assume Vitest + RTL is available; if not, create minimal setup for dashboard tests.

## Notes

- No additional external services required for UI improvements.
