export function NormalizeText(text: string): string {
    var InvalidCharsRegex = new RegExp('[^a-zA-Z0-9_\-]');
    return text.replace(InvalidCharsRegex, '');
}