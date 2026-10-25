[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$InstallerPath
)
$ErrorActionPreference = "Stop"
$installer = (Resolve-Path -LiteralPath $InstallerPath).Path
if ([IO.Path]::GetExtension($installer) -ine ".exe") {
  throw "Choose the official JT Windows Setup .exe. Repair by reinstalling is supported for Windows setup packages."
}
Write-Host "JT Workspace Repair" -ForegroundColor Cyan
Write-Host "This runs the selected official installer to repair/update the app files."
Write-Host "It does not intentionally erase local workspace/browser data. Back up important files first."
$confirm = Read-Host "Continue with $installer ? Type YES"
if ($confirm -cne "YES") { Write-Host "Cancelled."; exit 0 }
$process = Start-Process -FilePath $installer -ArgumentList @("/S") -Wait -PassThru
if ($process.ExitCode -ne 0) {
  Write-Error "Installer returned exit code $($process.ExitCode). Run the installer manually to view its UI and error messages."
}
Write-Host "Repair installer process finished. Open the app and verify its features." -ForegroundColor Green
