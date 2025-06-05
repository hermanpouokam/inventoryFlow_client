function capitalizeFirstLetter(word: string | null) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
}
function capitalizeWords(sentence: string | null) {
    return sentence
        ?.split(' ')
        .map(word => capitalizeFirstLetter(word))
        .join(' ');
}

function maskEmail(email: string) {
    if (!email.includes('@')) return email;

    const [local, domain] = email.split('@');

    let maskedLocal;
    if (local.length <= 4) {
        maskedLocal = local[0] + '*'.repeat(local.length - 1);
    } else {
        maskedLocal = local.slice(0, 4) + '*'.repeat(5);
    }

    return `${maskedLocal}@${domain}`;
}

function generateUUIDv4(length = 16): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const rand = Math.random() * 16 | 0;
        const value = char === 'x' ? rand : (rand & 0x3 | 0x8);
        return value.toString(length);
    });
}


export { capitalizeFirstLetter, capitalizeWords, maskEmail, generateUUIDv4 }