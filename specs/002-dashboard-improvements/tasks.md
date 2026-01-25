---
description: "Task list for dashboard UX improvements"
---

# Tasks: Dashboard UX Improvements

**Input**: Design documents from `/specs/002-dashboard-improvements/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested.

**Organization**: Tasks grouped by user story to enable independent implementation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared UI and data utilities for dashboard enhancements

- [ ] T001 Audit existing dashboard data flow and identify KPIs/charts data sources in client/src/hooks/useDashboardData.ts
- [ ] T002 [P] Define shared chart styling tokens and tooltip styles in client/src/components/EnhancedCharts.tsx
- [ ] T003 [P] Add reusable empty/error state components in client/src/components/dashboard/EmptyState.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core capabilities needed before user story work

- [ ] T004 Implement dashboard data normalization helpers in client/src/lib/dashboard-mappers.ts
- [ ] T005 [P] Add localStorage persistence helpers for filters/layout in client/src/lib/dashboard-preferences.ts
- [ ] T006 [P] Add realtime status banner logic in client/src/components/dashboard/RealtimeStatus.tsx

**Checkpoint**: Foundation ready for user story implementation

---

## Phase 3: User Story 1 - Enhanced Dashboard Overview (Priority: P1) 🎯 MVP

**Goal**: Rich KPI cards and summary overview with fast load and clear states

**Independent Test**: Dashboard renders KPI cards with empty states and drilldown actions in under 3 seconds.

### Implementation for User Story 1

- [ ] T007 [US1] Update KPI card variants and hover interactions in client/src/components/dashboard/KpiCard.tsx
- [ ] T008 [US1] Map KPI data to cards with normalized values in client/src/pages/Dashboard.tsx
- [ ] T009 [US1] Add empty states and guidance actions for KPIs in client/src/pages/Dashboard.tsx
- [ ] T010 [US1] Add realtime status banner to dashboard header in client/src/pages/Dashboard.tsx

**Checkpoint**: User Story 1 independently functional

---

## Phase 4: User Story 2 - Interactive Data Visualization (Priority: P2)

**Goal**: Interactive charts with filtering, tooltips, and exports

**Independent Test**: Charts respond to filters and hover tooltips without UI blocking.

### Implementation for User Story 2

- [ ] T011 [US2] Add chart filter controls and callbacks in client/src/components/EnhancedCharts.tsx
- [ ] T012 [US2] Wire filter state and compare periods in client/src/pages/Dashboard.tsx
- [ ] T013 [US2] Add CSV export handler for chart datasets in client/src/lib/dashboard-export.ts
- [ ] T014 [US2] Connect export actions to chart controls in client/src/components/EnhancedCharts.tsx

**Checkpoint**: User Story 2 independently functional

---

## Phase 5: User Story 3 - Personalized Dashboard Configuration (Priority: P3)

**Goal**: Persisted widget layout and visibility preferences

**Independent Test**: User layout persists across reloads and devices (localStorage fallback).

### Implementation for User Story 3

- [ ] T015 [US3] Persist widget layout and visibility in client/src/components/dashboard/DashboardCustomizer.tsx
- [ ] T016 [US3] Hydrate saved preferences on load in client/src/pages/Dashboard.tsx
- [ ] T017 [US3] Add user preference storage mapping in client/src/lib/dashboard-preferences.ts

**Checkpoint**: User Story 3 independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Performance, accessibility, and resilience

- [ ] T018 [P] Add skeleton/loading states for dashboard cards in client/src/pages/Dashboard.tsx
- [ ] T019 [P] Add accessibility labels and keyboard focus styles in client/src/components/dashboard/KpiCard.tsx
- [ ] T020 [P] Update quickstart verification checklist in specs/002-dashboard-improvements/quickstart.md

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → P1 (US1) → P2 (US2) → P3 (US3) → Polish
- US1 is MVP; US2/US3 can follow sequentially after foundations

## Parallel Opportunities

- T002, T003 can run in parallel
- T005, T006 can run in parallel
- T018, T019, T020 can run in parallel

## Implementation Strategy

- Build MVP with US1 first, then enrich charts (US2), then personalization (US3).
