// import { handleLogout } from "@/components/auth";
import { clearStorageAndCookies } from "@/app/(auth)/signup/functions";
import { logoutUser } from "@/components/auth";
import {
  User,
  LogOutIcon,
  ChartPie,
  FileText,
  UsersRoundIcon,
  Receipt,
  Layers,
  WalletCards,
  LandmarkIcon,
  MessageSquare,
} from "lucide-react";
import moment from "moment";

export const menuItems: Menu[] = [
  {
    name: "dashboard",
    link: "/dashboard",
    icon: ChartPie,
    menu: null,
  },
  // {
  //   name: "Bouclage journalier",
  //   link: "/dailyclosure",
  //   menu: null,
  // },
  {
    name: "sell",
    link: null,
    icon: FileText,
    menu: [
      {
        text: "Nouvelle vente",
        link: "/sell/newsell",
      },
      {
        text: "Commandes à livrer",
        link: "/sell/pending",
      },
      {
        text: "Encaisser une facture",
        link: "/sell/receipt",
      },
      {
        text: "Feuille de route",
        link: "/sell/roadmap",
      },
      {
        text: "Historique",
        link: "/sell/history",
      },
    ],
  },
  {
    name: "customers",
    link: null,
    icon: UsersRoundIcon,
    menu: [
      {
        text: "Ajouter un client",
        link: "/customers/add",
      },
      {
        text: "Gérer",
        link: "/customers/manage",
      },
    ],
  },
  {
    name: "purchases",
    link: null,
    icon: Receipt,
    menu: [
      {
        text: "Creer un bon",
        link: "/buy/new",
      },
      {
        text: "Achat en cours",
        link: "/buy/in_progress",
      },
      {
        text: "Feuille de route",
        link: "/buy/roadmap",
      },
      {
        text: "Historique",
        link: "/buy/history",
      },
    ],
  },
  {
    name: "stock",
    link: null,
    icon: Layers,
    menu: [
      {
        text: "Fournisseurs",
        link: "/stock/suppliers",
      },
      {
        text: "Articles",
        link: "/stock/articles",
      },
      {
        text: "Inventaire",
        link: "/stock/inventory",
      },
      {
        text: "Emballages",
        link: "/stock/packagings",
      },
      {
        text: "Inventaire d'emballages",
        link: "/stock/packagings/inventory",
      },
      {
        text: "Pertes",
        link: "/stock/lose",
      },
    ],
  },
  {
    name: "finances",
    link: null,
    icon: WalletCards,
    menu: [
      {
        text: "Ma caisse",
        link: "/finances/caisse",
      },
      {
        text: "Depenses",
        link: "/finances/expenses",
      },
      {
        text: "Gestion de pertes",
        link: "/finances/lose",
      },
    ],
  },
  {
    name: "enterprise",
    link: null,
    icon: LandmarkIcon,
    menu: [
      {
        text: "Point de vente",
        link: "/enterprise/salespoints",
      },
      {
        text: "Informations",
        link: "/enterprise/informations",
      },
      {
        text: "Utilisateurs",
        link: "/enterprise/inventory",
      },
    ],
  },
  {
    name: "reports",
    link: null,
    icon: MessageSquare,
    menu: [
      {
        text: "Consulter ",
        link: "report/all",
      },
    ],
  },
];

export const handleLogout = async () => {
  try {
    await fetch("/api/logout");
    // window.location.replace("/signin");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

export const userMenu: DropdownMenuProps[] = [
  {
    title: "information",
    menu: [
      {
        name: "Paramètres de compte",
        link: "",
        //@ts-ignore
        icon: User,
        menu: null,
        onClick: () => window.location.assign("/settings/account"),
      },
      {
        name: "Se déconnecter",
        link: "",
        //@ts-ignore
        icon: LogOutIcon,
        menu: null,
        onClick: () => clearStorageAndCookies(),
      },
    ],
  },
];

export const LONG_LIFE_DURATION = 10 * 365 * 24 * 60 * 60;

export const datesData = [
  {
    name: "Aujourd'hui",
    value: {
      from: moment().format("llll"),
      to: moment().format("llll"),
    },
  },
  {
    name: "Hier",
    value: {
      from: moment().subtract(1, "days").format("llll"),
      to: moment().subtract(1, "days").format("llll"),
    },
  },
  {
    name: "Cette semaine",
    value: {
      from: moment().startOf("isoWeek").format("llll"),
      to: moment().endOf("isoWeek").format("llll"),
    },
  },
  {
    name: "Ce mois-ci",
    value: {
      from: moment().startOf("month").format("llll"),
      to: moment().endOf("month").format("llll"),
    },
  },
  {
    name: "Le mois dernier",
    value: {
      from: moment().subtract(1, "month").startOf("month").format("llll"),
      to: moment().subtract(1, "month").endOf("month").format("llll"),
    },
  },
  {
    name: "Cette année",
    value: {
      from: moment().startOf("year").format("llll"),
      to: moment().endOf("year").format("llll"),
    },
  },
  {
    name: "L'année dernière",
    value: {
      from: moment().subtract(1, "year").startOf("year").format("llll"),
      to: moment().subtract(1, "year").endOf("year").format("llll"),
    },
  },
];

export const orientations = [
  {
    name: "landscape",
    value: "landscape",
  },
  {
    name: "portrait",
    value: "portrait",
  },
];

export const status = {
  created: "Créée",
  pending: "Livrée",
  success: "encaisée",
  receipt: "Receptionnée",
};

export const statusBuy = {
  pending: "En attente",
  receipt: "Receptionnée",
};

export const plansData = {
  1: {
    accountNumber: 1,
    salespointNumber: 1,
  },
  2: {
    accountNumber: 2,
    salespointNumber: 1,
  },
  3: {
    accountNumber: "unlimited",
    salespointNumber: 3,
    dataVisualization: true,
    marketPrediction: true,
  },
  4: {
    accountNumber: "unlimited",
    salespointNumber: "unlimited",
    dataVisualization: true,
    marketPrediction: true,
  },
};

export const menuTranslate = {
  dashboard: "Tableau de bord",
  sell: "ventes",
  customers: "clients",
  purchases: "Achats",
  stock: "stock",
  finances: "finances",
  enterprise: "entreprise",
  reports: "plaintes",
};

export const plansDataTranslate = {
  accountNumber: "compte(s)",
  salespointNumber: "Point(s) de vente",
  dataVisualization: "Données graphique",
  marketPrediction: "Prédiction de marché",
};

export const userErrors = {
  "USER NOT FOUND": "Cet utilisateur n'existe pas.",
  "INCORRECT PASSWORD": "Nom d'utilisateur ou mot de passe incorrect.",
  "INACTIVE USER":
    "Vous avez été désactivé(e). Veuillez contacter votre administrateur.",
};

export const userRegErrors = {
  "USERNAME ALREADY EXIST":
    "Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.",
  "EMAIL ALREADY EXIST": "Un compte avec cet email existe déjà.",
};
