// ==================== 练习页面逻辑 ====================

let banks = [];
let currentBank = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let practiceAnswers = [];
let fillblankSelections = {};

// 加载可练习的题库
async function loadPracticeBanks() {
    try {
        const response = await api('/api/banks');
        if (response.success) {
            banks = response.data.filter(b => b.question_count > 0);
            renderPracticeBanks();
        }
    } catch (error) {
        console.error('加载题库失败:', error);
        showToast('加载题库失败', 'error');
    }
}

// 渲染可练习的题库
function renderPracticeBanks() {
    const container = document.getElementById('practice-banks');
    
    if (banks.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">📁</div>
                <h3>暂无可练习的题库</h3>
                <p>请先<a href="banks.html">创建题库</a>并添加题目</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = banks.map(bank => `
        <div class="practice-bank-card" onclick="startPractice(${bank.id})">
            <div class="practice-bank-name">${bank.name}</div>
            <div class="practice-bank-info">
                ${getTypeName(bank.type)} · ${bank.question_count} 题
            </div>
        </div>
    `).join('');
}

// 开始练习
async function startPractice(bankId) {
    currentBank = banks.find(b => b.id === bankId);
    if (!currentBank) return;
    
    try {
        const response = await api(`/api/banks/${bankId}/questions`);
        if (response.success && response.data.length > 0) {
            currentQuestions = response.data;
            currentQuestionIndex = 0;
            practiceAnswers = [];
            fillblankSelections = {};
            
            // 切换界面
            document.getElementById('practice-select').classList.add('hidden');
            document.getElementById('practice-area').classList.remove('hidden');
            
            renderCurrentQuestion();
        } else {
            showToast('题库中没有题目', 'error');
        }
    } catch (error) {
        console.error('加载题目失败:', error);
        showToast('加载题目失败', 'error');
    }
}

// 渲染当前题目
function renderCurrentQuestion() {
    const container = document.getElementById('practice-area');
    const question = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length * 100).toFixed(0);
    
    let questionContent = '';
    
    if (currentBank.type === 'translation') {
        questionContent = renderTranslationQuestion(question);
    } else if (currentBank.type === 'fillblank') {
        questionContent = renderFillblankQuestion(question);
    } else if (currentBank.type === 'synonym') {
        questionContent = renderSynonymQuestion(question);
    }
    
    container.innerHTML = `
        <div class="practice-header">
            <div class="practice-progress">
                <div>题目 ${currentQuestionIndex + 1} / ${currentQuestions.length}</div>
                <div class="practice-progress-bar">
                    <div class="practice-progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="practice-actions">
                <button class="btn btn-secondary" onclick="exitPractice()">退出</button>
                ${currentQuestionIndex < currentQuestions.length - 1 
                    ? `<button class="btn btn-primary" onclick="nextQuestion()">下一题 →</button>`
                    : `<button class="btn btn-primary" onclick="finishPractice()">完成练习</button>`
                }
            </div>
        </div>
        ${questionContent}
    `;
}

// 渲染翻译题目
function renderTranslationQuestion(question) {
    const content = question.content;
    const englishLines = content.english.split('\n').filter(l => l.trim());
    const chineseLines = content.chinese.split('\n').filter(l => l.trim());

    // 按索引对齐显示，使用实际句子数量
    const maxLines = Math.max(englishLines.length, chineseLines.length);

    return `
        <div class="question-card">
            <div class="question-number">翻译练习</div>
            <div class="question-content">
                ${Array.from({length: maxLines}, (_, i) => `
                    <div class="translation-item">
                        <div class="translation-english">${englishLines[i] || ''}</div>
                        <div class="translation-chinese masked" onclick="this.classList.remove('masked')">
                            ${chineseLines[i] || ''}
                        </div>
                        <div class="translation-reveal-hint">点击显示翻译</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// 渲染填空题目
function renderFillblankQuestion(question) {
    const content = question.content;
    const text = content.text;
    const options = content.options || [];
    
    // 提取所有填空
    const blanks = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        blanks.push(match[1]);
    }
    
    // 替换填空为可点击区域
    let displayText = text;
    blanks.forEach((blank, index) => {
        const selected = fillblankSelections[`${question.id}_${index}`];
        displayText = displayText.replace(
            `{{${blank}}}`,
            `<span class="fillblank-blank ${selected ? 'filled' : ''}" 
                   data-index="${index}" 
                   onclick="selectBlank(${question.id}, ${index}, '${blank}')">
                ${selected || ''}
            </span>`
        );
    });
    
    return `
        <div class="question-card">
            <div class="question-number">选词填空</div>
            <div class="question-content">
                <div class="fillblank-text">${displayText}</div>
                <div class="fillblank-options">
                    ${options.map(opt => `
                        <span class="fillblank-option ${isOptionUsed(question.id, opt) ? 'used' : ''}" 
                              onclick="fillBlank(${question.id}, '${opt}')">${opt}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// 检查选项是否已被使用
function isOptionUsed(questionId, option) {
    return Object.values(fillblankSelections).includes(option);
}

// 选择填空位置
let selectedBlankIndex = null;
let selectedBlankQuestionId = null;

function selectBlank(questionId, index, answer) {
    selectedBlankQuestionId = questionId;
    selectedBlankIndex = index;
    
    // 高亮选中的填空
    document.querySelectorAll('.fillblank-blank').forEach(el => {
        el.style.borderColor = '';
    });
    event.target.style.borderColor = 'var(--primary)';
}

// 填充答案
function fillBlank(questionId, option) {
    if (selectedBlankQuestionId !== questionId || selectedBlankIndex === null) {
        showToast('请先点击选择一个填空位置', 'error');
        return;
    }
    
    fillblankSelections[`${questionId}_${selectedBlankIndex}`] = option;
    renderCurrentQuestion();
}

// 渲染同义词题目
function renderSynonymQuestion(question) {
    const content = question.content;
    const pairs = content.pairs || [];
    const sentence = content.sentence || '';
    const target = content.target || '';
    
    // 替换目标词
    const displaySentence = sentence.replace(
        new RegExp(target, 'g'),
        `<span class="synonym-target">${target}</span>`
    );
    
    return `
        <div class="question-card">
            <div class="question-number">同义词替换</div>
            
            <div class="synonym-study-card">
                <div class="synonym-study-title">学习以下同义词对：</div>
                <div class="synonym-pairs-list">
                    ${pairs.map(pair => `
                        <div class="synonym-pair-item">
                            <span class="synonym-word">${pair[0]}</span>
                            <span class="synonym-arrow">↔</span>
                            <span class="synonym-word">${pair[1]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="question-content">
                <div class="synonym-exercise">
                    请将句子中的 ${displaySentence} 替换为同义词
                </div>
                <div class="synonym-input-area">
                    <input type="text" id="synonym-answer" placeholder="输入同义词">
                    <button class="btn btn-primary" onclick="checkSynonymAnswer()">确认</button>
                </div>
                <div class="synonym-hint">提示：查看上方学习的同义词对</div>
            </div>
        </div>
    `;
}

// 检查同义词答案
function checkSynonymAnswer() {
    const input = document.getElementById('synonym-answer');
    const answer = input.value.trim();
    
    if (!answer) {
        showToast('请输入答案', 'error');
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const pairs = question.content.pairs || [];
    const target = question.content.target;
    
    // 检查答案是否正确
    let isCorrect = false;
    for (const pair of pairs) {
        if ((pair[0] === target && pair[1] === answer) ||
            (pair[1] === target && pair[0] === answer)) {
            isCorrect = true;
            break;
        }
    }
    
    practiceAnswers.push({
        questionId: question.id,
        answer: answer,
        correct: isCorrect,
    });
    
    if (isCorrect) {
        showToast('回答正确！');
        input.style.borderColor = 'var(--success)';
    } else {
        showToast('回答错误', 'error');
        input.style.borderColor = 'var(--danger)';
    }
    
    setTimeout(() => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
            nextQuestion();
        } else {
            finishPractice();
        }
    }, 1000);
}

// 下一题
function nextQuestion() {
    // 保存当前答案
    if (currentBank.type === 'fillblank') {
        const question = currentQuestions[currentQuestionIndex];
        const answers = [];
        let index = 0;
        while (fillblankSelections[`${question.id}_${index}`] !== undefined) {
            answers.push(fillblankSelections[`${question.id}_${index}`]);
            index++;
        }
        practiceAnswers.push({
            questionId: question.id,
            answers: answers,
        });
    }
    
    currentQuestionIndex++;
    renderCurrentQuestion();
}

// 退出练习
function exitPractice() {
    if (confirm('确定要退出练习吗？进度将不会保存。')) {
        location.reload();
    }
}

// 完成练习
async function finishPractice() {
    // 保存最后一题答案
    if (currentBank.type === 'fillblank') {
        const question = currentQuestions[currentQuestionIndex];
        const answers = [];
        let index = 0;
        while (fillblankSelections[`${question.id}_${index}`] !== undefined) {
            answers.push(fillblankSelections[`${question.id}_${index}`]);
            index++;
        }
        practiceAnswers.push({
            questionId: question.id,
            answers: answers,
        });
    }
    
    // 计算得分
    let score = 0;
    let total = currentQuestions.length;
    
    if (currentBank.type === 'fillblank') {
        // 填空题按空算分
        total = 0;
        score = 0;
        practiceAnswers.forEach((ans, idx) => {
            const question = currentQuestions[idx];
            const correctAnswers = [];
            const regex = /\{\{([^}]+)\}\}/g;
            let match;
            while ((match = regex.exec(question.content.text)) !== null) {
                correctAnswers.push(match[1]);
            }
            
            total += correctAnswers.length;
            ans.answers.forEach((a, i) => {
                if (a === correctAnswers[i]) score++;
            });
        });
    } else if (currentBank.type === 'synonym') {
        score = practiceAnswers.filter(a => a.correct).length;
    } else {
        // 翻译题默认满分
        score = total;
    }
    
    // 保存记录
    try {
        await api('/api/records', {
            method: 'POST',
            body: JSON.stringify({
                bank_id: currentBank.id,
                type: currentBank.type,
                score: score,
                total: total,
                details: practiceAnswers,
            }),
        });
    } catch (error) {
        console.error('保存记录失败:', error);
    }
    
    // 显示结果
    showResult(score, total);
}

// 显示结果
function showResult(score, total) {
    const container = document.getElementById('practice-area');
    const percentage = Math.round(score / total * 100);
    
    container.innerHTML = `
        <div class="practice-result">
            <div class="result-score">${percentage}</div>
            <div class="result-label">分</div>
            <div class="result-stats">
                <div class="result-stat">
                    <div class="result-stat-value">${score}</div>
                    <div class="result-stat-label">正确</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-value">${total - score}</div>
                    <div class="result-stat-label">错误</div>
                </div>
                <div class="result-stat">
                    <div class="result-stat-value">${total}</div>
                    <div class="result-stat-label">总计</div>
                </div>
            </div>
            <div class="practice-actions" style="justify-content: center;">
                <button class="btn btn-secondary" onclick="location.reload()">返回</button>
                <button class="btn btn-primary" onclick="location.href='records.html'">查看记录</button>
            </div>
        </div>
    `;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPracticeBanks();
});
