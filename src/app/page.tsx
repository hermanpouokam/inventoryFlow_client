"use client"

import { motion } from "framer-motion";
import {
  FileText,
  Package,
  Store,
  Users,
  Truck,
  Shield,
  Palette,
  Zap,
  Lock,
  Cloud,
  ThumbsUp,
  Building2,
  Check,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import dashboardMockup from "@/assets/dashboard-mockup.png";
import Image from "next/image";
import { formatteCurrency } from "./(admin)/stock/functions";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { encryptParam } from "@/utils/encryptURL";


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Section = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`py-14 md:py-18 ${className}`}>
    <div className="container mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
  </section>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
    {children}
  </span>
);

/* ──────────────────────────── NAV ──────────────────────────── */

const navLinks = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Avantages", href: "#why" },
  { label: "Tarifs", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-hero-foreground/10 bg-hero/80 backdrop-blur-xl">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#" className="flex items-center gap-2 text-xl font-bold text-hero-foreground">
          <Package className="h-7 w-7 text-primary" />
          InventoryFlow
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-hero-muted transition-colors hover:text-hero-foreground"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/signup"
            className="gradient-primary rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-glow"
          >
            Commencer
          </a>
        </div>
        <button className="text-hero-foreground md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-hero-foreground/10 bg-hero px-4 py-4 md:hidden">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-hero-muted"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/signup"
            onClick={() => setOpen(false)}
            className="mt-2 block gradient-primary rounded-lg px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
          >
            Commencer
          </a>
        </div>
      )}
    </nav>
  );
}

/* ──────────────────────────── HERO ──────────────────────────── */

function Hero() {
  return (
    <section className="gradient-hero relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-center lg:text-left"
          >
            <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              La gestion simplifiée
            </span>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-hero-foreground sm:text-5xl lg:text-6xl">
              Simplifiez la gestion de votre entreprise avec{" "}
              <span className="text-gradient">InventoryFlow</span>
            </h1>
            <p className="mx-auto mb-8 max-w-xl text-lg text-hero-muted lg:mx-0">
              Factures, stocks, magasins, clients & fournisseurs — tout centraliser dans une
              plateforme intuitive conçue pour les PME et grandes entreprises.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="/signup"
                className="gradient-primary inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90"
              >
                Commencer gratuitement <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-hero-foreground/20 px-7 py-3.5 text-sm font-semibold text-hero-foreground transition hover:bg-hero-foreground/5"
              >
                Voir la démo
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-xl border border-hero-foreground/10 shadow-glow">
              <Image
                src={dashboardMockup}
                alt="InventoryFlow dashboard"
                className="w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── STATS BANNER ──────────────────────────── */

const stats = [
  { value: "10K+", label: "Entreprises", icon: Building2 },
  { value: "2M+", label: "Factures créées", icon: FileText },
  { value: "99.9%", label: "Uptime", icon: Cloud },
  { value: "4.9/5", label: "Satisfaction", icon: ThumbsUp },
];

function StatsBanner() {
  return (
    <div className="relative -mt-12 z-10">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-glow backdrop-blur-sm"
        >
          {/* inner decorative gradient stripe */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 gradient-primary" />
          <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-[60px]" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-primary/8 blur-[60px]" />
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`group relative flex flex-col items-center justify-center px-6 py-10 transition-colors duration-300 hover:bg-primary/[0.03] ${i < stats.length - 1 ? "md:border-r md:border-border" : ""
                  } ${i < 2 ? "border-b border-border md:border-b-0" : ""}`}
              >
                <div className="mb-3 rounded-xl border border-primary/10 bg-accent p-2.5 text-accent-foreground transition-all duration-300 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-glow group-hover:border-transparent">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-extrabold text-gradient">{s.value}</span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ──────────────────────────── PROBLEM / SOLUTION ──────────────────────────── */

function ProblemSolution() {
  return (
    <Section id="problem" className="relative overflow-hidden">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-destructive/5 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-primary/5 blur-[100px]" />
      {/* cross-hatch pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "linear-gradient(45deg, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(-45deg, hsl(var(--foreground)) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative text-center mb-14">
        <SectionLabel>Problème & Solution</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Passez de la galère à l'efficacité
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border-2 border-destructive/15 bg-destructive/[0.02] p-8"
        >
          {/* top decorative bar */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-destructive/60 via-destructive/30 to-transparent" />
          <div className="absolute -right-3 -top-3 rounded-full bg-destructive/10 p-2 ring-4 ring-destructive/5">
            <X className="h-5 w-5 text-destructive" />
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 py-1.5 text-xs font-semibold text-destructive">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            Le problème
          </div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            La gestion manuelle freine votre croissance
          </h2>
          <ul className="mt-6 space-y-3">
            {[
              "Erreurs de saisie et pertes de données fréquentes",
              "Aucune visibilité en temps réel sur les stocks",
              "Difficulté à gérer plusieurs magasins",
              "Facturation lente et non conforme",
            ].map((t, idx) => (
              <li key={t} className="flex items-start gap-3 rounded-xl border border-destructive/10 bg-gradient-to-r from-destructive/[0.04] to-transparent px-5 py-4 text-sm text-muted-foreground transition-all duration-300 hover:border-destructive/20 hover:from-destructive/[0.06]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-[10px] font-bold text-destructive">{idx + 1}</span>
                {t}
              </li>
            ))}
          </ul>
          {/* bottom stat */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-destructive/10 bg-destructive/[0.03] p-4">
            <span className="text-2xl font-extrabold text-destructive">67%</span>
            <span className="text-xs text-muted-foreground">des PME perdent du temps avec des outils inadaptés</span>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={1}
          className="relative overflow-hidden rounded-2xl border-2 border-primary/15 gradient-card p-8"
        >
          {/* top decorative bar */}
          <div className="absolute inset-x-0 top-0 h-1 gradient-primary" />
          <div className="absolute -right-3 -top-3 rounded-full gradient-primary p-2 shadow-glow ring-4 ring-primary/10">
            <Check className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            La solution
          </div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            InventoryFlow automatise tout
          </h2>
          <ul className="mt-6 space-y-3">
            {[
              "Stock synchronisé en temps réel dans tous vos magasins",
              "Factures générées en quelques clics, conformes et traçables",
              "Tableau de bord unifié pour piloter votre activité",
              "Rôles et permissions pour sécuriser l'accès",
            ].map((t, idx) => (
              <li key={t} className="flex items-start gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/[0.04] to-transparent px-5 py-4 text-sm text-muted-foreground transition-all duration-300 hover:border-primary/20 hover:from-primary/[0.06]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-primary-foreground">{idx + 1}</span>
                {t}
              </li>
            ))}
          </ul>
          {/* bottom stat */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/[0.03] p-4">
            <span className="text-2xl font-extrabold text-gradient">3x</span>
            <span className="text-xs text-muted-foreground">plus rapide qu'une gestion manuelle traditionnelle</span>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────── FEATURES ──────────────────────────── */

const features = [
  { icon: FileText, title: "Facturation intelligente", desc: "Créez, envoyez et suivez vos factures en un instant avec des modèles personnalisables." },
  { icon: Package, title: "Gestion avancée des stocks", desc: "Suivi en temps réel, alertes de seuil et historique complet de vos mouvements." },
  { icon: Store, title: "Multi-magasins", desc: "Gérez plusieurs points de vente depuis une seule interface centralisée." },
  { icon: Users, title: "Gestion clients", desc: "Base clients enrichie avec historique d'achats, soldes et communications." },
  { icon: Truck, title: "Gestion fournisseurs", desc: "Commandes, réceptions et suivi des paiements fournisseurs simplifiés." },
  { icon: Shield, title: "Rôles & permissions", desc: "Contrôle d'accès granulaire pour chaque utilisateur de votre équipe." },
  { icon: Palette, title: "Personnalisation complète", desc: "Thèmes, langues et paramètres adaptés à votre image de marque." },
];

function Features() {
  return (
    <Section id="features" className="relative overflow-hidden bg-muted/40">
      {/* grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {/* diagonal accent */}
      <div className="pointer-events-none absolute -right-32 top-20 h-64 w-64 rotate-45 rounded-3xl border border-primary/5 bg-primary/[0.02]" />
      <div className="pointer-events-none absolute -left-20 bottom-32 h-48 w-48 rotate-12 rounded-3xl border border-primary/5 bg-primary/[0.02]" />

      <div className="relative text-center">
        <SectionLabel>Fonctionnalités</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Tout ce dont vous avez besoin, en un seul outil
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          InventoryFlow regroupe les fonctionnalités essentielles pour piloter votre activité commerciale.
        </p>
      </div>

      {/* featured card (first item large) */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative mt-14 overflow-hidden rounded-2xl border-2 border-primary/15 gradient-card p-8 md:p-12"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 gradient-primary" />
        <div className="pointer-events-none absolute right-0 top-0 h-60 w-60 rounded-full bg-primary/5 blur-[80px]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/8 blur-[60px]" />
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex rounded-xl gradient-primary p-4 text-primary-foreground shadow-glow ring-4 ring-primary/10">
              <FileText className="h-7 w-7" />
            </div>
            <span className="ml-3 inline-flex items-center rounded-full gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
              Populaire
            </span>
            <h3 className="mt-4 mb-3 text-2xl font-bold text-card-foreground">Facturation intelligente</h3>
            <p className="text-muted-foreground leading-relaxed">
              Créez des factures professionnelles en quelques clics. Modèles personnalisables, envoi automatique,
              suivi des paiements et relances intégrées. Conformité légale garantie.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Modèles", "Auto-envoi", "Relances", "Export PDF"].map((tag) => (
                <span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-accent-foreground backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
            <a href="#" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3">
              Explorer la facturation <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="relative rounded-xl border border-border bg-card/80 p-6 shadow-card">
            {/* mini header bar */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Factures récentes</span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">3 nouvelles</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Facture #2847", amount: "1 250,00 €", status: "Payée", color: "text-primary", bg: "bg-primary/10" },
                { label: "Facture #2848", amount: "3 780,50 €", status: "En attente", color: "text-yellow-600", bg: "bg-yellow-500/10" },
                { label: "Facture #2849", amount: "890,00 €", status: "Envoyée", color: "text-blue-500", bg: "bg-blue-500/10" },
              ].map((inv) => (
                <div key={inv.label} className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 px-4 py-3.5 transition-all duration-200 hover:border-primary/15 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg ${inv.bg} p-1.5`}>
                      <FileText className={`h-3.5 w-3.5 ${inv.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.label}</p>
                      <p className="text-xs text-muted-foreground">{inv.amount}</p>
                    </div>
                  </div>
                  <span className={`rounded-full ${inv.bg} px-2.5 py-1 text-[10px] font-semibold ${inv.color}`}>{inv.status}</span>
                </div>
              ))}
            </div>
            {/* mini chart bar */}
            <div className="mt-4 rounded-lg border border-border/50 bg-background/50 p-3">
              <div className="flex items-end justify-between gap-1 h-10">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t gradient-primary opacity-60 transition-opacity hover:opacity-100" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground text-center">Revenus mensuels</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* remaining features grid */}
      <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.slice(1).map((f, i) => (
          <motion.div
            key={f.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-glow"
          >
            {/* top accent line on hover */}
            <div className="absolute inset-x-0 top-0 h-0.5 gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-primary/3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl border border-primary/10 bg-accent p-3 text-accent-foreground transition-all duration-300 group-hover:gradient-primary group-hover:border-transparent group-hover:text-primary-foreground group-hover:shadow-glow group-hover:ring-4 group-hover:ring-primary/10">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                En savoir plus <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────────── WHY US ──────────────────────────── */

const reasons = [
  { icon: Zap, title: "Performance", desc: "Interface ultra-rapide optimisée pour la productivité.", stat: "<100ms" },
  { icon: Lock, title: "Sécurité", desc: "Données chiffrées, sauvegardes automatiques et conformité.", stat: "AES-256" },
  { icon: Cloud, title: "Cloud", desc: "Accessible partout, depuis n'importe quel appareil.", stat: "99.9%" },
  { icon: ThumbsUp, title: "Facilité", desc: "Prise en main immédiate sans formation technique.", stat: "5 min" },
  { icon: Building2, title: "Scalable", desc: "De 1 à 1 000+ utilisateurs sans compromis.", stat: "∞" },
];

function WhyUs() {
  return (
    <Section id="why" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.04] blur-[100px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-primary/[0.03] blur-[80px]" />
      </div>
      {/* horizontal lines decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, hsl(var(--foreground)), hsl(var(--foreground)) 1px, transparent 1px, transparent 60px)",
      }} />

      <div className="relative text-center">
        <SectionLabel>Pourquoi nous</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          La plateforme de confiance pour votre business
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Conçu pour la performance, la sécurité et la simplicité.
        </p>
      </div>

      {/* large 2-col feature highlight */}
      <div className="relative mt-14 grid gap-6 md:grid-cols-2">
        {reasons.slice(0, 2).map((r, i) => (
          <motion.div
            key={r.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i}
            className="group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-8 transition-all duration-300 hover:border-primary/20 hover:shadow-glow"
          >
            <div className="absolute inset-x-0 top-0 h-1 gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start gap-5">
              <div className="shrink-0 rounded-2xl border border-primary/10 bg-accent p-4 text-accent-foreground transition-all duration-300 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-glow group-hover:border-transparent group-hover:ring-4 group-hover:ring-primary/10">
                <r.icon className="h-7 w-7" />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground">{r.title}</h3>
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-bold text-gradient">{r.stat}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
                {/* mini progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-primary" style={{ width: i === 0 ? "95%" : "98%" }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* bottom 3-col */}
      <div className="relative mt-6 grid gap-6 sm:grid-cols-3">
        {reasons.slice(2).map((r, i) => (
          <motion.div
            key={r.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={i + 2}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/20 hover:shadow-glow"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 gradient-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 gradient-card" />
            <div className="relative">
              <div className="mx-auto mb-3 inline-flex rounded-2xl border border-primary/10 bg-accent p-4 text-accent-foreground transition-all duration-300 group-hover:gradient-primary group-hover:border-transparent group-hover:text-primary-foreground group-hover:shadow-glow group-hover:ring-4 group-hover:ring-primary/10">
                <r.icon className="h-6 w-6" />
              </div>
              <p className="mb-1 text-2xl font-extrabold text-gradient">{r.stat}</p>
              <h3 className="mb-1 font-semibold text-foreground">{r.title}</h3>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ──────────────────────────── PRICING ──────────────────────────── */

export const plans = [
  {
    name: "basic",
    price: 9900,
    desc: "Pour les petites boutiques",
    popular: false,
  },
  {
    name: "pro",
    price: 14900,
    desc: "Pour les entreprises en croissance",
    popular: true,
  },
  {
    name: "enterprise",
    price: 24900,
    desc: "Pour les grandes structures",
    popular: false,
  },
];

export function Pricing({ page = 'home' }: { page: "select_plan" | "home" }) {


  const [billing, setBilling] = useQueryState('billing', { defaultValue: 'monthly' })
  const { t: tCommon } = useTranslation('common');

  const isAnnual = billing === 'annual'

  return (
    <Section id="pricing" className="relative overflow-hidden">
      {/* decorative elements */}

      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="pointer-events-none absolute -left-20 top-1/3 h-60 w-60 rounded-full bg-primary/[0.04] blur-[80px]" />
      <div className="pointer-events-none absolute -right-20 bottom-1/4 h-60 w-60 rounded-full bg-primary/[0.04] blur-[80px]" />
      {/* floating shapes */}
      <div className="pointer-events-none absolute right-10 top-20 h-20 w-20 rotate-12 rounded-xl border border-primary/5 bg-primary/[0.02]" />
      <div className="pointer-events-none absolute left-16 bottom-32 h-16 w-16 -rotate-12 rounded-lg border border-primary/5 bg-primary/[0.02]" />

      <div className="relative text-center">
        {
          page === 'home' ?
            <>
              <SectionLabel>Tarifs</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
                Des prix simples et transparents
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Choisissez le plan adapté à la taille de votre activité. Évoluez à tout moment.
              </p>
            </>
            : null
        }
        {/* toggle pill */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm">
          {["monthly", "annual"].map((el) => {
            return (
              <span onClick={() => setBilling(isAnnual ? 'monthly' : 'annual')} className={cn("rounded-full  px-4 py-1.5 text-xs font-semibold  cursor-pointer capitalize", billing === el && "gradient-primary text-primary-foreground")}>
                {tCommon(el)} {el == 'annual' ? <span className="text-primary font-bold">-8%</span> : null}
              </span>
            )
          })}
          {/* <span className="px-4 py-1.5 text-xs font-medium text-muted-foreground cursor-pointer">Annuel </span> */}
        </div>
      </div>

      <div className="relative mt-14 grid items-stretch gap-8 lg:grid-cols-3">
        {plans.map((p, i) => {
          const baseMonthly = p.price
          const displayedPrice = isAnnual
            ? (Math.round(baseMonthly * 11 * 100) / 12 / 100) * 12
            : baseMonthly

          return (
            <motion.div
              key={p.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300 ${p.popular
                ? "border-primary/40 shadow-glow scale-[1.03] gradient-card z-10"
                : "border-border bg-card hover:border-primary/15 hover:shadow-card"
                }`}
            >
              {/* top accent */}
              <div className={`absolute inset-x-0 top-0 h-1 ${p.popular ? "gradient-primary" : "bg-border opacity-0 group-hover:opacity-100 transition-opacity gradient-primary"}`} />
              {p.popular && (
                <>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-[60px]" />
                  <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-primary/8 blur-[40px]" />
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-lg gradient-primary px-5 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">
                    {tCommon('recommended')}
                  </span>
                </>
              )}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-card-foreground">{tCommon(`plans.${p.name}.name`)}</h3>
                  {!p.popular && <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{i === 0 ? "Starter" : "Custom"}</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tCommon(`plans.${p.name}.desc`)}</p>
                <div className="flex items-baseline gap-1 relative my-6">
                  <span className={cn(" text-xs absolute -top-3 text-green-600 dark:text-green-300", !isAnnual && "opacity-0")}>{tCommon('subtext_off', { amount: formatteCurrency((baseMonthly * 12) - displayedPrice) })}</span>
                  <span className={`text-3xl font-extrabold ${p.popular ? "text-gradient" : "text-card-foreground"}`}>{formatteCurrency(displayedPrice)}</span>
                  <span className="text-muted-foreground">/{tCommon(`billing_${billing}`)}</span>
                </div>

                <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
                <ul className="mb-8 space-y-3 flex-1">
                  {/*@ts-ignore*/}
                  {tCommon(`plans.${p.name}.features`, { returnObjects: true }).map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className={`shrink-0 rounded-full p-0.5 ${p.popular ? "gradient-primary shadow-sm" : "bg-primary/10"}`}>
                        <Check className={`h-3 w-3 ${p.popular ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={(`/signup/checkout?plan=${encryptParam(String(i + 1))}&interval=${encryptParam(billing)}`)}
                className={`mt-auto block rounded-xl py-3.5 text-center text-sm font-semibold transition-all duration-300 ${p.popular
                  ? "gradient-primary text-primary-foreground shadow-glow hover:opacity-90 hover:scale-[1.02]"
                  : "border-2 border-border text-foreground hover:border-primary/20 hover:bg-accent hover:shadow-card"
                  }`}
              >
                {tCommon('pricing_card_btn_text')}
              </a>
              {p.popular && (
                <p className="mt-3 text-center text-[10px] text-muted-foreground"> {tCommon('pricing_card_subtext')}</p>
              )}
            </motion.div>
          )
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">{tCommon('pricing_page_subtext')}</p>
    </Section>
  );
}

/* ──────────────────────────── FAQ ──────────────────────────── */

const faqs = [
  { q: "Puis-je tester InventoryFlow gratuitement ?", a: "Oui, nous offrons un essai gratuit de 14 jours sur tous les plans, sans carte bancaire requise." },
  { q: "Mes données sont-elles sécurisées ?", a: "Absolument. Nous utilisons le chiffrement AES-256, des sauvegardes quotidiennes et nos serveurs sont hébergés en Europe." },
  { q: "Puis-je gérer plusieurs magasins ?", a: "Oui, à partir du plan Pro vous pouvez connecter jusqu'à 5 magasins. Le plan Enterprise offre un nombre illimité." },
  { q: "Comment fonctionne le support ?", a: "Support email sur le plan Basic, prioritaire sur Pro, et un account manager dédié 24/7 sur Enterprise." },
  { q: "Puis-je importer mes données existantes ?", a: "Oui, nous supportons l'import CSV/Excel et proposons un accompagnement personnalisé pour la migration." },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <Section id="faq" className="relative overflow-hidden bg-muted/30">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />
      <div className="pointer-events-none absolute -left-10 top-1/4 h-40 w-2 rounded-full gradient-primary opacity-10" />
      <div className="pointer-events-none absolute -right-10 bottom-1/4 h-40 w-2 rounded-full gradient-primary opacity-10" />

      <div className="relative text-center">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          Questions fréquentes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Tout ce que vous devez savoir pour démarrer avec InventoryFlow.
        </p>
      </div>

      <div className="relative mx-auto mt-12 grid gap-6 md:grid-cols-2 max-w-4xl">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className={`overflow-hidden rounded-xl border-2 transition-all duration-300 ${openIdx === i
                ? "border-primary/20 bg-card shadow-card"
                : "border-border bg-card/60 hover:border-primary/10"
                }`}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground"
              >
                <span className="flex items-center gap-3">
                  <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 ${openIdx === i ? "gradient-primary text-primary-foreground shadow-glow" : "bg-accent text-accent-foreground"
                    }`}>
                    {i + 1}
                  </span>
                  {f.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${openIdx === i ? "rotate-180 text-primary" : ""
                    }`}
                />
              </button>
              {openIdx === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t border-border/50 px-5 py-4"
                >
                  <p className="pl-10 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={2}
          className="flex flex-col justify-between rounded-2xl border-2 border-primary/15 gradient-card p-8"
        >
          <div>
            <div className="mb-4 inline-flex rounded-xl gradient-primary p-3 text-primary-foreground shadow-glow ring-4 ring-primary/10">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Besoin d'aide ?</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner.
            </p>
            <div className="mt-6 rounded-xl border border-primary/10 bg-card/50 p-4">
              <p className="text-xs italic text-muted-foreground">"L'équipe support est incroyablement réactive. Réponse en moins de 2h !"</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground">M</div>
                <span className="text-xs font-medium text-foreground">Marie L.</span>
                <span className="text-[10px] text-muted-foreground">· ModaBoutique</span>
              </div>
            </div>
          </div>
          <a href="#" className="mt-6 block rounded-xl gradient-primary py-3 text-center text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:opacity-90 hover:scale-[1.02]">
            Contacter le support
          </a>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────── CTA ──────────────────────────── */

function CTASection() {
  return (
    <Section className="relative overflow-hidden">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl gradient-hero px-8 py-16 text-center md:px-16 md:py-20"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[500px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="pointer-events-none absolute left-1/4 top-0 h-[200px] w-[200px] rounded-full bg-primary/10 blur-[80px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-0 h-[200px] w-[200px] rounded-full bg-primary/8 blur-[60px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-primary/20" />

        <div className="relative">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-hero-foreground/10 bg-hero-foreground/5 px-4 py-1.5 text-xs font-semibold text-hero-foreground backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Offre limitée — 14 jours gratuits
          </div>
          <h2 className="text-3xl font-extrabold text-hero-foreground sm:text-4xl lg:text-5xl">
            Prêt à transformer votre gestion ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-hero-muted">
            Rejoignez plus de 10 000 entreprises qui font confiance à InventoryFlow.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#pricing"
              className="gradient-primary inline-flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow ring-4 ring-primary/20 transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-hero-foreground/20 px-8 py-4 text-sm font-semibold text-hero-foreground transition hover:bg-hero-foreground/5"
            >
              Demander une démo
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-hero-muted">
            {[
              { icon: Shield, label: "SSL sécurisé" },
              { icon: Cloud, label: "RGPD conforme" },
              { icon: Zap, label: "Setup en 5 min" },
            ].map((badge) => (
              <span key={badge.label} className="inline-flex items-center gap-1.5 text-xs font-medium">
                <badge.icon className="h-3.5 w-3.5" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ──────────────────────────── FOOTER ──────────────────────────── */

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/50 gradient-hero py-16">
      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-primary/10 via-transparent to-transparent" />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#" className="flex items-center gap-2 text-lg font-bold text-hero-foreground">
              <div className="rounded-lg gradient-primary p-1.5 shadow-glow ring-2 ring-primary/20">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              InventoryFlow
            </a>
            <p className="mt-4 text-sm leading-relaxed text-hero-muted">
              La solution complète pour gérer votre activité commerciale en toute simplicité.
            </p>
            <div className="mt-5 flex gap-3">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="rounded-lg border border-hero-foreground/10 bg-hero-foreground/5 px-3 py-1.5 text-xs font-medium text-hero-muted transition-all hover:border-primary/30 hover:text-hero-foreground hover:bg-hero-foreground/10"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-hero-foreground">Produit</h4>
            <ul className="space-y-3 text-sm text-hero-muted">
              <li><a href="#features" className="transition-colors hover:text-primary">Fonctionnalités</a></li>
              <li><a href="#pricing" className="transition-colors hover:text-primary">Tarifs</a></li>
              <li><a href="#faq" className="transition-colors hover:text-primary">FAQ</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-hero-foreground">Entreprise</h4>
            <ul className="space-y-3 text-sm text-hero-muted">
              <li><a href="#" className="transition-colors hover:text-primary">À propos</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Blog</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Carrières</a></li>
              <li><a href="#" className="transition-colors hover:text-primary">Presse</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-hero-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-hero-muted">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
                contact@inventoryflow.com
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
                +33 1 23 45 67 89
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
                Paris, France
              </li>
            </ul>
            {/* newsletter mini */}
            <div className="mt-6 rounded-xl border border-hero-foreground/10 bg-hero-foreground/5 p-4">
              <p className="text-xs font-medium text-hero-foreground mb-2">Newsletter</p>
              <div className="flex gap-2">
                <input placeholder="email@exemple.com" className="flex-1 rounded-lg border border-hero-foreground/10 bg-transparent px-3 py-1.5 text-xs text-hero-foreground placeholder:text-hero-muted focus:outline-none focus:border-primary/40" />
                <button className="rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow">OK</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-hero-foreground/10 pt-8 sm:flex-row">
          <p className="text-xs text-hero-muted">
            © {new Date().getFullYear()} InventoryFlow. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-hero-muted">
            <a href="#" className="transition-colors hover:text-primary">Confidentialité</a>
            <a href="#" className="transition-colors hover:text-primary">CGU</a>
            <a href="#" className="transition-colors hover:text-primary">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────── PAGE ──────────────────────────── */

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StatsBanner />
      <ProblemSolution />
      <Features />
      <WhyUs />
      <Pricing page="home" />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
}
