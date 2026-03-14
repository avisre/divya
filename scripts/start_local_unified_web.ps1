param(
  [int]$Port = 3100,
  [string]$NodeEnv = "production",
  [switch]$BuildFirst
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$webDir = Join-Path $repoRoot "web"
$logPath = Join-Path $webDir ("web-local-{0}.log" -f $Port)

$env:MONGODB_URI = "mongodb+srv://project:project@cluster0.kos1k7l.mongodb.net/GOD1"
$env:JWT_SECRET = "minimum-32-character-secret-key-2026"
$env:JWT_EXPIRE = "30d"
$env:NODE_ENV = $NodeEnv
$env:PORT = "$Port"
$env:NEXT_PUBLIC_SITE_URL = "http://localhost:$Port"
$env:NEXT_PUBLIC_BACKEND_ORIGIN = "http://localhost:$Port"
$env:BACKEND_API_BASE_URL = "http://localhost:$Port/api"
$env:PUBLIC_API_BASE_URL = "http://localhost:$Port"
$env:WEB_APP_URL = "http://localhost:$Port"
$env:CORS_ORIGINS = "http://localhost:$Port"
$env:TRUST_PROXY = "false"

if (Test-Path $logPath) {
  Remove-Item $logPath -Force
}

if ($BuildFirst) {
  Push-Location $webDir
  try {
    npm run build | Out-Null
  } finally {
    Pop-Location
  }
}

$child = Start-Process cmd.exe `
  -ArgumentList @("/d", "/s", "/c", "node server.mjs >> `"$logPath`" 2>&1") `
  -WorkingDirectory $webDir `
  -WindowStyle Hidden `
  -PassThru

Start-Sleep -Seconds 12

$root = Invoke-WebRequest -Uri ("http://localhost:{0}/" -f $Port) -UseBasicParsing -TimeoutSec 10
$health = Invoke-WebRequest -Uri ("http://localhost:{0}/health/ready" -f $Port) -UseBasicParsing -TimeoutSec 10

[PSCustomObject]@{
  pid = $child.Id
  port = $Port
  root = $root.StatusCode
  health = $health.StatusCode
  log = $logPath
} | ConvertTo-Json -Compress
