$ErrorActionPreference = "Stop"

Write-Host "[audio-gate] Running audio/player unit tests..."
& .\gradlew :androidApp:testDebugUnitTest

$reportDir = "androidApp/build/test-results/testDebugUnitTest"
if (-not (Test-Path $reportDir)) {
  throw "[audio-gate] Missing test report directory: $reportDir"
}

$xmlFiles = Get-ChildItem -Path $reportDir -Filter "TEST-*.xml" -File -Recurse
if ($xmlFiles.Count -eq 0) {
  throw "[audio-gate] No test result XML files found."
}

$failed = @()
foreach ($file in $xmlFiles) {
  [xml]$xml = Get-Content -Path $file.FullName
  $suite = $xml.testsuite
  if ($suite -and [int]$suite.failures -gt 0 -or [int]$suite.errors -gt 0) {
    $failed += $file.FullName
  }
}

if ($failed.Count -gt 0) {
  Write-Host "[audio-gate] Failing test suites:"
  $failed | ForEach-Object { Write-Host " - $_" }
  throw "[audio-gate] Release gate failed."
}

Write-Host "[audio-gate] PASS - audio/player tests are clean."

