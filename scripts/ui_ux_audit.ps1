param(
    [string]$ReportPath = "docs/UI_UX_AUDIT_LATEST.md"
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Name,
        [string]$Workdir,
        [string]$Command,
        [int]$Weight
    )

    Write-Host "==> $Name"
    Push-Location $Workdir
    try {
        & powershell -NoProfile -Command $Command | Out-Host
        Pop-Location
        return [pscustomobject]@{
            Name = $Name
            Passed = $true
            Weight = $Weight
            Evidence = "Command succeeded"
        }
    } catch {
        Pop-Location
        return [pscustomobject]@{
            Name = $Name
            Passed = $false
            Weight = $Weight
            Evidence = $_.Exception.Message
        }
    }
}

function New-CheckResult {
    param(
        [string]$Name,
        [bool]$Passed,
        [int]$Weight,
        [string]$Evidence
    )
    return [pscustomobject]@{
        Name = $Name
        Passed = $Passed
        Weight = $Weight
        Evidence = $Evidence
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$results = @()

$webRoot = Join-Path $repoRoot "web"
$androidNavRouteFile = Join-Path $repoRoot "androidApp\src\main\java\com\divya\android\navigation\DivyaRoute.kt"
$androidNavGraphFile = Join-Path $repoRoot "androidApp\src\main\java\com\divya\android\navigation\DivyaNavGraph.kt"
$androidThemeFile = Join-Path $repoRoot "androidApp\src\main\java\com\divya\android\ui\theme\Color.kt"
$webCssFile = Join-Path $repoRoot "web\src\styles\global.css"
$appRouteFile = Join-Path $repoRoot "web\src\app\App.tsx"

# Automated runtime checks
$results += Invoke-Step -Name "Web production build (UI compile gate)" -Workdir $webRoot -Command "npm run build" -Weight 2
$results += Invoke-Step -Name "Web UI e2e flows (navigation/player/legal/auth redirect)" -Workdir $webRoot -Command "npm run test:e2e -- --retries=1" -Weight 2
$results += Invoke-Step -Name "Android UI compile gate" -Workdir $repoRoot -Command ".\.tools\gradle-8.7\bin\gradle.bat :androidApp:compileDebugKotlin --console=plain" -Weight 1

# Static UI system checks
$css = Get-Content $webCssFile -Raw
$requiredCssTokens = @(
    "--saffron:", "--temple-gold:", "--lamp-glow:", "--warm-background:", "--ivory:",
    "--sand:", "--soft-rose:", "--clay:", "--dusk:", "--deep-brown:",
    "--forest-ash:", "--success-leaf:", "--alert-marigold:", "--white-smoke:",
    "--radius-sm:", "--radius-md:", "--radius-lg:"
)
$missingCssTokens = @($requiredCssTokens | Where-Object { $css -notmatch [regex]::Escape($_) })
$cssTokenEvidence = if ($missingCssTokens.Count -eq 0) { "All required tokens present" } else { "Missing: $($missingCssTokens -join ', ')" }
$results += New-CheckResult -Name "Web design tokens (color + radius parity)" -Passed ($missingCssTokens.Count -eq 0) -Weight 1 -Evidence $cssTokenEvidence

$hasDisplayFont = $css -match "Cormorant Garamond"
$hasBodyFont = $css -match "Source Sans 3"
$fontEvidence = "display=$hasDisplayFont, body=$hasBodyFont"
$results += New-CheckResult -Name "Web typography system (display + body families)" -Passed ($hasDisplayFont -and $hasBodyFont) -Weight 1 -Evidence $fontEvidence

$pages = Get-ChildItem (Join-Path $repoRoot "web\src\pages") -Filter "*.tsx"
$pagesWithSectionSystem = 0
foreach ($page in $pages) {
    $content = Get-Content $page.FullName -Raw
    if ($content -match "HeroSection" -and $content -match "SectionCard") {
        $pagesWithSectionSystem++
    }
}
$sectionEvidence = "$pagesWithSectionSystem/$($pages.Count) pages use HeroSection + SectionCard"
$results += New-CheckResult -Name "Uniform section system usage across web pages" -Passed ($pagesWithSectionSystem -ge 12) -Weight 1 -Evidence $sectionEvidence

$routesRaw = Get-Content $appRouteFile -Raw
$requiredRoutes = @(
    "/home", "/prayers", "/prayers/:slug", "/temple", "/pujas", "/pujas/:id", "/calendar",
    "/bookings", "/bookings/:id", "/videos/:bookingId", "/profile", "/contact",
    "/privacy", "/terms", "/sitemap"
)
$missingRoutes = @($requiredRoutes | Where-Object { $routesRaw -notmatch [regex]::Escape($_) })
$routeEvidence = if ($missingRoutes.Count -eq 0) { "All required routes mapped" } else { "Missing routes: $($missingRoutes -join ', ')" }
$results += New-CheckResult -Name "Consumer route coverage (core + legal + support)" -Passed ($missingRoutes.Count -eq 0) -Weight 1 -Evidence $routeEvidence

$navRoutesRaw = Get-Content $androidNavRouteFile -Raw
$requiredEmojiMap = @{
    home = "\uD83C\uDFE0"
    library = "\uD83D\uDCFF"
    temple = "\uD83C\uDFDB\uFE0F"
    myPujas = "\uD83E\uDE94"
    profile = "\uD83D\uDC64"
}
$missingEmoji = @()
foreach ($key in $requiredEmojiMap.Keys) {
    if ($navRoutesRaw -notmatch ("val\s+" + [regex]::Escape($key) + ".*" + [regex]::Escape($requiredEmojiMap[$key]))) {
        $missingEmoji += $key
    }
}
$navGraphRaw = Get-Content $androidNavGraphFile -Raw
$iconOnly = $navGraphRaw -match "label\s*=\s*null" -and $navGraphRaw -match "alwaysShowLabel\s*=\s*false"
$a11ySemantics = $navGraphRaw -match "contentDescription\s*=\s*route\.navLabel"
$navEvidence = "missingEmoji=$($missingEmoji -join '/'), iconOnly=$iconOnly, a11y=$a11ySemantics"
$results += New-CheckResult -Name "Android bottom-nav UX (emoji + icon-only + a11y labels)" -Passed (($missingEmoji.Count -eq 0) -and $iconOnly -and $a11ySemantics) -Weight 1 -Evidence $navEvidence

$themeRaw = Get-Content $androidThemeFile -Raw
$requiredThemeKeys = @(
    "Saffron", "TempleGold", "LampGlow", "WarmBackground", "Ivory", "Sand", "SoftRose",
    "Clay", "Dusk", "DeepBrown", "ForestAsh", "SuccessLeaf", "AlertMarigold", "WhiteSmoke"
)
$missingThemeKeys = @($requiredThemeKeys | Where-Object { $themeRaw -notmatch ("val\s+" + [regex]::Escape($_) + "\s*=") })
$themeEvidence = if ($missingThemeKeys.Count -eq 0) { "All palette keys present" } else { "Missing: $($missingThemeKeys -join ', ')" }
$results += New-CheckResult -Name "Android palette parity (theme color set)" -Passed ($missingThemeKeys.Count -eq 0) -Weight 1 -Evidence $themeEvidence

$maxScore = ($results | Measure-Object -Property Weight -Sum).Sum
$earnedScore = ($results | Where-Object { $_.Passed } | Measure-Object -Property Weight -Sum).Sum
$score = [math]::Round((10.0 * $earnedScore / $maxScore), 2)
$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss K")

$lines = @()
$lines += "# UI/UX Audit Report"
$lines += ""
$lines += "- Generated: $timestamp"
$lines += "- UI/UX score: **$score / 10**"
$lines += ""
$lines += "| Check | Status | Weight | Evidence |"
$lines += "| --- | --- | --- | --- |"
foreach ($result in $results) {
    $status = if ($result.Passed) { "PASS" } else { "FAIL" }
    $evidence = ($result.Evidence -replace "\|", "/")
    $lines += "| $($result.Name) | $status | $($result.Weight) | $evidence |"
}

$fails = @($results | Where-Object { -not $_.Passed })
if ($fails.Count -gt 0) {
    $lines += ""
    $lines += "## Priority Fixes"
    foreach ($f in $fails) {
        $lines += "- **$($f.Name)**: $($f.Evidence)"
    }
}

Set-Content -Path (Join-Path $repoRoot $ReportPath) -Value $lines -Encoding UTF8
Write-Host ""
Write-Host "UI/UX audit score: $score / 10"
Write-Host "Report: $(Join-Path $repoRoot $ReportPath)"

if ($fails.Count -gt 0) {
    exit 1
}
