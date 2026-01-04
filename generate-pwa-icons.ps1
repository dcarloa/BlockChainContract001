# PWA Icon Generator for Ant Pool
# Requires: ImageMagick (install from https://imagemagick.org/)

# Check if ImageMagick is installed
if (!(Get-Command "magick" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ImageMagick no está instalado" -ForegroundColor Red
    Write-Host "📥 Descarga desde: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    Write-Host "O instala con chocolatey: choco install imagemagick" -ForegroundColor Yellow
    exit 1
}

# Source image (replace with your actual logo path)
$sourceImage = ".\frontend\assets\LogoAntPool.png"

if (!(Test-Path $sourceImage)) {
    Write-Host "❌ No se encontró el archivo fuente: $sourceImage" -ForegroundColor Red
    Write-Host "Por favor, asegúrate de tener el logo en la ruta correcta" -ForegroundColor Yellow
    exit 1
}

# Create assets directory if it doesn't exist
$assetsDir = ".\frontend\assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

Write-Host "🎨 Generando iconos PWA..." -ForegroundColor Cyan

# Define icon sizes
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)

foreach ($size in $sizes) {
    $outputFile = "$assetsDir\icon-$size.png"
    Write-Host "  ➜ Generando icon-$size.png..." -ForegroundColor Gray
    
    # Generate icon with ImageMagick
    & magick convert $sourceImage -resize "${size}x${size}" -background none -gravity center -extent "${size}x${size}" $outputFile
    
    if (Test-Path $outputFile) {
        Write-Host "  ✅ icon-$size.png creado" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Error creando icon-$size.png" -ForegroundColor Red
    }
}

# Generate favicon
Write-Host "  ➜ Generando favicon.ico..." -ForegroundColor Gray
& magick convert $sourceImage -resize "32x32" -background none "$assetsDir\favicon.ico"

if (Test-Path "$assetsDir\favicon.ico") {
    Write-Host "  ✅ favicon.ico creado" -ForegroundColor Green
} else {
    Write-Host "  ❌ Error creando favicon.ico" -ForegroundColor Red
}

# Generate maskable icon (PWA requirement)
Write-Host "  ➜ Generando maskable icon..." -ForegroundColor Gray
& magick convert $sourceImage -resize "512x512" -background "#667eea" -gravity center -extent "512x512" "$assetsDir\icon-512-maskable.png"

Write-Host ""
Write-Host "✅ ¡Iconos PWA generados exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📂 Archivos creados en: $assetsDir" -ForegroundColor Cyan
Write-Host "  - icon-72.png"
Write-Host "  - icon-96.png"
Write-Host "  - icon-128.png"
Write-Host "  - icon-144.png"
Write-Host "  - icon-152.png"
Write-Host "  - icon-192.png"
Write-Host "  - icon-384.png"
Write-Host "  - icon-512.png"
Write-Host "  - icon-512-maskable.png"
Write-Host "  - favicon.ico"
Write-Host ""
Write-Host "🚀 Siguiente paso: firebase deploy --only hosting" -ForegroundColor Yellow
