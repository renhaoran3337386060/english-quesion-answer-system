"""
打包脚本 - 生成Windows EXE可执行文件
使用PyInstaller打包Flask应用为独立EXE
"""

import os
import sys
import shutil
import subprocess

def clean_build():
    """清理构建目录"""
    dirs_to_remove = ['build', 'dist', '__pycache__', '*.spec']
    for d in dirs_to_remove:
        if os.path.exists(d):
            if os.path.isdir(d):
                shutil.rmtree(d)
            else:
                os.remove(d)
    print("✓ 清理完成")

def build_exe():
    """使用PyInstaller打包EXE"""
    print("=" * 50)
    print("开始打包英语练习工具为EXE")
    print("=" * 50)
    
    # 清理旧文件
    clean_build()
    
    # PyInstaller参数
    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--name=英语练习工具',
        '--onefile',  # 打包成单个EXE文件
        '--windowed',  # 无控制台窗口
        '--add-data=static;static',  # 包含静态文件
        '--hidden-import=flask',
        '--hidden-import=flask_cors',
        '--hidden-import=sqlite3',
        '--hidden-import=datetime',
        '--hidden-import=json',
        '--hidden-import=re',
        '--hidden-import=socket',
        '--hidden-import=webbrowser',
        '--hidden-import=threading',
        '--hidden-import=time',
        'main.py'
    ]
    
    print("\n正在打包，请稍候...")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✓ 打包成功！")
            print("\n输出文件:")
            exe_path = os.path.join('dist', '英语练习工具.exe')
            if os.path.exists(exe_path):
                size = os.path.getsize(exe_path) / (1024 * 1024)
                print(f"  {exe_path} ({size:.2f} MB)")
                print("\n可以直接运行: dist\\英语练习工具.exe")
            return True
        else:
            print("✗ 打包失败")
            print("\n错误信息:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"✗ 打包出错: {e}")
        return False

def create_installer():
    """创建安装程序（可选）"""
    print("\n" + "=" * 50)
    print("创建便携版文件夹")
    print("=" * 50)
    
    # 创建便携版目录
    portable_dir = '英语练习工具-便携版'
    if os.path.exists(portable_dir):
        shutil.rmtree(portable_dir)
    os.makedirs(portable_dir)
    
    # 复制EXE文件
    exe_source = os.path.join('dist', '英语练习工具.exe')
    exe_dest = os.path.join(portable_dir, '英语练习工具.exe')
    if os.path.exists(exe_source):
        shutil.copy2(exe_source, exe_dest)
    
    # 创建说明文件
    readme_content = """英语练习工具 - 使用说明
========================

1. 直接运行"英语练习工具.exe"即可启动
2. 程序会自动打开浏览器访问应用
3. 数据库文件会自动创建在程序目录下

功能：
- 题库管理（文章翻译、选词填空、同义词替换）
- 开始练习
- 练习记录
- 学习统计

注意：
- 首次启动可能需要几秒钟
- 请勿删除或修改 english_practice.db 数据库文件
- 支持Windows 7/8/10/11

技术支持：
如有问题请重新运行程序或联系开发者
"""
    
    with open(os.path.join(portable_dir, '使用说明.txt'), 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    print(f"✓ 便携版已创建: {portable_dir}/")
    print(f"  包含: 英语练习工具.exe + 使用说明.txt")

if __name__ == '__main__':
    # 检查PyInstaller
    try:
        import PyInstaller
    except ImportError:
        print("正在安装PyInstaller...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pyinstaller'], check=True)
        print("✓ PyInstaller安装完成\n")
    
    # 打包
    if build_exe():
        create_installer()
        print("\n" + "=" * 50)
        print("打包完成！")
        print("=" * 50)
    else:
        print("\n打包失败，请检查错误信息")
        sys.exit(1)
