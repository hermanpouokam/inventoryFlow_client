import {
    Settings,
    DollarSign,
    FileText,
    Package,
    Bell,
    Shield,
} from "lucide-react";

export type FieldType = "string" | "number" | "boolean" | "select" | "text" | "image";

export interface SettingField {
    id: string;
    label: string;
    type: FieldType;
    value: string | number | boolean;
    defaultValue: string | number | boolean;
    description?: string;
    placeholder?: string;
    options?: { label: string; value: string }[];
    required?: boolean;
    important?: boolean;
}

export interface SettingSection {
    id: string;
    title: string;
    description?: string;
    fields: SettingField[];
}

export interface SettingCategory {
    id: string;
    label: string;
    icon: typeof Settings;
    sections: SettingSection[];
}

export const settingsConfig: SettingCategory[] = [
    {
        id: "general",
        label: "Paramètres généraux",
        icon: Settings,
        sections: [
            {
                id: "store-info",
                title: "Informations du magasin",
                description: "Configurez les informations de base de votre entreprise.",
                fields: [
                    { id: "store_name", label: "Nom du magasin", type: "string", value: "Ma Boutique", defaultValue: "", placeholder: "Nom de votre boutique", required: true, important: true },
                    { id: "store_logo", label: "Logo", type: "image", value: "", defaultValue: "", description: "Format recommandé : PNG, 512x512px" },
                    { id: "store_description", label: "Description", type: "text", value: "", defaultValue: "", placeholder: "Décrivez votre activité..." },
                    { id: "store_email", label: "Email de contact", type: "string", value: "contact@maboutique.com", defaultValue: "", placeholder: "email@exemple.com", required: true },
                    { id: "store_phone", label: "Téléphone", type: "string", value: "+33 1 23 45 67 89", defaultValue: "", placeholder: "+33..." },
                    { id: "store_address", label: "Adresse", type: "text", value: "12 Rue du Commerce, 75001 Paris", defaultValue: "", placeholder: "Adresse complète" },
                    { id: "store_nc", label: "Numero de contribuable", type: "string", value: "M123456789012A", defaultValue: "", placeholder: "NC" },
                
                ],
            },
        ],
    },
    {
        id: "finances",
        label: "Finances",
        icon: DollarSign,
        sections: [
            {
                id: "currency",
                title: "Devise",
                fields: [
                    { id: "currency", label: "Devise principale", type: "select", value: "EUR", defaultValue: "EUR", options: [{ label: "Euro (€)", value: "EUR" }, { label: "Dollar ($)", value: "USD" }, { label: "Dirham (MAD)", value: "MAD" }, { label: "Dinar (DZD)", value: "DZD" }], important: true },
                    { id: "currency_position", label: "Position du symbole", type: "select", value: "after", defaultValue: "after", options: [{ label: "Après (100 €)", value: "after" }, { label: "Avant (€ 100)", value: "before" }] },
                ],
            },
        ],
    },
    {
        id: "invoicing",
        label: "Facturation",
        icon: FileText,
        sections: [
            {
                id: "invoice-settings",
                title: "Paramètres de facturation",
                fields: [
                    { id: "invoice_prefix", label: "Préfixe facture", type: "string", value: "INV-", defaultValue: "INV-", placeholder: "INV-" },
                    { id: "invoice_auto_send", label: "Envoi automatique", type: "boolean", value: false, defaultValue: false, description: "Envoyer la facture par email automatiquement" },
                    { id: "invoice_notes", label: "Notes par défaut", type: "text", value: "Merci pour votre confiance.", defaultValue: "", placeholder: "Notes affichées en bas de facture" },
                    { id: "invoice_logo_on_pdf", label: "Logo sur les factures PDF", type: "boolean", value: true, defaultValue: true },
                ],
            },
        ],
    },
    {
        id: "products",
        label: "Produits",
        icon: Package,
        sections: [
            {
                id: "product-settings",
                title: "Paramètres produits",
                fields: [
                    { id: "sku_auto", label: "SKU automatique", type: "boolean", value: true, defaultValue: true, description: "Générer automatiquement les codes SKU" },
                    { id: "sku_prefix", label: "Préfixe SKU", type: "string", value: "PRD-", defaultValue: "PRD-" },
                    { id: "low_stock_threshold", label: "Seuil stock bas", type: "number", value: 5, defaultValue: 5, important: true, description: "Alerte quand le stock descend en dessous" },
                    { id: "track_inventory", label: "Suivi des stocks", type: "boolean", value: true, defaultValue: true },
                ],
            },
        ],
    },
    {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        sections: [
            {
                id: "notif-settings",
                title: "Préférences de notification",
                fields: [
                    { id: "notif_email", label: "Notifications par email", type: "boolean", value: true, defaultValue: true },
                    { id: "notif_low_stock", label: "Alerte stock bas", type: "boolean", value: true, defaultValue: true, important: true },
                    { id: "notif_new_order", label: "Nouvelle commande", type: "boolean", value: true, defaultValue: true },
                    { id: "notif_payment_received", label: "Paiement reçu", type: "boolean", value: false, defaultValue: false },
                    { id: "notif_daily_report", label: "Rapport quotidien", type: "boolean", value: false, defaultValue: false, description: "Recevoir un résumé journalier par email" },
                ],
            },
        ],
    },
    {
        id: "security",
        label: "Sécurité",
        icon: Shield,
        sections: [
            {
                id: "security-settings",
                title: "Paramètres de sécurité",
                fields: [
                    { id: "session_timeout", label: "Expiration de session (min)", type: "number", value: 60, defaultValue: 60, important: true },
                    { id: "ip_whitelist", label: "Filtrage IP", type: "boolean", value: false, defaultValue: false, description: "Restreindre l'accès à certaines adresses IP" },
                    { id: "audit_log", label: "Journal d'activité", type: "boolean", value: true, defaultValue: true, description: "Enregistrer toutes les actions utilisateurs" },
                ],
            },
        ],
    },
];
