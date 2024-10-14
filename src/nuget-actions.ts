import * as vscode from 'vscode';
import * as path from 'path';
import fs = require('fs');
import * as os from 'os';
import * as ChildProcess from 'child_process';
import { options } from 'axios';

let MSSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/MSSymbols/nuget/v3/index.json";
let AppSourceSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/AppSourceSymbols/nuget/v3/index.json";
let ApplicationSymbol = "Microsoft.Application.symbols";
let PlattformSymbol = "Microsoft.Platform.symbols";
let SystemSymbol = "Microsoft.SystemApplication.symbols.63ca2fa4-4f03-4f2b-a480-172fef340d3f";

export function NugetRestoreAction() {
    DownloadPaketIfNotExists();
    if (vscode.workspace.workspaceFolders !== undefined) {
        let appjsonpath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'app.json');
        if (fs.existsSync(appjsonpath)) {
            fs.readFile(appjsonpath, async (err, data) => {
                
                if (vscode.workspace.workspaceFolders !== undefined) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    var outputDirectory = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.alpackages');   
                    var paketDependencies = path.join(outputDirectory, 'paket.dependencies');
                    var appJsonRaw = data.toString();
                    console.log(appJsonRaw);
                    if (fs.existsSync(paketDependencies)) {
                        fs.rmSync(paketDependencies);
                    }
                    fs.writeFileSync(paketDependencies, 'strategy: min\r\n', { flag: 'w' });
                    fs.writeFileSync(paketDependencies, 'lowest_matching: true\r\n', {flag: 'a'});
                    fs.writeFileSync(paketDependencies, `source ${MSSymbols}\r\n`, { flag: 'a' });
                    fs.writeFileSync(paketDependencies, `source ${AppSourceSymbols}\r\n`, { flag: 'a' });
                    
                    let appJson = JSON.parse(appJsonRaw);
                    if (appJson.application)
                    {
                        fs.writeFileSync(paketDependencies, `nuget ${ApplicationSymbol} >= ${appJson.application}\r\n`, { flag: 'a' });
                    }
                    if (appJson.platform)
                    {
                        fs.writeFileSync(paketDependencies, `nuget ${PlattformSymbol} >= ${appJson.platform}\r\n`, { flag: 'a' });
                        fs.writeFileSync(paketDependencies, `nuget ${SystemSymbol} >= ${appJson.platform}\r\n`, { flag: 'a' });
                    }
                    if (appJson.dependencies.length > 0) {
                        for (let dep of appJson.dependencies) {
                            console.log(dep.name + ' ' + dep.version);
                            var packageName =`${dep.publisher}.${dep.name}.symbols.${dep.id}`;
                            packageName = packageName.replaceAll(' ', ''); 
                            if (vscode.workspace.workspaceFolders !== undefined) {
                                fs.writeFileSync(paketDependencies, `nuget ${packageName} >= ${dep.version}\r\n`, { flag: 'a' });
                                console.log(dep.name);
                            }
                        }
                    }
                    var result = ChildProcess.execSync(`${GetPaketPath()} install `, { cwd: outputDirectory });
                    console.log(result.toString());
                }
            });
        }
    }
}

export function DownloadPaketIfNotExists() {
    if (vscode.workspace.workspaceFolders !== undefined) {
        if (!fs.existsSync(GetPaketPath())) {
            // Download nuget.exe
            let file = fs.createWriteStream(GetPaketPath());
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

export function GetPaketPath() {
    if (vscode.workspace.workspaceFolders !== undefined) {
        return path.join(`${os.tmpdir()}${path.sep}`, 'paket.exe');
    }
    return '';
}