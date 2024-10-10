import * as vscode from 'vscode';
import * as path from 'path';
import fs = require('fs');
import * as os from 'os';
import * as ChildProcess from 'child_process';

let MSSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/MSSymbols/nuget/v3/index.json";
let AppSourceSymbols = "https://dynamicssmb2.pkgs.visualstudio.com/DynamicsBCPublicFeeds/_packaging/AppSourceSymbols/nuget/v3/index.json";

export function NugetRestoreAction() {
    DownloadNugetIfNotExists();
    if (vscode.workspace.workspaceFolders !== undefined) {
        let appjsonpath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, 'app.json');
        if (fs.existsSync(appjsonpath)) {
            fs.readFile(appjsonpath, async (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }

                console.log(data);
                
                let appJson = JSON.parse(data.toString());
                if (appJson.dependencies.length > 0) {

                    
                    appJson.dependencies.forEach((dep: any) => {
                        console.log(dep.name + ' ' + dep.version);
                        var packageName =`${dep.publisher}.${dep.name}.symbols.${dep.id}`;
                        packageName = packageName.replaceAll(' ', ''); 
                        if (vscode.workspace.workspaceFolders !== undefined) {
                            var outputDirectory = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.alpackages');   
                            var result = ChildProcess.execSync(`${GetNugetPath()} install "${packageName}" -Version ${dep.version} -OutputDirectory ${outputDirectory} -source ${AppSourceSymbols} -FallbackSource ${MSSymbols}`);
                            console.log(result.toString());
                        }
                    });
                }
            });
        }
    }
}

export function DownloadNugetIfNotExists() {
    if (vscode.workspace.workspaceFolders !== undefined) {
        if (!fs.existsSync(GetNugetPath())) {
            // Download nuget.exe
            let file = fs.createWriteStream(GetNugetPath());
            let url = 'https://dist.nuget.org/win-x86-commandline/latest/nuget.exe';
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

export function GetNugetPath() {
    if (vscode.workspace.workspaceFolders !== undefined) {
        return path.join(`${os.tmpdir()}${path.sep}`, 'nuget.exe');
    }
    return '';
}