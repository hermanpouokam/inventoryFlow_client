import { instance } from "@/components/fetch";
import { useState, useEffect } from "react";




export function useEnterpriseSettings() {
    const [values, setValues] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);

    const formatFlatValues = (data: any) => {
        const flatValues: Record<string, any> = {};

        // Enterprise fields
        flatValues["store_name"] = data.name;
        flatValues["store_email"] = data.email;
        const country = data.country || "CI";
        flatValues["country"] = country;
        // Combine country + phone dans le format attendu par le PhoneField
        flatValues["store_phone"] = data.phone
            ? `${country}|${data.phone}`
            : `${country}|`;
        flatValues["store_address"] = data.address;
        flatValues["currency"] = data.currency;
        flatValues["country"] = data.country;
        flatValues["store_nc"] = data.nc;
        flatValues["store_description"] = data.description;

        // Settings fields
        Object.entries(data.settings || {}).forEach(([key, value]) => {
            flatValues[key] = value;
        });

        return flatValues
    }

    const formatValues = (values: any) => {
        const enterprisePayload: any = {};
        const settingsPayload: any = {};

        Object.entries(values).forEach(([key, value]) => {
            switch (key) {
                case "store_name":
                    enterprisePayload["name"] = value;
                    break;

                case "store_email":
                    enterprisePayload["email"] = value;
                    break;

                case "store_phone":
                    const phoneParts = typeof value === "string" ? value.split("|") : [];
                    enterprisePayload["phone"] = phoneParts[1] || null;
                    break;

                case "store_address":
                    enterprisePayload["address"] = value;
                    break;
                case "store_nc":
                    enterprisePayload["nc"] = value;
                    break
                case "store_description":
                    enterprisePayload["description"] = value;
                    break;
                case "currency":
                case "country":
                    enterprisePayload[key] = value;
                    break;
                default:
                    settingsPayload[key] = value;
            }
        });
        return { enterprisePayload, settingsPayload }
    }


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await instance.get('/settings/', { withCredentials: true })

                if (!res) throw new Error("Impossible de charger les paramètres");

                const data = res.data;

                // Transforme backend => flat values
                const flatValues = formatFlatValues(data)
                setValues(flatValues);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return { values, setValues, loading, formatValues, formatFlatValues };
}