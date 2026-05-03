@echo off
chcp 65001
cls
echo ========================================
echo Android APK Build - WSL Mode
echo ========================================
echo.
echo This will use WSL2 to build APK
echo First build may take 30-60 minutes
echo.
pause

python build_apk_auto.py

if errorlevel 1 (
    echo.
    echo Build failed!
    pause
    exit /b 1
)

echo.
pause
