@echo off
chcp 65001
cls
echo ========================================
echo English Practice Tool - Android APK Build
echo ========================================
echo.
echo This script will build Android APK using Docker
echo First build may take 30-60 minutes, please be patient
echo.
pause

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found. Please install Docker Desktop first.
    echo Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/3] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo OK
echo.

echo [2/3] Building APK...
echo First build will download Android SDK, taking 30-60 minutes
echo Please keep network connected, do not close window
echo.

python build_apk.py

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    echo Please check error messages above
    pause
    exit /b 1
)

echo.
echo [3/3] Build complete!
echo.
echo ========================================
echo APK location: bin\*.apk
echo ========================================
echo.
pause
