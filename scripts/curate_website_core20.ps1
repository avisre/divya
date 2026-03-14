param(
  [string]$Source,
  [string]$Target,
  [string]$BaseUrl = "http://localhost:3102"
)

$ErrorActionPreference = "Stop"

$entries = @(
  @{ source = "01-landing.png"; target = "01-landing.png"; route = "/" }
  @{ source = "02-login.png"; target = "02-login.png"; route = "/login" }
  @{ source = "03-register.png"; target = "03-register.png"; route = "/register" }
  @{ source = "04-home.png"; target = "04-home.png"; route = "/home" }
  @{ source = "05-prayers.png"; target = "05-prayers.png"; route = "/prayers" }
  @{ source = "06-prayer-detail.png"; target = "06-prayer-detail.png"; route = "/prayers/[slug]" }
  @{ source = "07-temple.png"; target = "07-temple.png"; route = "/temple" }
  @{ source = "08-calendar.png"; target = "08-calendar.png"; route = "/calendar" }
  @{ source = "09-pujas.png"; target = "09-pujas.png"; route = "/pujas" }
  @{ source = "10-puja-detail.png"; target = "10-puja-detail.png"; route = "/pujas/[id]" }
  @{ source = "11-bookings.png"; target = "11-bookings.png"; route = "/bookings" }
  @{ source = "12-booking-detail.png"; target = "12-booking-detail.png"; route = "/bookings/[id]" }
  @{ source = "13-video.png"; target = "13-video.png"; route = "/videos/[bookingId]" }
  @{ source = "14-deity-detail.png"; target = "14-deity-detail.png"; route = "/deities/[id]" }
  @{ source = "15-learning-path.png"; target = "15-learning-path.png"; route = "/deities/[id]/learn" }
  @{ source = "16-learning-module.png"; target = "16-learning-module.png"; route = "/deities/[id]/learn/[moduleId]" }
  @{ source = "17-profile.png"; target = "17-profile.png"; route = "/profile" }
  @{ source = "18-contact.png"; target = "18-contact.png"; route = "/contact" }
  @{ source = "20-shared-prayer-create.png"; target = "19-shared-prayer-create.png"; route = "/shared-prayer/create" }
  @{ source = "21-shared-prayer-room.png"; target = "20-shared-prayer-room.png"; route = "/shared-prayer/[sessionCode]" }
)

if (Test-Path $Target) {
  Remove-Item $Target -Recurse -Force
}

New-Item -ItemType Directory -Path $Target | Out-Null

foreach ($entry in $entries) {
  Copy-Item (Join-Path $Source $entry.source) -Destination (Join-Path $Target $entry.target)
}

$readme = @(
  "# Website 20-Screenshot Pack",
  "",
  ("Generated: " + (Get-Date).ToString("s")),
  ("Base URL: " + $BaseUrl),
  "Viewport: 1440x1100",
  "",
  "## Files"
)

foreach ($entry in $entries) {
  $readme += ("- " + $entry.target + " -> " + $entry.route)
}

$dimensions = $entries | ForEach-Object { $_.target + " | viewport 1440x1100" }

Set-Content -Path (Join-Path $Target "README.md") -Value $readme -Encoding UTF8
Set-Content -Path (Join-Path $Target "MEDIA_DIMENSIONS.txt") -Value $dimensions -Encoding UTF8

Write-Output $Target
