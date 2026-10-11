# LV Coach : notification quotidienne.
# Lancé chaque jour par le Planificateur de tâches (via rappel.vbs, sans fenêtre).
# Un clic sur la notification ouvre l'appli.

Add-Type -AssemblyName System.Windows.Forms, System.Drawing

$app = Join-Path (Split-Path -Parent $PSScriptRoot) 'index.html'
$messages = @(
  "Ta leçon du jour t'attend ! 5 minutes suffisent.",
  "Garde ta série 🔥 : une petite leçon et c'est bon !",
  "Practice makes perfect! Som-hi ! C'est l'heure de ta leçon.",
  "Quelques expressions à réviser t'attendent.",
  "Un mini-dialogue aujourd'hui ? Clique ici pour ouvrir l'appli.",
  "Ton objectif du jour n'attend que toi. Let's go!"
)
$msg = Get-Random -InputObject $messages

$icon = New-Object System.Windows.Forms.NotifyIcon
$icon.Icon = [System.Drawing.SystemIcons]::Information
$icon.Text = 'LV Coach'
$icon.Visible = $true

$script:open = $false
$icon.add_BalloonTipClicked({ $script:open = $true })
$icon.add_Click({ $script:open = $true })
$icon.ShowBalloonTip(15000, "LV Coach : c'est l'heure !", $msg, [System.Windows.Forms.ToolTipIcon]::Info)

# On attend un éventuel clic pendant 2 minutes
$deadline = (Get-Date).AddMinutes(2)
while (-not $script:open -and (Get-Date) -lt $deadline) {
  [System.Windows.Forms.Application]::DoEvents()
  Start-Sleep -Milliseconds 200
}
$icon.Visible = $false
$icon.Dispose()

if ($script:open -and (Test-Path $app)) { Start-Process $app }
