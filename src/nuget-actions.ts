import * as vscode from 'vscode';
import * as path from 'path';
import fs = require('fs');
import * as ChildProcess from 'child_process';
import { Settings } from './settings';
import * as output from './output';
import { NormalizeText } from './helper';

let MSSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/MSSymbols/nuget/v3/index.json";
let AppSourceSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/AppSourceSymbols/nuget/v3/index.json";


export function NugetRestoreAction() {
    try {
        output.clearOutput();
        if (vscode.workspace.workspaceFolders !== undefined) {
            for (let folder of vscode.workspace.workspaceFolders) {
                ProcessWorkspaceFolder(folder);
            }
        }
    } catch (error: any) {
        showErrorMessage(error.message);
    }
}


function ProcessWorkspaceFolder(workspaceFolder: vscode.WorkspaceFolder) {
    try {
        var workingDirectory = workspaceFolder.uri.fsPath;
        let appjsonpath = path.join(workingDirectory, 'app.json');
        let paketPath = Settings.GetPaketPath();
        if (fs.existsSync(appjsonpath)) {
            fs.readFile(appjsonpath, async (err, data) => {
                try {
                    if (err) {
                        console.log(err);
                        output.log(err.toString());
                        return;
                    }
                    var outputDirectory = path.join(workingDirectory, '.alpackages');
                    var paketDependencies = path.join(outputDirectory, 'paket.dependencies');
                    var appJsonRaw = data.toString();
                    if (!fs.existsSync(paketDependencies) || Settings.GetOverwritePaketDependencies(workspaceFolder)) {
                        WritePaketDependencies(outputDirectory, appJsonRaw, paketDependencies, workspaceFolder);
                    }
                    var result = ChildProcess.execSync(`${paketPath} install `, { cwd: outputDirectory });
                    console.log(result.toString());
                    output.log(result.toString());

                } catch (error: any) {
                    console.log(error);
                    output.log(`Error in workspace folder ${workspaceFolder.name}`);
                    output.log(error.toString());
                    showErrorMessage(error.message);
                }
            });
        }
    } catch (error: any) {
        console.log(error);
        output.log(`Error in workspace folder ${workspaceFolder.name}`);
        output.log(error.toString());
        throw error;
    }
}
function showErrorMessage(message: string) {
    vscode.window.showErrorMessage(message,
        'Create GitHub issue').then((action) => {
            if (action === 'Create GitHub issue') {
                vscode.env.openExternal(vscode.Uri.parse(`https://github.com/PatrickSchiefer/AL-Nuget-Helper/issues/new?body=${message}`));
            }
        });
}

function WritePaketDependencies(outputDirectory: string, appJsonRaw: string, paketDependencies: string, workspaceFolder: vscode.WorkspaceFolder) {
    CreateFolderIfNotExists(outputDirectory);

    console.log(appJsonRaw);
    if (fs.existsSync(paketDependencies)) {
        fs.rmSync(paketDependencies);
    }
    fs.writeFileSync(paketDependencies, 'strategy: min\r\n', { flag: 'w' });
    fs.writeFileSync(paketDependencies, 'lowest_matching: true\r\n', { flag: 'a' });
    fs.writeFileSync(paketDependencies, `source ${MSSymbols}\r\n`, { flag: 'a' });
    fs.writeFileSync(paketDependencies, `source ${AppSourceSymbols}\r\n`, { flag: 'a' });

    let ApplicationSymbol = Settings.GetApplicationSymbol(workspaceFolder);
    let PlattformSymbol = Settings.GetPlatformSymbol();
    let SystemSymbol = Settings.GetSystemSymbol(workspaceFolder);
    let appJson = JSON.parse(appJsonRaw);
    if (appJson.application) {
        fs.writeFileSync(paketDependencies, `nuget ${ApplicationSymbol} >= ${appJson.application}\r\n`, { flag: 'a' });
    }
    if (appJson.platform) {
        fs.writeFileSync(paketDependencies, `nuget ${PlattformSymbol} >= ${appJson.platform}\r\n`, { flag: 'a' });
        fs.writeFileSync(paketDependencies, `nuget ${SystemSymbol} >= ${appJson.platform}\r\n`, { flag: 'a' });
    }
    if (appJson.dependencies.length > 0) {
        for (let dep of appJson.dependencies) {
            console.log(dep.name + ' ' + dep.version);
            var packageName = `${NormalizeText(dep.publisher)}.${NormalizeText(dep.name)}.symbols.${dep.id}`;
            packageName = packageName.replaceAll(' ', '');
            if (!AppExistsInWorkspaces(dep.id)) {
                fs.writeFileSync(paketDependencies, `nuget ${packageName} >= ${dep.version}\r\n`, { flag: 'a' });
                console.log(dep.name);
            }
        }
    }
}

export function AppExistsInWorkspaces(appID: string): boolean {
    try {
        if (vscode.workspace.workspaceFolders !== undefined) {
            for (let folder of vscode.workspace.workspaceFolders) {
                var workingDirectory = folder.uri.fsPath;
                let appjsonpath = path.join(workingDirectory, 'app.json');
                if (fs.existsSync(appjsonpath)) {
                    var data = fs.readFileSync(appjsonpath);
                    var appJsonRaw = data.toString();
                    let appJson = JSON.parse(appJsonRaw);
                    if (appJson.id === appID) {
                        return true;
                    }
                }
            }
        }
    } catch (error: any) {
        console.log(error);
        output.log(error.toString());
        showErrorMessage(error.message);
    }
    return false;
}

export function CreateFolderIfNotExists(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}