/**
 * Column Manager
 * Beheer zichtbare kolommen en volgorde
 */

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Settings2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean;
}

interface OfferteColumnManagerProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export function OfferteColumnManager({
  columns,
  onColumnsChange
}: OfferteColumnManagerProps) {
  const [open, setOpen] = useState(false);
  const [localColumns, setLocalColumns] = useState(columns);

  const handleToggle = (id: string) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSave = () => {
    onColumnsChange(localColumns);
    setOpen(false);
  };

  const handleReset = () => {
    const reset = columns.map(col => ({ ...col, visible: true }));
    setLocalColumns(reset);
    onColumnsChange(reset);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 hover:bg-white/5"
        >
          <Settings2 className="w-4 h-4 mr-2" />
          Kolommen
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kolommen beheren</DialogTitle>
          <DialogDescription>
            Kies welke kolommen je wilt zien in de tabel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {localColumns.map((column) => (
            <div
              key={column.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-white/10",
                column.visible ? "bg-white/5" : "bg-transparent"
              )}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
              
              <Checkbox
                id={column.id}
                checked={column.visible}
                onCheckedChange={() => handleToggle(column.id)}
                disabled={column.required}
              />
              
              <Label
                htmlFor={column.id}
                className={cn(
                  "flex-1 cursor-pointer",
                  column.required && "text-muted-foreground"
                )}
              >
                {column.label}
                {column.required && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (verplicht)
                  </span>
                )}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-white/10"
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600"
          >
            Opslaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}