import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Book, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Help() {
  const [chatOpen, setChatOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const faqs = [
    "Hoe maak ik mijn eerste factuur?",
    "Hoe voeg ik een nieuwe klant toe?",
    "Hoe werkt de AI assistent?",
    "Hoe kan ik mijn data exporteren?"
  ];

  const handleOpenFaq = (faq: string) => {
    setSelectedFaq(faq);
    setFaqOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Pages</span>
          <span>/</span>
          <span className="text-foreground">Help & Support</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Help & Support
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Vind antwoorden op je vragen en krijg ondersteuning
            </motion.p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer">
          <CardHeader>
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 w-fit">
              <MessageCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Praat direct met ons support team voor directe hulp.
            </p>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setChatOpen(true)}>
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer">
          <CardHeader>
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
              <Book className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Kennisbank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Doorzoek onze uitgebreide kennisbank met handleidingen en tips.
            </p>
            <Button
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5"
              onClick={() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" })}
            >
              Kennisbank
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer">
          <CardHeader>
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 w-fit">
              <Mail className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              E-mail Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Stuur ons een e-mail en we reageren binnen 24 uur.
            </p>
            <Button
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5"
              onClick={() => {
                window.location.href = "mailto:support@archon.ai";
              }}
            >
              Stuur E-mail
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="faq">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Veelgestelde Vragen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleOpenFaq(faq)}
              >
                <p className="text-sm">{faq}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Contact Informatie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Telefoon</p>
                <p className="text-sm text-muted-foreground">020 123 4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">E-mail</p>
                <p className="text-sm text-muted-foreground">support@archon.ai</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">Openingstijden</p>
                <p className="text-sm text-muted-foreground">Ma-Vr: 09:00 - 17:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Live Chat</DialogTitle>
            <DialogDescription>Stel je vraag aan ons support team.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Typ je vraag..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setChatOpen(false)}>
              Sluiten
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                setChatMessage("");
                setChatOpen(false);
              }}
            >
              Verstuur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedFaq}</DialogTitle>
            <DialogDescription>Snelle uitleg uit de kennisbank.</DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Bekijk de relevante handleiding in de kennisbank voor stapsgewijze uitleg.
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setFaqOpen(false)}>
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
