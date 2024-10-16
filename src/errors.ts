export class PlattformUnsupportedError extends Error {
    override name: "PlattformUnsupportedError" = "PlattformUnsupportedError";
    constructor(msg?: string) {
        super(msg);
    }
}