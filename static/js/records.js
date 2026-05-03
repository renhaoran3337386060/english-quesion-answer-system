// ==================== 练习记录页面逻辑 ====================

let records = [];

// 加载练习记录
async function loadRecords() {
    try {
        const response = await api('/api/records');
        if (response.success) {
            records = response.data;
            renderRecords();
        }
    } catch (error) {
        console.error('加载记录失败:', error);
        showToast('加载记录失败', 'error');
    }
}

// 渲染记录列表
function renderRecords() {
    const list = document.getElementById('records-list');
    
    if (records.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>暂无练习记录</h3>
                <p>完成练习后会自动保存记录</p>
            </div>
        `;
        return;
    }
    
    list.innerHTML = records.map(record => {
        const percentage = Math.round(record.score / record.total * 100);
        const typeIcons = {
            translation: '📝',
            fillblank: '🔤',
            synonym: '🔄',
        };
        
        return `
            <div class="record-item">
                <div class="record-icon ${record.type}">
                    ${typeIcons[record.type] || '✏️'}
                </div>
                <div class="record-content">
                    <div class="record-title">${record.bank_name}</div>
                    <div class="record-meta">
                        ${getTypeName(record.type)} · ${formatDate(record.created_at)}
                    </div>
                </div>
                <div class="record-score">
                    <div class="record-score-value">${percentage}</div>
                    <div class="record-score-label">分</div>
                </div>
                <div class="record-actions">
                    <button class="btn btn-sm btn-secondary" onclick="viewRecordDetail(${record.id})">详情</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${record.id})">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 查看记录详情
function viewRecordDetail(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    
    const percentage = Math.round(record.score / record.total * 100);
    const details = JSON.parse(record.details || '[]');
    
    const content = document.getElementById('record-detail-content');
    content.innerHTML = `
        <div class="record-detail-header">
            <div class="record-detail-score">${percentage}分</div>
            <div>${record.bank_name}</div>
        </div>
        <div class="record-detail-info">
            <div class="record-detail-item">
                <div class="record-detail-item-value">${record.score}</div>
                <div class="record-detail-item-label">正确</div>
            </div>
            <div class="record-detail-item">
                <div class="record-detail-item-value">${record.total - record.score}</div>
                <div class="record-detail-item-label">错误</div>
            </div>
            <div class="record-detail-item">
                <div class="record-detail-item-value">${record.total}</div>
                <div class="record-detail-item-label">总计</div>
            </div>
        </div>
    `;
    
    document.getElementById('record-detail-modal').classList.remove('hidden');
}

// 关闭记录详情
function closeRecordDetail() {
    document.getElementById('record-detail-modal').classList.add('hidden');
}

// 删除记录
async function deleteRecord(recordId) {
    const confirmed = await confirmDialog('确定要删除这条记录吗？');
    if (!confirmed) return;
    
    try {
        const response = await api(`/api/records/${recordId}`, {
            method: 'DELETE',
        });
        
        if (response.success) {
            showToast('记录删除成功');
            loadRecords();
        }
    } catch (error) {
        console.error('删除记录失败:', error);
        showToast('删除记录失败', 'error');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadRecords();
});
