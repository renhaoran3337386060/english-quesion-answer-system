# 英语翻译练习工具

一个完整的桌面应用程序，用于英语文章翻译练习。支持输入英文原文和中文翻译，逐句显示英文并隐藏中文翻译，点击后显示答案。

## 项目结构

```
.
├── app.py                 # Flask 后端 API
├── main.py               # 桌面应用入口
├── build.py              # 打包脚本
├── requirements.txt      # Python 依赖
├── translation.db        # SQLite 数据库（自动创建）
├── static/               # 前端文件
│   ├── index.html       # 主页面
│   ├── style.css        # 样式文件
│   └── app.js           # 前端逻辑
└── README.md            # 说明文档
```

## 功能特点

- **文章管理**: 创建、编辑、删除文章
- **翻译练习**: 逐句显示英文，隐藏中文翻译
- **进度追踪**: 实时统计已查看/未查看数量
- **数据持久化**: SQLite 数据库保存所有数据
- **独立运行**: 可打包成单个 exe 文件

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 运行开发版本

```bash
python main.py
```

程序会自动打开浏览器访问应用。

### 3. 打包成 exe

```bash
python build.py
```

打包完成后，`dist/英语翻译练习工具.exe` 就是独立的可执行文件。

## 使用说明

1. **创建文章**
   - 点击"新建文章"
   - 输入文章标题
   - 输入英文原文（每句一行或用句号分隔）
   - 输入中文翻译（与英文对应）
   - 点击"开始练习"

2. **翻译练习**
   - 查看英文原文
   - 尝试自己翻译
   - 点击紫色区域查看答案
   - 再次点击可隐藏答案

3. **管理功能**
   - 显示/隐藏全部翻译
   - 重置练习进度
   - 编辑文章标题
   - 删除文章

## 技术栈

- **后端**: Python + Flask + SQLite
- **前端**: HTML5 + CSS3 + Vanilla JS
- **打包**: PyInstaller

## 数据库结构

### articles 表
- `id`: 文章ID
- `title`: 文章标题
- `created_at`: 创建时间
- `updated_at`: 更新时间

### sentences 表
- `id`: 句子ID
- `article_id`: 所属文章ID
- `sentence_index`: 句子序号
- `english`: 英文原文
- `chinese`: 中文翻译
- `revealed`: 是否已查看

## 注意事项

1. 打包后的 exe 文件可以复制到任何地方运行
2. 数据库文件 `translation.db` 会自动创建在程序所在目录
3. 建议定期备份数据库文件

## License

MIT License
