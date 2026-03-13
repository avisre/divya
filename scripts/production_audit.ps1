param(
    [string]$ReportPath = "docs/PRODUCTION_AUDIT_LATEST.md"
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Name,
        [string]$Workdir,
        [string]$Command,
        [int]$Weight = 1
    )

    Write-Host "==> $Name"
    Push-Location $Workdir
    try {
        & powershell -NoProfile -Command $Command | Out-Host
        Pop-Location
        return [pscustomobject]@{
            name = $Name
            passed = $true
            weight = $Weight
            command = $Command
            workdir = $Workdir
        }
    } catch {
        Pop-Location
        return [pscustomobject]@{
            name = $Name
            passed = $false
            weight = $Weight
            command = $Command
            workdir = $Workdir
            error = $_.Exception.Message
        }
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$gradle = ".\.tools\gradle-8.7\bin\gradle.bat"

$steps = @(
    @{ name = "Release content validation"; workdir = $repoRoot; command = "node scripts/validate_release_content.mjs"; weight = 2 },
    @{ name = "Backend verify"; workdir = "$repoRoot\backend"; command = "npm run verify"; weight = 2 },
    @{ name = "Backend prayer contract local"; workdir = "$repoRoot\backend"; command = "npm run test:contract:prayers:local"; weight = 2 },
    @{ name = "Backend prod dependency audit"; workdir = "$repoRoot\backend"; command = "npm audit --omit=dev"; weight = 2 },
    @{ name = "Admin production build"; workdir = "$repoRoot\admin"; command = "npm run build"; weight = 1 },
    @{ name = "Web production build"; workdir = "$repoRoot\web"; command = "npm run build"; weight = 1 },
    @{ name = "Web unit tests"; workdir = "$repoRoot\web"; command = "npm run test"; weight = 1 },
    @{ name = "Web e2e tests"; workdir = "$repoRoot\web"; command = "npm run test:e2e"; weight = 1 },
    @{ name = "Android compileDebugKotlin"; workdir = $repoRoot; command = "$gradle :androidApp:compileDebugKotlin --console=plain"; weight = 2 },
    @{ name = "Android testDebugUnitTest"; workdir = $repoRoot; command = "$gradle :androidApp:testDebugUnitTest --console=plain"; weight = 2 },
    @{ name = "Android installDebug"; workdir = $repoRoot; command = "$gradle :androidApp:installDebug --console=plain"; weight = 1 },
    @{ name = "Android bundleRelease"; workdir = $repoRoot; command = "$gradle :androidApp:bundleRelease --console=plain"; weight = 2 }
)

$results = @()
foreach ($step in $steps) {
    $results += Invoke-Step -Name $step.name -Workdir $step.workdir -Command $step.command -Weight $step.weight
}

$maxScore = ($results | Measure-Object -Property weight -Sum).Sum
$earnedScore = ($results | Where-Object { $_.passed } | Measure-Object -Property weight -Sum).Sum
$scoreOutOfTen = [math]::Round((10.0 * $earnedScore / $maxScore), 2)
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss K")

$lines = @()
$lines += "# Production Audit Report"
$lines += ""
$lines += "- Generated: $timestamp"
$lines += "- Score: **$scoreOutOfTen / 10**"
$lines += ""
$lines += "| Check | Status | Weight |"
$lines += "| --- | --- | --- |"
foreach ($result in $results) {
    $status = if ($result.passed) { "PASS" } else { "FAIL" }
    $lines += "| $($result.name) | $status | $($result.weight) |"
}

$failures = @($results | Where-Object { -not $_.passed })
if ($failures.Count -gt 0) {
    $lines += ""
    $lines += "## Failures"
    foreach ($failure in $failures) {
        $lines += "- **$($failure.name)** (`$($failure.command)`): $($failure.error)"
    }
}

Set-Content -Path (Join-Path $repoRoot $ReportPath) -Value $lines -Encoding UTF8
Write-Host ""
Write-Host "Production audit score: $scoreOutOfTen / 10"
Write-Host "Report: $(Join-Path $repoRoot $ReportPath)"

if ($failures.Count -gt 0) {
    exit 1
}
