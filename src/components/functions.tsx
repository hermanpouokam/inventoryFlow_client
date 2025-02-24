export default function getFormData(form: any) {
    const formData = new FormData(form)
    //@ts-ignore
    const values = [...formData.values()]
    const isEmpty = values.includes('')
    const data = Object.fromEntries(formData)
    return { isEmpty, data }
}

function isMinLength(password: string | any[]) {
    return password.length >= 8;
}

function hasUppercase(password: string) {
    return /[A-Z]/.test(password);
}

function hasDigit(password: string) {
    return /\d/.test(password);
}

export function validatePassword(password: string) {
    const minLength = isMinLength(password);
    const uppercase = hasUppercase(password);
    const digit = hasDigit(password);

    return {
        minLength,
        uppercase,
        digit,
        isValid: minLength && uppercase && digit
    };
}

