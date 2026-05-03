// ==================== 题库管理页面逻辑 ====================

let allBanks = [];
let currentFilter = 'all';

// 加载题库列表
async function loadBanks() {
    try {
        const response = await api('/api/banks');
        if (response.success) {
            allBanks = response.data;
            renderBanks();
        }
    } catch (error) {
        console.error('加载题库失败:', error);
        showToast('加载题库失败', 'error');
    }
}

// 渲染题库卡片
function renderBanks() {
    const grid = document.getElementById('banks-grid');
    
    // 过滤题库
    const filteredBanks = currentFilter === 'all' 
        ? allBanks 
        : allBanks.filter(b => b.type === currentFilter);
    
    if (filteredBanks.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">📁</div>
                <h3>暂无题库</h3>
                <p>点击右上角"新建题库"创建你的第一个题库</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredBanks.map(bank => `
        <div class="card bank-card" onclick="location.href='bank-detail.html?id=${bank.id}'">
            <div class="bank-card-type">
                <span class="tag ${getTypeTagClass(bank.type)}">${getTypeName(bank.type)}</span>
            </div>
            <div class="bank-card-content">
                <div class="bank-card-title">${bank.name}</div>
                <div class="bank-card-desc">${bank.description || '暂无描述'}</div>
                <div class="bank-card-stats">
                    <span class="bank-card-stat">
                        <span>❓</span> ${bank.question_count || 0} 题
                    </span>
                    <span class="bank-card-stat">
                        <span>📅</span> ${formatDate(bank.updated_at).split(' ')[0]}
                    </span>
                </div>
            </div>
            <div class="bank-card-actions" onclick="event.stopPropagation()">
                <button class="btn btn-sm btn-secondary" onclick="editBank(${bank.id})">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteBank(${bank.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 过滤题库
function filterBanks(type) {
    currentFilter = type;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === type) {
            btn.classList.add('active');
        }
    });
    
    renderBanks();
}

// 打开新建题库弹窗
function openBankModal() {
    document.getElementById('bank-modal').classList.remove('hidden');
    document.getElementById('bank-name').value = '';
    document.getElementById('bank-type').value = 'translation';
    document.getElementById('bank-desc').value = '';
}

// 关闭新建题库弹窗
function closeBankModal() {
    document.getElementById('bank-modal').classList.add('hidden');
}

// 创建题库
async function createBank() {
    const name = document.getElementById('bank-name').value.trim();
    const type = document.getElementById('bank-type').value;
    const description = document.getElementById('bank-desc').value.trim();
    
    if (!name) {
        showToast('请输入题库名称', 'error');
        return;
    }
    
    try {
        const response = await api('/api/banks', {
            method: 'POST',
            body: JSON.stringify({ name, type, description }),
        });
        
        if (response.success) {
            showToast('题库创建成功');
            closeBankModal();
            loadBanks();
        } else {
            showToast(response.message || '创建失败', 'error');
        }
    } catch (error) {
        console.error('创建题库失败:', error);
        showToast('创建题库失败', 'error');
    }
}

// 编辑题库
async function editBank(bankId) {
    const bank = allBanks.find(b => b.id === bankId);
    if (!bank) return;
    
    const newName = prompt('请输入新的题库名称:', bank.name);
    if (newName === null) return;
    
    const newDesc = prompt('请输入新的描述:', bank.description || '');
    if (newDesc === null) return;
    
    try {
        const response = await api(`/api/banks/${bankId}`, {
            method: 'PUT',
            body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
        });
        
        if (response.success) {
            showToast('题库更新成功');
            loadBanks();
        }
    } catch (error) {
        console.error('更新题库失败:', error);
        showToast('更新题库失败', 'error');
    }
}

// 删除题库
async function deleteBank(bankId) {
    const confirmed = await confirmDialog('确定要删除这个题库吗？题库中的所有题目也将被删除。');
    if (!confirmed) return;
    
    try {
        const response = await api(`/api/banks/${bankId}`, {
            method: 'DELETE',
        });
        
        if (response.success) {
            showToast('题库删除成功');
            loadBanks();
        }
    } catch (error) {
        console.error('删除题库失败:', error);
        showToast('删除题库失败', 'error');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadBanks();
});
