"""
Android APK打包脚本
使用Buildozer将Flask应用打包为Android APK

支持三种方式:
1. Docker (推荐) - Windows/Mac/Linux
2. WSL2 - Windows
3. 本地Linux - Linux
"""

import os
import sys
import subprocess
import platform

def check_environment():
    """检查打包环境"""
    print("=" * 60)
    print("检查Android打包环境")
    print("=" * 60)
    
    current_os = platform.system()
    print(f"\n当前操作系统: {current_os}")
    
    # 检查Docker
    try:
        subprocess.run(['docker', '--version'], capture_output=True, check=True)
        print("✓ Docker已安装")
        return 'docker'
    except:
        pass
    
    # 检查WSL
    if current_os == "Windows":
        try:
            subprocess.run(['wsl', '--version'], capture_output=True, check=True)
            print("✓ WSL已安装")
            return 'wsl'
        except:
            pass
    
    # 检查是否为Linux
    if current_os == "Linux":
        return 'linux'
    
    return None

def build_with_docker():
    """使用Docker打包"""
    print("\n" + "=" * 60)
    print("使用Docker打包APK")
    print("=" * 60)
    
    # 检查Docker运行状态
    try:
        subprocess.run(['docker', 'info'], capture_output=True, check=True)
    except:
        print("✗ Docker未运行，请先启动Docker Desktop")
        return False
    
    # 创建bin目录
    os.makedirs('bin', exist_ok=True)
    
    # 构建命令
    cmd = [
        'docker', 'run', '--rm', '-it',
        '-v', f'{os.getcwd()}:/home/user/app',
        '-v', f'{os.getcwd()}/bin:/home/user/app/bin',
        'kivy/buildozer:latest',
        'bash', '-c',
        'pip3 install --user flask flask-cors && buildozer android debug'
    ]
    
    print("\n开始构建（首次需要30-60分钟）...")
    print("-" * 60)
    
    try:
        result = subprocess.run(cmd)
        return result.returncode == 0
    except Exception as e:
        print(f"✗ Docker构建失败: {e}")
        return False

def build_with_wsl():
    """使用WSL2打包"""
    print("\n" + "=" * 60)
    print("使用WSL2打包APK")
    print("=" * 60)
    
    # 在WSL中运行打包
    wsl_cmd = """
    cd /mnt/w/cursor/question && 
    sudo apt update && 
    sudo apt install -y python3-pip git zip unzip tar openjdk-17-jdk && 
    pip3 install buildozer flask flask-cors && 
    buildozer android debug
    """
    
    cmd = ['wsl', 'bash', '-c', wsl_cmd]
    
    print("\n在WSL2中开始构建...")
    print("-" * 60)
    
    try:
        result = subprocess.run(cmd)
        return result.returncode == 0
    except Exception as e:
        print(f"✗ WSL构建失败: {e}")
        return False

def build_native():
    """本地Linux打包"""
    print("\n" + "=" * 60)
    print("本地Linux打包APK")
    print("=" * 60)
    
    # 检查buildozer
    try:
        subprocess.run(['buildozer', '--version'], capture_output=True, check=True)
    except:
        print("正在安装Buildozer...")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', 'buildozer'], check=True)
            print("✓ Buildozer安装完成")
        except:
            print("✗ Buildozer安装失败")
            return False
    
    # 构建
    print("\n开始构建...")
    print("-" * 60)
    
    try:
        result = subprocess.run(['buildozer', 'android', 'debug'])
        return result.returncode == 0
    except Exception as e:
        print(f"✗ 构建失败: {e}")
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
            print("\n安装方法:")
            print("  1. 将APK传输到Android设备")
            print("  2. 允许安装未知来源应用")
            print("  3. 安装并运行")
            return True
    
    print("\n✗ 未找到APK文件")
    return False

if __name__ == '__main__':
    print("=" * 60)
    print("英语练习工具 - Android APK打包")
    print("=" * 60)
    
    # 检查环境
    env = check_environment()
    
    if env == 'docker':
        print("\n推荐使用Docker打包")
        success = build_with_docker()
    elif env == 'wsl':
        print("\n检测到WSL，可以使用WSL打包")
        print("或继续使用Docker打包")
        choice = input("\n选择打包方式 (1=Docker, 2=WSL): ").strip()
        if choice == '2':
            success = build_with_wsl()
        else:
            success = build_with_docker()
    elif env == 'linux':
        print("\n检测到Linux系统")
        success = build_native()
    else:
        print("\n✗ 未检测到可用的打包环境")
        print("\n请选择以下方式之一:")
        print("  1. 安装Docker Desktop")
        print("  2. 安装WSL2 + Ubuntu")
        print("  3. 使用GitHub Actions云打包")
        print("\n详细说明请查看: ANDROID_BUILD.md")
        sys.exit(1)
    
    # 显示结果
    if success:
        show_result()
    else:
        print("\n✗ 打包失败")
        print("\n常见问题:")
        print("  - 首次构建需要下载Android SDK，耗时30-60分钟")
        print("  - 确保网络连接正常")
        print("  - 确保磁盘空间充足（20GB+）")
        print("  - 查看 .buildozer/android/platform/build-arm64-v8a_armeabi-v7a/build.log 了解详细错误")
        sys.exit(1)
