# Android APK打包Dockerfile
FROM kivy/buildozer:latest

# 设置工作目录
WORKDIR /home/user/app

# 复制项目文件
COPY . .

# 安装Python依赖
RUN pip3 install --user flask flask-cors

# 设置权限
RUN sudo chown -R user:user /home/user/app

# 默认命令
CMD ["buildozer", "android", "debug"]
