#!/bin/bash
# APK打包脚本 - 在WSL Linux文件系统中执行

# 设置环境变量，允许pip全局安装
export PIP_BREAK_SYSTEM_PACKAGES=1
export PATH=$PATH:/home/zut_rhr/.local/bin

# 删除之前的构建目录（如果存在）
rm -rf ~/android-build

# 创建Linux目录
mkdir -p ~/android-build

# 复制项目到Linux文件系统
cp -r /mnt/w/cursor/question/* ~/android-build/
cp -r /mnt/w/cursor/question/.git ~/android-build/ 2>/dev/null || true

# 进入Linux目录
cd ~/android-build

# 先安装buildozer需要的依赖
pip3 install appdirs colorama jinja2 'sh>=1.10,<2.0' build toml packaging setuptools

# 手动克隆python-for-android（强制使用HTTPS，带重试）
mkdir -p .buildozer/android/platform
cd .buildozer/android/platform

echo "正在下载python-for-android..."
for i in 1 2 3; do
    echo "尝试第 $i 次..."
    # 强制使用HTTPS
    if git clone --depth 1 -b master https://github.com/kivy/python-for-android.git python-for-android; then
        echo "下载成功！"
        break
    else
        echo "下载失败，等待10秒后重试..."
        rm -rf python-for-android 2>/dev/null
        sleep 10
    fi
done

cd ~/android-build

# 检查是否下载成功
if [ ! -d ".buildozer/android/platform/python-for-android" ]; then
    echo "ERROR: 无法下载python-for-android，请检查网络连接"
    exit 1
fi

# 开始打包APK
buildozer android debug

# 打包完成后复制回Windows
mkdir -p /mnt/w/cursor/question/bin
cp bin/*.apk /mnt/w/cursor/question/bin/ 2>/dev/null || echo "APK在 ~/android-build/bin/ 目录中，请手动复制"

echo "打包完成！"
echo "APK位置: ~/android-build/bin/"
