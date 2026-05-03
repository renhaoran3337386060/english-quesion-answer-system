@echo off
chcp 65001
cls
echo ========================================
echo Android APK Docker Build Script
echo ========================================
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found. Please install Docker Desktop first.
    echo Download: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/4] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo OK
echo.

echo [2/4] Pulling Buildozer image...
docker pull kivy/buildozer:latest
if errorlevel 1 (
    echo [ERROR] Failed to pull image. Check your network.
    pause
    exit /b 1
)
echo OK
echo.

echo [3/4] Building APK...
echo This may take 30-60 minutes for first build...
echo.

if not exist "bin" mkdir bin

docker run --rm -it -v "%cd%":/home/user/app -v "%cd%\bin":/home/user/app/bin kivy/buildozer:latest bash -c "pip3 install --user flask flask-cors && buildozer android debug"

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Build complete!
echo.
echo ========================================
echo APK location: bin\*.apk
echo ========================================
echo.

echo Generated APK files:
for %%f in (bin\*.apk) do (
    echo   - %%f
)

echo.
pause
