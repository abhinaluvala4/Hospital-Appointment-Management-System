$ErrorActionPreference = 'Stop'
$version = '3.10.0'
$installRoot = Join-Path $env:USERPROFILE '.m2\wrapper\dists'
$installPath = Join-Path $installRoot "apache-maven-$version"
$mavenCommand = Join-Path $installPath 'bin\mvn.cmd'

if (Test-Path -LiteralPath $mavenCommand) { exit 0 }

New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
$archive = Join-Path $env:TEMP "apache-maven-$version-bin.zip"
$download = "https://dlcdn.apache.org/maven/maven-3/$version/binaries/apache-maven-$version-bin.zip"
try {
    Write-Host "Downloading Apache Maven $version..."
    Invoke-WebRequest -Uri $download -OutFile $archive
    Expand-Archive -LiteralPath $archive -DestinationPath $installRoot -Force
} catch {
    Write-Error "Could not download Maven. Check your internet connection and retry. $($_.Exception.Message)"
    exit 1
} finally {
    Remove-Item -LiteralPath $archive -Force -ErrorAction SilentlyContinue
}

if (-not (Test-Path -LiteralPath $mavenCommand)) {
    Write-Error "Maven extraction did not create $mavenCommand"
    exit 1
}
