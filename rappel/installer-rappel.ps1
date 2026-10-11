# English Coach : installe (ou met à jour) le rappel quotidien dans le Planificateur de tâches Windows.

$ErrorActionPreference = 'Stop'
$taskName = 'English Coach - rappel'
$vbs = Join-Path $PSScriptRoot 'rappel.vbs'

Write-Host ''
Write-Host '  English Coach : rappel quotidien' -ForegroundColor Green
Write-Host '  --------------------------------'
$h = Read-Host '  À quelle heure veux-tu ton rappel ? (ex. 19:00 ; Entrée = 19:00)'
if (-not $h) { $h = '19:00' }
$h = $h.Trim().ToLower() -replace '[h\.]', ':'
if ($h -match '^\d{1,2}:?$') { $h = $h.TrimEnd(':') + ':00' }

if ($h -notmatch '^([01]?\d|2[0-3]):([0-5]\d)$') {
  Write-Host "  Heure invalide : « $h ». Relance l'installeur et tape par exemple 19:00." -ForegroundColor Red
  Read-Host '  Appuie sur Entrée pour fermer'
  exit 1
}
$time = '{0:D2}:{1}' -f [int]$Matches[1], $Matches[2]

try {
  $action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbs`""
  $trigger = New-ScheduledTaskTrigger -Daily -At ([datetime]::ParseExact($time, 'HH:mm', $null))
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
  $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal `
    -Description "Rappel quotidien pour ta leçon d'anglais (English Coach)." -Force | Out-Null
} catch {
  # Repli avec l'outil classique schtasks
  schtasks.exe /Create /F /SC DAILY /ST $time /TN $taskName /TR "wscript.exe \`"$vbs\`"" | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  Impossible de créer le rappel : $($_.Exception.Message)" -ForegroundColor Red
    Read-Host '  Appuie sur Entrée pour fermer'
    exit 1
  }
}

Write-Host ''
Write-Host "  C'est fait ! Tu recevras un rappel chaque jour à $time." -ForegroundColor Green
Write-Host '  (Si l''ordinateur est éteint à cette heure-là, le rappel arrivera au démarrage.)'
Write-Host ''
$t = Read-Host '  Veux-tu voir un exemple de notification maintenant ? (o/n)'
if ($t -match '^[oOyY]') { Start-Process wscript.exe -ArgumentList "`"$vbs`"" }
Read-Host '  Appuie sur Entrée pour fermer'
