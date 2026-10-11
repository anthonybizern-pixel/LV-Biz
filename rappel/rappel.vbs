' English Coach : lance la notification sans ouvrir de fenetre de console.
Dim dossier
dossier = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
CreateObject("WScript.Shell").Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & dossier & "\rappel.ps1""", 0, False
