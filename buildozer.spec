# Buildozer配置文件 - 用于打包Android APK
# 安装: pip install buildozer
# 打包: buildozer android debug

[app]
# 应用标题
title = 英语练习工具

# 包名
package.name = englishpractice

# 包域名
package.domain = com.example

# 源代码目录
source.dir = .

# 包含的文件
source.include_exts = py,html,css,js,db,txt,md,png,jpg,jpeg,gif

# 排除的文件
source.exclude_exts = spec,gitignore

# 版本号
version = 1.0.0

# 依赖项
requirements = python3,flask,flask-cors,jinja2,markupsafe,werkzeug,itsdangerous,click

# 图标 (可选)
# icon.filename = icon.png

# 启动图片 (可选)
# presplash.filename = presplash.png

# 方向
orientation = portrait

# 全屏
fullscreen = 0

# Android API版本
android.api = 33
android.minapi = 21
android.sdk = 33
android.ndk = 25b

# 固定build-tools版本，避免使用37
android.buildtools.version = 34.0.0

# Android权限
android.permissions = INTERNET,WRITE_EXTERNAL_STORAGE,READ_EXTERNAL_STORAGE,ACCESS_NETWORK_STATE

# Android架构
android.archs = arm64-v8a, armeabi-v7a

# Android SDK路径 - 使用环境变量或默认路径
# android.sdk_path = ~/.buildozer/android/platform/android-sdk
# android.ndk_path = ~/.buildozer/android/platform/android-ndk-r25b

# 额外的Android参数
android.add_aars = 
android.add_jars = 

# 添加Python库
android.add_p4a = 

# 服务
services = 

# 启动选项
# android.launch_mode = standard

[buildozer]
# Buildozer日志级别 (0=错误, 1=警告, 2=信息, 3=调试)
log_level = 2

# 警告模式
warn_on_root = 1

# 构建目录
build_dir = ./.buildozer

# bin目录
bin_dir = ./bin
