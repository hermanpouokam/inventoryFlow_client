import { User, Shield, Palette, Bell, type LucideIcon } from "lucide-react";
import type { FieldType } from "./settings-config";

export interface UserSettingField {
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

export interface UserSettingSection {
  id: string;
  title: string;
  description?: string;
  fields: UserSettingField[];
}

export interface UserSettingCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  sections: UserSettingSection[];
}

export const userSettingsConfig: UserSettingCategory[] = [
  {
    id: "profile",
    label: "user_config.profil",
    icon: User,
    sections: [
      {
        id: "personal-info",
        title: "user_config.informations_personnelles",
        description: "user_config.vos_informations_de_base_visibles_par_les_autres_membres",
        fields: [
          { id: "user_firstname", label: "user_config.prenom", type: "string", value: "Jean", defaultValue: "Jean", placeholder: "user_config.votre_prenom", required: true },
          { id: "user_lastname", label: "user_config.nom", type: "string", value: "Dupont", defaultValue: "Dupont", placeholder: "user_config.votre_nom", required: true },
          { id: "user_email", label: "user_config.adresse_email", type: "string", value: "jean@entreprise.com", defaultValue: "jean@entreprise.com", placeholder: "settings_config.email_exemple_com", required: true, important: true },
          { id: "user_number", label: "settings_config.telephone", type: "string", value: "", defaultValue: "", placeholder: "+237 6 00 00 00 00" },
          { id: "user_avatar", label: "user_config.photo_de_profil", type: "image", value: "", defaultValue: "" },
        ],
      },
    ],
  },
  {
    id: "security",
    label: "settings_config.securite",
    icon: Shield,
    sections: [
      {
        id: "password",
        title: "user_config.mot_de_passe",
        description: "user_config.changez_votre_mot_de_passe_regulierement_pour_plus_de_securi",
        fields: [
          { id: "user_current_password", label: "user_config.mot_de_passe_actuel", type: "string", value: "", defaultValue: "", placeholder: "••••••••", required: true },
          { id: "user_new_password", label: "user_config.nouveau_mot_de_passe", type: "string", value: "", defaultValue: "", placeholder: "••••••••", required: true },
          { id: "user_confirm_password", label: "user_config.confirmer_le_mot_de_passe", type: "string", value: "", defaultValue: "", placeholder: "••••••••", required: true },
        ],
      },
      {
        id: "two-factor",
        title: "user_config.authentification_a_deux_facteurs",
        description: "user_config.ajoutez_une_couche_de_securite_supplementaire_a_votre_compte",
        fields: [
          { id: "user_2fa_enabled", label: "user_config.activer_la_2fa", type: "boolean", value: false, defaultValue: false, important: true },
          {
            id: "user_2fa_method", label: "user_config.methode", type: "select", value: "email", defaultValue: "email", options: [
              { label: "user_config.email", value: "email" },
              { label: "user_config.sms", value: "sms" },
            ]
          },
        ],
      },
      {
        id: "sessions",
        title: "user_config.sessions_actives",
        fields: [
          // { id: "user_auto_logout", label: "user_config.deconnexion_automatique_min", type: "number", value: 30, defaultValue: 30, placeholder: "30", description: "user_config.delai_d_inactivite_avant_deconnexion_automatique" },
          { id: "user_single_session", label: "user_config.limiter_a_une_session", type: "boolean", value: false, defaultValue: false, description: "user_config.deconnecter_les_autres_sessions_a_la_connexion" },
        ],
      },
    ],
  },
  {
    id: "preferences",
    label: "user_config.preferences",
    icon: Palette,
    sections: [
      {
        id: "display",
        title: "user_config.affichage",
        description: "user_config.personnalisez_l_apparence_de_votre_interface",
        fields: [
          {
            id: "user_theme", label: "user_config.theme", type: "select", value: "system", defaultValue: "system", options: [
              { label: "user_config.clair", value: "light" },
              { label: "user_config.sombre", value: "dark" },
              { label: "user_config.systeme", value: "system" },
            ]
          },
          {
            id: "user_language", label: "user_config.langue", type: "select", value: "fr", defaultValue: "fr", options: [
              { label: "user_config.francais", value: "fr" },
              { label: "user_config.english", value: "en" },
              // { label: "user_config.espanol", value: "es" },
            ]
          },
        ],
      },
      // {
      //   id: "regional",
      //   title: "user_config.parametres_regionaux",
      //   fields: [
      //     {
      //       id: "user_date_format", label: "user_config.format_de_date", type: "select", value: "dd/MM/yyyy", defaultValue: "dd/MM/yyyy", options: [
      //         { label: "user_config.jj_mm_aaaa", value: "dd/MM/yyyy" },
      //         { label: "user_config.mm_jj_aaaa", value: "MM/dd/yyyy" },
      //         { label: "user_config.aaaa_mm_jj", value: "yyyy-MM-dd" },
      //       ]
      //     },
      //   ],
      // },
    ],
  },
  {
    id: "notifications",
    label: "settings_config.notifications",
    icon: Bell,
    sections: [
      {
        id: "email-notifs",
        title: "settings_config.notifications_par_email",
        description: "user_config.choisissez_quelles_notifications_recevoir_par_email",
        fields: [
          { id: "user_notif_invoices", label: "user_config.factures", type: "boolean", value: true, defaultValue: true, description: "user_config.recevoir_un_email_a_chaque_nouvelle_facture" },
          { id: "user_notif_payments", label: "user_config.paiements", type: "boolean", value: true, defaultValue: true, description: "user_config.etre_notifie_des_paiements_recus" },
          { id: "user_notif_reports", label: "user_config.rapports_hebdomadaires", type: "boolean", value: false, defaultValue: false, description: "user_config.resume_des_ventes_chaque_lundi" },
          { id: "user_notif_security", label: "user_config.alertes_de_securite", type: "boolean", value: true, defaultValue: true, description: "user_config.connexions_suspectes_changements_de_mot_de_passe", important: true },
        ],
      },
      {
        id: "push-notifs",
        title: "user_config.notifications_push",
        fields: [
          { id: "user_push_enabled", label: "user_config.activer_les_notifications_push", type: "boolean", value: false, defaultValue: false },
          { id: "user_push_sound", label: "user_config.son_de_notification", type: "boolean", value: true, defaultValue: true },
        ],
      },
      // {
      //   id: "digest",
      //   title: "user_config.frequence_des_resumes",
      //   fields: [
      //     {
      //       id: "user_digest_frequency", label: "user_config.frequence", type: "select", value: "weekly", defaultValue: "weekly", options: [
      //         { label: "user_config.quotidien", value: "daily" },
      //         { label: "user_config.hebdomadaire", value: "weekly" },
      //         { label: "user_config.mensuel", value: "monthly" },
      //         { label: "user_config.jamais", value: "never" },
      //       ]
      //     },
      //   ],
      // },
    ],
  },
];
