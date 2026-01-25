import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, TrendingUp, FileText, Users, Calendar, Receipt, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AISuggestion {
  icon: React.ReactNode;
  text: string;
  category: string;
}

const suggestions: AISuggestion[] = [
  {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "Wat is mijn cashflow deze maand?",
    category: "Financieel"
  },
  {
    icon: <FileText className="h-4 w-4" />,
    text: "Toon openstaande facturen",
    category: "Facturen"
  },
  {
    icon: <Users className="h-4 w-4" />,
    text: "Welke projecten lopen achter?",
    category: "Projecten"
  },
  {
    icon: <Calendar className="h-4 w-4" />,
    text: "Planning voor volgende week",
    category: "Agenda"
  }
];

const buildAssistantPayload = (history: Message[]) => ({
  messages: history.map((message) => ({
    role: message.role,
    text: message.content,
  })),
});

// Add props interface
interface AIAssistantPanelProps {
  externalInput?: string | null;
  onClearExternalInput?: () => void;
}

export function AIAssistantPanel({ externalInput, onClearExternalInput }: AIAssistantPanelProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hallo! Ik ben je AI-assistent. Ik kan je helpen met vragen over je projecten, financiën, planning en meer. Probeer een van de suggesties hieronder of stel me een vraag!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Handle external input (e.g. from Voice)
  useEffect(() => {
    if (externalInput) {
      handleSend(externalInput);
      onClearExternalInput?.();
    }
  }, [externalInput]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let responseText = "Ik kan nu geen antwoord ophalen. Probeer het later opnieuw.";

    try {
      const nextHistory = [...messages, userMessage];
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildAssistantPayload(nextHistory)),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof data.reply === "string" && data.reply.trim().length > 0) {
          responseText = data.reply;
        }
      }
    } catch {
      // Keep fallback responseText
    }

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
    inputRef.current?.focus();

    // Check if response mentions creating an offerte and suggest action
    const lowerResponse = responseText.toLowerCase();
    if (lowerResponse.includes("offerte") && (lowerResponse.includes("maken") || lowerResponse.includes("genereren") || lowerResponse.includes("opstellen"))) {
      // Auto-scroll to show the response
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleCreateOfferte = () => {
    navigate("/offertes?ai=1");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-border">
              <Sparkles className="h-5 w-5 text-cyan-400 ai-pulse" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card ai-glow-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg gradient-text">AI Assistent</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Altijd online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
        <div className="space-y-4 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                index={index}
                onCreateOfferte={handleCreateOfferte}
              />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span>AI denkt na...</span>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pb-4 space-y-2"
        >
          <p className="text-xs text-muted-foreground font-medium mb-3">
            Snelle vragen:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="group text-left p-3 rounded-lg bg-card hover:bg-muted/50 transition-all border border-border hover:border-cyan-500/30 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-cyan-400">{suggestion.icon}</div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {suggestion.category}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-tight">
                    {suggestion.text}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-6 pt-4 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Stel een vraag..."
              className="bg-muted/30 border-border focus-visible:border-cyan-500/50 pr-12 placeholder:text-muted-foreground/50"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {input.length > 0 && `${input.length}/500`}
            </div>
          </div>
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 transition-all glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          AI kan fouten maken. Controleer belangrijke informatie.
        </p>
      </div>
    </motion.div>
  );
}

interface MessageBubbleProps {
  message: Message;
  index: number;
  onCreateOfferte?: () => void;
}

function MessageBubble({ message, index, onCreateOfferte }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={cn(
        "flex gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-border flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-[80%] space-y-1",
        isUser && "flex flex-col items-end"
      )}>
        <div className={cn(
          "rounded-xl p-4 relative",
          isUser
            ? "bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 ml-8"
            : "bg-muted/40 border border-border mr-8"
        )}>
          {/* Message text with markdown-like formatting */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content.split('**').map((part, i) =>
              i % 2 === 0 ? part : <strong key={i} className="font-semibold text-cyan-400">{part}</strong>
            )}
          </p>
          
          {/* Action button for offerte creation */}
          {!isUser && message.content.toLowerCase().includes("offerte") && (
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                size="sm"
                onClick={onCreateOfferte}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
              >
                <Receipt className="w-3 h-3 mr-2" />
                Open AI Offerte Wizard
              </Button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 flex items-center justify-center font-semibold text-xs">
            JD
          </div>
        </div>
      )}
    </motion.div>
  );
}
