@echo off
chcp 65001
cls
echo ========================================
echo Push to GitHub
echo ========================================
echo.

set GIT_PATH=w:\cursor\Git\cmd\git.exe

if not exist "%GIT_PATH%" (
    echo [ERROR] Git not found at %GIT_PATH%
    pause
    exit /b 1
)

echo [1/4] Initializing Git...
if not exist .git (
    "%GIT_PATH%" init
    echo OK
) else (
    echo Already initialized
)
echo.

echo [2/4] Configuring Git...
"%GIT_PATH%" config user.name "User"
"%GIT_PATH%" config user.email "user@example.com"
echo OK
echo.

echo [3/4] Adding and committing files...
"%GIT_PATH%" add .
"%GIT_PATH%" commit -m "Initial commit for APK build"
echo OK
echo.

echo [4/4] Pushing to GitHub...
"%GIT_PATH%" remote add origin https://github.com/renhaoran3337386060/english-quesion-answer-system.git 2>nul

REM Get current branch
for /f "tokens=*" %%a in ('"%GIT_PATH%" branch --show-current 2^>nul') do set CURRENT_BRANCH=%%a

if "%CURRENT_BRANCH%"=="" (
    set CURRENT_BRANCH=main
    "%GIT_PATH%" checkout -b main 2>nul
)

echo Current branch: %CURRENT_BRANCH%
"%GIT_PATH%" push -u origin %CURRENT_BRANCH%

if errorlevel 1 (
    echo.
    echo Push failed. Trying with master branch...
    "%GIT_PATH%" checkout -b master 2>nul
    "%GIT_PATH%" push -u origin master
)

echo.
echo ========================================
echo Push completed!
echo ========================================
echo.
pause
