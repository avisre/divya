$src = "artifacts\screenshots\ui20_raw_20260309"
$dst = "artifacts\screenshots\ui20_20260309"

$keep = @(
    "01-login-top.png",
    "02-register-top.png",
    "03-onboarding-top.png",
    "04-home-top.png",
    "05-prayer-library-top.png",
    "06-prayer-player-top.png",
    "07-now-playing-top.png",
    "08-deity-detail-top.png",
    "09-deity-learn-top.png",
    "11-temple-top.png",
    "12-puja-detail-top.png",
    "13-waitlist-join-top.png",
    "14-my-pujas-top.png",
    "15-my-pujas-gifts-top.png",
    "16-puja-video-top.png",
    "17-calendar-top.png",
    "18-festival-prep-top.png",
    "19-profile-top.png",
    "20-profile-contact-top.png",
    "21-shared-prayer-create-top.png"
)

if (Test-Path $dst) {
    Remove-Item $dst -Recurse -Force
}

New-Item -ItemType Directory -Path $dst | Out-Null

foreach ($file in $keep) {
    Copy-Item (Join-Path $src $file) (Join-Path $dst $file) -Force
}

Add-Type -AssemblyName System.Drawing
$lines = New-Object System.Collections.Generic.List[string]
foreach ($file in (Get-ChildItem $dst -Filter *.png | Sort-Object Name)) {
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        $lines.Add("$($file.Name): $($img.Width)x$($img.Height)")
    } finally {
        $img.Dispose()
    }
}

Set-Content -Path (Join-Path $dst "MEDIA_DIMENSIONS.txt") -Value $lines -Encoding UTF8

$readme = @(
    "# Om 2 UI Screenshot Set (2026-03-09)",
    "",
    "This folder contains 20 curated UI screenshots covering the main user-facing screens of the current Android app build.",
    "",
    "Included screens:",
    "1. Login",
    "2. Register",
    "3. Onboarding",
    "4. Home",
    "5. Prayer Library",
    "6. Prayer Player",
    "7. Now Playing",
    "8. Deity Detail",
    "9. Deity Learn",
    "10. Temple",
    "11. Puja Detail",
    "12. Waitlist Join",
    "13. My Pujas",
    "14. My Pujas Gifts",
    "15. Puja Video",
    "16. Calendar",
    "17. Festival Prep",
    "18. Profile",
    "19. Profile Contact",
    "20. Shared Prayer Create"
)

Set-Content -Path (Join-Path $dst "README.md") -Value $readme -Encoding UTF8
