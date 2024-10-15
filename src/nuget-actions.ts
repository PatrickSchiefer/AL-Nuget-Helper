import * as vscode from 'vscode';
import * as path from 'path';
import fs = require('fs');
import * as ChildProcess from 'child_process';
import { Settings } from './settings';

let MSSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/MSSymbols/nuget/v3/index.json";
let AppSourceSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/AppSourceSymbols/nuget/v3/index.json";
let logOutputChannel = vscode.window.createOutputChannel('Nuget Restore');

export function NugetRestoreAction() {
    DownloadPaketIfNotExists();
    if (vscode.workspace.workspaceFolders !== undefined) {
        for (let folder of vscode.workspace.workspaceFolders) {
            ProcessWorkspaceFolder(folder);
        }
    }

    function ProcessWorkspaceFolder(workspaceFolder: vscode.WorkspaceFolder) {
        var workingDirectory = workspaceFolder.uri.fsPath; 
        let appjsonpath = path.join(workingDirectory, 'app.json');
        if (fs.existsSync(appjsonpath)) {
            fs.readFile(appjsonpath, async (err, data) => {
                    if (err) {
                        console.log(err);
                        logOutputChannel.appendLine(err.toString());
                        return;
                    }
                    var outputDirectory = path.join(workingDirectory, '.alpackages');
                    var paketDependencies = path.join(outputDirectory, 'paket.dependencies');
                    var appJsonRaw = data.toString();
                    if (!fs.existsSync(paketDependencies) || Settings.GetoverwritePaketDependencies(workspaceFolder)) {
                        WritePaketDependencies(outputDirectory, appJsonRaw, paketDependencies, workspaceFolder);
                    }
                    var result = ChildProcess.execSync(`${Settings.GetPaketPath()} install `, { cwd: outputDirectory });
                    console.log(result.toString());
                    logOutputChannel.appendLine(result.toString());
                    logOutputChannel.show();
                }
            );
        }
    }
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
            var packageName = `${dep.publisher}.${dep.name}.symbols.${dep.id}`;
            packageName = packageName.replaceAll(' ', '');
            if (vscode.workspace.workspaceFolders !== undefined) {
                fs.writeFileSync(paketDependencies, `nuget ${packageName} >= ${dep.version}\r\n`, { flag: 'a' });
                console.log(dep.name);
            }
        }
    }
}

export function DownloadPaketIfNotExists() {
    if (Settings.GetCustomPaketExecutablePath().length > 0) {
        return;
    }
    if (vscode.workspace.workspaceFolders !== undefined) {
        if (!fs.existsSync(Settings.GetPaketPath())) {
            // Download nuget.exe
            let file = fs.createWriteStream(Settings.GetPaketPath());
            let url = 'https://github.com/fsprojects/Paket/releases/download/8.0.3/paket.exe';
            let axios = require('axios');
            axios({
                method: 'get',
                url: url,
                responseType: 'stream'
            }).then((response: any) => {
                response.data.pipe(file);
            });
        }
    }
}


export function CreateFolderIfNotExists(folderPath: string) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}