import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import re


class TranslationPracticeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("英语翻译练习工具")
        self.root.geometry("900x700")
        self.root.configure(bg="#f5f5f5")
        
        # 数据存储
        self.sentences = []
        self.current_index = 0
        
        # 设置样式
        self.setup_styles()
        
        # 创建界面
        self.create_widgets()
        
    def setup_styles(self):
        """设置自定义样式"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # 按钮样式
        style.configure('Primary.TButton',
                       font=('Microsoft YaHei', 11),
                       foreground='white',
                       background='#667eea',
                       padding=10)
        
        style.configure('Secondary.TButton',
                       font=('Microsoft YaHei', 10),
                       padding=8)
        
        # 标签样式
        style.configure('Title.TLabel',
                       font=('Microsoft YaHei', 16, 'bold'),
                       foreground='#333')
        
        style.configure('Subtitle.TLabel',
                       font=('Microsoft YaHei', 12, 'bold'),
                       foreground='#555')
        
        style.configure('Stats.TLabel',
                       font=('Microsoft YaHei', 11),
                       foreground='#666')
        
        style.configure('English.TLabel',
                       font=('Microsoft YaHei', 14),
                       foreground='#333',
                       wraplength=800)
        
        # 框架样式
        style.configure('Card.TFrame', background='white')
        
    def create_widgets(self):
        """创建界面组件"""
        # 主容器
        main_container = ttk.Frame(self.root, padding="20")
        main_container.pack(fill=tk.BOTH, expand=True)
        
        # 标题
        title_label = ttk.Label(main_container, 
                               text="英语翻译练习工具", 
                               style='Title.TLabel')
        title_label.pack(pady=(0, 20))
        
        # 创建笔记本（标签页）
        self.notebook = ttk.Notebook(main_container)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # 输入页面
        self.input_frame = ttk.Frame(self.notebook, padding="20")
        self.notebook.add(self.input_frame, text="输入文章")
        self.create_input_page()
        
        # 练习页面
        self.practice_frame = ttk.Frame(self.notebook, padding="20")
        self.notebook.add(self.practice_frame, text="翻译练习")
        self.create_practice_page()
        
    def create_input_page(self):
        """创建输入页面"""
        # 英文输入区域
        english_frame = ttk.LabelFrame(self.input_frame, 
                                       text="英文原文（每句一行，或用句号分隔）", 
                                       padding="10")
        english_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        self.english_text = scrolledtext.ScrolledText(
            english_frame, 
            wrap=tk.WORD, 
            font=('Microsoft YaHei', 11),
            height=8,
            padx=10,
            pady=10
        )
        self.english_text.pack(fill=tk.BOTH, expand=True)
        
        # 中文输入区域
        chinese_frame = ttk.LabelFrame(self.input_frame, 
                                       text="中文翻译（每句一行，与英文对应）", 
                                       padding="10")
        chinese_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        self.chinese_text = scrolledtext.ScrolledText(
            chinese_frame, 
            wrap=tk.WORD, 
            font=('Microsoft YaHei', 11),
            height=8,
            padx=10,
            pady=10
        )
        self.chinese_text.pack(fill=tk.BOTH, expand=True)
        
        # 按钮区域
        button_frame = ttk.Frame(self.input_frame)
        button_frame.pack(fill=tk.X, pady=(0, 10))
        
        start_btn = tk.Button(button_frame,
                             text="开始练习",
                             font=('Microsoft YaHei', 12, 'bold'),
                             bg='#667eea',
                             fg='white',
                             activebackground='#5a6fd6',
                             activeforeground='white',
                             padx=30,
                             pady=10,
                             cursor='hand2',
                             relief=tk.FLAT,
                             command=self.start_practice)
        start_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        clear_btn = tk.Button(button_frame,
                             text="清空内容",
                             font=('Microsoft YaHei', 11),
                             bg='#f0f0f0',
                             fg='#333',
                             activebackground='#e0e0e0',
                             padx=20,
                             pady=10,
                             cursor='hand2',
                             relief=tk.FLAT,
                             command=self.clear_input)
        clear_btn.pack(side=tk.LEFT)
        
        # 提示信息
        tips_frame = ttk.LabelFrame(self.input_frame, text="使用提示", padding="10")
        tips_frame.pack(fill=tk.X)
        
        tips_text = """• 将英文原文和中文翻译分别输入到上方文本框中
• 每句英文对应一行中文翻译
• 点击"开始练习"后，系统会逐句显示英文，隐藏中文翻译
• 点击被遮盖的翻译区域即可查看答案
• 快捷键：Ctrl+Enter 快速开始练习"""
        
        tips_label = ttk.Label(tips_frame, 
                              text=tips_text, 
                              font=('Microsoft YaHei', 10),
                              foreground='#666',
                              justify=tk.LEFT)
        tips_label.pack(anchor=tk.W)
        
        # 绑定快捷键
        self.root.bind('<Control-Return>', lambda e: self.start_practice())
        
    def create_practice_page(self):
        """创建练习页面"""
        # 统计信息区域
        self.stats_frame = ttk.LabelFrame(self.practice_frame, 
                                          text="练习统计", 
                                          padding="15")
        self.stats_frame.pack(fill=tk.X, pady=(0, 15))
        
        stats_inner = ttk.Frame(self.stats_frame)
        stats_inner.pack(fill=tk.X)
        
        self.total_label = ttk.Label(stats_inner, 
                                    text="总句数: 0", 
                                    style='Stats.TLabel')
        self.total_label.pack(side=tk.LEFT, padx=(0, 30))
        
        self.revealed_label = ttk.Label(stats_inner, 
                                       text="已查看: 0", 
                                       style='Stats.TLabel')
        self.revealed_label.pack(side=tk.LEFT, padx=(0, 30))
        
        self.hidden_label = ttk.Label(stats_inner, 
                                     text="未查看: 0", 
                                     style='Stats.TLabel')
        self.hidden_label.pack(side=tk.LEFT)
        
        # 控制按钮区域
        control_frame = ttk.Frame(self.practice_frame)
        control_frame.pack(fill=tk.X, pady=(0, 15))
        
        reveal_all_btn = tk.Button(control_frame,
                                  text="显示全部",
                                  font=('Microsoft YaHei', 10),
                                  bg='#667eea',
                                  fg='white',
                                  activebackground='#5a6fd6',
                                  padx=15,
                                  pady=5,
                                  cursor='hand2',
                                  relief=tk.FLAT,
                                  command=self.reveal_all)
        reveal_all_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        hide_all_btn = tk.Button(control_frame,
                                text="隐藏全部",
                                font=('Microsoft YaHei', 10),
                                bg='#f0f0f0',
                                fg='#333',
                                activebackground='#e0e0e0',
                                padx=15,
                                pady=5,
                                cursor='hand2',
                                relief=tk.FLAT,
                                command=self.hide_all)
        hide_all_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        reset_btn = tk.Button(control_frame,
                             text="重新开始",
                             font=('Microsoft YaHei', 10),
                             bg='#f0f0f0',
                             fg='#333',
                             activebackground='#e0e0e0',
                             padx=15,
                             pady=5,
                             cursor='hand2',
                             relief=tk.FLAT,
                             command=self.reset_practice)
        reset_btn.pack(side=tk.LEFT)
        
        # 句子显示区域（带滚动条）
        canvas_frame = ttk.Frame(self.practice_frame)
        canvas_frame.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(canvas_frame, bg='#f5f5f5', highlightthickness=0)
        scrollbar = ttk.Scrollbar(canvas_frame, orient="vertical", command=self.canvas.yview)
        self.sentences_frame = ttk.Frame(self.canvas, padding="10")
        
        self.sentences_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.sentences_frame, anchor="nw", width=840)
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 鼠标滚轮支持
        self.canvas.bind_all("<MouseWheel>", self.on_mousewheel)
        
    def on_mousewheel(self, event):
        """处理鼠标滚轮事件"""
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        
    def split_into_sentences(self, text):
        """将文本分割成句子"""
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        if len(lines) <= 1:
            # 尝试按句号分割
            sentences = re.split(r'[。\.]+', text)
            lines = [s.strip() for s in sentences if s.strip()]
        
        return lines
        
    def start_practice(self):
        """开始练习"""
        english_text = self.english_text.get("1.0", tk.END).strip()
        chinese_text = self.chinese_text.get("1.0", tk.END).strip()
        
        if not english_text or not chinese_text:
            messagebox.showwarning("提示", "请输入英文原文和中文翻译！")
            return
        
        english_sentences = self.split_into_sentences(english_text)
        chinese_sentences = self.split_into_sentences(chinese_text)
        
        if len(english_sentences) != len(chinese_sentences):
            messagebox.showerror("错误", 
                f"英文句子数 ({len(english_sentences)}) 与中文句子数 ({len(chinese_sentences)}) 不匹配，请检查输入！")
            return
        
        self.sentences = []
        for i, (eng, chn) in enumerate(zip(english_sentences, chinese_sentences)):
            self.sentences.append({
                'index': i + 1,
                'english': eng,
                'chinese': chn,
                'revealed': False
            })
        
        self.render_sentences()
        self.update_stats()
        self.notebook.select(1)  # 切换到练习页面
        
    def render_sentences(self):
        """渲染句子列表"""
        # 清空现有内容
        for widget in self.sentences_frame.winfo_children():
            widget.destroy()
        
        if not self.sentences:
            empty_label = ttk.Label(self.sentences_frame, 
                                   text="暂无练习内容，请先输入文章",
                                   font=('Microsoft YaHei', 12),
                                   foreground='#999')
            empty_label.pack(pady=50)
            return
        
        for item in self.sentences:
            # 句子卡片
            card = tk.Frame(self.sentences_frame, 
                           bg='white',
                           padx=20,
                           pady=15,
                           relief=tk.FLAT)
            card.pack(fill=tk.X, pady=(0, 10))
            
            # 添加边框效果
            card.configure(highlightbackground='#e0e0e0', 
                          highlightthickness=1)
            
            # 左侧彩色条
            left_bar = tk.Frame(card, bg='#667eea', width=4)
            left_bar.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 15))
            
            # 内容区域
            content_frame = tk.Frame(card, bg='white')
            content_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            
            # 序号和英文
            english_label = tk.Label(content_frame,
                                    text=f"{item['index']}. {item['english']}",
                                    font=('Microsoft YaHei', 13),
                                    bg='white',
                                    fg='#333',
                                    wraplength=750,
                                    justify=tk.LEFT,
                                    anchor=tk.W)
            english_label.pack(fill=tk.X, pady=(0, 10))
            
            # 翻译区域（可点击显示/隐藏）
            if item['revealed']:
                # 已显示状态
                translation_frame = tk.Frame(content_frame, bg='#e8f5e9', padx=10, pady=8)
                translation_frame.pack(fill=tk.X)
                
                translation_label = tk.Label(translation_frame,
                                            text=item['chinese'],
                                            font=('Microsoft YaHei', 12),
                                            bg='#e8f5e9',
                                            fg='#2e7d32',
                                            wraplength=730,
                                            justify=tk.LEFT)
                translation_label.pack(fill=tk.X)
                
                # 点击隐藏
                translation_frame.bind('<Button-1>', 
                                      lambda e, idx=item['index']-1: self.toggle_translation(idx))
                translation_label.bind('<Button-1>', 
                                      lambda e, idx=item['index']-1: self.toggle_translation(idx))
            else:
                # 隐藏状态（可点击显示）
                mask_frame = tk.Frame(content_frame, 
                                     bg='#667eea',
                                     padx=10, 
                                     pady=8,
                                     cursor='hand2')
                mask_frame.pack(fill=tk.X)
                
                mask_label = tk.Label(mask_frame,
                                     text="点击显示翻译",
                                     font=('Microsoft YaHei', 11, 'bold'),
                                     bg='#667eea',
                                     fg='white')
                mask_label.pack()
                
                # 点击显示
                mask_frame.bind('<Button-1>', 
                               lambda e, idx=item['index']-1: self.toggle_translation(idx))
                mask_label.bind('<Button-1>', 
                               lambda e, idx=item['index']-1: self.toggle_translation(idx))
                
    def toggle_translation(self, index):
        """切换翻译显示/隐藏状态"""
        self.sentences[index]['revealed'] = not self.sentences[index]['revealed']
        self.render_sentences()
        self.update_stats()
        
    def reveal_all(self):
        """显示所有翻译"""
        for item in self.sentences:
            item['revealed'] = True
        self.render_sentences()
        self.update_stats()
        
    def hide_all(self):
        """隐藏所有翻译"""
        for item in self.sentences:
            item['revealed'] = False
        self.render_sentences()
        self.update_stats()
        
    def reset_practice(self):
        """重置练习"""
        if messagebox.askyesno("确认", "确定要重新开始吗？当前进度将丢失。"):
            for item in self.sentences:
                item['revealed'] = False
            self.render_sentences()
            self.update_stats()
            self.notebook.select(0)  # 返回输入页面
            
    def update_stats(self):
        """更新统计信息"""
        total = len(self.sentences)
        revealed = sum(1 for item in self.sentences if item['revealed'])
        hidden = total - revealed
        
        self.total_label.config(text=f"总句数: {total}")
        self.revealed_label.config(text=f"已查看: {revealed}")
        self.hidden_label.config(text=f"未查看: {hidden}")
        
    def clear_input(self):
        """清空输入"""
        if messagebox.askyesno("确认", "确定要清空所有输入内容吗？"):
            self.english_text.delete("1.0", tk.END)
            self.chinese_text.delete("1.0", tk.END)


def main():
    root = tk.Tk()
    app = TranslationPracticeApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
