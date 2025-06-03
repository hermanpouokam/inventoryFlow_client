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
export { capitalizeFirstLetter, capitalizeWords }