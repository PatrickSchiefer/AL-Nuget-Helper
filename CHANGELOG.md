# AL Nuget Helper Changelog 

## 0.3.2
- fix issue when apps have '-' in there name

## 0.3.1
- fix windows binaries

## 0.3.0
- fix timing problem when downloading packages
- full linux support (including codespaces)

## 0.2.6
- Add support for UTF8 with BOM
- fix issue with normalizing appnames when they include ":" fixed

## 0.2.5
- Add Linux support
- Add button to reload window after download finished, to reload symbol cache

## 0.2.4
- Ignore apps which are part of the workspace
- Normalize app and publisher name

## 0.2.3
- Add new workspace setting
    - Country Code 
    - Overwrite paket.dependencies
- Add new global setting
    - Custom paket executable path
- Add log to VS Code Output Channel
- Added Documentation to readme
- include paket.exe in extension instead of downloading it
- added error handling 
- Action for "Create GitHub Issue" on errors

## 0.2.2
- iterate through workspaces
- create .alpackages if not exist

## 0.2.1
- Update Readme.md

## 0.2.0
- use paket client instead of nuget cli
- download system symbols
- download application symbols
- download plattform symbols
- added description
- added video to readme

## 0.1.0
- Initial release