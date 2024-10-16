import { window } from "vscode";

let logOutputChannel = window.createOutputChannel('Nuget Restore');

export function log(message: string) {
    logOutputChannel.appendLine(message);
    logOutputChannel.show(true);
}

export function clearOutput() {
    logOutputChannel.clear();
}