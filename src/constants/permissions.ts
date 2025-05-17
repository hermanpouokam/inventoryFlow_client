// constants/permissions.ts

export const PERMISSIONS = {
  add_product: "Ajouter un article",
  edit_product: "Modifier un article",
  delete_product: "Supprimer un article",
  view_products: "Voir les article",
  add_packaging: "Ajouter un emballage",
  modifiy_packaging: "Modifier un emballage",
  delete_packaging: "Supprimer un emballage",
  back_packaging: "Récupérer un emballage",
  add_supplier: "Ajouter un fournisseur",
  edit_supplier: "Modifier un fournisseur",
  delete_supplier: "Supprimer un fournisseur",
  view_suppliers: "Voir les fournisseurs",
  edit_invoice: "Modifier une facture",
  delete_invoice: "Supprimer une facture",
  view_invoices: "Voir les factures",
  view_daily_report: "Voir le rapport journalier",
  view_monthly_report: "Voir le rapport mensuel",
  add_user: "Ajouter un utilisateur",
  edit_user: "Modifier un utilisateur",
  delete_user: "Supprimer un utilisateur",
  assign_roles: "Assigner des rôles",
  add_customer: "Add a customer",
  edit_customer: "Edit a customer",
  delete_customer: "Delete a customer",
  cash_in_invoices: "encaisser une facture",
  view_customer: "View customer",
  validate_supply: "Validaer une commande",
  delete_supply: "Supprimer une commande",
  validate_bill: "Valider une facture",
  delete_bill: "Supprimer une facture",
  receipt_bill: "Receptionner une facture",
  create_bill: "Créer une facture",
  view_users: "Voir les utilisateurs",
  add_expense: "Ajouter une dépense",
  validate_expense: "Valider une dépense",
  delete_expense: "Supprimer une dépense",
  manage_cash: "Gérer la caisse",
  add_inventory: "Ajouter un inventaire",
  delete_inventory: "Supprimer un inventaire",
  validate_inventory: "Valider un inventaire",
  add_packaging_inventory: "Add a packaging inventory",
  delete_packaging_inventory: "Delete a packaging inventory",
  validate_packaging_inventory: "Validate a packaging inventory",
  add_loss: "Add a loss",
  validate_loss: "Validate a loss",
  delete_loss: "Delete a loss"
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function sanitizePermissions(rawPerms: string[]): Permission[] {
  return rawPerms?.filter((p): p is Permission => p in PERMISSIONS);
}
