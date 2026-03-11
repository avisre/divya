param(
    [string]$AdbPath = ".\.android-sdk\platform-tools\adb.exe",
    [string]$EmulatorPath = ".\.android-sdk\emulator\emulator.exe",
    [string]$ApkPath = ".\androidApp\build\outputs\apk\debug\androidApp-debug.apk",
    [string]$PackageName = "com.divya.prayerapp.avinash.debug",
    [string]$MainActivity = "com.divya.android.MainActivity",
    [string]$OutputRoot = ".\artifacts\screenshots",
    [string]$BackendBaseUrl = "http://127.0.0.1:5000",
    [string]$Email = "ui20.multidevice.20260309@example.com",
    [string]$Password = "Divya12345",
    [string]$Name = "UI Multi Device Capture User",
    [int]$MarkerTimeoutSeconds = 60
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}
Add-Type -AssemblyName System.Drawing
if (-not $env:ANDROID_SDK_ROOT) {
    $globalSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $globalSdk) {
        $env:ANDROID_SDK_ROOT = $globalSdk
    }
}

$proofDir = Join-Path $OutputRoot "ui20_multidevice_20260309"
$rawSmallDir = Join-Path $OutputRoot "ui20_small_phone_raw_20260309"
$rawRegularDir = Join-Path $OutputRoot "ui20_regular_phone_raw_20260309"
$rawLargeDir = Join-Path $OutputRoot "ui20_large_phone_raw_20260309"
$rawTabletDir = Join-Path $OutputRoot "ui20_tablet_raw_20260309"

$routeCaptures = @(
    @{ Order = 1; Route = "login"; FileBase = "login"; Public = $true; Markers = @("Return to your sacred routine", "Sign in with your email and password") },
    @{ Order = 2; Route = "register"; FileBase = "register"; Public = $true; Markers = @("Save your spiritual journey", "Create your account") },
    @{ Order = 3; Route = "onboarding"; FileBase = "onboarding"; Public = $false; Markers = @("Onboarding", "Get Started") },
    @{ Order = 4; Route = "home"; FileBase = "home"; Public = $false; Markers = @("Home", "Your daily spiritual home") },
    @{ Order = 5; Route = "library"; FileBase = "prayer-library"; Public = $false; Markers = @("Prayer Library", "Find the right prayer for today") },
    @{ Order = 6; Route = "prayer"; FileBase = "prayer-player"; Public = $false; Markers = @("Prayer Player", "Audio controls") },
    @{ Order = 7; Route = "now-playing"; FileBase = "now-playing"; Public = $false; Markers = @("Now Playing", "Audio controls") },
    @{ Order = 8; Route = "deity"; FileBase = "deity-detail"; Public = $false; Markers = @("Deity Detail", "Deity") },
    @{ Order = 9; Route = "deity-learn"; FileBase = "deity-learn"; Public = $false; Markers = @("Deity Learn", "Learn") },
    @{ Order = 10; Route = "temple"; FileBase = "temple"; Public = $false; Markers = @("Temple", "Bhadra Bhagavathi Temple, Karunagapally") },
    @{ Order = 11; Route = "puja"; FileBase = "puja-detail"; Public = $false; Markers = @("Puja Detail", "Temple") },
    @{ Order = 12; Route = "waitlist"; FileBase = "waitlist-join"; Public = $false; Markers = @("Waitlist Join", "Prepare your puja request") },
    @{ Order = 13; Route = "my-pujas"; FileBase = "my-pujas"; Public = $false; Markers = @("My Pujas", "Track your pujas clearly") },
    @{ Order = 14; Route = "my-pujas-gifts"; FileBase = "my-pujas-gifts"; Public = $false; Markers = @("Gifts", "Gift") },
    @{ Order = 15; Route = "video"; FileBase = "puja-video"; Public = $false; Markers = @("Puja Video", "Video") },
    @{ Order = 16; Route = "calendar"; FileBase = "calendar"; Public = $false; Markers = @("Calendar", "Today") },
    @{ Order = 17; Route = "festival"; FileBase = "festival-prep"; Public = $false; Markers = @("Festival Prep", "Festival") },
    @{ Order = 18; Route = "profile"; FileBase = "profile"; Public = $false; Markers = @("Profile", "Support") },
    @{ Order = 19; Route = "profile-contact"; FileBase = "profile-contact"; Public = $false; Markers = @("Support Contact", "Contact") },
    @{ Order = 20; Route = "shared-prayer-create"; FileBase = "shared-prayer-create"; Public = $false; Markers = @("Create Shared Prayer", "Create") }
)

$devices = @(
    @{
        Label = "Small phone"
        Slug = "small-phone"
        Avd = "DivyaApi34"
        Density = 480
        OutputDir = $rawSmallDir
    },
    @{
        Label = "Regular phone"
        Slug = "regular-phone"
        Avd = "Medium_Phone_API_36.1"
        Density = $null
        OutputDir = $rawRegularDir
    },
    @{
        Label = "Large phone"
        Slug = "large-phone"
        Avd = "Pixel_6"
        Density = 320
        OutputDir = $rawLargeDir
    },
    @{
        Label = "Tablet"
        Slug = "tablet"
        Avd = "Pixel_Tablet"
        Density = $null
        OutputDir = $rawTabletDir
    }
)

$backgroundColor = [System.Drawing.ColorTranslator]::FromHtml("#FDF6EE")
$titleColor = [System.Drawing.ColorTranslator]::FromHtml("#1A1A1A")
$subtleColor = [System.Drawing.ColorTranslator]::FromHtml("#555555")
$targetHeight = 1400
$padding = 28
$gutter = 32
$headerHeight = 70

function Write-Step {
    param([string]$Message)
    Write-Host "[multidevice] $Message"
}

function Ensure-AdbServer {
    $null = & $AdbPath start-server 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "adb start-server failed"
    }
}

function Run-Adb {
    param(
        [Parameter(Mandatory = $true)][string]$Serial,
        [Parameter(Mandatory = $true)][string[]]$Args,
        [switch]$AllowFailure
    )
    $escapedArgs = @("-s", $Serial) + $Args
    $displayArgs = $escapedArgs | ForEach-Object {
        if ($_ -match '[\s"]') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ }
    }
    $cmdLine = '"' + $AdbPath + '" ' + ($displayArgs -join " ")
    $output = cmd /c "$cmdLine 2>&1"
    $code = $LASTEXITCODE
    $text = (($output | Out-String).Trim())
    if ($code -ne 0 -and $text -match "cannot connect to daemon") {
        Ensure-AdbServer
        $output = cmd /c "$cmdLine 2>&1"
        $code = $LASTEXITCODE
        $text = (($output | Out-String).Trim())
    }
    if (-not $AllowFailure -and $code -ne 0) {
        throw "adb ($Serial) $($Args -join ' ') failed (exit $code): $text"
    }
    return $text
}

function Get-ConnectedSerials {
    $output = & $AdbPath devices
    if ($LASTEXITCODE -ne 0) {
        throw "adb devices failed"
    }
    $serials = @()
    foreach ($line in $output) {
        if ($line -match '^(\S+)\s+device$') {
            $serials += $matches[1]
        }
    }
    return $serials
}

function Get-AvdName {
    param([Parameter(Mandatory = $true)][string]$Serial)
    $raw = Run-Adb -Serial $Serial -Args @("emu", "avd", "name") -AllowFailure
    $lines = $raw -split "(`r`n|`n|`r)" | ForEach-Object { $_.Trim() } | Where-Object { $_ -and $_ -ne "OK" }
    return ($lines | Select-Object -First 1)
}

function Wait-ForBoot {
    param([Parameter(Mandatory = $true)][string]$Serial)
    $deadline = (Get-Date).AddMinutes(8)
    while ((Get-Date) -lt $deadline) {
        $boot = (Run-Adb -Serial $Serial -Args @("shell", "getprop", "sys.boot_completed") -AllowFailure).Trim()
        if ($boot -eq "1") {
            Start-Sleep -Seconds 2
            return
        }
        Start-Sleep -Seconds 2
    }
    throw "Timed out waiting for $Serial to boot"
}

function Ensure-Emulator {
    param([Parameter(Mandatory = $true)][string]$Avd)
    foreach ($serial in (Get-ConnectedSerials)) {
        if ((Get-AvdName -Serial $serial) -eq $Avd) {
            Wait-ForBoot -Serial $serial
            return $serial
        }
    }
    Write-Step "Starting emulator $Avd"
    Start-Process -FilePath $EmulatorPath -ArgumentList @("-avd", $Avd, "-no-snapshot-load", "-no-boot-anim", "-no-window") | Out-Null
    $deadline = (Get-Date).AddMinutes(8)
    while ((Get-Date) -lt $deadline) {
        foreach ($serial in (Get-ConnectedSerials)) {
            if ((Get-AvdName -Serial $serial) -eq $Avd) {
                Wait-ForBoot -Serial $serial
                return $serial
            }
        }
        Start-Sleep -Seconds 2
    }
    throw "Could not find booted emulator for $Avd"
}

function Convert-ToAdbInputText {
    param([Parameter(Mandatory = $true)][string]$Text)
    return $Text -replace " ", "%s"
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
        [Parameter(Mandatory = $true)][string]$Serial,
        [Parameter(Mandatory = $true)][string[]]$Markers,
        [Parameter(Mandatory = $true)][int]$TimeoutSeconds
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    $dumpPath = "/sdcard/multidevice-$([System.Guid]::NewGuid().ToString('N')).xml"
    while ((Get-Date) -lt $deadline) {
        Run-Adb -Serial $Serial -Args @("shell", "rm", "-f", $dumpPath) -AllowFailure | Out-Null
        Run-Adb -Serial $Serial -Args @("shell", "uiautomator", "dump", $dumpPath) -AllowFailure | Out-Null
        $xmlText = Run-Adb -Serial $Serial -Args @("shell", "cat", $dumpPath) -AllowFailure
        if (-not [string]::IsNullOrWhiteSpace($xmlText)) {
            foreach ($marker in $Markers) {
                if ($xmlText -match [regex]::Escape($marker)) {
                    Run-Adb -Serial $Serial -Args @("shell", "rm", "-f", $dumpPath) -AllowFailure | Out-Null
                    return $xmlText
                }
            }
        }
        Start-Sleep -Milliseconds 700
    }
    Run-Adb -Serial $Serial -Args @("shell", "rm", "-f", $dumpPath) -AllowFailure | Out-Null
    throw "Timed out waiting for markers [$($Markers -join ', ')] on $Serial"
}

function Ensure-ScreenshotAccount {
    Write-Step "Ensuring capture account exists"
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
    $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Method Post -Uri "$BackendBaseUrl/api/auth/login" -ContentType "application/json" -Body $loginBody
    if ([string]::IsNullOrWhiteSpace($loginResponse.token)) {
        throw "Capture account login failed: token missing"
    }
}

function Perform-LoginInApp {
    param([Parameter(Mandatory = $true)][string]$Serial)
    Write-Step "Logging into app on $Serial"
    Run-Adb -Serial $Serial -Args @("shell", "am", "force-stop", $PackageName) | Out-Null
    Run-Adb -Serial $Serial -Args @("shell", "am", "start", "-n", "$PackageName/$MainActivity", "--es", "route", "login", "--ez", "hideMiniPlayer", "true") | Out-Null
    $xmlText = Wait-ForMarkers -Serial $Serial -Markers @("Return to your sacred routine", "Sign in with your email and password") -TimeoutSeconds $MarkerTimeoutSeconds
    [xml]$doc = $xmlText
    $editFields = @($doc.SelectNodes("//node[@class='android.widget.EditText']"))
    if ($editFields.Count -lt 2) {
        throw "Could not find login fields on $Serial"
    }
    $emailCenter = Parse-BoundsCenter -Bounds $editFields[0].bounds
    Run-Adb -Serial $Serial -Args @("shell", "input", "tap", "$($emailCenter.X)", "$($emailCenter.Y)") | Out-Null
    Start-Sleep -Milliseconds 250
    Run-Adb -Serial $Serial -Args @("shell", "input", "text", (Convert-ToAdbInputText -Text $Email)) | Out-Null
    Run-Adb -Serial $Serial -Args @("shell", "input", "keyevent", "61") | Out-Null
    Start-Sleep -Milliseconds 250
    Run-Adb -Serial $Serial -Args @("shell", "input", "text", (Convert-ToAdbInputText -Text $Password)) | Out-Null
    Start-Sleep -Milliseconds 250
    Run-Adb -Serial $Serial -Args @("shell", "input", "keyevent", "4") | Out-Null
    Start-Sleep -Milliseconds 500
    $postEntryXml = Wait-ForMarkers -Serial $Serial -Markers @("Sign in") -TimeoutSeconds 10
    [xml]$postDoc = $postEntryXml
    $signInNode = $postDoc.SelectSingleNode("//node[@text='Sign in']")
    if ($null -eq $signInNode) {
        throw "Could not find Sign in button on $Serial"
    }
    $signInCenter = Parse-BoundsCenter -Bounds $signInNode.bounds
    Run-Adb -Serial $Serial -Args @("shell", "input", "tap", "$($signInCenter.X)", "$($signInCenter.Y)") | Out-Null
    Wait-ForMarkers -Serial $Serial -Markers @("Home", "Your daily spiritual home") -TimeoutSeconds $MarkerTimeoutSeconds | Out-Null
}

function Install-DebugApk {
    param([Parameter(Mandatory = $true)][string]$Serial)
    Write-Step "Installing debug APK on $Serial"
    $cmdLine = '"' + $AdbPath + '" -s ' + $Serial + ' install -r "' + $ApkPath + '"'
    $output = cmd /c "$cmdLine 2>&1"
    if ($LASTEXITCODE -ne 0 -and (($output | Out-String) -match "cannot connect to daemon")) {
        Ensure-AdbServer
        $output = cmd /c "$cmdLine 2>&1"
    }
    if ($LASTEXITCODE -ne 0 -and (($output | Out-String) -match "INSUFFICIENT_STORAGE")) {
        Run-Adb -Serial $Serial -Args @("uninstall", $PackageName) -AllowFailure | Out-Null
        $output = cmd /c "$cmdLine 2>&1"
    }
    if ($LASTEXITCODE -ne 0) {
        throw "APK install failed on ${Serial}: $($output | Out-String)"
    }
}

function Apply-DeviceOverrides {
    param(
        [Parameter(Mandatory = $true)][string]$Serial,
        [Parameter()][Nullable[int]]$Density
    )
    Run-Adb -Serial $Serial -Args @("shell", "wm", "size", "reset") -AllowFailure | Out-Null
    if ($null -eq $Density) {
        Run-Adb -Serial $Serial -Args @("shell", "wm", "density", "reset") -AllowFailure | Out-Null
    } else {
        Run-Adb -Serial $Serial -Args @("shell", "wm", "density", "$Density") | Out-Null
    }
    Start-Sleep -Seconds 2
}

function Capture-Route {
    param(
        [Parameter(Mandatory = $true)][string]$Serial,
        [Parameter(Mandatory = $true)][string]$Route,
        [Parameter(Mandatory = $true)][string]$FileName,
        [Parameter(Mandatory = $true)][string[]]$Markers,
        [Parameter(Mandatory = $true)][string]$OutputDir
    )
    Write-Step "Capturing $Route on $Serial"
    Run-Adb -Serial $Serial -Args @("shell", "am", "force-stop", $PackageName) | Out-Null
    Run-Adb -Serial $Serial -Args @("shell", "am", "start", "-n", "$PackageName/$MainActivity", "--es", "route", $Route, "--ez", "hideMiniPlayer", "true") | Out-Null
    Start-Sleep -Milliseconds 1200
    Wait-ForMarkers -Serial $Serial -Markers $Markers -TimeoutSeconds $MarkerTimeoutSeconds | Out-Null
    $remote = "/sdcard/$FileName"
    Run-Adb -Serial $Serial -Args @("shell", "screencap", "-p", $remote) | Out-Null
    $destination = Join-Path $OutputDir $FileName
    $cmdLine = '"' + $AdbPath + '" -s ' + $Serial + ' pull "' + $remote + '" "' + $destination + '"'
    $output = cmd /c "$cmdLine 2>&1"
    if ($LASTEXITCODE -ne 0) {
        Ensure-AdbServer
        $output = cmd /c "$cmdLine 2>&1"
    }
    if ($LASTEXITCODE -ne 0) {
        throw "adb pull failed for $FileName from ${Serial}: $($output | Out-String)"
    }
    Run-Adb -Serial $Serial -Args @("shell", "rm", "-f", $remote) -AllowFailure | Out-Null
}

function Capture-DeviceSet {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Device,
        [Parameter(Mandatory = $true)][string]$Serial
    )
    $outputDir = [string]$Device.OutputDir
    if (Test-Path $outputDir) {
        Remove-Item $outputDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Apply-DeviceOverrides -Serial $Serial -Density $Device.Density
    Run-Adb -Serial $Serial -Args @("shell", "pm", "clear", $PackageName) | Out-Null
    foreach ($capture in ($routeCaptures | Where-Object { $_.Public })) {
        $fileName = "{0:D2}-{1}-{2}.png" -f $capture.Order, $capture.FileBase, $Device.Slug
        Capture-Route -Serial $Serial -Route $capture.Route -FileName $fileName -Markers $capture.Markers -OutputDir $outputDir
    }
    Ensure-ScreenshotAccount
    Perform-LoginInApp -Serial $Serial
    foreach ($capture in ($routeCaptures | Where-Object { -not $_.Public })) {
        $fileName = "{0:D2}-{1}-{2}.png" -f $capture.Order, $capture.FileBase, $Device.Slug
        Capture-Route -Serial $Serial -Route $capture.Route -FileName $fileName -Markers $capture.Markers -OutputDir $outputDir
    }
}

function Reset-DeviceOverrides {
    param([Parameter(Mandatory = $true)][string]$Serial)
    Run-Adb -Serial $Serial -Args @("shell", "wm", "size", "reset") -AllowFailure | Out-Null
    Run-Adb -Serial $Serial -Args @("shell", "wm", "density", "reset") -AllowFailure | Out-Null
}

function Write-DimensionFile {
    param(
        [Parameter(Mandatory = $true)][string]$TargetDir,
        [Parameter(Mandatory = $true)][string]$FileName
    )
    $lines = New-Object System.Collections.Generic.List[string]
    foreach ($file in (Get-ChildItem $TargetDir -Filter *.png | Sort-Object Name)) {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        try {
            $lines.Add("$($file.Name): $($img.Width)x$($img.Height)")
        } finally {
            $img.Dispose()
        }
    }
    Set-Content -Path (Join-Path $TargetDir $FileName) -Value $lines -Encoding UTF8
}

function Validate-CaptureCounts {
    param(
        [Parameter(Mandatory = $true)][string]$TargetDir,
        [Parameter(Mandatory = $true)][int]$Expected
    )
    $actual = (Get-ChildItem $TargetDir -Filter *.png).Count
    if ($actual -ne $Expected) {
        throw "Expected $Expected PNG files in $TargetDir, found $actual"
    }
}

function Combine-MultiDeviceShots {
    if (Test-Path $proofDir) {
        Remove-Item $proofDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $proofDir | Out-Null

    $titleFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $labelFont = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Regular)
    $titleBrush = New-Object System.Drawing.SolidBrush($titleColor)
    $labelBrush = New-Object System.Drawing.SolidBrush($subtleColor)

    try {
        foreach ($capture in $routeCaptures) {
            $index = "{0:D2}" -f $capture.Order
            $images = @()
            foreach ($device in $devices) {
                $path = Join-Path ([string]$device.OutputDir) "$index-$($capture.FileBase)-$($device.Slug).png"
                $img = [System.Drawing.Image]::FromFile($path)
                $images += [pscustomobject]@{
                    Label = [string]$device.Label
                    Image = $img
                    Width = [int][Math]::Round($img.Width * ($targetHeight / $img.Height))
                }
            }

            try {
                $canvasWidth = [int](($padding * 2) + (($images | Measure-Object -Property Width -Sum).Sum) + ($gutter * ($images.Count - 1)))
                $canvasHeight = [int]($headerHeight + $targetHeight + $padding)
                $bitmap = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
                try {
                    $graphics.Clear($backgroundColor)
                    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

                    $x = $padding
                    foreach ($entry in $images) {
                        $graphics.DrawString($entry.Label, $titleFont, $titleBrush, [float]$x, [float]18.0)
                        $rect = New-Object System.Drawing.Rectangle($x, $headerHeight, $entry.Width, $targetHeight)
                        $graphics.DrawImage($entry.Image, $rect)
                        $x += $entry.Width + $gutter
                    }
                    $graphics.DrawString($capture.FileBase, $labelFont, $labelBrush, [float]18.0, [float]($canvasHeight - 24))
                } finally {
                    $graphics.Dispose()
                }
                $bitmap.Save((Join-Path $proofDir "$index-$($capture.FileBase).png"), [System.Drawing.Imaging.ImageFormat]::Png)
                $bitmap.Dispose()
            } finally {
                foreach ($entry in $images) {
                    $entry.Image.Dispose()
                }
            }
        }
    } finally {
        $titleFont.Dispose()
        $labelFont.Dispose()
        $titleBrush.Dispose()
        $labelBrush.Dispose()
    }

    Write-DimensionFile -TargetDir $proofDir -FileName "MEDIA_DIMENSIONS.txt"
    $readme = @(
        "# Om 2 Multi-Device Responsive Proof Pack (2026-03-09)",
        "",
        "This folder contains 20 proof screenshots rendered across four emulator classes:",
        "- Small phone: DivyaApi34 with density override for an effective 360dp width",
        "- Regular phone: Medium_Phone_API_36.1 at default density",
        "- Large phone: Pixel_6 with density override for a wider phone layout",
        "- Tablet: Pixel_Tablet at default density",
        "",
        "Each PNG shows the same screen on all four device classes side by side.",
        "",
        "Raw folders:",
        "- artifacts/screenshots/ui20_small_phone_raw_20260309",
        "- artifacts/screenshots/ui20_regular_phone_raw_20260309",
        "- artifacts/screenshots/ui20_large_phone_raw_20260309",
        "- artifacts/screenshots/ui20_tablet_raw_20260309"
    )
    Set-Content -Path (Join-Path $proofDir "README.md") -Value $readme -Encoding UTF8
}

Write-Step "Removing previous multi-device screenshot folders"
foreach ($folder in @($proofDir, $rawSmallDir, $rawRegularDir, $rawLargeDir, $rawTabletDir)) {
    if (Test-Path $folder) {
        Remove-Item $folder -Recurse -Force
    }
}

if (-not (Test-Path $ApkPath)) {
    throw "APK not found: $ApkPath"
}

Ensure-AdbServer
$health = Invoke-WebRequest -UseBasicParsing "$BackendBaseUrl/health" -TimeoutSec 10
if ($health.StatusCode -ne 200) {
    throw "Backend health check failed with status $($health.StatusCode)"
}

$deviceSerials = @{}
foreach ($device in $devices) {
    $serial = Ensure-Emulator -Avd ([string]$device.Avd)
    $deviceSerials[[string]$device.Avd] = $serial
    Install-DebugApk -Serial $serial
}

try {
    foreach ($device in $devices) {
        Capture-DeviceSet -Device $device -Serial $deviceSerials[[string]$device.Avd]
    }
}
finally {
    foreach ($device in $devices) {
        $serial = $deviceSerials[[string]$device.Avd]
        if ($serial) {
            Reset-DeviceOverrides -Serial $serial
        }
    }
}

foreach ($device in $devices) {
    Validate-CaptureCounts -TargetDir ([string]$device.OutputDir) -Expected $routeCaptures.Count
    Write-DimensionFile -TargetDir ([string]$device.OutputDir) -FileName "MEDIA_DIMENSIONS.txt"
}

Combine-MultiDeviceShots
Validate-CaptureCounts -TargetDir $proofDir -Expected $routeCaptures.Count

Write-Step "Capture complete"
Write-Step "Proof pack: $proofDir"
