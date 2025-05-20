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
    
            "id": 21,
            "number": 21,
            "name": "/buy/new",
            "path": "/buy/new"
        },
        {
            "id": 22,
            "number": 22,
            "name": "/buy/in_progress",
            "path": "/buy/in_progress"
        },
        {
            "id": 23,
            "number": 23,
            "name": "/buy/roadmap",
            "path": "/buy/roadmap"
        },
        {
            "id": 24,
            "number": 24,
            "name": "/buy/history",
            "path": "/buy/history"
        }
} as const;

export type PagePermission = keyof typeof PERMISSIONS;

export function sanitizePagePermissions(rawPerms: string[]): PagePermission[] {
    return rawPerms?.filter((p): p is PagePermission => p in PERMISSIONS);
}
