import { useEffect, useState } from "react";
import { instance } from "@/components/fetch";
import { userSettingsConfig } from "@/lib/user-config";
import { useThemeMode } from "@/utils/theme-provider";

type SettingValue = string | number | boolean;

function buildEmptyValues() {
    const map: Record<string, SettingValue> = {};

    userSettingsConfig.forEach((cat) =>
        cat.sections.forEach((sec) =>
            sec.fields.forEach((f) => {
                map[f.id] = f.defaultValue;
            })
        )
    );

    return map;
}

function mapBackendToSettings(user: any) {
    return {
        // ===== USER =====
        user_firstname: user.name,
        user_lastname: user.surname,
        user_email: user.email,
        user_avatar: user.img,
        username: user.username,
        user_phone: `${user.country}|${user.number}`,

        // ===== CONFIG =====
        user_theme: user.user_configurations_details?.theme,
        user_language: user.user_configurations_details?.language,
        user_date_format: user.user_configurations_details?.date_format,
        user_email_verified: user.user_configurations_details?.email_verified ?? false,

        user_notif_invoices:
            user.user_configurations_details?.notif_invoices,

        user_notif_payments:
            user.user_configurations_details?.notif_payments,

        user_notif_reports:
            user.user_configurations_details?.notif_reports,

        user_notif_security:
            user.user_configurations_details?.notif_security,

        user_push_enabled:
            user.user_configurations_details?.push_enabled,

        user_push_sound:
            user.user_configurations_details?.push_sound,

        user_digest_frequency:
            user.user_configurations_details?.digest_frequency,

        user_2fa_enabled:
            user.user_configurations_details?.two_factor_enabled,

        user_2fa_method:
            user.user_configurations_details?.two_factor_method,

        user_auto_logout:
            user.user_configurations_details?.auto_logout,

        user_single_session:
            user.user_configurations_details?.single_session,
    };
}

function mapSettingsToBackend(values: Record<string, SettingValue>) {
    const [country, number] = typeof values.user_phone === "string"
        ? values.user_phone.split("|")
        : ["CI", ""];

    return {
        // ===== USER =====
        name: values.user_firstname,
        surname: values.user_lastname,
        email: values.user_email,
        img: values.user_avatar,
        country,
        number,
        // ===== CONFIG =====
        user_configurations: {
            theme: values.user_theme,
            language: values.user_language,
            date_format: values.user_date_format,

            notif_invoices: values.user_notif_invoices,
            notif_payments: values.user_notif_payments,
            notif_reports: values.user_notif_reports,
            notif_security: values.user_notif_security,

            push_enabled: values.user_push_enabled,
            push_sound: values.user_push_sound,

            digest_frequency: values.user_digest_frequency,

            two_factor_enabled: values.user_2fa_enabled,
            two_factor_method: values.user_2fa_method,

            auto_logout: values.user_auto_logout,
            single_session: values.user_single_session,
        },
    };
}

export function useUserSettings() {
    const [values, setValues] = useState<Record<string, SettingValue>>(
        buildEmptyValues()
    );

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { userMode, changeMode } = useThemeMode();

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await instance.get("/current-user/");

                const backendValues = mapBackendToSettings(res.data);

                setValues({
                    ...backendValues
                });
            } catch (err) {
                console.error("Erreur chargement settings", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    function updateValue(id: string, value: SettingValue) {
        setValues((prev) => ({
            ...prev,
            [id]: value,
        }));

        // changement thème live
        if (id === "user_theme") {
            changeMode(value as typeof userMode);
        }
    }

    async function saveSettings(data: any) {
        try {
            setSaving(true);

            const payload = mapSettingsToBackend(data);
            const res = await instance.patch(
                "/user/update-info/",
                payload
            );
            if (res.data?.pending_email) {
                return { pendingEmail: true };
            }
            if (res.data?.pending_email) {
                return { pendingEmail: true };
            }
        } catch (err) {
            const message = err?.response?.data?.error;
            throw new Error(message);
        } finally {
            setSaving(false);
        }
    }

    return {
        values,
        loading,
        saving,
        updateValue,
        saveSettings,
    };
}