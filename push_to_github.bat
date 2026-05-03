@echo off
chcp 65001
cls
echo ========================================
echo Push to GitHub for Cloud Build
echo ========================================
echo.

REM Check git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git not found. Please install Git first.
    echo Download: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/4] Initializing Git...
if not exist .git (
    git init
    echo OK
) else (
    echo Already initialized
)
echo.

echo [2/4] Adding files...
git add .
echo OK
echo.

echo [3/4] Committing...
git commit -m "Update for APK build"
echo OK
echo.

echo [4/4] Checking remote...
git remote -v >nul 2>&1
if errorlevel 1 (
    echo.
    echo Please set up GitHub repository first:
    echo 1. Create repo at https://github.com/new
    echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
    echo 3. Run this script again
    pause
    exit /b 1
)

echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo [ERROR] Push failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Push successful!
echo.
echo Next steps:
echo 1. Visit https://github.com/YOUR_USERNAME/REPO_NAME/actions
echo 2. Wait for build to complete (15-30 min)
echo 3. Download APK from Artifacts
echo ========================================
echo.
pause
