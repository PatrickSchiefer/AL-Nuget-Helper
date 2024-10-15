import path from 'path';
import * as os from 'os';
import fs = require('fs');
import * as vscode from 'vscode';

export class Settings {
   static CountryCode(workspaceFolder : vscode.WorkspaceFolder): string {
      return vscode.workspace.getConfiguration('al-nuget-helper', workspaceFolder).get('countryCode') || '';
   }
   static GetCountryString(workspaceFolder : vscode.WorkspaceFolder): string {
      return Settings.CountryCode(workspaceFolder).length === 0 ? "" : "." + Settings.CountryCode(workspaceFolder);
   }

   static GetApplicationSymbol(workspaceFolder : vscode.WorkspaceFolder): string {
      return `Microsoft.Application${Settings.GetCountryString(workspaceFolder)}.symbols`;
   }

   static GetPlatformSymbol(): string {
      return `Microsoft.Platform.symbols`;
   }
   
   static GetSystemSymbol(workspaceFolder : vscode.WorkspaceFolder): string {
      return `Microsoft.SystemApplication${Settings.GetCountryString(workspaceFolder)}.symbols.63ca2fa4-4f03-4f2b-a480-172fef340d3f`;
   }

   static GetoverwritePaketDependencies(workspaceFolder : vscode.WorkspaceFolder): boolean {
      return vscode.workspace.getConfiguration('al-nuget-helper', workspaceFolder).get('overwritePaketDependencies', true);
   }

   static GetCustomPaketExecutablePath(): string {
      return vscode.workspace.getConfiguration('al-nuget-helper').get('customPaketExecutablePath') || '';
   }

   static GetPaketPath() : string {
      if (this.GetCustomPaketExecutablePath().length > 0) {
         return this.GetCustomPaketExecutablePath();
      }
      var execPath = path.join(`${os.tmpdir()}${path.sep}`, 'AL-Nuget-Helper');
      if (!fs.existsSync(execPath)) {
         fs.mkdirSync(execPath);
      }
      return path.join(execPath, 'paket.exe');

  }
}