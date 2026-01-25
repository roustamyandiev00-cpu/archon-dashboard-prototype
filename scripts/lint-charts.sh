#!/bin/bash
# Lint guard: Prevent ChartContainer usage (not allowed in this project)
# ChartCard is the standard chart container component

if rg -n "ChartContainer" client/src --type tsx --type ts 2>/dev/null | grep -v "client/src/components/ui/chart.tsx"; then
  echo "❌ Error: ChartContainer found in codebase."
  echo "   Use ChartCard from @/components/dashboard/ChartCard instead."
  echo "   ChartContainer (shadcn) is not the standard in this project."
  exit 1
fi

echo "✅ No ChartContainer usage found."
exit 0
