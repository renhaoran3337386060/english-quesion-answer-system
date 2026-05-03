"""
英语翻译练习工具 - 桌面应用入口
打包成 exe 后双击运行即可启动
"""

import sys
import os
import webbrowser
import threading
import time
import socket

# 添加当前目录到路径
if getattr(sys, 'frozen', False):
    # 打包后的路径
    application_path = sys._MEIPASS
else:
    # 开发环境路径
    application_path = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, application_path)
os.chdir(application_path)

from app import run_app, app


def find_free_port():
    """查找可用端口"""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
    sock.close()
    return port


def open_browser(port):
    """延迟打开浏览器"""
    time.sleep(1.5)
    url = f'http://127.0.0.1:{port}'
    webbrowser.open(url)


def main():
    """主函数"""
    print("=" * 50)
    print("英语翻译练习工具")
    print("=" * 50)
    print("正在启动服务...")
    
    # 查找可用端口
    port = find_free_port()
    
    # 在新线程中打开浏览器
    browser_thread = threading.Thread(target=open_browser, args=(port,))
    browser_thread.daemon = True
    browser_thread.start()
    
    print(f"服务将在 http://127.0.0.1:{port} 启动")
    print("正在启动，请稍候...")
    print("=" * 50)
    
    try:
        # 启动 Flask 应用
        from app import init_db
        init_db()
        
        # 使用 waitress 作为生产服务器（如果可用）
        try:
            from waitress import serve
            print("使用 Waitress 服务器")
            serve(app, host='127.0.0.1', port=port, threads=4)
        except ImportError:
            # 回退到 Flask 开发服务器
            print("使用 Flask 开发服务器")
            app.run(host='127.0.0.1', port=port, debug=False, threaded=True)
            
    except KeyboardInterrupt:
        print("\n服务已停止")
        sys.exit(0)
    except Exception as e:
        print(f"启动失败: {e}")
        input("按回车键退出...")
        sys.exit(1)


if __name__ == '__main__':
    main()
