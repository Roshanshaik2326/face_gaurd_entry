# downloads face-api.js model files into public/models
param(
    [string]$Version = '0.22.2'
)

Set-StrictMode -Version Latest

$baseCandidates = @(
    "https://cdn.jsdelivr.net/npm/face-api.js@$Version/weights",
    "https://unpkg.com/face-api.js@$Version/weights",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master"
)

$files = @(
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1.bin',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1.bin',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1.bin',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1.bin'
)

$outDir = Join-Path -Path (Get-Location) -ChildPath 'public\models'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

Write-Host "Downloading face-api models into: $outDir"

foreach ($file in $files) {
    $downloaded = $false
    foreach ($base in $baseCandidates) {
        $url = "$base/$file"
        $dest = Join-Path $outDir $file
        try {
            Write-Host "Trying $url"
            Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -ErrorAction Stop
            $size = (Get-Item $dest).Length
            if ($size -gt 0) {
                Write-Host "Saved $file (from $base) - $size bytes"
                $downloaded = $true
                break
            } else {
                Write-Warning "$file downloaded but zero bytes from $base"
                Remove-Item $dest -ErrorAction SilentlyContinue
            }
        } catch {
            $msg = $_.Exception.Message -replace "\r|\n"," "
            Write-Warning ([string]::Format("Failed to download {0} from {1}: {2}", $file, $base, $msg))
            Start-Sleep -Milliseconds 200
        }
    }
    if (-not $downloaded) {
        Write-Error "Failed to download $file from all candidates. You may need to fetch it manually."
    }
}

Write-Host "Download script finished. Verify that public/models contains non-zero files."
