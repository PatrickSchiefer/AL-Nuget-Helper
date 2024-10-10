import * as vscode from 'vscode';
import { NugetRestoreAction } from './nuget-actions';

export function activate(context: vscode.ExtensionContext) {


	const disposable = vscode.commands.registerCommand('al-nuget-helper.restore', NugetRestoreAction);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
