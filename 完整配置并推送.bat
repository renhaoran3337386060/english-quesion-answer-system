@echo off
chcp 65001
cls
echo ========================================
echo Git配置并推送到GitHub
echo ========================================
echo.

set GIT_PATH=w:\cursor\Git\cmd\git.exe

if not exist "%GIT_PATH%" (
    echo [ERROR] Git not found at %GIT_PATH%
    pause
    exit /b 1
)

echo Git路径: %GIT_PATH%
echo.

echo [1/8] 设置环境变量...
set PATH=%PATH%;w:\cursor\Git\cmd
echo OK
echo.

echo [2/8] 验证Git版本...
"%GIT_PATH%" --version
echo.

echo [3/8] 配置Git用户信息...
"%GIT_PATH%" config --global user.name "GitHub User"
"%GIT_PATH%" config --global user.email "user@example.com"
echo OK
echo.

echo [4/8] 初始化Git仓库...
if not exist .git (
    "%GIT_PATH%" init
    echo OK
) else (
    echo Already initialized
)
echo.

echo [5/8] 添加文件到暂存区...
"%GIT_PATH%" add .
echo OK
echo.

echo [6/8] 提交文件...
"%GIT_PATH%" commit -m "Initial commit for APK build"
if errorlevel 1 (
    echo No changes to commit or already committed
)
echo.

echo [7/8] 连接远程仓库...
"%GIT_PATH%" remote remove origin 2>nul
"%GIT_PATH%" remote add origin https://github.com/renhaoran3337386060/english-quesion-answer-system.git
echo OK
echo.

echo [8/8] 推送到GitHub...
"%GIT_PATH%" branch -M main
"%GIT_PATH%" push -u origin main

if errorlevel 1 (
    echo.
    echo Main branch failed, trying master...
    "%GIT_PATH%" branch -M master
    "%GIT_PATH%" push -u origin master
)

echo.
echo ========================================
if errorlevel 1 (
    echo Push failed!
    echo Please check:
    echo 1. GitHub repository exists
    echo 2. Username and password/token are correct
) else (
    echo Push successful!
    echo.
    echo Next steps:
    echo 1. Visit https://github.com/renhaoran3337386060/english-quesion-answer-system/actions
    echo 2. Wait for build to complete (15-30 min)
    echo 3. Download APK from Artifacts
)
echo ========================================
echo.
pause
