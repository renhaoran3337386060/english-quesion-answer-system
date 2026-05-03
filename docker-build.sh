#!/bin/bash
# Android APK Docker打包脚本 (Linux/Mac)

echo "========================================"
echo "Android APK Docker打包脚本"
echo "========================================"
echo

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "[错误] 未找到Docker，请先安装Docker"
    echo "下载地址: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "[1/4] 检查Docker环境..."
if ! docker info &> /dev/null; then
    echo "[错误] Docker未启动，请先启动Docker"
    exit 1
fi
echo "✓ Docker运行正常"
echo

echo "[2/4] 拉取Buildozer镜像..."
docker pull kivy/buildozer:latest
if [ $? -ne 0 ]; then
    echo "[错误] 拉取镜像失败，请检查网络连接"
    exit 1
fi
echo "✓ 镜像拉取完成"
echo

echo "[3/4] 构建APK（这可能需要30-60分钟）..."
echo "首次构建会下载Android SDK，请耐心等待..."
echo

# 创建输出目录
mkdir -p bin

# 运行打包容器
docker run --rm -it \
  -v "$(pwd):/home/user/app" \
  -v "$(pwd)/bin:/home/user/app/bin" \
  kivy/buildozer:latest \
  bash -c "pip3 install --user flask flask-cors && buildozer android debug"

if [ $? -ne 0 ]; then
    echo
    echo "[错误] APK构建失败"
    exit 1
fi

echo
echo "[4/4] 构建完成！"
echo
echo "========================================"
echo "APK文件位置: bin/*.apk"
echo "========================================"
echo

# 显示生成的APK文件
echo "生成的APK文件:"
ls -lh bin/*.apk 2>/dev/null || echo "未找到APK文件"

echo
