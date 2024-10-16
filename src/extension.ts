import * as vscode from 'vscode';
import { NugetRestoreAction } from './nuget-actions';
import { Settings } from './settings';

export function activate(context: vscode.ExtensionContext) {


	const disposable = vscode.commands.registerCommand('al-nuget-helper.restore', NugetRestoreAction);

	context.subscriptions.push(disposable);

	Settings.SetExtensionContext(context);
}

export function deactivate() {}
