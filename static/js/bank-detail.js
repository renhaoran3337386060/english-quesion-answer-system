// ==================== 题库详情页面逻辑 ====================

let currentBankId = null;
let currentBank = null;
let questions = [];

// 获取URL参数
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// 加载题库详情
async function loadBankDetail() {
    currentBankId = getUrlParam('id');
    if (!currentBankId) {
        location.href = 'banks.html';
        return;
    }
    
    try {
        // 加载题库信息
        const banksRes = await api('/api/banks');
        currentBank = banksRes.data.find(b => b.id == currentBankId);
        
        if (!currentBank) {
            showToast('题库不存在', 'error');
            location.href = 'banks.html';
            return;
        }
        
        // 更新页面标题
        document.getElementById('bank-title').textContent = currentBank.name;
        document.title = `${currentBank.name} - 英语练习工具`;
        
        // 更新题库信息
        document.getElementById('bank-info').innerHTML = `
            <div class="bank-info-header">
                <div>
                    <div class="bank-info-title">${currentBank.name}</div>
                    <span class="tag ${getTypeTagClass(currentBank.type)}">${getTypeName(currentBank.type)}</span>
                </div>
            </div>
            <div class="bank-info-meta">
                <span>📅 创建于 ${formatDate(currentBank.created_at).split(' ')[0]}</span>
                <span>📝 ${currentBank.question_count || 0} 道题目</span>
                <span>🔄 ${formatDate(currentBank.updated_at).split(' ')[0]} 更新</span>
            </div>
        `;
        
        // 加载题目列表
        await loadQuestions();
    } catch (error) {
        console.error('加载题库详情失败:', error);
        showToast('加载题库详情失败', 'error');
    }
}

// 加载题目列表
async function loadQuestions() {
    try {
        const response = await api(`/api/banks/${currentBankId}/questions`);
        if (response.success) {
            questions = response.data;
            renderQuestions();
        }
    } catch (error) {
        console.error('加载题目失败:', error);
        showToast('加载题目失败', 'error');
    }
}

// 渲染题目列表
function renderQuestions() {
    const list = document.getElementById('questions-list');
    
    if (questions.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <h3>暂无题目</h3>
                <p>点击右上角"添加题目"开始添加</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = questions.map((q, index) => {
        const content = q.content;
        let preview = '';
        
        if (currentBank.type === 'translation') {
            preview = content.english ? content.english.substring(0, 100) + '...' : '无内容';
        } else if (currentBank.type === 'fillblank') {
            preview = content.text ? content.text.substring(0, 100) + '...' : '无内容';
        } else if (currentBank.type === 'synonym') {
            preview = content.sentence ? content.sentence.substring(0, 100) + '...' : '无内容';
        }
        
        return `
            <div class="question-item">
                <div class="question-item-content">
                    <span class="question-item-number">${index + 1}</span>
                    <span class="question-item-text">${preview}</span>
                </div>
                <div class="question-item-actions">
                    <button class="btn btn-sm btn-secondary" onclick="editQuestion(${q.id})">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.id})">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 打开添加题目弹窗
function openQuestionModal() {
    const modal = document.getElementById('question-modal');
    const form = document.getElementById('question-form');
    
    modal.classList.remove('hidden');
    
    // 根据题型生成表单
    if (currentBank.type === 'translation') {
        form.innerHTML = `
            <div class="form-group">
                <label>英文原文</label>
                <textarea id="q-english" rows="8" placeholder="输入英文原文，每段一行"></textarea>
                <div class="form-hint">每行输入一段，按回车换行</div>
            </div>
            <div class="form-group">
                <label>中文翻译</label>
                <textarea id="q-chinese" rows="8" placeholder="输入中文翻译，每段一行"></textarea>
                <div class="form-hint">每行输入一段，与英文段落对应</div>
            </div>
        `;
    } else if (currentBank.type === 'fillblank') {
        form.innerHTML = `
            <div class="form-group">
                <label>题目文本</label>
                <textarea id="q-text" rows="4" placeholder="输入题目文本，用 {{单词}} 标记填空位置"></textarea>
                <div class="form-hint">使用 <code>{{单词}}</code> 标记需要填空的位置</div>
            </div>
            <div class="form-group">
                <label>备选词汇（用逗号分隔）</label>
                <input type="text" id="q-options" placeholder="例如：apple, banana, orange, grape">
            </div>
            <div id="fillblank-preview" class="fillblank-preview"></div>
        `;
        
        // 实时预览
        document.getElementById('q-text').addEventListener('input', updateFillblankPreview);
    } else if (currentBank.type === 'synonym') {
        form.innerHTML = `
            <div class="form-group">
                <label>同义词对</label>
                <div id="synonym-pairs" class="synonym-pairs">
                    <div class="synonym-pair">
                        <input type="text" placeholder="单词1" class="synonym-word1">
                        <span class="synonym-pair-arrow">↔</span>
                        <input type="text" placeholder="同义词" class="synonym-word2">
                        <button class="synonym-pair-remove" onclick="this.parentElement.remove()">×</button>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary" onclick="addSynonymPair()" style="margin-top: 12px;">+ 添加词对</button>
            </div>
            <div class="form-group">
                <label>练习句子（用 {{目标词}} 标记）</label>
                <textarea id="q-sentence" rows="3" placeholder="输入包含目标词的句子"></textarea>
            </div>
            <div class="form-group">
                <label>目标词（需要替换的词）</label>
                <input type="text" id="q-target" placeholder="输入需要替换的目标词">
            </div>
        `;
    }
}

// 关闭添加题目弹窗
function closeQuestionModal() {
    document.getElementById('question-modal').classList.add('hidden');
}

// 更新填空预览
function updateFillblankPreview() {
    const text = document.getElementById('q-text').value;
    const preview = document.getElementById('fillblank-preview');
    
    if (!text) {
        preview.innerHTML = '';
        return;
    }
    
    // 替换 {{单词}} 为可视化标记
    const html = text.replace(/\{\{([^}]+)\}\}/g, '<span class="fillblank-blank">$1</span>');
    preview.innerHTML = html;
}

// 添加同义词对
function addSynonymPair() {
    const container = document.getElementById('synonym-pairs');
    const pair = document.createElement('div');
    pair.className = 'synonym-pair';
    pair.innerHTML = `
        <input type="text" placeholder="单词1" class="synonym-word1">
        <span class="synonym-pair-arrow">↔</span>
        <input type="text" placeholder="同义词" class="synonym-word2">
        <button class="synonym-pair-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(pair);
}

// 按段落划分（以换行为分隔）
function splitParagraphs(text) {
    return text.split('\n').map(s => s.trim()).filter(s => s);
}

// 保存题目
async function saveQuestion() {
    let content = {};
    
    if (currentBank.type === 'translation') {
        const englishText = document.getElementById('q-english').value.trim();
        const chineseText = document.getElementById('q-chinese').value.trim();
        
        if (!englishText || !chineseText) {
            showToast('请填写英文原文和中文翻译', 'error');
            return;
        }
        
        // 按段落划分（以换行为分隔）
        const englishParagraphs = splitParagraphs(englishText);
        const chineseParagraphs = splitParagraphs(chineseText);

        if (englishParagraphs.length === 0) {
            showToast('英文原文不能为空', 'error');
            return;
        }

        content = {
            english: englishParagraphs.join('\n'),
            chinese: chineseParagraphs.join('\n'),
            englishParagraphs: englishParagraphs,
            chineseParagraphs: chineseParagraphs
        };
    } else if (currentBank.type === 'fillblank') {
        const text = document.getElementById('q-text').value.trim();
        const options = document.getElementById('q-options').value.trim();
        
        if (!text || !options) {
            showToast('请填写题目文本和备选词汇', 'error');
            return;
        }
        
        content = { 
            text, 
            options: options.split(',').map(s => s.trim()).filter(s => s)
        };
    } else if (currentBank.type === 'synonym') {
        const pairs = [];
        document.querySelectorAll('.synonym-pair').forEach(pair => {
            const w1 = pair.querySelector('.synonym-word1').value.trim();
            const w2 = pair.querySelector('.synonym-word2').value.trim();
            if (w1 && w2) {
                pairs.push([w1, w2]);
            }
        });
        
        const sentence = document.getElementById('q-sentence').value.trim();
        const target = document.getElementById('q-target').value.trim();
        
        if (pairs.length === 0 || !sentence || !target) {
            showToast('请填写完整的同义词信息', 'error');
            return;
        }
        
        content = { pairs, sentence, target };
    }
    
    try {
        const response = await api(`/api/banks/${currentBankId}/questions`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
        
        if (response.success) {
            showToast('题目添加成功');
            closeQuestionModal();
            loadQuestions();
        }
    } catch (error) {
        console.error('添加题目失败:', error);
        showToast('添加题目失败', 'error');
    }
}

// 编辑题目
async function editQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    // 简化为重新添加，实际可以扩展为编辑功能
    showToast('编辑功能暂未实现，请删除后重新添加');
}

// 删除题目
async function deleteQuestion(questionId) {
    const confirmed = await confirmDialog('确定要删除这道题目吗？');
    if (!confirmed) return;
    
    try {
        const response = await api(`/api/questions/${questionId}`, {
            method: 'DELETE',
        });
        
        if (response.success) {
            showToast('题目删除成功');
            loadQuestions();
        }
    } catch (error) {
        console.error('删除题目失败:', error);
        showToast('删除题目失败', 'error');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadBankDetail();
});
