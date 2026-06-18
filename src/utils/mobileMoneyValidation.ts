// utils/mobileMoneyValidation.ts

export type MobileOperator = "mtn" | "orange";

// Préfixes par opérateur → pays (longueur gérée par libphonenumber-js via PhoneInput)
const PREFIXES: Record<MobileOperator, Record<string, string[]>> = {
    mtn: {
        CM: ["67", "68", "650", "651", "652", "653"],
        CI: ["05", "45", "25"],
        GH: ["024", "054", "055", "059"],
        SN: ["76", "77", "78"],
        BJ: ["96", "97"],
        RW: ["078", "079"],
        UG: ["077", "078"],
        GN: ["062", "063", "064"],
        CG: ["06"],
        LR: ["077", "088"],
        SS: ["091", "092"],
        ZM: ["096", "076"],
        SZ: ["76", "78"],
    },
    orange: {
        CM: ["69", "655", "656", "657"],
        CI: ["07", "47", "27"],
        SN: ["77", "78"],
        ML: ["70", "72", "73", "74", "75"],
        BF: ["70", "71", "72", "73", "74", "75"],
        GN: ["622", "623", "624"],
        MG: ["032", "033"],
        MA: ["061", "062", "063"],
        TN: ["50", "52", "53", "54"],
        NE: ["90", "91", "92", "93", "94", "95", "96"],
        LR: ["055"],
        SL: ["076", "078"],
        CF: ["75", "77"],
        CD: ["084", "085", "086"],
        GW: ["955", "956"],
        EG: ["0100", "0109"],
        JO: ["077", "078"],
        BW: ["73", "74", "75"],
    },
};

export interface PhoneValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Vérifie que le numéro national appartient bien à l'opérateur sélectionné.
 * La validation de longueur/format est déjà faite par PhoneInput (libphonenumber-js).
 */
export function validateOperatorPrefix(
    operator: MobileOperator,
    countryCode: string,
    nationalNumber: string, // chiffres uniquement, sans indicatif
    t: (key: string) => string
): PhoneValidationResult {
    const prefixes = PREFIXES[operator]?.[countryCode];

    // Pas de règle pour ce pays → on laisse passer
    if (!prefixes) return { valid: true };

    const hasValidPrefix = prefixes.some((p) => nationalNumber.startsWith(p));
    if (!hasValidPrefix) {
        return {
            valid: false,
            error: t("payment_method_modal.error_phone_prefix"),
        };
    }

    return { valid: true };
}

// Codes pays disponibles par opérateur (pour filtrer le PhoneInput)
export const MTN_COUNTRY_CODES = [
    "BJ", "CM", "CG", "CI", "SZ", "GH", "GN", "LR", "RW", "SS", "UG", "ZM",
] as const;

export const ORANGE_COUNTRY_CODES = [
    "BW", "BF", "CM", "CF", "CI", "CD", "EG", "GN", "GW", "JO",
    "LR", "MG", "ML", "MA", "NE", "SN", "SL", "TN",
] as const;
