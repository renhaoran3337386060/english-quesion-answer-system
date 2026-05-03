# 打包指南

## 一、打包成 Windows EXE

### 方法一：一键打包（推荐）

双击运行 `一键打包.bat`，自动完成所有步骤。

### 方法二：手动打包

```bash
# 1. 安装依赖
pip install pyinstaller flask flask-cors

# 2. 运行打包脚本
python build_exe.py
```

### 输出文件

- `dist/英语练习工具.exe` - 单文件版本
- `英语练习工具-便携版/` - 便携版文件夹

### 分发方式

1. **单文件版**：直接发送 `英语练习工具.exe`
2. **便携版**：发送整个 `英语练习工具-便携版` 文件夹
3. **压缩包**：将便携版文件夹压缩为ZIP后发送

---

## 二、打包成 Android APK

### 环境要求

APK打包需要在 **Linux环境** 下进行，Windows用户有以下选择：

### 方法一：使用 WSL2 (推荐)

1. **安装WSL2**
   ```powershell
   # 以管理员身份运行PowerShell
   wsl --install
   ```

2. **安装Ubuntu**
   ```powershell
   wsl --install -d Ubuntu
   ```

3. **在WSL中打包**
   ```bash
   # 进入WSL
   wsl
   
   # 更新系统
   sudo apt update && sudo apt upgrade -y
   
   # 安装依赖
   sudo apt install -y python3-pip python3-venv git zip unzip tar openjdk-17-jdk
   
   # 安装buildozer
   pip3 install buildozer
   
   # 进入项目目录
   cd /mnt/w/cursor/question
   
   # 运行打包脚本
   python3 build_apk.py
   ```

### 方法二：使用 Docker

```bash
# 拉取buildozer镜像
docker pull kivy/buildozer

# 运行打包
docker run -it --rm \
  -v $(pwd):/home/user/app \
  kivy/buildozer \
  buildozer android debug
```

### 方法三：使用 GitHub Actions (云打包)

创建 `.github/workflows/build-apk.yml`:

```yaml
name: Build APK

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        sudo apt update
        sudo apt install -y python3-pip git zip unzip tar
        pip3 install buildozer
    
    - name: Build APK
      run: buildozer android debug
    
    - name: Upload APK
      uses: actions/upload-artifact@v2
      with:
        name: app-debug
        path: bin/*.apk
```

### 输出文件

- `bin/englishpractice-1.0.0-arm64-v8a_armeabi-v7a-debug.apk`

### 安装说明

1. 将APK文件传输到Android设备
2. 允许安装未知来源应用
3. 安装并运行

---

## 三、常见问题

### EXE打包问题

**Q: 打包后的EXE文件太大？**
A: 这是正常的，因为包含了Python解释器和所有依赖。可以使用UPX压缩减小体积。

**Q: 运行时提示缺少DLL？**
A: 确保在相同架构的系统上运行（x64 EXE需要在64位Windows上运行）。

**Q: 如何减小文件大小？**
```bash
# 使用UPX压缩
pip install upx-binary
pyinstaller --upx-dir=UPX_PATH main.py
```

### APK打包问题

**Q: Windows上可以直接打包APK吗？**
A: 不可以，Buildozer只支持Linux。请使用WSL2或Docker。

**Q: 打包时间太长？**
A: 首次打包需要下载Android SDK/NDK（约2-5GB），耗时30-60分钟。后续打包会快很多。

**Q: 打包失败提示内存不足？**
A: 增加WSL内存限制，在 `.wslconfig` 中设置：
```ini
[wsl2]
memory=8GB
processors=4
```

**Q: 国内下载SDK慢？**
A: 配置镜像源或使用代理。

---

## 四、文件说明

| 文件 | 说明 |
|------|------|
| `build_exe.py` | Windows EXE打包脚本 |
| `build_apk.py` | Android APK打包脚本 |
| `buildozer.spec` | Buildozer配置文件 |
| `一键打包.bat` | Windows一键打包批处理 |
| `README_BUILD.md` | 本文件 |

---

## 五、技术支持

如有问题，请检查：
1. Python版本是否为3.8+
2. 依赖是否完整安装
3. 磁盘空间是否充足（APK打包需要20GB+）
