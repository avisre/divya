param(
    [string]$OutputRoot = ".\artifacts\screenshots"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$proofDir = Join-Path $OutputRoot "ui20_multidevice_20260309"
$rawSmallDir = Join-Path $OutputRoot "ui20_small_phone_raw_20260309"
$rawRegularDir = Join-Path $OutputRoot "ui20_regular_phone_raw_20260309"
$rawLargeDir = Join-Path $OutputRoot "ui20_large_phone_raw_20260309"
$rawTabletDir = Join-Path $OutputRoot "ui20_tablet_raw_20260309"

$routeCaptures = @(
    @{ Order = 1; FileBase = "login" },
    @{ Order = 2; FileBase = "register" },
    @{ Order = 3; FileBase = "onboarding" },
    @{ Order = 4; FileBase = "home" },
    @{ Order = 5; FileBase = "prayer-library" },
    @{ Order = 6; FileBase = "prayer-player" },
    @{ Order = 7; FileBase = "now-playing" },
    @{ Order = 8; FileBase = "deity-detail" },
    @{ Order = 9; FileBase = "deity-learn" },
    @{ Order = 10; FileBase = "temple" },
    @{ Order = 11; FileBase = "puja-detail" },
    @{ Order = 12; FileBase = "waitlist-join" },
    @{ Order = 13; FileBase = "my-pujas" },
    @{ Order = 14; FileBase = "my-pujas-gifts" },
    @{ Order = 15; FileBase = "puja-video" },
    @{ Order = 16; FileBase = "calendar" },
    @{ Order = 17; FileBase = "festival-prep" },
    @{ Order = 18; FileBase = "profile" },
    @{ Order = 19; FileBase = "profile-contact" },
    @{ Order = 20; FileBase = "shared-prayer-create" }
)

$devices = @(
    @{ Label = "Small phone"; Slug = "small-phone"; OutputDir = $rawSmallDir },
    @{ Label = "Regular phone"; Slug = "regular-phone"; OutputDir = $rawRegularDir },
    @{ Label = "Large phone"; Slug = "large-phone"; OutputDir = $rawLargeDir },
    @{ Label = "Tablet"; Slug = "tablet"; OutputDir = $rawTabletDir }
)

$backgroundColor = [System.Drawing.ColorTranslator]::FromHtml("#FDF6EE")
$titleColor = [System.Drawing.ColorTranslator]::FromHtml("#1A1A1A")
$subtleColor = [System.Drawing.ColorTranslator]::FromHtml("#555555")
$targetHeight = 1400
$padding = 28
$gutter = 32
$headerHeight = 70

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
    "This folder contains 20 proof screenshots rendered across four emulator classes.",
    "- Small phone",
    "- Regular phone",
    "- Large phone",
    "- Tablet"
)
Set-Content -Path (Join-Path $proofDir "README.md") -Value $readme -Encoding UTF8
