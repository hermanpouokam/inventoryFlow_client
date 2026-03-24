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
        user_firstname: user.name,
        user_lastname: user.surname,
        user_email: user.email,
        user_phone: user.number,
        user_avatar: user.img,

        user_theme: user.user_configurations_details?.theme,
        user_language: user.user_configurations_details?.language,
        user_date_format: user.user_configurations_details?.date_format,

        user_notif_invoices: user.user_configurations_details?.notif_invoices,
        user_notif_payments: user.user_configurations_details?.notif_payments,
        user_notif_reports: user.user_configurations_details?.notif_reports,
        user_notif_security: user.user_configurations_details?.notif_security,
        user_push_enabled: user.user_configurations_details?.push_enabled,
        user_push_sound: user.user_configurations_details?.push_sound,
        user_digest_frequency: user.user_configurations_details?.digest_frequency,

        user_2fa_enabled: user.user_configurations_details?.two_factor_enabled,
        user_2fa_method: user.user_configurations_details?.two_factor_method,
        user_auto_logout: user.user_configurations_details?.auto_logout,
        user_single_session: user.user_configurations_details?.single_session,
    };
}

export function useUserSettings() {
    const [values, setValues] = useState<Record<string, SettingValue>>(
        buildEmptyValues()
    );
    const [loading, setLoading] = useState(true);
    const { userMode, changeMode } = useThemeMode()

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await instance.get("/current-user/");
                const backendValues = mapBackendToSettings(res.data);

                setValues((prev) => ({
                    // ...prev,
                    ...backendValues,
                    user_theme: userMode
                }));
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
    }

    return {
        values,
        loading,
        updateValue,
    };
}