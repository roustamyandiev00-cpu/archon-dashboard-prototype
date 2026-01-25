# ChartContainer Fix - Documentation

## Issue
Clicking the button on the Modules page navigates to `/dashboard`, which crashes with:
```
ChartContainer is not defined
ReferenceError
```

## Root Cause (Corrected)
**Primary cause:** `ChartContainer` was used in `Dashboard.tsx` without a valid definition/import in scope → ReferenceError at runtime.

**Secondary cause (would occur if imported):** The shadcn `ChartContainer` from `@/components/ui/chart` has a different signature (requires `config` prop) than the props being passed (`title`, `subtitle`, `action`).

## Solution
Replaced `<ChartContainer>` with `<ChartCard>` from `@/components/dashboard/ChartCard`, which already has the correct props signature.

## Files Changed
- `client/src/pages/Dashboard.tsx` - Line 516: Changed `<ChartContainer>` to `<ChartCard>`
- `client/src/components/dashboard/ChartCard.tsx` - Enhanced with future-ready props

## ChartCard Enhancements
The `ChartCard` component is now future-ready with:
- `headerSlot`: Optional custom header content (overrides default title/subtitle)
- `contentPadding`: Optional content padding (default: `p-6`)
- `disableAnimation`: Disable animation for nested components

### Chart-Safety
ChartCard is already chart-safe:
- ✅ `h-full` on wrapper + `flex-1 min-h-0` on CardContent
- ✅ Fully children-based content
- ✅ Proper overflow handling for Recharts

## Regression Prevention

### Lint Guard
Created `scripts/lint-charts.sh` to prevent ChartContainer usage:
```bash
./scripts/lint-charts.sh
```

Add to pre-commit hook or CI pipeline:
```bash
# In .git/hooks/pre-commit
./scripts/lint-charts.sh || exit 1
```

### Project Rule
**Use `ChartCard` from `@/components/dashboard/ChartCard` as the standard chart container component.**

The shadcn `ChartContainer` from `@/components/ui/chart` is available but not used in this project.

## Runtime Smoke Test

### Steps
1. **Navigate from Modules page**
   - Go to `/modules`
   - Click "Opslaan & naar Dashboard" button
   - Dashboard should load without errors

2. **Hard refresh**
   - Open `/dashboard` directly
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
   - Dashboard should load without errors

3. **Chart interaction**
   - Hover over Cashflow chart
   - Verify tooltips appear correctly
   - Click time range buttons (week/month/quarter/year)
   - Verify chart updates

### Expected Results
- ✅ No ReferenceError
- ✅ Dashboard renders fully
- ✅ Charts are responsive
- ✅ Tooltips work correctly
- ✅ Time range switching works

## Verification Status
| Check | Status |
|-------|--------|
| ChartContainer usage in client/src | ✅ Only in chart.tsx (definition) |
| components/ui/chart imports | ✅ None found |
| TypeScript errors (related to fix) | ✅ None |
| Lint guard script | ✅ Created and passing |
| ChartCard chart-safety | ✅ Verified (flex-1 min-h-0) |
| Future-ready props | ✅ Added (headerSlot, contentPadding, disableAnimation) |

## Future Considerations
If shadcn charts need to be integrated:
1. Use `headerSlot` prop for custom chart controls
2. Use `contentPadding` prop to adjust chart spacing
3. Consider creating a wrapper that uses shadcn `ChartContainer` internally with `config` prop
