param(
    [string]$AdbPath = ".\.android-sdk\platform-tools\adb.exe",
    [string]$PackageName = "com.divya.prayerapp.avinash.debug",
    [string]$MainActivity = "com.divya.android.MainActivity",
    [string]$OutputDir = "C:\Users\avina\Downloads\playstore_submission\v15_playstore_pack\media\phone_screenshots_full_20260309",
    [string]$BackendBaseUrl = "http://127.0.0.1:5000",
    [string]$Email = "playstore.screenshots.20260309",
    [string]$Password = "Divya12345",
    [string]$Name = "Play Store Capture User",
    [int]$MarkerTimeoutSeconds = 45,
    [ValidateSet("play8", "full")]
    [string]$CapturePreset = "full",
    [switch]$CaptureScrolled
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}
if (-not $PSBoundParameters.ContainsKey("CaptureScrolled")) {
    $CaptureScrolled = ($CapturePreset -eq "full")
}

$playRouteCaptures = @(
    @{ Route = "login"; FileBase = "login"; Public = $true; Markers = @("Return to your sacred routine", "Sign in with your email and password") },
    @{ Route = "register"; FileBase = "register"; Public = $true; Markers = @("Save your spiritual journey", "Create your account") },
    @{ Route = "home"; FileBase = "home"; Public = $false; Markers = @("Home", "Your daily spiritual home") },
    @{ Route = "library"; FileBase = "prayer-library"; Public = $false; Markers = @("Prayer Library", "Find the right prayer for today") },
    @{ Route = "prayer"; FileBase = "prayer-player"; Public = $false; Markers = @("Prayer Player", "Audio controls") },
    @{ Route = "temple"; FileBase = "temple"; Public = $false; Markers = @("Temple", "Bhadra Bhagavathi Temple, Karunagapally") },
    @{ Route = "waitlist"; FileBase = "puja-waitlist"; Public = $false; Markers = @("Waitlist Join", "Prepare your puja request") },
    @{ Route = "my-pujas"; FileBase = "my-pujas"; Public = $false; Markers = @("My Pujas", "Track your pujas clearly") }
)

$fullRouteCaptures = @(
    @{ Route = "login"; FileBase = "login"; Public = $true; Markers = @("Return to your sacred routine", "Sign in with your email and password") },
    @{ Route = "register"; FileBase = "register"; Public = $true; Markers = @("Save your spiritual journey", "Create your account") },
    @{ Route = "onboarding"; FileBase = "onboarding"; Public = $false; Markers = @("Onboarding", "Get Started") },
    @{ Route = "home"; FileBase = "home"; Public = $false; Markers = @("Home", "Your daily spiritual home") },
    @{ Route = "library"; FileBase = "prayer-library"; Public = $false; Markers = @("Prayer Library", "Find the right prayer for today") },
    @{ Route = "prayer"; FileBase = "prayer-player"; Public = $false; Markers = @("Prayer Player", "Audio controls") },
    @{ Route = "now-playing"; FileBase = "now-playing"; Public = $false; Markers = @("Now Playing", "Audio controls") },
    @{ Route = "deity"; FileBase = "deity-detail"; Public = $false; Markers = @("Deity Detail", "Deity") },
    @{ Route = "deity-learn"; FileBase = "deity-learn"; Public = $false; Markers = @("Deity Learn", "Learn") },
    @{ Route = "deity-module"; FileBase = "deity-module"; Public = $false; Markers = @("Learning Module", "Module") },
    @{ Route = "temple"; FileBase = "temple"; Public = $false; Markers = @("Temple", "Bhadra Bhagavathi Temple, Karunagapally") },
    @{ Route = "puja"; FileBase = "puja-detail"; Public = $false; Markers = @("Puja Detail", "Temple") },
    @{ Route = "waitlist"; FileBase = "waitlist-join"; Public = $false; Markers = @("Waitlist Join", "Prepare your puja request") },
    @{ Route = "my-pujas"; FileBase = "my-pujas"; Public = $false; Markers = @("My Pujas", "Track your pujas clearly") },
    @{ Route = "my-pujas-gifts"; FileBase = "my-pujas-gifts"; Public = $false; Markers = @("Gifts", "Gift") },
    @{ Route = "video"; FileBase = "puja-video"; Public = $false; Markers = @("Puja Video", "Video") },
    @{ Route = "calendar"; FileBase = "calendar"; Public = $false; Markers = @("Calendar", "Today") },
    @{ Route = "festival"; FileBase = "festival-prep"; Public = $false; Markers = @("Festival Prep", "Festival") },
    @{ Route = "profile"; FileBase = "profile"; Public = $false; Markers = @("Profile", "Support") },
    @{ Route = "profile-contact"; FileBase = "profile-contact"; Public = $false; Markers = @("Support Contact", "Contact") },
    @{ Route = "shared-prayer-create"; FileBase = "shared-prayer-create"; Public = $false; Markers = @("Create Shared Prayer", "Create") },
    @{ Route = "shared-prayer-session"; FileBase = "shared-prayer-session"; Public = $false; Markers = @("Shared Prayer Session", "Session") },
    @{ Route = "features"; FileBase = "feature-operations"; Public = $false; Markers = @("Feature Operations", "Operations") }
)

function Write-Step {
    param([string]$Message)
    Write-Host "[capture] $Message"
}

function Run-Adb {
    param(
        [Parameter(Mandatory = $true)][string[]]$Args,
        [switch]$AllowFailure
    )
    $escapedArgs = $Args | ForEach-Object {
        if ($_ -match '[\s"]') {
            '"' + ($_ -replace '"', '\"') + '"'
        } else {
            $_
        }
    }
    $cmdLine = '"' + $AdbPath + '" ' + ($escapedArgs -join " ")
    $output = cmd /c "$cmdLine 2>&1"
    $code = $LASTEXITCODE
    $text = (($output | Out-String).Trim())
    if (-not $AllowFailure -and $code -ne 0) {
        throw "adb $($Args -join ' ') failed (exit $code): $text"
    }
    return $text
}

function Parse-BoundsCenter {
    param([Parameter(Mandatory = $true)][string]$Bounds)
    if ($Bounds -notmatch "\[(\d+),(\d+)\]\[(\d+),(\d+)\]") {
        throw "Unable to parse bounds: $Bounds"
    }
    $x1 = [int]$matches[1]
    $y1 = [int]$matches[2]
    $x2 = [int]$matches[3]
    $y2 = [int]$matches[4]
    return @{
        X = [int](($x1 + $x2) / 2)
        Y = [int](($y1 + $y2) / 2)
    }
}

function Wait-ForMarkers {
    param(
        [Parameter(Mandatory = $true)][string[]]$Markers,
        [Parameter(Mandatory = $true)][int]$TimeoutSeconds
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $dumpPath = "/sdcard/capture-ui-$([System.Guid]::NewGuid().ToString('N')).xml"
    while ((Get-Date) -lt $deadline) {
        Run-Adb -Args @("shell", "rm", "-f", $dumpPath) -AllowFailure | Out-Null
        Run-Adb -Args @("shell", "uiautomator", "dump", $dumpPath) -AllowFailure | Out-Null
        $xmlText = Run-Adb -Args @("shell", "cat", $dumpPath) -AllowFailure
        if (-not [string]::IsNullOrWhiteSpace($xmlText)) {
            foreach ($marker in $Markers) {
                if ($xmlText -match [regex]::Escape($marker)) {
                    Run-Adb -Args @("shell", "rm", "-f", $dumpPath) -AllowFailure | Out-Null
                    return $xmlText
                }
            }
        }
        Start-Sleep -Milliseconds 700
    }
    Run-Adb -Args @("shell", "rm", "-f", $dumpPath) -AllowFailure | Out-Null
    throw "Timed out waiting for markers [$($Markers -join ', ')]"
}

function Convert-ToAdbInputText {
    param([Parameter(Mandatory = $true)][string]$Text)
    $encoded = [System.Uri]::EscapeDataString($Text)
    return $encoded -replace "%20", "%s"
}

function Build-CapturePlan {
    param(
        [Parameter(Mandatory = $true)][array]$Routes,
        [Parameter(Mandatory = $true)][bool]$IncludeScrolled
    )
    $plan = New-Object System.Collections.Generic.List[hashtable]
    $order = 1
    foreach ($route in $Routes) {
        $variants = @("top")
        if ($IncludeScrolled) {
            $variants += "bottom"
        }
        foreach ($variant in $variants) {
            $fileName = "{0:D2}-{1}-{2}.png" -f $order, $route.FileBase, $variant
            $plan.Add(@{
                    Route = $route.Route
                    FileName = $fileName
                    Markers = $route.Markers
                    Public = [bool]$route.Public
                    ScrollBeforeCapture = ($variant -eq "bottom")
                })
            $order += 1
        }
    }
    return $plan
}

function Capture-RouteVariant {
    param(
        [Parameter(Mandatory = $true)][string]$Route,
        [Parameter(Mandatory = $true)][string]$FileName,
        [Parameter(Mandatory = $true)][string[]]$Markers,
        [Parameter(Mandatory = $true)][bool]$ScrollBeforeCapture
    )
    Write-Step "Capturing route '$Route' ($([System.IO.Path]::GetFileNameWithoutExtension($FileName)))"
    Run-Adb -Args @("shell", "am", "force-stop", $PackageName) | Out-Null
    Run-Adb -Args @("shell", "am", "start", "-n", "$PackageName/$MainActivity", "--es", "route", $Route, "--ez", "hideMiniPlayer", "true") | Out-Null
    Start-Sleep -Milliseconds 1100
    Wait-ForMarkers -Markers $Markers -TimeoutSeconds $MarkerTimeoutSeconds | Out-Null

    if ($ScrollBeforeCapture) {
        for ($i = 0; $i -lt 2; $i += 1) {
            Run-Adb -Args @("shell", "input", "swipe", "540", "2050", "540", "450", "350") | Out-Null
            Start-Sleep -Milliseconds 450
        }
    }

    $remote = "/sdcard/$FileName"
    Run-Adb -Args @("shell", "screencap", "-p", $remote) | Out-Null
    Run-Adb -Args @("pull", $remote, (Join-Path $OutputDir $FileName)) | Out-Null
}

function Ensure-ScreenshotAccount {
    Write-Step "Ensuring screenshot account exists"
    $registerBody = @{
        name = $Name
        email = $Email
        password = $Password
        country = "IN"
        timezone = "Asia/Kolkata"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Method Post -Uri "$BackendBaseUrl/api/auth/register" -ContentType "application/json" -Body $registerBody | Out-Null
    } catch {
        $statusCode = $null
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        if ($statusCode -ne 409) {
            throw
        }
    }

    $loginBody = @{
        email = $Email
        password = $Password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Method Post -Uri "$BackendBaseUrl/api/auth/login" -ContentType "application/json" -Body $loginBody
    if ([string]::IsNullOrWhiteSpace($loginResponse.token)) {
        throw "Screenshot account login failed: token missing"
    }
}

function Perform-LoginInApp {
    Write-Step "Logging in within app using bounds-driven field targeting"
    Run-Adb -Args @("shell", "am", "force-stop", $PackageName) | Out-Null
    Run-Adb -Args @("shell", "am", "start", "-n", "$PackageName/$MainActivity", "--es", "route", "login", "--ez", "hideMiniPlayer", "true") | Out-Null
    $xmlText = Wait-ForMarkers -Markers @("Return to your sacred routine", "Sign in with your email and password") -TimeoutSeconds $MarkerTimeoutSeconds

    [xml]$doc = $xmlText
    $editFields = @($doc.SelectNodes("//node[@class='android.widget.EditText']"))
    if ($editFields.Count -lt 2) {
        throw "Could not find login fields from UI dump"
    }

    $emailCenter = Parse-BoundsCenter -Bounds $editFields[0].bounds
    Run-Adb -Args @("shell", "input", "tap", "$($emailCenter.X)", "$($emailCenter.Y)") | Out-Null
    Start-Sleep -Milliseconds 220
    Run-Adb -Args @("shell", "input", "text", (Convert-ToAdbInputText -Text $Email)) | Out-Null

    Run-Adb -Args @("shell", "input", "keyevent", "61") | Out-Null
    Start-Sleep -Milliseconds 220
    Run-Adb -Args @("shell", "input", "text", (Convert-ToAdbInputText -Text $Password)) | Out-Null
    Start-Sleep -Milliseconds 220
    Run-Adb -Args @("shell", "input", "keyevent", "4") | Out-Null
    Start-Sleep -Milliseconds 500

    $postEntryXml = Wait-ForMarkers -Markers @("Return to your sacred routine", "Sign in") -TimeoutSeconds 10
    [xml]$postDoc = $postEntryXml
    $signInNode = $postDoc.SelectSingleNode("//node[@text='Sign in']")
    if ($null -eq $signInNode) {
        throw "Could not find Sign in button after entering credentials"
    }
    $signInCenter = Parse-BoundsCenter -Bounds $signInNode.bounds
    Run-Adb -Args @("shell", "input", "tap", "$($signInCenter.X)", "$($signInCenter.Y)") | Out-Null

    Wait-ForMarkers -Markers @("Home", "Your daily spiritual home") -TimeoutSeconds $MarkerTimeoutSeconds | Out-Null
}

function Validate-Images {
    param([int]$ExpectedCount)
    Write-Step "Validating PNG count and dimensions"
    Add-Type -AssemblyName System.Drawing
    $files = Get-ChildItem -Path $OutputDir -Filter "*.png" | Sort-Object Name
    if ($files.Count -ne $ExpectedCount) {
        throw "Expected $ExpectedCount screenshots, found $($files.Count)"
    }

    $lines = New-Object System.Collections.Generic.List[string]
    foreach ($file in $files) {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        try {
            if ($img.Width -ne 1080 -or $img.Height -ne 2400) {
                throw "Invalid dimensions for $($file.Name): $($img.Width)x$($img.Height)"
            }
            $lines.Add("$($file.Name): $($img.Width)x$($img.Height)")
        } finally {
            $img.Dispose()
        }
    }
    Set-Content -Path (Join-Path $OutputDir "MEDIA_DIMENSIONS.txt") -Value $lines -Encoding UTF8
}

function Write-Readme {
    param(
        [Parameter(Mandatory = $true)][string]$Preset,
        [Parameter(Mandatory = $true)][bool]$IncludesScrolled
    )
    $pngFiles = Get-ChildItem -Path $OutputDir -Filter "*.png" | Sort-Object Name
    $listLines = New-Object System.Collections.Generic.List[string]
    for ($i = 0; $i -lt $pngFiles.Count; $i += 1) {
        $listLines.Add("$($i + 1). $($pngFiles[$i].Name)")
    }

    $content = @"
# Divya Screenshot Pack (2026-03-09)

This folder contains phone-only screenshots generated from the current debug app.

## Pack Details

- Preset: $Preset
- Includes scrolled/full-page pass: $IncludesScrolled
- Device mode: 1080x2400 portrait
- Package: $PackageName
- Activity: $MainActivity
- Backend: $BackendBaseUrl

## Included Files

$($listLines -join "`r`n")

## Capture Command

```powershell
.\scripts\capture_play_phone_screenshots.ps1 -CapturePreset $Preset
```

## Notes

- Captures use `adb shell screencap -p` + `adb pull` to avoid corrupted PNG output.
- Login and register are captured pre-authentication; all other routes are captured after deterministic sign-in.
"@

    Set-Content -Path (Join-Path $OutputDir "README.md") -Value $content -Encoding UTF8
}

Write-Step "Preflight checks"
if (-not (Test-Path $AdbPath)) {
    throw "adb not found at '$AdbPath'"
}
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}
Get-ChildItem -Path $OutputDir -Filter "*.png" -ErrorAction SilentlyContinue | Remove-Item -Force

$devices = Run-Adb -Args @("devices")
if ($devices -notmatch "emulator-\d+\s+device") {
    throw "No running emulator device found. adb devices output: $devices"
}

$ready = Invoke-WebRequest -UseBasicParsing "$BackendBaseUrl/health/ready"
if ($ready.StatusCode -lt 200 -or $ready.StatusCode -ge 300) {
    throw "Backend readiness check failed: HTTP $($ready.StatusCode)"
}

$packages = Run-Adb -Args @("shell", "pm", "list", "packages")
if ($packages -notmatch [regex]::Escape($PackageName)) {
    throw "Package '$PackageName' is not installed on the emulator"
}

Write-Step "Resetting emulator display overrides to phone mode"
Run-Adb -Args @("shell", "wm", "size", "reset") | Out-Null
Run-Adb -Args @("shell", "wm", "density", "reset") | Out-Null
Start-Sleep -Seconds 1
$sizeInfo = Run-Adb -Args @("shell", "wm", "size")
if ($sizeInfo -notmatch "1080x2400") {
    throw "Expected phone mode 1080x2400 after reset, got: $sizeInfo"
}

Write-Step "Clearing app state for clean auth captures"
Run-Adb -Args @("shell", "pm", "clear", $PackageName) | Out-Null

$selectedRoutes = if ($CapturePreset -eq "play8") { $playRouteCaptures } else { $fullRouteCaptures }
$capturePlan = Build-CapturePlan -Routes $selectedRoutes -IncludeScrolled ([bool]$CaptureScrolled)
$publicCaptures = $capturePlan | Where-Object { $_.Public }
$privateCaptures = $capturePlan | Where-Object { -not $_.Public }

foreach ($capture in $publicCaptures) {
    Capture-RouteVariant -Route $capture.Route -FileName $capture.FileName -Markers $capture.Markers -ScrollBeforeCapture ([bool]$capture.ScrollBeforeCapture)
}

if ($privateCaptures.Count -gt 0) {
    Ensure-ScreenshotAccount
    Perform-LoginInApp
    foreach ($capture in $privateCaptures) {
        Capture-RouteVariant -Route $capture.Route -FileName $capture.FileName -Markers $capture.Markers -ScrollBeforeCapture ([bool]$capture.ScrollBeforeCapture)
    }
}

Validate-Images -ExpectedCount $capturePlan.Count
Write-Readme -Preset $CapturePreset -IncludesScrolled ([bool]$CaptureScrolled
)
Write-Step "Capture complete -> $OutputDir"
