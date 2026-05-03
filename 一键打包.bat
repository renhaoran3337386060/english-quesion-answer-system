@echo off
chcp 65001
cls
echo ========================================
echo English Practice Tool - Windows EXE Build
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
pip install pyinstaller flask flask-cors -q
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo OK
echo.

echo [2/3] Building EXE...
python build_exe.py
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo.

echo [3/3] Build complete!
echo.
echo ========================================
echo Output files:
echo   - dist\EnglishPractice.exe
echo   - EnglishPractice-Portable\
echo ========================================
echo.
pause
