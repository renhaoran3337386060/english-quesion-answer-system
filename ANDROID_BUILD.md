# Android APK 打包指南

## 快速开始

### 方法一：Docker打包（推荐，最简单）

#### Windows用户

1. **安装Docker Desktop**
   - 下载地址：https://www.docker.com/products/docker-desktop
   - 安装并启动Docker Desktop

2. **双击运行打包脚本**
   ```
   docker-build.bat
   ```

3. **等待构建完成**
   - 首次构建需要30-60分钟（下载Android SDK）
   - 后续构建约5-10分钟

4. **获取APK文件**
   - 构建完成后，APK文件在 `bin/` 目录下

#### Mac/Linux用户

```bash
# 给脚本添加执行权限
chmod +x docker-build.sh

# 运行打包脚本
./docker-build.sh
```

---

### 方法二：GitHub Actions 云打包（无需本地环境）

1. **Fork或推送代码到GitHub仓库**

2. **启用GitHub Actions**
   - 进入仓库的 Actions 页面
   - 启用工作流

3. **触发构建**
   - 每次推送到main分支会自动构建
   - 或手动触发：Actions → Build Android APK → Run workflow

4. **下载APK**
   - 构建完成后，在Actions页面下载Artifacts
   - 或在Releases页面下载

---

### 方法三：WSL2 (Windows Subsystem for Linux)

1. **安装WSL2和Ubuntu**
   ```powershell
   # 以管理员身份运行PowerShell
   wsl --install
   wsl --install -d Ubuntu
   ```

2. **在WSL中配置环境**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装依赖
   sudo apt install -y python3-pip git zip unzip tar openjdk-17-jdk
   
   # 安装buildozer
   pip3 install buildozer
   ```

3. **进入项目目录并打包**
   ```bash
   cd /mnt/w/cursor/question
   python3 build_apk.py
   ```

---

## 常见问题

### Q: Docker打包失败，提示内存不足？

**A:** 增加Docker内存限制：
1. 打开Docker Desktop
2. Settings → Resources → Advanced
3. 内存设置为 4GB 或更高
4. 点击 Apply & Restart

### Q: 构建时间太长？

**A:** 这是正常的：
- 首次构建需要下载Android SDK（约2-5GB）
- 国内用户建议配置Docker镜像加速
- 后续构建会快很多（5-10分钟）

### Q: 如何配置Docker镜像加速？

**A:** 
1. 打开Docker Desktop
2. Settings → Docker Engine
3. 添加registry-mirrors：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```

### Q: APK安装后闪退？

**A:** 检查以下几点：
1. Android版本是否支持（需要Android 5.0+）
2. 是否允许安装未知来源应用
3. 查看logcat日志排查问题

### Q: 如何调试APK？

**A:**
```bash
# 连接手机，开启USB调试
adb install bin/englishpractice-1.0.0-arm64-v8a-debug.apk

# 查看日志
adb logcat | grep python
```

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `docker-build.bat` | Windows Docker打包脚本 |
| `docker-build.sh` | Linux/Mac Docker打包脚本 |
| `Dockerfile` | Docker镜像配置文件 |
| `buildozer.spec` | Buildozer打包配置 |
| `.github/workflows/build-apk.yml` | GitHub Actions工作流 |

---

## 技术支持

如有问题，请检查：
1. Docker是否正常运行
2. 网络连接是否正常
3. 磁盘空间是否充足（需要20GB+）
