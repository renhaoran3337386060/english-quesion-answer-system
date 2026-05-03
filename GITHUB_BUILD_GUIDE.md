# GitHub Actions 云打包指南

## 概述

使用GitHub Actions在云端自动构建Android APK，**无需本地配置任何环境**。

## 使用方法

### 第一步：创建GitHub仓库

1. 访问 https://github.com/new
2. 创建新仓库（如 `english-practice-tool`）
3. 选择 **Public**（公开）或 **Private**（私有）

### 第二步：推送代码到GitHub

```bash
# 初始化Git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/english-practice-tool.git

# 推送
git push -u origin main
```

### 第三步：触发自动构建

推送代码后，GitHub Actions会自动开始构建APK。

**查看构建状态：**
1. 打开GitHub仓库页面
2. 点击 **Actions** 标签
3. 查看构建进度

### 第四步：下载APK

构建完成后（约15-30分钟），有两种方式获取APK：

#### 方式A：从Artifacts下载
1. 进入 **Actions** 页面
2. 点击最新的工作流运行记录
3. 滚动到 **Artifacts** 部分
4. 点击 **android-apk** 下载

#### 方式B：从Releases下载（自动发布）
1. 进入仓库的 **Releases** 页面
2. 下载最新版本的APK文件

---

## 手动触发构建

如果不想推送代码，可以手动触发：

1. 进入 **Actions** 页面
2. 点击 **Build Android APK**
3. 点击 **Run workflow**
4. 选择分支，点击 **Run workflow**

---

## 构建时间

- **首次构建**：约15-30分钟（安装依赖）
- **后续构建**：约10-15分钟（有缓存）

---

## 常见问题

### Q: 构建失败怎么办？

A: 点击构建记录查看日志，常见问题：
- 网络问题：重新运行
- 配置错误：检查 `buildozer.spec` 文件

### Q: 如何修改应用名称？

A: 编辑 `buildozer.spec` 文件：
```ini
title = 你的应用名称
package.name = 你的包名
```

### Q: 私有仓库能用吗？

A: 可以，GitHub Actions对私有仓库也免费（有额度限制）。

### Q: APK文件在哪里？

A: 构建完成后：
- Artifacts中保留90天
- Releases中永久保留

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `.github/workflows/build-apk.yml` | GitHub Actions工作流配置 |
| `buildozer.spec` | Buildozer打包配置 |

---

## 优势

✅ 无需安装Docker/WSL  
✅ 无需配置Android SDK  
✅ 跨平台（Windows/Mac/Linux都能用）  
✅ 自动构建，推送即打包  
✅ 构建历史可追踪  
