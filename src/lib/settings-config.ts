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
        label: "settings_config.parametres_generaux",
        icon: Settings,
        sections: [
            {
                id: "store-info",
                title: "settings_config.informations_du_magasin",
                description: "settings_config.configurez_les_informations_de_base_de_votre_entreprise",
                fields: [
                    { id: "store_name", label: "settings_config.nom_du_magasin", type: "string", value: "Ma Boutique", defaultValue: "", placeholder: "settings_config.nom_de_votre_boutique", required: true, important: true },
                    { id: "store_logo", label: "settings_config.logo", type: "image", value: "", defaultValue: "", description: "settings_config.format_recommande_png_512x512px" },
                    { id: "store_description", label: "settings_config.description", type: "text", value: "", defaultValue: "", placeholder: "settings_config.decrivez_votre_activite" },
                    { id: "store_email", label: "settings_config.email_de_contact", type: "string", value: "contact@maboutique.com", defaultValue: "", placeholder: "settings_config.email_exemple_com", required: true },
                    { id: "store_phone", label: "settings_config.telephone", type: "string", value: "+33 1 23 45 67 89", defaultValue: "", placeholder: "+33..." },
                    { id: "store_address", label: "settings_config.adresse", type: "text", value: "12 Rue du Commerce, 75001 Paris", defaultValue: "", placeholder: "settings_config.adresse_complete" },
                    { id: "store_nc", label: "settings_config.numero_de_contribuable", type: "string", value: "M123456789012A", defaultValue: "", placeholder: "NC" },
                
                ],
            },
        ],
    },
    {
        id: "invoicing",
        label: "settings_config.facturation",
        icon: FileText,
        sections: [
            {
                id: "invoice-settings",
                title: "settings_config.parametres_de_facturation",
                fields: [
                    // { id: "invoice_prefix", label: "settings_config.prefixe_facture", type: "string", value: "INV-", defaultValue: "INV-", placeholder: "INV-" },
                    { id: "invoice_auto_send", label: "settings_config.envoi_automatique", type: "boolean", value: false, defaultValue: false, description: "settings_config.envoyer_la_facture_par_email_automatiquement" },
                    { id: "invoice_notes", label: "settings_config.notes_par_defaut", type: "text", value: "Merci pour votre confiance.", defaultValue: "", placeholder: "settings_config.notes_affichees_en_bas_de_facture" },
                    { id: "invoice_logo_on_pdf", label: "settings_config.logo_sur_les_factures_pdf", type: "boolean", value: true, defaultValue: true },
                ],
            },
        ],
    },
    {
        id: "products",
        label: "settings_config.produits",
        icon: Package,
        sections: [
            {
                id: "product-settings",
                title: "settings_config.parametres_produits",
                fields: [
                    // { id: "sku_auto", label: "settings_config.sku_automatique", type: "boolean", value: true, defaultValue: true, description: "settings_config.generer_automatiquement_les_codes_sku" },
                    // { id: "sku_prefix", label: "settings_config.prefixe_sku", type: "string", value: "PRD-", defaultValue: "PRD-" },
                    { id: "low_stock_threshold", label: "settings_config.seuil_stock_bas", type: "number", value: 5, defaultValue: 5, important: true, description: "settings_config.alerte_quand_le_stock_descend_en_dessous" },
                    { id: "track_inventory", label: "settings_config.suivi_des_stocks", type: "boolean", value: true, defaultValue: true },
                ],
            },
        ],
    },
    {
        id: "notifications",
        label: "settings_config.notifications",
        icon: Bell,
        sections: [
            {
                id: "notif-settings",
                title: "settings_config.preferences_de_notification",
                fields: [
                    { id: "notif_email", label: "settings_config.notifications_par_email", type: "boolean", value: true, defaultValue: true },
                    { id: "notif_low_stock", label: "settings_config.alerte_stock_bas", type: "boolean", value: true, defaultValue: true, important: true },
                    { id: "notif_new_order", label: "settings_config.nouvelle_commande", type: "boolean", value: true, defaultValue: true },
                    { id: "notif_payment_received", label: "settings_config.paiement_recu", type: "boolean", value: false, defaultValue: false },
                    { id: "notif_daily_report", label: "settings_config.rapport_quotidien", type: "boolean", value: false, defaultValue: false, description: "settings_config.recevoir_un_resume_journalier_par_email" },
                ],
            },
        ],
    },
];
