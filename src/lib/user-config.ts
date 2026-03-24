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
    label: "Profil",
    icon: User,
    sections: [
      {
        id: "personal-info",
        title: "Informations personnelles",
        description: "Vos informations de base visibles par les autres membres.",
        fields: [
          { id: "user_firstname", label: "Prénom", type: "string", value: "Jean", defaultValue: "Jean", placeholder: "Votre prénom", required: true },
          { id: "user_lastname", label: "Nom", type: "string", value: "Dupont", defaultValue: "Dupont", placeholder: "Votre nom", required: true },
          { id: "user_email", label: "Adresse email", type: "string", value: "jean@entreprise.com", defaultValue: "jean@entreprise.com", placeholder: "email@exemple.com", required: true, important: true },
          { id: "user_phone", label: "Téléphone", type: "string", value: "", defaultValue: "", placeholder: "+33 6 00 00 00 00" },
          { id: "user_avatar", label: "Photo de profil", type: "image", value: "", defaultValue: "" },
        ],
      },
      {
        id: "role-info",
        title: "Rôle & Organisation",
        fields: [
          { id: "user_job_title", label: "Poste", type: "string", value: "Gérant", defaultValue: "Gérant", placeholder: "Ex : Directeur, Caissier…" },
          {
            id: "user_department", label: "Service", type: "select", value: "management", defaultValue: "management", options: [
              { label: "Direction", value: "management" },
              { label: "Ventes", value: "sales" },
              { label: "Comptabilité", value: "accounting" },
              { label: "Support", value: "support" },
            ]
          },
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
        id: "password",
        title: "Mot de passe",
        description: "Changez votre mot de passe régulièrement pour plus de sécurité.",
        fields: [
          { id: "user_current_password", label: "Mot de passe actuel", type: "string", value: "", defaultValue: "", placeholder: "••••••••", required: true },
          { id: "user_new_password", label: "Nouveau mot de passe", type: "string", value: "", defaultValue: "", placeholder: "••••••••", required: true },
          { id: "user_confirm_password", label: "Confirmer le mot de passe", type: "string", value: "", defaultValue: "", placeholder: "••••••••", required: true },
        ],
      },
      {
        id: "two-factor",
        title: "Authentification à deux facteurs",
        description: "Ajoutez une couche de sécurité supplémentaire à votre compte.",
        fields: [
          { id: "user_2fa_enabled", label: "Activer la 2FA", type: "boolean", value: false, defaultValue: false, important: true },
          {
            id: "user_2fa_method", label: "Méthode", type: "select", value: "email", defaultValue: "email", options: [
              { label: "Email", value: "email" },
              { label: "SMS", value: "sms" },
            ]
          },
        ],
      },
      {
        id: "sessions",
        title: "Sessions actives",
        fields: [
          { id: "user_auto_logout", label: "Déconnexion automatique (min)", type: "number", value: 30, defaultValue: 30, placeholder: "30", description: "Délai d'inactivité avant déconnexion automatique." },
          { id: "user_single_session", label: "Limiter à une session", type: "boolean", value: false, defaultValue: false, description: "Déconnecter les autres sessions à la connexion." },
        ],
      },
    ],
  },
  {
    id: "preferences",
    label: "Préférences",
    icon: Palette,
    sections: [
      {
        id: "display",
        title: "Affichage",
        description: "Personnalisez l'apparence de votre interface.",
        fields: [
          {
            id: "user_theme", label: "Thème", type: "select", value: "system", defaultValue: "system", options: [
              { label: "Clair", value: "light" },
              { label: "Sombre", value: "dark" },
              { label: "Système", value: "system" },
            ]
          },
          {
            id: "user_language", label: "Langue", type: "select", value: "fr", defaultValue: "fr", options: [
              { label: "Français", value: "fr" },
              { label: "English", value: "en" },
              { label: "Español", value: "es" },
            ]
          },
        ],
      },
      {
        id: "regional",
        title: "Paramètres régionaux",
        fields: [
          {
            id: "user_date_format", label: "Format de date", type: "select", value: "dd/MM/yyyy", defaultValue: "dd/MM/yyyy", options: [
              { label: "JJ/MM/AAAA", value: "dd/MM/yyyy" },
              { label: "MM/JJ/AAAA", value: "MM/dd/yyyy" },
              { label: "AAAA-MM-JJ", value: "yyyy-MM-dd" },
            ]
          },
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
        id: "email-notifs",
        title: "Notifications par email",
        description: "Choisissez quelles notifications recevoir par email.",
        fields: [
          { id: "user_notif_invoices", label: "Factures", type: "boolean", value: true, defaultValue: true, description: "Recevoir un email à chaque nouvelle facture." },
          { id: "user_notif_payments", label: "Paiements", type: "boolean", value: true, defaultValue: true, description: "Être notifié des paiements reçus." },
          { id: "user_notif_reports", label: "Rapports hebdomadaires", type: "boolean", value: false, defaultValue: false, description: "Résumé des ventes chaque lundi." },
          { id: "user_notif_security", label: "Alertes de sécurité", type: "boolean", value: true, defaultValue: true, description: "Connexions suspectes, changements de mot de passe.", important: true },
        ],
      },
      {
        id: "push-notifs",
        title: "Notifications push",
        fields: [
          { id: "user_push_enabled", label: "Activer les notifications push", type: "boolean", value: false, defaultValue: false },
          { id: "user_push_sound", label: "Son de notification", type: "boolean", value: true, defaultValue: true },
        ],
      },
      {
        id: "digest",
        title: "Fréquence des résumés",
        fields: [
          {
            id: "user_digest_frequency", label: "Fréquence", type: "select", value: "weekly", defaultValue: "weekly", options: [
              { label: "Quotidien", value: "daily" },
              { label: "Hebdomadaire", value: "weekly" },
              { label: "Mensuel", value: "monthly" },
              { label: "Jamais", value: "never" },
            ]
          },
        ],
      },
    ],
  },
];
