export const PERMISSIONS = {
    "/dashboard": "Tableau de bord",
    "/sell/newsell": "Nouvelle vente",
    "/sell/pending": "Ventes en attente",
    "/sell/receipt": "Reçus de vente",
    "/sell/roadmap": "Feuille de route des ventes",
    "/sell/history": "Historique des ventes",
    "/customers/add": "Ajouter un client",
    "/customers/manage": "Gérer les clients",
    "/stock/suppliers": "Fournisseurs",
    "/stock/articles": "Articles en stock",
    "/stock/inventory": "Inventaire",
    "/stock/packagings": "Emballages",
    "/stock/packagings/inventory": "Inventaire des emballages",
    "/stock/lose": "Pertes de stock",
    "/finances/caisse": "Caisse",
    "/finances/expenses": "Dépenses",
    "/enterprise/salespoints": "Points de vente",
    "/enterprise/informations": "Informations sur l'entreprise",
    "/enterprise/users": "Utilisateurs de l'entreprise",
    "/reports/all": "Rapports",

    "/buy/new": "Nouvel achat",

    "/buy/in_progress": "Achat en cours",

    "/buy/roadmap": "Feuille de route d'achat"
  "/buy/history": "Historique d'achat"

} as const;

export type PagePermission = keyof typeof PERMISSIONS;

export function sanitizePagePermissions(rawPerms: string[]): PagePermission[] {
    return rawPerms?.filter((p): p is PagePermission => p in PERMISSIONS);
}
