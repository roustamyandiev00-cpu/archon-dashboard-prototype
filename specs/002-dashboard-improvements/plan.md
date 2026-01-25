# Implementation Plan: Dashboard UX Improvements

**Branch**: `002-dashboard-improvements` | **Date**: 2026-01-23 | **Spec**: ../spec.md
**Input**: Feature specification from `/specs/002-dashboard-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Improve the dashboard UX with richer KPI cards, interactive data visualizations, and personalized layouts while keeping performance targets (<3s load) and accessibility requirements. The plan focuses on UI components, data shaping, filtering, and graceful empty/error states.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (Vite + React)  
**Primary Dependencies**: React, Recharts, Framer Motion, TailwindCSS, Supabase JS  
**Storage**: Supabase (PostgreSQL) + localStorage for UI preferences  
**Testing**: Vitest + React Testing Library (NEEDS CLARIFICATION: current test setup usage)  
**Target Platform**: Web (desktop + mobile)  
**Project Type**: Web application (single frontend in `/client`)  
**Performance Goals**: Dashboard load < 3s on 95% of sessions; chart interaction < 500ms  
**Constraints**: Must handle empty states, partial data, and degraded network without blocking UI  
**Scale/Scope**: Dashboard for SMB teams; 1k+ records per dataset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file contains placeholders and no enforceable rules.
- Action: Update constitution with actual principles before relying on gating.

## Project Structure

### Documentation (this feature)

```text
specs/002-dashboard-improvements/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
client/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   └── ui/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   └── contexts/
└── public/
```

**Structure Decision**: Single web frontend (Vite) in `/client` with dashboard-specific components under `client/src/components/dashboard`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
