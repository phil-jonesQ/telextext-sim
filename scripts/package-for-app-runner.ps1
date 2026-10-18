param(
  [string]$OutputPath,
  [switch]$SourceOnly
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

$requiredPaths = @(
  'metadata.json',
  'package.json'
)

foreach ($relativePath in $requiredPaths) {
  if (-not (Test-Path (Join-Path $projectRoot $relativePath))) {
    throw "Required app file or folder is missing: $relativePath"
  }
}

if ($SourceOnly) {
  $relativePaths = @(
    'index.html',
    'metadata.json',
    'package.json',
    'package-lock.json',
    'public',
    'src',
    'tsconfig.json',
    'vite.config.ts'
  )
} else {
  Push-Location $projectRoot
  try {
    & npm.cmd ci --include=dev
    if ($LASTEXITCODE -ne 0) {
      throw "npm ci failed with exit code $LASTEXITCODE"
    }

    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
      throw "npm run build failed with exit code $LASTEXITCODE"
    }
  } finally {
    Pop-Location
  }

  if (-not (Test-Path (Join-Path $projectRoot 'dist\index.html'))) {
    throw 'Build completed without producing dist\index.html'
  }

  $relativePaths = @(
  'metadata.json',
  'package.json',
  'dist'
  )
}

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $archiveName = if ($SourceOnly) { 'teletext-sim-source-only.zip' } else { 'teletext-sim-prebuilt.zip' }
  $OutputPath = Join-Path (Split-Path -Parent $projectRoot) $archiveName
} elseif (-not [IO.Path]::IsPathRooted($OutputPath)) {
  $OutputPath = Join-Path (Get-Location) $OutputPath
}

$OutputPath = [IO.Path]::GetFullPath($OutputPath)
foreach ($relativePath in $relativePaths) {
  $sourcePath = [IO.Path]::GetFullPath((Join-Path $projectRoot $relativePath))
  if ($OutputPath -eq $sourcePath) {
    throw "Output path cannot replace app source: $relativePath"
  }
}

$outputDirectory = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

if (Test-Path $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

Push-Location $projectRoot
$archive = $null
try {
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem

  $archive = [IO.Compression.ZipFile]::Open($OutputPath, [IO.Compression.ZipArchiveMode]::Create)
  foreach ($relativePath in $relativePaths) {
    $sourcePath = Join-Path $projectRoot $relativePath
    $files = if ((Get-Item -LiteralPath $sourcePath).PSIsContainer) {
      Get-ChildItem -LiteralPath $sourcePath -File -Recurse
    } else {
      Get-Item -LiteralPath $sourcePath
    }

    foreach ($file in $files) {
      $entryName = $file.FullName.Substring($projectRoot.Length + 1).Replace('\', '/')
      $entry = $archive.CreateEntry($entryName, [IO.Compression.CompressionLevel]::Optimal)
      $input = [IO.File]::OpenRead($file.FullName)
      $output = $entry.Open()
      try {
        $input.CopyTo($output)
      } finally {
        $output.Dispose()
        $input.Dispose()
      }
    }
  }
} finally {
  if ($null -ne $archive) {
    $archive.Dispose()
  }
  Pop-Location
}

$archiveType = if ($SourceOnly) { 'source-only' } else { 'prebuilt' }
Write-Output "Created $archiveType app archive: $OutputPath"
