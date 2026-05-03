"""
Android APK打包脚本 - 自动选择WSL模式
"""

import os
import sys
import subprocess

def build_with_wsl():
    """使用WSL2打包"""
    print("=" * 60)
    print("使用WSL2打包APK")
    print("=" * 60)
    
    # 检查WSL
    try:
        result = subprocess.run(['wsl', '--version'], capture_output=True, text=True)
        if result.returncode != 0:
            print("✗ WSL未安装")
            return False
    except:
        print("✗ WSL未安装")
        return False
    
    print("✓ WSL已安装")
    print("\n开始配置WSL环境...")
    print("-" * 60)
    
    # 安装依赖并打包
    wsl_script = """
cd /mnt/w/cursor/question

# 更新系统
sudo apt update -qq

# 安装必要依赖
sudo apt install -y -qq python3-pip git zip unzip tar openjdk-17-jdk

# 安装Python包
pip3 install -q buildozer flask flask-cors

# 开始构建
echo "开始构建APK..."
buildozer android debug
"""
    
    try:
        result = subprocess.run(['wsl', 'bash', '-c', wsl_script])
        return result.returncode == 0
    except Exception as e:
        print(f"✗ WSL构建失败: {e}")
        return False

def show_result():
    """显示构建结果"""
    print("\n" + "=" * 60)
    print("构建结果")
    print("=" * 60)
    
    bin_dir = 'bin'
    if os.path.exists(bin_dir):
        apks = [f for f in os.listdir(bin_dir) if f.endswith('.apk')]
        if apks:
            print("\n✓ APK构建成功!")
            print(f"\n生成的APK文件:")
            for apk in apks:
                apk_path = os.path.join(bin_dir, apk)
                size = os.path.getsize(apk_path) / (1024 * 1024)
                print(f"  {apk} ({size:.2f} MB)")
            print(f"\n位置: {os.path.abspath(bin_dir)}/")
            return True
    
    print("\n✗ 未找到APK文件")
    return False

if __name__ == '__main__':
    print("=" * 60)
    print("英语练习工具 - Android APK打包 (WSL模式)")
    print("=" * 60)
    
    success = build_with_wsl()
    
    if success:
        show_result()
        print("\n安装方法:")
        print("  1. 将APK传输到Android设备")
        print("  2. 允许安装未知来源应用")
        print("  3. 安装并运行")
    else:
        print("\n✗ 打包失败")
        print("\n建议:")
        print("  1. 确保WSL2已安装: wsl --install")
        print("  2. 确保Ubuntu已安装: wsl --install -d Ubuntu")
        print("  3. 或使用GitHub Actions云打包")
        sys.exit(1)
