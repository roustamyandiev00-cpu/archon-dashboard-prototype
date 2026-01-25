/**
 * Bulk Actions Component
 * Snelle acties op meerdere offertes tegelijk
 */

import { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Send,
  Trash2,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Mail,
  Archive,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { componentClasses } from "@/lib/design-tokens";

interface OfferteBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, ids: string[]) => Promise<void>;
}

export function OfferteBulkActions({
  selectedIds,
  onClearSelection,
  onBulkAction
}: OfferteBulkActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      await onBulkAction(action, selectedIds);
      
      const actionLabels: Record<string, string> = {
        send: "verzonden",
        delete: "verwijderd",
        export: "geëxporteerd",
        duplicate: "gedupliceerd",
        accept: "geaccepteerd",
        reject: "afgewezen",
        email: "gemaild",
        archive: "gearchiveerd",
        "ai-advice": "geanalyseerd door AI"
      };
      
      toast.success(`${selectedIds.length} offerte(s) ${actionLabels[action] || "verwerkt"}`);
      onClearSelection();
    } catch (error) {
      toast.error("Actie mislukt", { description: "Probeer het opnieuw" });
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-card border-white/10 shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[500px]">
        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
          {selectedIds.length} geselecteerd
        </Badge>

        <div className="flex gap-2 flex-1">
          {/* AI Opvolgadvies - Moved here from toolbar */}
          <Button
            size="sm"
            className="bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
            onClick={() => {
              toast.info("AI analyseert geselecteerde offertes...", {
                description: "Opvolgadvies wordt gegenereerd",
                icon: <Sparkles className="w-4 h-4" />
              });
              handleAction("ai-advice");
            }}
            disabled={loading}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Advies
          </Button>

          <Button
            size="sm"
            className={componentClasses.button.secondary}
            onClick={() => handleAction("send")}
            disabled={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            Verzenden
          </Button>

          <Button
            size="sm"
            className={componentClasses.button.secondary}
            onClick={() => handleAction("export")}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className={componentClasses.button.secondary}
                disabled={loading}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/10">
              <DropdownMenuItem onClick={() => handleAction("duplicate")}>
                <Copy className="w-4 h-4 mr-2" />
                Dupliceren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("email")}>
                <Mail className="w-4 h-4 mr-2" />
                Email versturen
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => handleAction("accept")} className="text-emerald-400">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accepteren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("reject")} className="text-red-400">
                <XCircle className="w-4 h-4 mr-2" />
                Afwijzen
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => handleAction("archive")}>
                <Archive className="w-4 h-4 mr-2" />
                Archiveren
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAction("delete")}
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-muted-foreground hover:text-white"
        >
          Annuleren
        </Button>
      </div>
    </div>
  );
}