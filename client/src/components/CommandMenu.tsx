import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    User,
    LayoutDashboard,
    FileText,
    Users,
    Sparkles,
    Command as CommandIcon,
    Search,
    Plus
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [, setLocation] = useLocation();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-40 md:hidden">
                <button
                    onClick={() => setOpen(true)}
                    className="bg-cyan-500 text-white p-3 rounded-full shadow-lg hover:bg-cyan-600 transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>
            </div>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                title="Quick Actions"
                description="Search for commands, pages, and actions."
                showCloseButton={false}
                className="glass-card border-white/10 dark:bg-black/80"
            >
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => setLocation("/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4 text-cyan-400" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/offertes"))}>
                            <FileText className="mr-2 h-4 w-4 text-purple-400" />
                            <span>Offertes</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/klanten"))}>
                            <Users className="mr-2 h-4 w-4 text-blue-400" />
                            <span>Klanten</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setLocation("/facturen"))}>
                            <CreditCard className="mr-2 h-4 w-4 text-green-400" />
                            <span>Facturen</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Quick Actions">
                        <CommandItem onSelect={() => runCommand(() => { /* TODO: Trigger new quote modal */ })}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Nieuwe Offerte</span>
                            <CommandShortcut>⌘N</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => { /* TODO: Trigger AI Assistant */ })}>
                            <Sparkles className="mr-2 h-4 w-4 text-cyan-400" />
                            <span>Ask AI Assistant</span>
                            <CommandShortcut>⌘I</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => setLocation("/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Instellingen</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
