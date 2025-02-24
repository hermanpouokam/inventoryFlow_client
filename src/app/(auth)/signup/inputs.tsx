
export const inputs = [
    {
        name: 'name',
        label: 'Nom',
    },
    {
        name: 'surname',
        label: 'Prenom',
    },
    {
        name: 'username',
        label: "Nom d'utilisateur",
    },
    {
        name: 'email',
        label: 'Adresse Email',
    },
    {
        name: 'number',
        label: 'Téléphone',
    },
    {
        name: 'password',
        label: 'Mot de passe',
    },
    {
        name: 'confirmPassword',
        label: 'Confirmer le mot de passe',
    },
]

export const passwordTest = {
    minLength: "Le mot de passe doit contenir 8 caractères",
    uppercase: "Le mot de passe doit contenir un lettre majuscule",
    digit: "Le mot de passe doit contenir moins un chiffre",
}