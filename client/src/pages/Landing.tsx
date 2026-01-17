/*
 * Landing Page - Public facing marketing page
 * Design: Modern SaaS landing with hero, features, and CTA
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Check, Sparkles, BarChart, Users, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 px-4 py-3 bg-zinc-950/50 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                ARCHON<span className="text-cyan-500">.AI</span>
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Functies
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Prijzen
            </Link>
            <Link href="#about" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Over ons
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm text-zinc-300 hover:text-white hover:bg-white/5">
                Inloggen
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border-0">
                Gratis proberen
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
              <Sparkles className="w-4 h-4" />
              Nieuw: AI-Assistent 2.0
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-8 display-text tracking-tight"
          >
            Bouwsoftware voor<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
              slimme ondernemers
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          >
            De alles-in-één oplossing voor facturatie, projectmanagement en financieel inzicht.
            Speciaal ontwikkeld voor de moderne bouwsector.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg bg-cyan-500 hover:bg-cyan-600 text-white shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all rounded-xl">
                Start gratis proefperiode
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 text-white hover:border-white/20 rounded-xl">
                Bekijk de demo
              </Button>
            </Link>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-20 relative"
          >
            <div className="relative max-w-5xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <img
                src="/images/hero-gradient-mesh.png"
                alt="Voorbeeld van ARCHON Dashboard"
                className="relative w-full h-auto rounded-2xl shadow-2xl shadow-black/50 border border-white/10 bg-zinc-900/50 backdrop-blur-sm"
              />
              {/* Floating feature pills */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute -left-4 top-1/4 bg-zinc-900/90 backdrop-blur border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3 hidden md:flex"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Omzet deze maand</div>
                  <div className="font-bold text-white">€ 48.250,00</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -right-4 bottom-1/4 bg-zinc-900/90 backdrop-blur border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3 hidden md:flex"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Nieuwe leads</div>
                  <div className="font-bold text-white">+12 deze week</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4 bg-zinc-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold mb-6 display-text"
            >
              Alles wat je nodig hebt
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed"
            >
              Een complete toolkit voor jouw bouwbedrijf. Van eerste offerte tot laatste factuur, volledig geautomatiseerd.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart className="w-8 h-8 text-cyan-400" />,
                title: "Financieel inzicht",
                description: "Real-time overzicht van je financiële gezondheid met slimme rapportages en prognoses.",
                features: ["Automatische BTW-berekening", "Winst- & verliesanalyse", "Cashflow voorspellingen"]
              },
              {
                icon: <Users className="w-8 h-8 text-blue-400" />,
                title: "Projectmanagement",
                description: "Houd alle projecten, taken en deadlines perfect georganiseerd in één overzicht.",
                features: ["Gantt-grafieken", "Urenregistratie", "Team samenwerking"]
              },
              {
                icon: <Shield className="w-8 h-8 text-purple-400" />,
                title: "Veilig & betrouwbaar",
                description: "Hoogwaardige beveiliging en dagelijkse back-ups voor gemoedsrust.",
                features: ["Twee-factor authenticatie", "Voldoet aan AVG", "256-bit encryptie"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-zinc-900 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/5 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="mb-6 p-3 bg-white/5 rounded-2xl w-fit group-hover:bg-cyan-500/10 transition-colors duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-zinc-400 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-cyan-400" />
                        </div>
                        <span className="text-sm text-zinc-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5" />
        <div className="container mx-auto">
          <div className="relative rounded-[2.5rem] p-12 md:p-24 text-center overflow-hidden border border-white/10 bg-zinc-900/80 backdrop-blur-xl">
            {/* CTA Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold mb-6 display-text"
              >
                Klaar om te groeien?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-zinc-300 mb-10 leading-relaxed"
              >
                Sluit je aan bij honderden bouwbedrijven die slimmer werken met Archon.
                Start vandaag nog met je 14-dagen gratis proefperiode.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-lg bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl transition-all rounded-xl font-semibold">
                    Start gratis proefperiode
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-14 px-10 text-lg border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30 rounded-xl">
                    Ik heb al een account
                  </Button>
                </Link>
              </motion.div>
              <p className="mt-6 text-sm text-zinc-500">
                Geen creditcard nodig • Direct opzegbaar • 24/7 support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-4 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  ARCHON<span className="text-cyan-500">.AI</span>
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                De slimste bouwsoftware voor ambitieuze ondernemers. Automatiseer je administratie en focus op vakmanschap.
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white text-base">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="text-zinc-400 hover:text-cyan-400 transition-colors">Functies</Link></li>
                <li><Link href="#pricing" className="text-zinc-400 hover:text-cyan-400 transition-colors">Prijzen</Link></li>
                <li><Link href="/login" className="text-zinc-400 hover:text-cyan-400 transition-colors">Inloggen</Link></li>
                <li><Link href="/register" className="text-zinc-400 hover:text-cyan-400 transition-colors">Registreren</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white text-base">Bedrijf</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#about" className="text-zinc-400 hover:text-cyan-400 transition-colors">Over ons</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors">Vacatures</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-white text-base">Kenniscentrum</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors">Documentatie</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors">API</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors">Hulpcentrum</Link></li>
                <li><Link href="#" className="text-zinc-400 hover:text-cyan-400 transition-colors">Community</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-500">
              © {new Date().getFullYear()} ARCHON.AI. Alle rechten voorbehouden.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-500">
              <Link href="#" className="hover:text-cyan-400 transition-colors">Privacybeleid</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">Gebruikersvoorwaarden</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">Cookiebeleid</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}