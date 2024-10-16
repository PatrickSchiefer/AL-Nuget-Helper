# AL Nuget Helper

This is an extension for VSCode which provide a restore command for NuGet in AL Projects

# Available Commands
- AL Nuget Helper: restore

![Screenshot of the command](https://raw.githubusercontent.com/PatrickSchiefer/AL-Nuget-Helper/refs/heads/main/media/RestoreCommand.png)

Run command AL Nuget Helper, it will parse your app.json and download all dependencies, using the official Microsoft feeds


![Video demonstrating the use of AL Nuget Helper](https://raw.githubusercontent.com/PatrickSchiefer/AL-Nuget-Helper/refs/heads/main/media/downloadSymbols.gif)


# Available Settings

|Setting|Supported Scope|Default value|Description|
|---|---|---|---|
|al-nuget-helper.countryCode|User,Workspace,Folder||Defines the country version of the packages which is downloaded.<br>This only applies for localized 1st party apps from microsoft|
|al-nuget-helper.overwritePaketDependencies|User,Workspace,Folder|true|If false the paket.dependencies file will not be modified automatically anymore,<br> if the file does not exist, it will be created anyway|
|al-nuget-helper.customPaketExecutablePath|User||Here you can define your own executable instead of the paket.exe provided by the extension.<br>You can use every command which accepts install as first parameter

# Created structure in AL packages folder
The structure in the .alpackages folder is a little bit different then you might expect. The tools is creating some status files and a paket.dependencies file which holds the information about what NuGet packages will be restored.
Also instead of only the *.app file, the whole nuget package is downloaded which means that there will be subfolders

![example image of how the folder structure looks](https://raw.githubusercontent.com/PatrickSchiefer/AL-Nuget-Helper/refs/heads/main/media/folderStructure.png)