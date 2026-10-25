[CmdletBinding()]
param()
$ErrorActionPreference = "Stop"
$roots = @(
  "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
  "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
)
$products = @("JT AI Agent","JT AI Core","JT App Manager","JT Cloud","JT Code","JT Design","JT Motion","JT Studio","JT Stream")
$found = foreach ($root in $roots) {
  Get-ItemProperty $root -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName -and ($products -contains $_.DisplayName) -and $_.UninstallString } |
    Select-Object DisplayName, UninstallString, PSPath
}
$found = @($found | Sort-Object DisplayName -Unique)
if (-not $found.Count) {
  Write-Host "No supported JT workspace setup installation was found. Portable ZIP and macOS/Linux installs must be removed using their platform-specific instructions."
  exit 0
}
Write-Host "Installed JT workspaces:" -ForegroundColor Cyan
for ($i = 0; $i -lt $found.Count; $i++) { Write-Host "[$($i + 1)] $($found[$i].DisplayName)" }
$choice = Read-Host "Enter the number to uninstall, or press Enter to cancel"
if ([string]::IsNullOrWhiteSpace($choice)) { Write-Host "Cancelled."; exit 0 }
$index = 0
if (-not [int]::TryParse($choice, [ref]$index) -or $index -lt 1 -or $index -gt $found.Count) { throw "Invalid selection." }
$item = $found[$index - 1]
Write-Host "This removes $($item.DisplayName) application files. User data is not deliberately deleted by this helper." -ForegroundColor Yellow
$confirm = Read-Host "Type UNINSTALL to continue"
if ($confirm -cne "UNINSTALL") { Write-Host "Cancelled."; exit 0 }
$command = [string]$item.UninstallString
if ($command -match '^\s*"([^"]+\.exe)"\s*(.*)$') {
  $exe = $Matches[1]; $args = $Matches[2]
} elseif ($command -match '^\s*(\S+\.exe)\s*(.*)$') {
  $exe = $Matches[1]; $args = $Matches[2]
} else {
  throw "Could not safely parse the registered uninstaller. Open Windows Settings > Apps > Installed apps and uninstall it there."
}
if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) {
  throw "The registered uninstaller was not found. Use Windows Settings > Apps > Installed apps or rerun the official setup to repair the installation."
}
Start-Process -FilePath $exe -ArgumentList $args -Wait
Write-Host "Uninstaller finished. Check Windows Settings > Apps if the product remains listed." -ForegroundColor Green
