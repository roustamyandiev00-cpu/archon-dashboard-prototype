import { motion } from "framer-motion";
import { HelpCircle, MessageCircle, Book, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Help() {
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
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
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
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
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
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
              Stuur E-mail
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              Veelgestelde Vragen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              "Hoe maak ik mijn eerste factuur?",
              "Hoe voeg ik een nieuwe klant toe?",
              "Hoe werkt de AI assistent?",
              "Hoe kan ik mijn data exporteren?"
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
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
    </div>
  );
}
