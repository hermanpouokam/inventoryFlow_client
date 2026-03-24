export type Country = {
    code: string
    name: string
    flag: string
    dialCode: string
}

export const countries: Country[] = [
    { code: "CM", name: "Cameroon", flag: "🇨🇲", dialCode: "+237" },
    { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
    { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
    { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
    { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234" },
    { code: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233" },
    // 👉 en prod tu mets la liste complète (je peux te la générer)
]