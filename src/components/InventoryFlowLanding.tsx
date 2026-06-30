"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from "framer-motion";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  Download,
  FileSpreadsheet,
  GitMerge,
  LineChart,
  LockKeyhole,
  Mail,
  Menu,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  Store,
  Truck,
  UploadCloud,
  UsersRound,
  X,
} from "lucide-react";
import logo from "@/assets/img/logo.png";

import dashboardMockup from "@/assets/dashboard-mockup.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageSwitcher } from "./legal/LanguageSwitcher";
import { useThemeMode } from "@/utils/theme-provider";

const navItems = [
  { label: "Pourquoi", href: "#pourquoi" },
  { label: "Plateforme", href: "#plateforme" },
  { label: "Import", href: "#import" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "IA", href: "#ia" },
];

const premiumEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const heroMetrics = [
  {
    label: "Chiffre d'affaires",
    value: "2 840 000 FCFA",
    change: "+18% vs hier",
    tone: "success",
  },
  {
    label: "Produits à risque",
    value: "12",
    change: "à commander avant vendredi",
    tone: "warning",
  },
  {
    label: "Écart de caisse",
    value: "0,4%",
    change: "contrôle normal",
    tone: "blue",
  },
];

const heroFloatingSignals = [
  {
    icon: PackageCheck,
    title: "Stock faible",
    value: "12 produits",
    copy: "Akwa + Bonabéri",
    className: "-left-10 bottom-12",
    color: "#EA580C",
  },
  {
    icon: CircleDollarSign,
    title: "Caisse clôturée",
    value: "0,4% écart",
    copy: "contrôle normal",
    className: "-right-8 top-20",
    color: "#16A34A",
  },
  {
    icon: Truck,
    title: "Réapprovisionnement",
    value: "24 lignes",
    copy: "commande prête",
    className: "right-10 -bottom-8",
    color: "#2563EB",
  },
];

const trustLogos = [
  { name: "Acacia Market", mark: "A", color: "#2563EB" },
  { name: "Kora Depot", mark: "K", color: "#16A34A" },
  { name: "Mboa Retail", mark: "M", color: "#EA580C" },
  { name: "PharmaPlus", mark: "P", color: "#DC2626" },
  { name: "UrbanStock", mark: "U", color: "#111111" },
];

const trustMetrics = [
  { value: 3, suffix: " sec", label: "pour comprendre le jour", progress: 82, color: "#2563EB" },
  { value: 1, suffix: " vue", label: "ventes, stock, caisse", progress: 74, color: "#16A34A" },
  { value: 0, suffix: " tableur", label: "dans le pilotage quotidien", progress: 96, color: "#EA580C" },
  { value: 24, suffix: "/7", label: "acces cloud securise", progress: 88, color: "#111111" },
];

const flowEvents = [
  {
    icon: CreditCard,
    title: "Vente encaissée",
    source: "POS Akwa",
    value: "+48 000 FCFA",
    color: "#16A34A",
  },
  {
    icon: PackageCheck,
    title: "Stock ajusté",
    source: "Entrepôt Bonabéri",
    value: "-24 unités",
    color: "#2563EB",
  },
  {
    icon: CircleDollarSign,
    title: "Caisse rapprochée",
    source: "Finance",
    value: "0,4% écart",
    color: "#EA580C",
  },
  {
    icon: BrainCircuit,
    title: "Décision suggérée",
    source: "IA opérationnelle",
    value: "Commander",
    color: "#111111",
  },
];

const businessProblems = [
  {
    icon: PackageCheck,
    title: "Ruptures invisibles",
    question: "Quels produits nécessitent mon attention ?",
    answer: "InventoryFlow remonte les seuils critiques avant que les ventes ne s'arrêtent.",
  },
  {
    icon: CircleDollarSign,
    title: "Caisse difficile à suivre",
    question: "Où va mon argent ?",
    answer: "Chaque vente, dépense et solde client est relié au point de vente concerné.",
  },
  {
    icon: Store,
    title: "Points de vente dispersés",
    question: "Que se passe-t-il dans mon entreprise aujourd'hui ?",
    answer: "Les magasins, entrepôts et équipes remontent dans une vue consolidée.",
  },
  {
    icon: ReceiptText,
    title: "Suivi manuel trop lent",
    question: "Combien ai-je vendu ?",
    answer: "POS, factures, retours et reçus mettent à jour les chiffres en temps réel.",
  },
];

const moduleTabs = [
  {
    value: "pos",
    label: "POS",
    icon: CreditCard,
    title: "Vendre vite, sans perdre la trace.",
    description:
      "Vente rapide, scanner code-barres, remises, reçus et historique complet restent synchronisés avec le stock.",
    metric: "8 sec",
    metricLabel: "pour finaliser une vente simple",
    actions: ["Paiements multiples", "Retours produit", "Annulations contrôlées"],
  },
  {
    value: "inventory",
    label: "Inventaire",
    icon: PackageCheck,
    title: "Savoir quoi commander, quand et pour quel point.",
    description:
      "Entrées, sorties, ajustements, transferts et inventaires physiques deviennent lisibles par décision.",
    metric: "12",
    metricLabel: "produits sous seuil aujourd'hui",
    actions: ["Mouvements de stock", "Transferts entre entrepôts", "Valorisation du stock"],
  },
  {
    value: "finance",
    label: "Finances",
    icon: CircleDollarSign,
    title: "Relier les ventes, les dépenses et la trésorerie.",
    description:
      "Les dirigeants suivent revenus, dépenses, soldes clients, dettes fournisseurs et résultats sans tableurs parallèles.",
    metric: "0,4%",
    metricLabel: "écart de caisse détecté",
    actions: ["Journal financier", "Dépenses par point", "Crédit client"],
  },
  {
    value: "teams",
    label: "Équipes",
    icon: UsersRound,
    title: "Donner le bon niveau d'accès à chaque rôle.",
    description:
      "Vendeurs, managers et finance travaillent dans le même système avec permissions et historique d'activité.",
    metric: "6",
    metricLabel: "rôles opérationnels prêts",
    actions: ["Permissions", "Comptes employés", "Journal d'activité"],
  },
];

const importableData = [
  "Catégories",
  "Fournisseurs",
  "Emballages",
  "Clients",
  "Produits",
  "Variantes",
];

const importPipeline = [
  {
    icon: Download,
    title: "Template prêt",
    copy: "Chaque type de donnée dispose de son modèle CSV pour éviter les colonnes improvisées.",
  },
  {
    icon: UploadCloud,
    title: "CSV ou XLSX",
    copy: "Les équipes déposent un fichier jusqu'à 10 Mo, puis l'import est lancé sur le bon point de vente.",
  },
  {
    icon: ShieldCheck,
    title: "Validation avant écriture",
    copy: "Colonnes requises, valeurs numériques et lignes suspectes sont contrôlées avant la création.",
  },
  {
    icon: GitMerge,
    title: "Conflits maîtrisés",
    copy: "Les doublons, dépendances manquantes et erreurs de ligne sont résolus sans bloquer toute l'opération.",
  },
];

const importRows = [
  { product: "Riz premium 25kg", column: "supplier_name", state: "validé", color: "#16A34A" },
  { product: "Huile végétale 5L", column: "category", state: "créé", color: "#2563EB" },
  { product: "Lait concentré", column: "price", state: "corriger", color: "#EA580C" },
  { product: "Savon carton", column: "quantity", state: "validé", color: "#16A34A" },
];

const dashboardSignals = [
  { label: "Marge estimée", value: "31,8%", status: "stable" },
  { label: "Commandes ouvertes", value: "24", status: "à traiter" },
  { label: "Meilleur magasin", value: "Akwa", status: "+14%" },
];

const dashboardFocusStats = [
  { label: "Produits faibles", value: 12, suffix: "", color: "#EA580C", bars: [34, 46, 42, 68, 56, 74] },
  { label: "Bénéfice estimé", value: 842, suffix: "k", color: "#16A34A", bars: [38, 52, 49, 58, 76, 88] },
  { label: "Commandes en attente", value: 24, suffix: "", color: "#2563EB", bars: [30, 42, 36, 54, 48, 67] },
];

const aiUseCases = [
  {
    icon: LineChart,
    title: "Prévision des ventes",
    copy: "Anticipez les pics par produit, par magasin et par période avant de lancer vos achats.",
  },
  {
    icon: PackageCheck,
    title: "Alertes de rupture",
    copy: "Repérez les produits qui vont manquer selon la vitesse réelle des ventes.",
  },
  {
    icon: Truck,
    title: "Réapprovisionnement conseillé",
    copy: "Transformez les seuils, ventes et délais fournisseurs en listes d'achat concrètes.",
  },
  {
    icon: ShieldCheck,
    title: "Anomalies opérationnelles",
    copy: "Détectez écarts de caisse, retours suspects et mouvements inhabituels sans fouiller les journaux.",
  },
];

const proofItems = [
  {
    quote:
      "Avant InventoryFlow, nos magasins envoyaient leurs chiffres trop tard. Maintenant je vois les ruptures, la caisse et les ventes le même jour.",
    name: "Aissatou K.",
    role: "Directrice réseau, distribution alimentaire",
  },
  {
    quote:
      "Le produit parle comme un outil de direction, pas comme un simple stock. Les managers savent quoi corriger avant la fermeture.",
    name: "Daniel M.",
    role: "Gérant, chaîne de pharmacies",
  },
  {
    quote:
      "La valeur est dans la clarté. Un vendeur peut encaisser, un responsable peut piloter, et la finance garde le contrôle.",
    name: "Nadia T.",
    role: "Responsable opérations, grossiste",
  },
];

const reveal: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: premiumEase },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-3xl text-center"
    >
      <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#111111] sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-zinc-600">{description}</p>
    </motion.div>
  );
}

function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView || !ref.current) return;

    const format = (latest: number) =>
      `${prefix}${new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      }).format(latest)}${suffix}`;

    if (shouldReduceMotion) {
      ref.current.textContent = format(value);
      return;
    }

    const controls = animate(0, value, {
      duration: 0.72,
      ease: premiumEase,
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = format(latest);
        }
      },
    });

    return () => controls.stop();
  }, [decimals, isInView, prefix, shouldReduceMotion, suffix, value]);

  return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
}

function MagneticButtonLink({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light" | "outline" | "glass";
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 280, damping: 22 });
  const smoothY = useSpring(y, { stiffness: 280, damping: 22 });

  const buttonClassName =
    variant === "light"
      ? "h-12 cursor-pointer overflow-hidden rounded-lg bg-white px-5 text-[#111111] shadow-[0_18px_45px_rgba(255,255,255,0.18)] hover:bg-zinc-100"
      : variant === "glass"
        ? "h-12 cursor-pointer overflow-hidden rounded-lg border border-white/20 bg-white/10 px-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)] hover:bg-white/15 hover:text-white"
        : variant === "outline"
          ? "h-12 cursor-pointer overflow-hidden rounded-lg border-zinc-300 bg-white px-5 text-[#111111] hover:bg-zinc-50"
          : "h-12 cursor-pointer overflow-hidden rounded-lg border border-[#111111] bg-[#111111] px-5 text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)] hover:bg-[#2B2B2B]";

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.16);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.22);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="group relative inline-flex"
      style={{ x: smoothX, y: smoothY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.24, ease: premiumEase }}
    >
      <Button asChild size="lg" variant={variant === "outline" || variant === "glass" ? "outline" : "default"} className={buttonClassName}>
        <a href={href}>{children}</a>
      </Button>
    </motion.div>
  );
}

function PremiumSurface({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left) / rect.width;
    const pointerY = (event.clientY - rect.top) / rect.height;
    setGlow({ x: pointerX * 100, y: pointerY * 100 });
    rotateX.set((0.5 - pointerY) * 4);
    rotateY.set((pointerX - 0.5) * 5);
  }

  function handleMouseLeave() {
    setGlow({ x: 50, y: 50 });
    rotateX.set(0);
    rotateY.set(0);
  }

  const borderStyle: CSSProperties = {
    background: `radial-gradient(220px circle at ${glow.x}% ${glow.y}%, rgba(37, 99, 235, 0.5), transparent 42%)`,
    padding: 1,
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };

  return (
    <motion.div
      className={`group relative h-full rounded-lg [transform-style:preserve-3d] ${className}`}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6, scale: 1.006 }}
      transition={{ duration: 0.28, ease: premiumEase }}
    >
      <div
        className="pointer-events-none absolute -inset-3 rounded-[18px] opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(37, 99, 235, 0.16), transparent 46%)` }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={borderStyle} />
      <div className="relative h-full rounded-lg">{children}</div>
    </motion.div>
  );
}

function HeroAtmosphere({ spotlight }: { spotlight: { x: number; y: number } }) {
  const orbStyles = [
    { className: "left-[7%] top-[18%] h-72 w-72 bg-[#2563EB]/18", x: [0, 34, -14, 0], y: [0, -22, 18, 0], delay: 0 },
    { className: "right-[5%] top-[12%] h-80 w-80 bg-[#16A34A]/14", x: [0, -28, 18, 0], y: [0, 24, -12, 0], delay: 0.6 },
    { className: "bottom-[6%] left-[42%] h-72 w-72 bg-[#EA580C]/12", x: [0, 24, -20, 0], y: [0, -18, 20, 0], delay: 1.1 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-24 opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 18% 22%, rgba(37,99,235,0.18), transparent 28%), radial-gradient(circle at 78% 16%, rgba(22,163,74,0.14), transparent 26%), radial-gradient(circle at 52% 82%, rgba(234,88,12,0.12), transparent 30%)",
        }}
        animate={{ x: [0, 14, -10, 0], y: [0, -10, 12, 0], scale: [1, 1.025, 1] }}
        transition={{ duration: 8, ease: premiumEase, repeat: Infinity }}
      />

      {orbStyles.map((orb, index) => (
        <motion.div
          key={orb.className}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
          animate={{ x: orb.x, y: orb.y, scale: [1, 1.04, 0.98, 1] }}
          transition={{ duration: 8 + index, ease: premiumEase, repeat: Infinity, delay: orb.delay }}
        />
      ))}

      <motion.div
        className="absolute inset-0 [background-image:linear-gradient(rgba(17,17,17,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.055)_1px,transparent_1px)] [background-size:48px_48px]"
        animate={{ opacity: [0.16, 0.28, 0.16] }}
        transition={{ duration: 4.8, ease: premiumEase, repeat: Infinity }}
      />
      <div
        className="absolute inset-0 transition-[background] duration-300"
        style={{
          background: `radial-gradient(620px circle at ${spotlight.x}% ${spotlight.y}%, rgba(255,255,255,0.72), transparent 42%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(rgba(17,17,17,0.5) 0.6px, transparent 0.6px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}

function BrandMark() {
  return (
    <a href="/" className="flex items-center gap-3" aria-label="InventoryFlow home">
      <img src={logo.src} alt="logo" className="w-32 h-auto" />
    </a>
  );
}

function HeroSignalBeams() {
  const beams = [
    { top: "18%", left: "-12%", width: "58%", rotate: "11deg", color: "#2563EB", delay: 0 },
    { top: "44%", left: "42%", width: "54%", rotate: "-9deg", color: "#16A34A", delay: 0.8 },
    { top: "72%", left: "-8%", width: "64%", rotate: "-6deg", color: "#EA580C", delay: 1.4 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {beams.map((beam) => (
        <div
          key={`${beam.top}-${beam.color}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-zinc-900/15 to-transparent"
          style={{
            top: beam.top,
            left: beam.left,
            width: beam.width,
            transform: `rotate(${beam.rotate})`,
          }}
        >
          <motion.span
            className="absolute top-1/2 h-1.5 w-24 -translate-y-1/2 rounded-full blur-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${beam.color}, transparent)`,
            }}
            initial={{ left: "-20%", opacity: 0 }}
            animate={{ left: "100%", opacity: [0, 0.9, 0] }}
            transition={{
              duration: 4.4,
              ease: premiumEase,
              repeat: Infinity,
              repeatDelay: 1.2,
              delay: beam.delay,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function HeroFloatingSignals() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden xl:block">
      {heroFloatingSignals.map((signal, index) => (
        <motion.div
          key={signal.title}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
          transition={{
            opacity: { duration: 0.25, delay: 0.35 + index * 0.12 },
            scale: { duration: 0.25, delay: 0.35 + index * 0.12 },
            y: { duration: 4.2, repeat: Infinity, ease: premiumEase, delay: index * 0.45 },
          }}
          className={`absolute ${signal.className} w-56 rounded-lg border border-zinc-200 bg-white/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.14)] backdrop-blur-xl`}
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: signal.color }}
            >
              <signal.icon className="h-5 w-5" />
            </div>
            <span className="rounded-full border border-zinc-200 px-2 py-1 text-[11px] font-semibold text-zinc-500">
              live
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#111111]">{signal.title}</p>
          <p className="mt-1 text-xl font-semibold text-[#111111]">{signal.value}</p>
          <p className="mt-1 text-xs text-zinc-500">{signal.copy}</p>
        </motion.div>
      ))}
    </div>
  );
}

function LiveNetworkScene() {
  const nodes = [
    { name: "Douala", x: "18%", y: "58%", color: "#2563EB" },
    { name: "Yaoundé", x: "48%", y: "34%", color: "#16A34A" },
    { name: "Bafoussam", x: "70%", y: "62%", color: "#EA580C" },
    { name: "Garoua", x: "82%", y: "28%", color: "#2563EB" },
  ];

  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-7 overflow-hidden rounded-lg border border-zinc-200 bg-[#111111] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="relative min-h-[280px] rounded-lg border border-white/10 bg-white/[0.04]">
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:34px_34px]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M18 58 C32 38 38 32 48 34 S62 58 70 62 S78 32 82 28"
              fill="none"
              stroke="rgba(37,99,235,0.55)"
              strokeWidth="0.45"
              strokeDasharray="3 3"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: premiumEase }}
            />
          </svg>
          {nodes.map((node, index) => (
            <motion.div
              key={node.name}
              className="absolute"
              style={{ left: node.x, top: node.y }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: 0.1 * index }}
            >
              <span
                className="absolute -left-4 -top-4 h-8 w-8 rounded-full border"
                style={{ borderColor: node.color }}
              />
              <motion.span
                className="absolute -left-6 -top-6 h-12 w-12 rounded-full border"
                style={{ borderColor: node.color }}
                animate={{ scale: [0.8, 1.35], opacity: [0.5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.35 }}
              />
              <span
                className="relative flex h-4 w-4 rounded-full border-2 border-[#111111]"
                style={{ backgroundColor: node.color }}
              />
              <span className="absolute left-5 top-1 whitespace-nowrap text-xs font-semibold text-white">{node.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-3">
          {[
            ["Akwa", "2,84M FCFA", "+18%"],
            ["Bonabéri", "12 ruptures", "action"],
            ["Yaoundé", "24 commandes", "en attente"],
          ].map(([place, value, status]) => (
            <div key={place} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{place}</p>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-zinc-400">{status}</span>
              </div>
              <p className="mt-3 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-4 right-4 top-4 z-50">
      <div className="mx-auto max-w-7xl rounded-lg border border-zinc-200 bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 sm:px-5">
          <BrandMark />

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-[#111111]"
              >
                {item.label}
              </a>
            ))}
            <LanguageSwitcher />
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" className="h-9 cursor-pointer rounded-lg text-zinc-700 hover:bg-zinc-100">
              <a href="/signin">Connexion</a>
            </Button>
            <Button
              asChild
              className="h-9 cursor-pointer rounded-lg border border-[#111111] bg-[#111111] px-4 text-white hover:bg-[#2B2B2B]"
            >
              <a href="/signup">
                Commencer
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-lg md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

        </div>

        {open && (
          <div className="border-t border-zinc-200 p-3 md:hidden">
            <div className="grid gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-100"
                >
                  {item.label}
                </a>
              ))}

              <LanguageSwitcher />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="cursor-pointer rounded-lg">
                  <a href="/signin">Connexion</a>
                </Button>
                <Button asChild className="cursor-pointer rounded-lg bg-[#111111] text-white hover:bg-[#2B2B2B]">
                  <a href="/signup">Commencer</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function HeroVisual() {
  return (
    <motion.div
      className="group relative rounded-lg border border-zinc-200 bg-white p-3 shadow-[0_28px_90px_rgba(0,0,0,0.14)]"
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.32, ease: premiumEase }}
    >
      <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[24px] bg-[#2563EB]/10 blur-3xl" />
      <div className="pointer-events-none absolute -inset-2 -z-10 rounded-[20px] bg-white/70 blur-xl" />
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 rounded-lg bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.34)_38%,transparent_54%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        initial={{ x: "-45%" }}
        whileHover={{ x: "45%" }}
        transition={{ duration: 0.7, ease: premiumEase }}
      />
      <div className="flex h-10 items-center justify-between border-b border-zinc-200 px-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#EA580C]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
        </div>
        {/* <span className="text-xs font-medium text-zinc-500">Aujourd'hui - Vue dirigeant</span> */}
      </div>

      <div className="grid gap-3 pt-3 lg:grid-cols-[1fr_220px]">
        <div className="rounded-lg bg-[#111111] p-4 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-zinc-400">Chiffre d'affaires consolidé</p>
              <p className="mt-2 text-3xl font-semibold">2 840 000 FCFA</p>
            </div>
          </div>

          <div className="relative mt-8 h-36 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <motion.div
              className="absolute bottom-3 top-3 w-px bg-gradient-to-b from-transparent via-white/70 to-transparent"
              initial={{ left: "8%", opacity: 0 }}
              animate={{ left: ["8%", "92%"], opacity: [0, 1, 0] }}
              transition={{ duration: 3.2, ease: premiumEase, repeat: Infinity, repeatDelay: 1.3 }}
            />
            <motion.div
              className="absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-[#2563EB] to-transparent"
              initial={{ opacity: 0, scaleX: 0.2 }}
              animate={{ opacity: [0, 0.8, 0], scaleX: [0.2, 1, 0.2] }}
              transition={{ duration: 3.2, ease: premiumEase, repeat: Infinity, repeatDelay: 1.3 }}
            />
            <div className="relative flex h-full items-end gap-2">
              {[38, 52, 45, 70, 62, 88, 74, 96].map((height, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <motion.div
                    className="w-full rounded-t-sm bg-[#2563EB]"
                    initial={{ height: 0, opacity: 0.2 }}
                    animate={{ height: `${height}%`, opacity: 0.45 + index * 0.06 }}
                    transition={{ duration: 0.34, ease: premiumEase, delay: 0.08 + index * 0.04 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {dashboardSignals.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xs text-zinc-400">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
                <p className="mt-1 text-xs text-zinc-500">{item.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {heroMetrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-4">
              <p className="text-xs font-medium text-zinc-500">{metric.label}</p>
              <p className="mt-2 text-xl font-semibold text-[#111111]">{metric.value}</p>
              <p
                className={`mt-1 text-xs ${metric.tone === "success"
                  ? "text-[#16A34A]"
                  : metric.tone === "warning"
                    ? "text-[#EA580C]"
                    : "text-[#2563EB]"
                  }`}
              >
                {metric.change}
              </p>
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <motion.span
                  className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-white to-transparent"
                  animate={{ x: ["-120%", "240%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: premiumEase, delay: 0.15 }}
                />
                <motion.span
                  className="block h-full rounded-full bg-[#2563EB]/30"
                  initial={{ width: "18%" }}
                  animate={{ width: metric.tone === "success" ? "78%" : metric.tone === "warning" ? "46%" : "64%" }}
                  transition={{ duration: 0.62, ease: premiumEase }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <HeroFloatingSignals />
    </motion.div>
  );
}

function HeroSection() {
  const [spotlight, setSpotlight] = useState({ x: 58, y: 34 });
  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  const smoothParallaxX = useSpring(parallaxX, { stiffness: 90, damping: 24 });
  const smoothParallaxY = useSpring(parallaxY, { stiffness: 90, damping: 24 });

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y });
    parallaxX.set((x - 50) * -0.16);
    parallaxY.set((y - 50) * -0.12);
  }

  function handleMouseLeave() {
    setSpotlight({ x: 58, y: 34 });
    parallaxX.set(0);
    parallaxY.set(0);
  }

  return (
    <section
      className="relative overflow-hidden border-b border-zinc-200 bg-[#FAFAFA] pt-36"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <HeroAtmosphere spotlight={spotlight} />
      <HeroSignalBeams />
      <Container className="relative grid min-h-[760px] items-center gap-12 pb-16 lg:grid-cols-[0.88fr_1.12fr]">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
          <motion.h1 variants={reveal} className="mt-6 text-5xl font-semibold leading-[1.02] text-[#111111] sm:text-6xl">
            Pilotez votre activité en temps réel.
          </motion.h1>
          <motion.p variants={reveal} className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Ventes, inventaire, finances et équipes réunis dans une seule plateforme.
          </motion.p>
          <motion.p variants={reveal} className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
            InventoryFlow aide boutiques, pharmacies, grossistes, dépôts et réseaux de magasins à prendre de meilleures décisions chaque jour.
          </motion.p>
          <motion.div variants={reveal} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <MagneticButtonLink href="/signup">
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButtonLink>
            <MagneticButtonLink href="#dashboard" variant="outline">
              <span className="hover:text-black">
                Voir la démonstration
              </span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </MagneticButtonLink>
          </motion.div>
          <motion.div variants={reveal} className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["POS", "vente rapide"],
              ["Stock", "seuils critiques"],
              ["Finance", "caisse claire"],
            ].map(([label, copy]) => (
              <div key={label} className="rounded-lg border border-zinc-200 bg-white p-3">
                <p className="text-sm font-semibold text-[#111111]">{label}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">{copy}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: premiumEase, delay: 0.08 }}
          style={{ x: smoothParallaxX, y: smoothParallaxY }}
        >
          <HeroVisual />
        </motion.div>
      </Container>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <Container className="grid gap-6 py-7 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div>
          <p className="text-sm font-semibold text-[#111111]">Pensé pour les opérations réelles</p>
          <p className="mt-1 text-sm text-zinc-500">Boutiques, supermarchés, pharmacies, grossistes, distributeurs.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trustMetrics.map((metric) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.42, ease: premiumEase }}
              className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
            >
              <p className="text-lg font-semibold text-[#111111]">
                <AnimatedCounter value={metric.value} suffix={metric.suffix} />
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{metric.label}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: "0%" }}
                  whileInView={{ width: `${metric.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.62, ease: premiumEase, delay: 0.08 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="md:col-span-2">
          <LiveNetworkScene />
        </div>
      </Container>
    </section>
  );
}

function OperationFlowSection() {
  return (
    <section className="relative overflow-hidden bg-[#111111] py-20 text-white">
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >

            <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
              Chaque action terrain devient un signal de pilotage.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-300">
              Quand une vente est encaissée, le stock, la caisse, les alertes et les décisions se mettent à jour dans le même mouvement.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="relative rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
          >
            <div className="absolute left-8 right-8 top-1/2 hidden h-px bg-white/10 md:block" />
            <motion.div
              className="absolute left-8 right-8 top-1/2 hidden h-px origin-left bg-[#2563EB] md:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: premiumEase, delay: 0.18 }}
            />
            {[0, 1, 2].map((packet) => (
              <motion.span
                key={packet}
                className="absolute top-1/2 hidden h-2.5 w-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-white to-transparent md:block"
                initial={{ left: "6%", opacity: 0 }}
                animate={{ left: "90%", opacity: [0, 0.9, 0] }}
                transition={{
                  duration: 3.4,
                  ease: premiumEase,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  delay: packet * 0.9,
                }}
              />
            ))}

            <div className="grid gap-3 md:grid-cols-4">
              {flowEvents.map((event, index) => (
                <motion.div
                  key={event.title}
                  variants={reveal}
                  className="relative rounded-lg border border-white/10 bg-[#161616] p-4"
                >
                  <div
                    className="mb-7 flex h-10 w-10 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: event.color }}
                  >
                    <event.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{event.source}</p>
                  <p className="mt-4 text-lg font-semibold text-white">{event.value}</p>
                  <span className="absolute right-4 top-4 text-xs font-semibold text-zinc-600">0{index + 1}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function ProblemSection() {
  return (
    <section id="pourquoi" className="bg-white py-8">
      <Container>
        <SectionHeader
          title="La plupart des entreprises ne manquent pas de données. Elles manquent de visibilité au bon moment."
          description="InventoryFlow transforme les opérations quotidiennes en réponses métier lisibles, sans complexité inutile."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-4 md:grid-cols-2"
        >
          {businessProblems.map((problem) => (
            <motion.div key={problem.title} variants={reveal}>
              <PremiumSurface>
                <Card className="h-full rounded-lg border-zinc-200 bg-white shadow-none transition-colors duration-200 group-hover:border-zinc-300">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F7FB] text-[#2563EB]">
                        <problem.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="rounded-full border-zinc-200 text-zinc-500">
                        décision
                      </Badge>
                    </div>
                    <CardTitle className="pt-4 text-xl text-[#111111]">{problem.title}</CardTitle>
                    <CardDescription className="text-sm font-medium leading-6 text-[#111111]">
                      {problem.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-zinc-600">{problem.answer}</p>
                  </CardContent>
                </Card>
              </PremiumSurface>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function PlatformSection() {
  return (
    <section id="plateforme" className="border-y border-zinc-200 bg-[#FAFAFA] py-8">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="lg:sticky lg:top-28"
          >
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#111111] sm:text-4xl">
              Une architecture pensée pour piloter, pas seulement enregistrer.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Chaque module répond à une question opérationnelle. Moins d'écrans inutiles, plus de signaux qui aident à décider.
            </p>
            <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
              <p className="text-sm font-semibold text-[#111111]">Flux quotidien</p>
              <div className="mt-4 grid gap-3">
                {[
                  ["Recevoir", "achats, fournisseurs, entrepôts"],
                  ["Vendre", "POS, factures, paiements"],
                  ["Contrôler", "stock, caisse, équipes"],
                  ["Décider", "rapports, alertes, IA"],
                ].map(([step, copy], index) => (
                  <div key={step} className="grid grid-cols-[28px_1fr] gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{step}</p>
                      <p className="text-xs leading-5 text-zinc-500">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Tabs defaultValue="pos" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-white p-1 shadow-none sm:grid-cols-4">
                {moduleTabs.map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className="cursor-pointer rounded-lg px-3 py-3 text-sm data-[state=active]:bg-[#111111] data-[state=active]:text-white"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {moduleTabs.map((item) => (
                <TabsContent key={item.value} value={item.value} className="mt-4">
                  <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                    <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#F5F7FB] text-[#2563EB]">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-6 text-2xl font-semibold leading-tight text-[#111111]">{item.title}</h3>
                        <p className="mt-3 text-base leading-7 text-zinc-600">{item.description}</p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                          {item.actions.map((action) => (
                            <div key={action} className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-3">
                              <Check className="h-4 w-4 text-[#16A34A]" />
                              <p className="mt-2 text-sm font-medium leading-5 text-zinc-700">{action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg bg-[#111111] p-5 text-white">
                        <p className="text-sm text-zinc-400">Signal clé</p>
                        <p className="mt-3 text-4xl font-semibold">{item.metric}</p>
                        <p className="mt-3 text-sm leading-6 text-zinc-300">{item.metricLabel}</p>
                        <div className="mt-8 h-2 rounded-full bg-white/10">
                          <div className="h-2 w-3/4 rounded-full bg-[#2563EB]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function ImportSection() {
  return (
    <section id="import" className="bg-white py-8">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Import de données</p>
                  <p className="mt-1 text-xs text-zinc-500">products-june.xlsx - 8 420 lignes</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.28, ease: premiumEase }}
                  className="rounded-lg border border-zinc-200 bg-[#111111] p-4 text-white"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-[#111111]">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-sm font-semibold">products-june.xlsx</p>
                  <p className="mt-1 text-xs text-zinc-400">8 420 lignes - 7,8 Mo</p>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-[#2563EB]"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "82%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: premiumEase, delay: 0.16 }}
                    />
                  </div>
                </motion.div>

                <div className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase text-zinc-500">Validation en direct</p>
                    <span className="text-xs font-medium text-[#2563EB]">82%</span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {importRows.map((row, index) => (
                      <motion.div
                        key={row.product}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.25, ease: premiumEase, delay: 0.08 * index }}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#111111]">{row.product}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{row.column}</p>
                        </div>
                        <span
                          className="rounded-full px-2 py-1 text-[11px] font-semibold text-white"
                          style={{ backgroundColor: row.color }}
                        >
                          {row.state}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-4">
                <div className="relative">
                  <div className="absolute left-4 right-4 top-4 h-px bg-zinc-200" />
                  <motion.div
                    className="absolute left-4 right-4 top-4 h-px origin-left bg-[#2563EB]"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: premiumEase, delay: 0.12 }}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Succès", "8 126", "#16A34A"],
                  ["Conflits", "18", "#EA580C"],
                  ["Erreurs", "7", "#DC2626"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-lg border border-zinc-200 bg-[#FAFAFA] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-zinc-500">{label}</p>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-[#111111]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-zinc-200">
                {[
                  ["Télécharger template", "product.csv", "fait"],
                  ["Déposer fichier", "CSV ou XLSX, 10 Mo max", "fait"],
                  ["Valider colonnes", "name, category, supplier, price", "fait"],
                  ["Résoudre conflits", "18 lignes demandent une décision", "en cours"],
                ].map(([title, copy, status], index) => (
                  <div
                    key={title}
                    className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-zinc-200 px-4 py-3 last:border-b-0"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${status === "fait" ? "bg-[#16A34A]/10 text-[#166534]" : "bg-[#EA580C]/10 text-[#9A3412]"
                        }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{copy}</p>
                    </div>
                    <span className="hidden rounded-full border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-500 sm:inline-flex">
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 p-4">
                <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
                <div>
                  <p className="text-sm font-semibold text-[#111111]">Préflight intelligent</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Les catégories, fournisseurs ou emballages manquants peuvent être détectés avant l'import complet.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={reveal}>
              <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#111111] sm:text-4xl">
                Démarrez avec vos données existantes, sans reprise manuelle.
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                InventoryFlow importe les fichiers CSV et XLSX que les entreprises utilisent déjà, puis les transforme en données propres pour le pilotage quotidien.
              </p>
            </motion.div>

            <motion.div variants={reveal} className="mt-7 flex flex-wrap gap-2">
              {importableData.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-[#FAFAFA] px-3 py-1.5 text-sm font-medium text-zinc-700"
                >
                  <Database className="h-3.5 w-3.5 text-[#2563EB]" />
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.div variants={stagger} className="mt-8 grid gap-3">
              {importPipeline.map((item) => (
                <motion.div
                  key={item.title}
                  variants={reveal}
                  whileHover={{ y: -4, scale: 1.006 }}
                  transition={{ duration: 0.26, ease: premiumEase }}
                  className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-colors duration-200 hover:border-zinc-300 hover:shadow-[0_18px_55px_rgba(37,99,235,0.10)]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F7FB] text-[#2563EB]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{item.copy}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function DashboardSection() {
  return (
    <section id="dashboard" className="bg-white py-8">
      <Container>
        <SectionHeader
          title="Un centre de contrôle pour savoir quoi corriger aujourd'hui."
          description="Le dashboard priorise chiffre d'affaires, bénéfice, produits faibles, commandes et alertes au lieu d'empiler des widgets."
        />

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="group relative mt-14 overflow-hidden rounded-lg border border-zinc-200 bg-[#111111] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
        >
          <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_20%_12%,rgba(37,99,235,0.24),transparent_28%),radial-gradient(circle_at_82%_30%,rgba(22,163,74,0.16),transparent_24%)] opacity-70 blur-3xl" />
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.16)_42%,transparent_58%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            initial={{ x: "-55%" }}
            whileHover={{ x: "45%" }}
            transition={{ duration: 0.74, ease: premiumEase }}
          />
          <motion.div
            className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-20%", opacity: 0 }}
            whileInView={{ x: "430%", opacity: [0, 1, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: premiumEase, delay: 0.2 }}
          />
          <div className="grid gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-white">
              <p className="text-sm text-zinc-400">Lecture en moins de 3 secondes</p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {dashboardFocusStats.map((stat, statIndex) => (
                  <motion.div
                    key={stat.label}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.16)]"
                    initial={{ opacity: 0, x: 14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.42, ease: premiumEase, delay: statIndex * 0.06 }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-zinc-300">{stat.label}</p>
                      <span className="relative flex h-2.5 w-2.5">
                        <motion.span
                          className="absolute inline-flex h-full w-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: premiumEase, delay: statIndex * 0.18 }}
                        />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-semibold">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <div className="mt-4 flex h-8 items-end gap-1">
                      {stat.bars.map((bar, index) => (
                        <motion.span
                          key={`${stat.label}-${index}`}
                          className="flex-1 rounded-t-sm"
                          style={{ backgroundColor: stat.color }}
                          initial={{ height: 3, opacity: 0.18 }}
                          whileInView={{ height: `${bar}%`, opacity: 0.72 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, ease: premiumEase, delay: 0.05 * index }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-lg bg-white p-4 text-[#111111]">
                <p className="text-sm font-semibold">Décision suggérée</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Commander les produits faibles du magasin Akwa avant vendredi pour éviter une rupture sur les meilleures ventes.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function AISection() {
  return (
    <section id="ia" className="border-y border-zinc-200 bg-[#FAFAFA] py-8">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >

            <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#111111] sm:text-4xl">
              De l'IA utile, reliée à vos ventes, stocks et finances.
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">
              Pas de buzzwords. InventoryFlow transforme les données existantes en alertes, prévisions et recommandations exploitables.
            </p>
            <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-white">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-[#111111]">Résumé automatique du jour</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    "Les ventes progressent à Akwa, mais 12 produits à forte rotation seront sous seuil avant vendredi."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {aiUseCases.map((item) => (
              <motion.div key={item.title} variants={reveal}>
                <PremiumSurface>
                  <Card className="h-full rounded-lg border-zinc-200 bg-white shadow-none transition-colors duration-200 group-hover:border-zinc-300">
                    <CardHeader>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F7FB] text-[#2563EB]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="pt-4 text-lg text-[#111111]">{item.title}</CardTitle>
                      <CardDescription className="leading-6 text-zinc-600">{item.copy}</CardDescription>
                    </CardHeader>
                  </Card>
                </PremiumSurface>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="bg-white py-8">
      <Container>
        <SectionHeader
          title="Le logiciel doit inspirer confiance avant même la première formation."
          description="InventoryFlow est conçu pour des équipes qui veulent vendre, contrôler et décider sans se perdre dans la complexité."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-4 lg:grid-cols-3"
        >
          {proofItems.map((item) => (
            <motion.div key={item.name} variants={reveal}>
              <PremiumSurface>
                <Card className="h-full rounded-lg border-zinc-200 bg-white shadow-none transition-colors duration-200 group-hover:border-zinc-300">
                  <CardContent className="p-6">
                    <p className="text-base leading-7 text-zinc-700">"{item.quote}"</p>
                    <div className="mt-7 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-sm font-semibold text-white">
                        {item.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111111]">{item.name}</p>
                        <p className="text-xs leading-5 text-zinc-500">{item.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </PremiumSurface>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-y border-zinc-200 bg-[#FAFAFA] py-8">
      <Container>
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="overflow-hidden rounded-lg border border-zinc-200 bg-[#111111] px-6 py-8 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:px-10"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#111111]">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Prenez le contrôle de votre activité.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-zinc-300">
            Commencez avec une plateforme qui relie vos ventes, votre inventaire, vos finances et vos équipes dès le premier jour.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <MagneticButtonLink href="/signup" variant="light">
              Créer mon compte
              <ArrowRight className="ml-2 h-4 w-4" />
            </MagneticButtonLink>
            <MagneticButtonLink href="/signin" variant="glass">
              Accéder au dashboard
            </MagneticButtonLink>
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-5 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              Mise en route rapide
            </span>
            <span className="inline-flex items-center gap-2">
              <LockKeyhole className="h-4 w-4" />
              Accès par rôles
            </span>
            <span className="inline-flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Données en temps réel
            </span>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white">
      <Container className="py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <BrandMark />
          <div className="flex flex-wrap gap-5 text-sm text-zinc-500">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors duration-200 hover:text-[#111111]">
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>InventoryFlow. Plateforme opérationnelle pour entreprises africaines.</p>
          <a
            href={`mailto:contact@inventoryflow.site`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          >
            <Mail className="h-4 w-4" />
            contact@inventoryflow.site
          </a>
        </div>
      </Container>
    </footer>
  );
}

export function InventoryFlowLanding() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const { previewMode } = useThemeMode();

  useEffect(() => {
    previewMode("light");
    return () => previewMode(null);
  }, []);

  return (
    <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>
      <main className="min-h-screen overflow-x-hidden bg-[#FAFAFA] text-[#111111]">
        <motion.div
          className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-[#2563EB]"
          style={{ scaleX }}
        />
        <Navigation />
        <HeroSection />
        <TrustStrip />
        <OperationFlowSection />
        <ProblemSection />
        <PlatformSection />
        <ImportSection />
        <DashboardSection />
        <AISection />
        <ProofSection />
        <CTASection />
        <Footer />
      </main>
    </MotionConfig>
  );
}