/**
 * Dashboard Customizer
 * Allows users to customize dashboard layout: hide/show widgets, reorder sections
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Eye, EyeOff, GripVertical, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface DashboardWidget {
  id: string;
  label: string;
  description?: string;
  visible: boolean;
  order: number;
  category: "kpi" | "chart" | "list" | "action";
}

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onSave: (widgets: DashboardWidget[]) => void;
}

export function DashboardCustomizer({ widgets, onSave }: DashboardCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<DashboardWidget[]>(widgets);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleToggleVisibility = (id: string) => {
    setLocalWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    setLocalWidgets(prev => {
      const draggedIndex = prev.findIndex(w => w.id === draggedItem);
      const targetIndex = prev.findIndex(w => w.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(draggedIndex, 1);
      newWidgets.splice(targetIndex, 0, removed);

      return newWidgets.map((w, i) => ({ ...w, order: i }));
    });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSave = () => {
    onSave(localWidgets);
    setOpen(false);
  };

  const handleReset = () => {
    const resetWidgets = widgets.map((w, i) => ({
      ...w,
      visible: true,
      order: i,
    }));
    setLocalWidgets(resetWidgets);
  };

  const groupedWidgets = {
    kpi: localWidgets.filter(w => w.category === "kpi"),
    chart: localWidgets.filter(w => w.category === "chart"),
    list: localWidgets.filter(w => w.category === "list"),
    action: localWidgets.filter(w => w.category === "action"),
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-white/10 hover:bg-white/5"
        onClick={() => setOpen(true)}
      >
        <Settings className="w-4 h-4 mr-2" />
        Aanpassen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl bg-[#0F1520] border border-white/10 max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Dashboard aanpassen</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Verberg widgets of versleep ze om de volgorde te wijzigen
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Action Banner */}
            {groupedWidgets.action.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Actie Banner
                </h3>
                {groupedWidgets.action.map(widget => (
                  <WidgetItem
                    key={widget.id}
                    widget={widget}
                    onToggle={handleToggleVisibility}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedItem === widget.id}
                  />
                ))}
              </div>
            )}

            {/* KPI Cards */}
            {groupedWidgets.kpi.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  KPI Cards
                </h3>
                {groupedWidgets.kpi.map(widget => (
                  <WidgetItem
                    key={widget.id}
                    widget={widget}
                    onToggle={handleToggleVisibility}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedItem === widget.id}
                  />
                ))}
              </div>
            )}

            {/* Charts */}
            {groupedWidgets.chart.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Grafieken
                </h3>
                {groupedWidgets.chart.map(widget => (
                  <WidgetItem
                    key={widget.id}
                    widget={widget}
                    onToggle={handleToggleVisibility}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedItem === widget.id}
                  />
                ))}
              </div>
            )}

            {/* Lists */}
            {groupedWidgets.list.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Lijsten & Activiteit
                </h3>
                {groupedWidgets.list.map(widget => (
                  <WidgetItem
                    key={widget.id}
                    widget={widget}
                    onToggle={handleToggleVisibility}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedItem === widget.id}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-zinc-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset naar standaard
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-white/10 hover:bg-white/5"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleSave}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Opslaan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface WidgetItemProps {
  widget: DashboardWidget;
  onToggle: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function WidgetItem({
  widget,
  onToggle,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: WidgetItemProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(widget.id)}
      onDragOver={(e) => onDragOver(e, widget.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 transition-all cursor-move",
        isDragging && "opacity-50 scale-95",
        !widget.visible && "opacity-60"
      )}
    >
      <GripVertical className="w-4 h-4 text-zinc-500 shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {widget.label}
        </p>
        {widget.description && (
          <p className="text-xs text-zinc-500 truncate">
            {widget.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={widget.visible}
          onCheckedChange={() => onToggle(widget.id)}
          className="data-[state=checked]:bg-cyan-500"
        />
        {widget.visible ? (
          <Eye className="w-4 h-4 text-cyan-400" />
        ) : (
          <EyeOff className="w-4 h-4 text-zinc-500" />
        )}
      </div>
    </div>
  );
}
