// import { handleLogout } from "@/components/auth";
import { clearStorageAndCookies } from "@/app/(auth)/signup/functions";
import { logoutUser } from "@/components/auth";
import type { PagePermission } from "@/constants/pagePermissions";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";
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

type RawMenu = {
  name: string;
  link: PagePermission | null;
  icon: any; // ou React.ComponentType si les icônes sont des composants
  menu: { text: string; link: PagePermission }[] | null;
};
export function useMenuItems(): Menu[] {
  const { hasPagePermission, isAdmin } = usePermission();
  const { t } = useTranslation("common");

  const rawMenu: RawMenu[] = [
    {
      name: "dashboard",
      link: "/dashboard",
      icon: ChartPie,
      menu: null,
    },
    {
      name: "sell",
      link: null,
      icon: FileText,
      menu: [
        { text: t("navigation.items.sell_new"), link: "/sell/newsell" },
        { text: t("navigation.items.sell_pending"), link: "/sell/pending" },
        { text: t("navigation.items.sell_receipt"), link: "/sell/receipt" },
        { text: t("navigation.items.sell_roadmap"), link: "/sell/roadmap" },
        { text: t("navigation.items.sell_history"), link: "/sell/history" },
      ],
    },
    {
      name: "customers",
      link: null,
      icon: UsersRoundIcon,
      menu: [
        { text: t("navigation.items.customers_add"), link: "/customers/add" },
        { text: t("navigation.items.customers_manage"), link: "/customers/manage" },
      ],
    },
    {
      name: "purchases",
      link: null,
      icon: Receipt,
      menu: [
        { text: t("navigation.items.buy_new"), link: "/buy/new" },
        { text: t("navigation.items.buy_in_progress"), link: "/buy/in_progress" },
        { text: t("navigation.items.buy_roadmap"), link: "/buy/roadmap" },
        { text: t("navigation.items.buy_history"), link: "/buy/history" },
      ],
    },
    {
      name: "stock",
      link: null,
      icon: Layers,
      menu: [
        { text: t("navigation.items.stock_suppliers"), link: "/stock/suppliers" },
        { text: t("navigation.items.stock_articles"), link: "/stock/articles" },
        { text: t("navigation.items.stock_inventory"), link: "/stock/inventory" },
        { text: t("navigation.items.stock_packagings"), link: "/stock/packagings" },
        { text: t("navigation.items.stock_packaging_inventory"), link: "/stock/packagings/inventory" },
        { text: t("navigation.items.stock_losses"), link: "/stock/lose" },
      ],
    },
    {
      name: "finances",
      link: null,
      icon: WalletCards,
      menu: [
        { text: t("navigation.items.finances_cash"), link: "/finances/caisse" },
        { text: t("navigation.items.finances_expenses"), link: "/finances/expenses" },
      ],
    },
    {
      name: isAdmin() ? "enterprise" : "sales point",
      link: null,
      icon: LandmarkIcon,
      menu: [
        { text: !isAdmin() ? t("navigation.items.enterprise_details") : t("navigation.items.enterprise_sales_points"), link: "/enterprise/salespoints" },
        { text: t("navigation.items.enterprise_payment_info"), link: "/enterprise/informations" },
        { text: t("navigation.items.enterprise_settings"), link: "/enterprise/settings" },
        { text: t("navigation.items.upload"), link: "/enterprise/upload" },
        // { text: t("navigation.items.enterprise_users"), link: "/enterprise/users" },
      ],
    },
    {
      name: "reports",
      link: null,
      icon: MessageSquare,
      menu: [
        { text: t("navigation.items.reports_all"), link: "/reports/all" },
      ],
    },
  ];

  const filteredMenu: Menu[] = rawMenu
    .map((item) => {
      if (item.menu === null) {
        return hasPagePermission(item.link!)
          ? { ...item, menu: null }
          : null;
      } else {
        const filteredSubmenu = item.menu.filter((sub) =>
          hasPagePermission(sub.link)
        );
        return filteredSubmenu.length > 0
          ? { ...item, menu: filteredSubmenu }
          : null;
      }
    })
    .filter(Boolean) as Menu[];
  return filteredMenu;
}
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
        i18nKey: "user_menu.account_settings",
        link: "",
        //@ts-ignore
        icon: User,
        menu: null,
        onClick: () => window.location.assign("/settings"),
      },
      {
        name: "Se déconnecter",
        i18nKey: "user_menu.sign_out",
        danger: true,
        link: "",
        //@ts-ignore
        icon: LogOutIcon,
        menu: null,
        onClick: () => clearStorageAndCookies('/dashboard '),
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
  buy: "Achats",
  "sales point": "point de vente",
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
  "USERNAME_ALREADY_EXIST":
    "Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.",
  "EMAIL_ALREADY_EXIST": "Un compte avec cet email existe déjà.",
};

export const translate = {
  percentage: "pourcentage",
  supply: "achat",
  bill: "vente",
  flat: "fixe",
  plan_id: "plan",
  name: "nom",
  address: "adresse",
  number: "numéro",
  phone: "numéro",
  currency: "devise",
  email: "email",
  nc: "Numéro de contribuable",
};

export const mois = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "octobre",
  "novembre",
  "décembre",
];
