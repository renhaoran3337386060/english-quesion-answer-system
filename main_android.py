"""
英语练习工具 - Android版本入口
"""

import os
import sys
import webbrowser
import threading
import time

# Android路径适配
try:
    from android.storage import primary_external_storage_path
    from android.permissions import request_permissions, Permission
    
    # 请求权限
    request_permissions([
        Permission.INTERNET,
        Permission.WRITE_EXTERNAL_STORAGE,
        Permission.READ_EXTERNAL_STORAGE,
    ])
    
    # 设置Android工作目录
    android_path = primary_external_storage_path()
    os.chdir(android_path)
    
except ImportError:
    pass

# 修改工作目录（PyInstaller打包后）
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)

from app import run_app

def open_browser(port):
    """延迟打开浏览器"""
    time.sleep(3)
    url = f'http://127.0.0.1:{port}'
    print(f'应用已启动: {url}')
    
    try:
        webbrowser.open(url)
    except:
        pass

if __name__ == '__main__':
    print('=' * 50)
    print('英语练习工具 - Android版')
    print('=' * 50)
    
    # 启动浏览器
    port = 5000
    threading.Thread(target=open_browser, args=(port,), daemon=True).start()
    
    # 启动应用
    run_app(port)
