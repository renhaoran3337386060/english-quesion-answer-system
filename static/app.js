// 英语练习工具 - 前端逻辑

// ==================== 页面切换 ====================
function showPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    document.getElementById(`page-${pageName}`).classList.add('active');
}

// ==================== 文章翻译 ====================
let transData = [];

function startTranslation() {
    const enText = document.getElementById('trans-en').value.trim();
    const cnText = document.getElementById('trans-cn').value.trim();
    
    if (!enText || !cnText) {
        alert('请输入英文原文和中文翻译');
        return;
    }
    
    const enLines = enText.split('\n').filter(l => l.trim());
    const cnLines = cnText.split('\n').filter(l => l.trim());
    
    if (enLines.length !== cnLines.length) {
        alert(`英文句子数 (${enLines.length}) 与中文句子数 (${cnLines.length}) 不匹配`);
        return;
    }
    
    transData = enLines.map((en, i) => ({
        en: en.trim(),
        cn: cnLines[i].trim(),
        revealed: false
    }));
    
    renderTranslation();
    document.getElementById('translation-practice').classList.remove('hidden');
}

function renderTranslation() {
    const container = document.getElementById('trans-list');
    
    container.innerHTML = transData.map((item, idx) => `
        <div class="sentence-item">
            <div class="sentence-en">${idx + 1}. ${escapeHtml(item.en)}</div>
            <div class="sentence-cn ${item.revealed ? 'revealed' : ''}" onclick="toggleTrans(${idx})">
                ${item.revealed ? escapeHtml(item.cn) : ''}
            </div>
        </div>
    `).join('');
    
    updateTransProgress();
}

function toggleTrans(idx) {
    transData[idx].revealed = !transData[idx].revealed;
    renderTranslation();
}

function revealAllTrans() {
    transData.forEach(item => item.revealed = true);
    renderTranslation();
}

function hideAllTrans() {
    transData.forEach(item => item.revealed = false);
    renderTranslation();
}

function updateTransProgress() {
    const total = transData.length;
    const revealed = transData.filter(i => i.revealed).length;
    
    document.getElementById('trans-progress').textContent = `${revealed}/${total}`;
    document.getElementById('trans-bar').style.width = total > 0 ? `${(revealed/total)*100}%` : '0%';
}

// ==================== 选词填空 ====================
let fillData = {
    text: '',
    blanks: [],
    words: [],
    answers: {}
};

function startFillBlank() {
    const text = document.getElementById('fill-en').value.trim();
    const wordsText = document.getElementById('fill-words').value.trim();
    
    if (!text || !wordsText) {
        alert('请输入英文文章和备选词汇');
        return;
    }
    
    // 解析填空
    const blankRegex = /\{\{(.*?)\}\}/g;
    const blanks = [];
    let match;
    while ((match = blankRegex.exec(text)) !== null) {
        blanks.push({
            answer: match[1].trim(),
            index: blanks.length
        });
    }
    
    if (blanks.length === 0) {
        alert('未找到填空标记，请使用 {{单词}} 格式标记填空位置');
        return;
    }
    
    // 解析词汇
    const words = wordsText.split(/[,，\n]/).map(w => w.trim()).filter(w => w);
    
    fillData = {
        text: text,
        blanks: blanks,
        words: words,
        answers: {}
    };
    
    renderFillBlank();
    document.getElementById('fillblank-practice').classList.remove('hidden');
}

function renderFillBlank() {
    // 渲染词库
    const wordBank = document.getElementById('word-bank');
    wordBank.innerHTML = fillData.words.map(word => `
        <span class="word-chip" onclick="selectWord('${word}')">${word}</span>
    `).join('');
    
    // 渲染文章
    let content = fillData.text;
    fillData.blanks.forEach((blank, idx) => {
        const answer = fillData.answers[idx] || '';
        const filledClass = answer ? 'filled' : '';
        content = content.replace(
            `{{${blank.answer}}}`,
            `<span class="fill-blank ${filledClass}" id="blank-${idx}" onclick="fillBlank(${idx})">${answer}</span>`
        );
    });
    
    document.getElementById('fillblank-content').innerHTML = content;
}

let selectedWord = null;

function selectWord(word) {
    selectedWord = word;
    document.querySelectorAll('.word-chip').forEach(chip => {
        chip.classList.toggle('used', chip.textContent === word);
    });
}

function fillBlank(idx) {
    if (!selectedWord) {
        alert('请先从上方词库中选择一个单词');
        return;
    }
    
    fillData.answers[idx] = selectedWord;
    renderFillBlank();
}

function checkFillBlank() {
    fillData.blanks.forEach((blank, idx) => {
        const el = document.getElementById(`blank-${idx}`);
        const userAnswer = fillData.answers[idx];
        
        if (!userAnswer) {
            el.classList.add('wrong');
        } else if (userAnswer.toLowerCase() === blank.answer.toLowerCase()) {
            el.classList.add('correct');
        } else {
            el.classList.add('wrong');
            el.title = `正确答案: ${blank.answer}`;
        }
    });
}

// ==================== 同义词替换 ====================
let synData = {
    sentences: [],
    pairs: {},
    answers: {}
};

function startSynonym() {
    const sentencesText = document.getElementById('syn-sentences').value.trim();
    const pairsText = document.getElementById('syn-pairs').value.trim();
    
    if (!sentencesText || !pairsText) {
        alert('请输入英文句子和同义词对');
        return;
    }
    
    // 解析句子
    const sentences = sentencesText.split('\n').filter(s => s.trim()).map(s => s.trim());
    
    // 解析同义词对
    const pairs = {};
    pairsText.split('\n').forEach(line => {
        const parts = line.split('=').map(p => p.trim());
        if (parts.length === 2) {
            pairs[parts[0].toLowerCase()] = parts[1];
        }
    });
    
    if (Object.keys(pairs).length === 0) {
        alert('未找到有效的同义词对，格式应为：原词 = 替换词');
        return;
    }
    
    // 为每个句子找到要替换的词
    const sentenceData = sentences.map((sent, idx) => {
        const words = sent.split(/\s+/);
        let targetWord = null;
        let targetIndex = -1;
        
        for (let i = 0; i < words.length; i++) {
            const cleanWord = words[i].toLowerCase().replace(/[^a-z]/g, '');
            if (pairs[cleanWord]) {
                targetWord = cleanWord;
                targetIndex = i;
                break;
            }
        }
        
        return {
            original: sent,
            targetWord: targetWord,
            synonym: targetWord ? pairs[targetWord] : null,
            index: idx
        };
    }).filter(s => s.targetWord);
    
    if (sentenceData.length === 0) {
        alert('句子中没有找到可替换的词汇');
        return;
    }
    
    synData = {
        sentences: sentenceData,
        pairs: pairs,
        answers: {}
    };
    
    renderSynonym();
    document.getElementById('synonym-practice').classList.remove('hidden');
}

function renderSynonym() {
    // 显示提示
    const hints = synData.sentences.map(s => `${s.targetWord} → ?`).join(', ');
    document.getElementById('syn-hint-text').textContent = hints;
    
    // 渲染句子
    const container = document.getElementById('synonym-list');
    container.innerHTML = synData.sentences.map(item => {
        const highlightedText = item.original.replace(
            new RegExp(`\\b${item.targetWord}\\b`, 'gi'),
            `<span class="highlight">${item.targetWord}</span>`
        );
        
        return `
            <div class="synonym-item">
                <div class="synonym-original">${highlightedText}</div>
                <div class="synonym-answer">
                    <input type="text" 
                           id="syn-answer-${item.index}" 
                           placeholder="输入替换词..."
                           onkeypress="if(event.key==='Enter')checkSynonym(${item.index})">
                    <button class="check-btn" onclick="checkSynonym(${item.index})">检查</button>
                </div>
            </div>
        `;
    }).join('');
}

function checkSynonym(idx) {
    const input = document.getElementById(`syn-answer-${idx}`);
    const answer = input.value.trim().toLowerCase();
    const item = synData.sentences.find(s => s.index === idx);
    
    if (!answer) return;
    
    if (answer === item.synonym.toLowerCase()) {
        input.classList.add('correct');
        input.classList.remove('wrong');
    } else {
        input.classList.add('wrong');
        input.classList.remove('correct');
    }
}

// ==================== 工具函数 ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
