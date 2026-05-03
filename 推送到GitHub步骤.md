# 推送到GitHub步骤

## 前提条件

1. 安装Git：https://git-scm.com/download/win
2. 安装后重启终端或电脑

## 步骤

### 1. 配置Git（首次使用）

打开CMD或PowerShell，运行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 2. 进入项目目录

```bash
cd W:\cursor\question
```

### 3. 初始化Git仓库

```bash
git init
```

### 4. 添加所有文件

```bash
git add .
```

### 5. 提交文件

```bash
git commit -m "Initial commit for APK build"
```

### 6. 连接远程仓库

```bash
git remote add origin https://github.com/renhaoran3337386060/english-quesion-answer-system.git
```

### 7. 推送到GitHub

```bash
git push -u origin main
```

如果提示输入用户名密码，输入你的GitHub账号和密码（或Token）。

### 8. 等待构建

推送完成后：

1. 访问 https://github.com/renhaoran3337386060/english-quesion-answer-system/actions
2. 等待15-30分钟构建完成
3. 下载APK文件

## 可能遇到的问题

### 问题1：提示需要登录

**解决**：使用GitHub Token代替密码

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token**
3. 勾选 **repo** 权限
4. 生成Token并复制
5. 推送时密码栏输入这个Token

### 问题2：提示分支名不同

如果main推送失败，尝试：

```bash
git push -u origin master
```

或先查看当前分支：

```bash
git branch
```

### 问题3：远程仓库已存在

```bash
git remote remove origin
git remote add origin https://github.com/renhaoran3337386060/english-quesion-answer-system.git
```

## 验证推送成功

访问 https://github.com/renhaoran3337386060/english-quesion-answer-system

应该能看到所有代码文件。

## 下载APK

1. 访问 https://github.com/renhaoran3337386060/english-quesion-answer-system/actions
2. 点击最新的工作流运行
3. 等待状态变为 ✅ 绿色
4. 滚动到 **Artifacts** 部分
5. 点击 **android-apk** 下载
