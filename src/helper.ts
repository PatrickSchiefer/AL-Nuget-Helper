export function NormalizeText(text: string): string {
    var InvalidCharsRegex = new RegExp("[^a-zA-Z0-9_-]", "g");
    return text.replaceAll(InvalidCharsRegex, '');
}

export function RemoveBOM(text: string): string {
    if (text.charCodeAt(0) === 0xFEFF) {
        return text.slice(1);
    }
    return text;
}