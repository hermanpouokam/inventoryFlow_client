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
  link: PagePermission | string | null;
  icon: any; // ou React.ComponentType si les icônes sont des composants
  menu: { text: string; link: PagePermission | string }[] | null;
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
        ...(isAdmin() ? [{ text: t("navigation.items.enterprise_payment_info"), link: "/enterprise/informations" }] : []),
        ...(isAdmin() ? [{ text: t("navigation.items.enterprise_settings"), link: "/enterprise/settings" }] : []),
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
        // ensure item.link is a PagePermission before calling hasPagePermission
        return item.link && hasPagePermission(item.link as PagePermission)
          ? { ...item, menu: null }
          : null;
      } else {
        const filteredSubmenu = item.menu.filter((sub) =>
          hasPagePermission(sub.link as PagePermission)
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
    name: "today",
    i18nKey: "date_range.presets.today",
    value: {
      from: moment().format("llll"),
      to: moment().format("llll"),
    },
  },
  {
    name: "yesterday",
    i18nKey: "date_range.presets.yesterday",
    value: {
      from: moment().subtract(1, "days").format("llll"),
      to: moment().subtract(1, "days").format("llll"),
    },
  },
  {
    name: "this_week",
    i18nKey: "date_range.presets.this_week",
    value: {
      from: moment().startOf("isoWeek").format("llll"),
      to: moment().endOf("isoWeek").format("llll"),
    },
  },
  {
    name: "this_month",
    i18nKey: "date_range.presets.this_month",
    value: {
      from: moment().startOf("month").format("llll"),
      to: moment().endOf("month").format("llll"),
    },
  },
  {
    name: "last_month",
    i18nKey: "date_range.presets.last_month",
    value: {
      from: moment().subtract(1, "month").startOf("month").format("llll"),
      to: moment().subtract(1, "month").endOf("month").format("llll"),
    },
  },
  {
    name: "this_year",
    i18nKey: "date_range.presets.this_year",
    value: {
      from: moment().startOf("year").format("llll"),
      to: moment().endOf("year").format("llll"),
    },
  },
  {
    name: "last_year",
    i18nKey: "date_range.presets.last_year",
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
  "USER NOT FOUND": "auth_signin.errors.user_not_found",
  "INCORRECT PASSWORD": "auth_signin.errors.incorrect_password",
  "INACTIVE USER": "auth_signin.errors.inactive_user",
};

export const userRegErrors = {
  "USERNAME_ALREADY_EXIST": "auth_signup.errors.username_already_exist",
  "EMAIL_ALREADY_EXIST": "auth_signup.errors.email_already_exist",
};

export const translate = {
  percentage: "taxes.types.percentage",
  supply: "taxes.applications.supply",
  bill: "taxes.applications.bill",
  flat: "taxes.types.flat",
  plan_id: "billing.plan",
  name: "name",
  address: "address",
  number: "fields.number",
  phone: "phone",
  currency: "enterprise_information.currency",
  email: "email",
  nc: "fields.taxpayer_number",
};

export const monthKeys = [
  "dates.months.january",
  "dates.months.february",
  "dates.months.march",
  "dates.months.april",
  "dates.months.may",
  "dates.months.june",
  "dates.months.july",
  "dates.months.august",
  "dates.months.september",
  "dates.months.october",
  "dates.months.november",
  "dates.months.december",
];
