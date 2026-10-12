$projectDir = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectDir ".marketarc-orchestrator"
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
$stdoutPath = Join-Path $runtimeDir "orchestrator.stdout.log"
$stderrPath = Join-Path $runtimeDir "orchestrator.stderr.log"

$process = Start-Process -FilePath "node" `
  -ArgumentList @("scripts/marketarc-orchestrator.mjs") `
  -WorkingDirectory $projectDir `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutPath `
  -RedirectStandardError $stderrPath `
  -PassThru

Write-Output "MARKETARC_ORCHESTRATOR_STARTED pid=$($process.Id)"
