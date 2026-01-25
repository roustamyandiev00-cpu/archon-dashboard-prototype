import type { DashboardWidget } from "@/components/dashboard/DashboardCustomizer";

export const mergeDashboardWidgets = (
  defaults: DashboardWidget[],
  stored: DashboardWidget[]
) => {
  const storedMap = new Map(stored.map((widget) => [widget.id, widget]));

  return defaults.map((widget, index) => {
    const saved = storedMap.get(widget.id);
    if (!saved) {
      return { ...widget, order: index };
    }
    return {
      ...widget,
      ...saved,
      order: saved.order ?? index,
      visible: saved.visible ?? true,
    };
  }).sort((a, b) => a.order - b.order);
};
