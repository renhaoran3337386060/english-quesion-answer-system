"""
打包脚本 - 将应用打包成独立的 exe 文件
"""

import PyInstaller.__main__
import os
import shutil
import sys


def clean_build():
    """清理之前的构建文件"""
    dirs_to_remove = ['build', 'dist', '__pycache__']
    for dir_name in dirs_to_remove:
        if os.path.exists(dir_name):
            print(f"清理 {dir_name}...")
            shutil.rmtree(dir_name)
    
    # 删除 .spec 文件
    for file in os.listdir('.'):
        if file.endswith('.spec'):
            print(f"删除 {file}...")
            os.remove(file)


def build_exe():
    """打包 exe"""
    print("=" * 50)
    print("开始打包英语翻译练习工具")
    print("=" * 50)
    
    # 确保静态文件存在
    if not os.path.exists('static'):
        print("错误: static 文件夹不存在!")
        sys.exit(1)
    
    # PyInstaller 参数
    args = [
        'main.py',                          # 入口脚本
        '--name=英语翻译练习工具',           # 应用名称
        '--onefile',                        # 打包成单个文件
        '--windowed',                       # Windows 窗口应用（不显示控制台）
        '--icon=NONE',                      # 可以添加图标文件路径
        '--add-data=static;static',         # 包含静态文件
        '--add-data=app.py;.',              # 包含后端文件
        '--clean',                          # 清理临时文件
        '--noconfirm',                      # 不确认覆盖
        # 隐藏导入
        '--hidden-import=flask',
        '--hidden-import=flask_cors',
        '--hidden-import=sqlite3',
    ]
    
    print("打包参数:")
    for arg in args:
        print(f"  {arg}")
    print("=" * 50)
    
    try:
        PyInstaller.__main__.run(args)
        print("=" * 50)
        print("打包完成!")
        print(f"输出目录: {os.path.abspath('dist')}")
        print("=" * 50)
    except Exception as e:
        print(f"打包失败: {e}")
        sys.exit(1)


def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description='打包英语翻译练习工具')
    parser.add_argument('--clean', action='store_true', help='清理构建文件')
    args = parser.parse_args()
    
    if args.clean:
        clean_build()
        print("清理完成!")
        return
    
    # 先清理
    clean_build()
    
    # 然后打包
    build_exe()


if __name__ == '__main__':
    main()
