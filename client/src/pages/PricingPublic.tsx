import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, Sparkles, HelpCircle, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const faqs = [
  {
    question: "Is Archon geschikt voor ZZP'ers en kleine teams?",
    answer:
      "Ja. Het Starter plan is gemaakt voor zelfstandigen en kleinere aannemers die snel willen offreren en factureren."
  },
  {
    question: "Kan ik op elk moment opzeggen?",
    answer:
      "Ja, je kunt maandelijks opzeggen. Tijdens de proefperiode betaal je niets en kun je direct stoppen."
  },
  {
    question: "Wat zit er in de onboarding en support?",
    answer:
      "We helpen je met het inrichten van projecten, facturatie en planning. Support is beschikbaar via e-mail en chat."
  },
  {
    question: "Werkt Archon op mobiel en tablet?",
    answer:
      "Ja, Archon werkt in de browser op mobiel, tablet en desktop. Zo kan je team altijd doorwerken."
  }
];

const testimonials = [
  {
    name: "Maarten de Vries",
    company: "Horizon Bouw BV",
    quote:
      "Archon geeft ons direct inzicht in marges per project. Offertes zijn sneller klaar en facturen gaan dezelfde dag de deur uit.",
    rating: 5
  },
  {
    name: "Sanne Kuipers",
    company: "Kuipers Renovatie",
    quote:
      "De planning en voortgang zijn eindelijk overzichtelijk voor het hele team. We besparen elke week uren aan administratie.",
    rating: 5
  },
  {
    name: "Jeroen Vos",
    company: "Vos Installaties",
    quote:
      "Heldere dashboards, goede support en simpele workflows. Dit is precies wat we nodig hadden om te groeien.",
    rating: 5
  }
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "mainEntity": faqs.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    },
    {
      "@type": "SoftwareApplication",
      "name": "ARCHON.AI",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://archon.ai/pricing",
      "review": testimonials.map((testimonial) => ({
        "@type": "Review",
        "reviewBody": testimonial.quote,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": String(testimonial.rating),
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": testimonial.name
        }
      }))
    }
  ]
};

import { startPlanFlow } from "@/lib/plan-flow";

export default function PricingPublic() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false); // Add state for annual toggle to match Landing page logic if needed, or just use hardcoded

  const handleStart = (planId: string) => {
    // Determine billing cycle based on the annual state which is controlled in the UI below
    startPlanFlow(planId, user, setLocation, annual ? "yearly" : "monthly");
  };

  const handleEnterprise = () => {
    toast.success("Bedankt voor je interesse!", {
      description: "Stuur een email naar sales@archon.ai voor een persoonlijk gesprek.",
      duration: 5000
    });

    // Open email client
    window.location.href = "mailto:sales@archon.ai?subject=Enterprise Plan Aanvraag&body=Ik ben geïnteresseerd in het Enterprise plan.";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-cyan-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.png')] bg-repeat opacity-[0.07]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[520px] bg-purple-500/10 rounded-full blur-[120px] opacity-20" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] bg-zinc-950/50 backdrop-blur-xl transition-all duration-200">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                ARCHON<span className="text-cyan-500">.AI</span>
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Functies
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Prijzen
            </Link>
            <Link href="/pricing#faq" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border-0"
                onClick={() => setLocation("/dashboard")}
              >
                Ga naar Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm text-zinc-300 hover:text-white hover:bg-white/5">
                    Inloggen
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border-0"
                  onClick={() => handleStart("growth")}
                >
                  Start gratis
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20 px-4">
        {/* Hero */}
        <section className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
              <Zap className="w-4 h-4" />
              Transparante prijzen zonder verrassingen
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold mb-6 display-text tracking-tight"
          >
            Prijzen voor bouwbedrijven die willen groeien
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 leading-relaxed"
          >
            Alles-in-een bouwsoftware voor facturatie, projectmanagement, planning en financieel inzicht.
            Kies het pakket dat past bij jouw team en schaal eenvoudig op.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="h-12 px-8 bg-cyan-500 hover:bg-cyan-600 text-white shadow-xl shadow-cyan-500/20 rounded-xl"
              onClick={() => handleStart("growth")}
            >
              Start gratis proefperiode
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Link href="/#demo">
              <Button variant="outline" size="lg" className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl">
                Bekijk demo
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto mt-20">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold display-text"
            >
              Kies het pakket dat past bij jouw workflow
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-zinc-400 text-lg max-w-2xl mx-auto"
            >
              Start eenvoudig en voeg modules toe wanneer je bedrijf groeit. Geen verborgen kosten, altijd inzicht.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                planId: "starter",
                price: "€29",
                description: "Voor zelfstandigen die snel willen offreren.",
                features: ["Tot 5 actieve projecten", "Basis facturen & offertes", "Email support", "Basis rapportages"],
                cta: "Binnenkort beschikbaar",
                disabled: true
              },
              {
                name: "Professional",
                planId: "growth",
                price: "€63",
                yearly: "€756/jaar (bespaar €192)",
                description: "Voor groeiende teams met meerdere projecten.",
                features: ["25 actieve projecten", "AI offerte generator", "Team planning", "Prioriteit support"],
                highlight: true,
                cta: "Start 14 dagen gratis",
                disabled: false
              },
              {
                name: "Business",
                planId: "enterprise",
                price: "€159",
                yearly: "€1908/jaar (bespaar €480)",
                description: "Voor middelgrote organisaties.",
                features: ["Onbeperkte projecten", "Custom integraties", "API toegang", "Dedicated support"],
                cta: "Start 14 dagen gratis",
                disabled: false
              }
            ].map((tier) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`relative rounded-3xl border p-8 ${tier.highlight
                  ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-zinc-900 shadow-xl shadow-cyan-500/10"
                  : "border-white/10 bg-zinc-900/70"
                  } ${tier.disabled ? "opacity-60" : ""}`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-cyan-500/30">
                    Meest gekozen
                  </span>
                )}
                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                <p className="mt-3 text-zinc-400">{tier.description}</p>
                <div className="mt-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-sm text-zinc-400">/ maand</span>
                  </div>
                  {tier.yearly && (
                    <p className="text-sm text-emerald-400 mt-1 font-medium">
                      {tier.yearly}
                    </p>
                  )}
                </div>
                <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                  {tier.features.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20">
                        <Check className="h-3 w-3 text-cyan-300" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`mt-8 w-full rounded-xl ${tier.highlight
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  onClick={() => handleStart(tier.planId)}
                  disabled={tier.disabled}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Enterprise card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <div className="relative rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-zinc-900 to-zinc-900 p-8 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Star className="w-6 h-6 text-orange-400" />
                    Enterprise
                  </h3>
                  <p className="mt-2 text-zinc-300">
                    Voor grote bouwconcerns met maatwerk requirements
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Onbeperkte team members
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Dedicated account manager
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Custom AI modellen & SLA garanties
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <div className="text-center md:text-right">
                    <span className="text-3xl font-bold text-white">Op aanvraag</span>
                  </div>
                  <Button
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                    onClick={handleEnterprise}
                  >
                    Neem contact op
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Reviews */}
        <section className="container mx-auto mt-24">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold display-text"
            >
              Wat klanten zeggen
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-zinc-400 text-lg"
            >
              Bouwteams gebruiken Archon voor meer overzicht, sneller offreren en minder administratie.
            </motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-lg"
              >
                <div className="flex items-center gap-1 text-cyan-400">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 text-cyan-400 fill-cyan-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm text-zinc-300 leading-relaxed">"{testimonial.quote}"</p>
                <div className="mt-4 text-sm text-zinc-500">
                  {testimonial.name} - {testimonial.company}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container mx-auto mt-24">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold display-text"
            >
              Veelgestelde vragen
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-zinc-400 text-lg"
            >
              Alles wat je wilt weten over onze bouwsoftware, prijzen en support.
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((item) => (
              <div
                key={item.question}
                className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10">
                    <HelpCircle className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto mt-24">
          <div className="relative rounded-[2.5rem] p-12 md:p-20 text-center overflow-hidden border border-white/10 bg-zinc-900/80 backdrop-blur-xl">
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
                Start vandaag nog met Archon
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl text-zinc-300 mb-8 leading-relaxed"
              >
                Probeer 14 dagen gratis en ervaar hoe je projecten, offertes en financien overzichtelijk blijven.
              </motion.p>
              <Button
                size="lg"
                className="h-12 px-10 text-lg bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl transition-all rounded-xl font-semibold"
                onClick={() => handleStart("growth")}
              >
                Start gratis proefperiode
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
