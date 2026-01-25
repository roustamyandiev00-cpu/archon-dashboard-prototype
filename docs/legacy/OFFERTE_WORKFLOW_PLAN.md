# Offerte Workflow Implementation Plan

## 1. Data Model & Architecture
- [x] Create `client/src/lib/types-workflow.ts` with strict types for Offerte, Status, and Audit Log.
- [ ] Ensure Firestore rules allow creating/reading these collections (assumed generic rules exist).

## 2. Refactor `Offerte.tsx` (List View)
- [ ] **Status Filters**: Update the filter dropdown to support new statuses: `bekeken`, `onderhandelen`, `verloren`.
- [ ] **Columns**: Add "Next Action" column logic based on status.
  - Concept -> "Verzenden"
  - Verzonden -> "Herinnering sturen" (if > 2 days)
  - Bekeken -> "Contact opnemen"
  - Geaccepteerd -> "Project starten"
- [ ] **AI Winstkans**: Update the probability display to show a tooltip with "factors" (mocked for now, but structured).

## 3. Refactor `AIOfferteDialog.tsx` (Creation Flow)
- [ ] **Output Structure**: Ensure the AI output maps strictly to `OfferteItem[]`.
- [ ] **Validation Step**: Add a visible "Validator" logic before saving:
  - Check for items with 0 price.
  - Check for missing descriptions.
  - Warning if margin is low (mock logic).

## 4. Automation & Triggers (Client-Side Simulation)
Since we are in a prototype/Firebase client environment:
- [ ] Create `client/src/lib/workflow-engine.ts` to simulate server-side triggers.
- [ ] **Event: QuoteSent**: When user clicks "Verzend", trigger `WorkflowEngine.emit('QuoteSent', offerteId)`.
  - Action: Schedule a follow-up task (mock persistence).
- [ ] **Event: QuoteAccepted**: Trigger `WorkflowEngine.emit('QuoteAccepted', offerteId)`.
  - Action: Auto-create Project and Milestones.

## 5. Implementation Steps
1.  **Modify `Offertes.tsx`**: Add the new statuses and columns.
2.  **Modify `AIOfferteDialog.tsx`**: Enforce the JSON structure for items.
3.  **Create `WorkflowEngine`**: A simple class to handle status transitions and side effects (creating tasks/projects).
