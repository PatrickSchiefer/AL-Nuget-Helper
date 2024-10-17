export function NormalizeText(text: string): string {
    var InvalidCharsRegey = new RegExp('[^a-zA-Z0-9_\-]');
    return text.replace(InvalidCharsRegey, '');
}