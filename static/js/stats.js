// ==================== 统计页面逻辑 ====================

// 加载统计数据
async function loadStats() {
    try {
        // 获取统计数据
        const statsRes = await api('/api/stats');
        const stats = statsRes.data || {};
        
        // 获取题库数量
        const banksRes = await api('/api/banks');
        const banks = banksRes.data || [];
        
        // 计算题目总数
        let questionCount = 0;
        for (const bank of banks) {
            questionCount += bank.question_count || 0;
        }
        
        // 更新统计卡片
        document.getElementById('stat-total').textContent = stats.total_practice || 0;
        document.getElementById('stat-banks').textContent = banks.length;
        document.getElementById('stat-questions').textContent = questionCount;
        
        // 渲染题型分布图
        renderTypeChart(stats.type_stats || {});
        
        // 加载最近活动
        loadRecentActivity();
    } catch (error) {
        console.error('加载统计数据失败:', error);
        showToast('加载统计数据失败', 'error');
    }
}

// 渲染题型分布图
function renderTypeChart(typeStats) {
    const container = document.getElementById('type-chart');
    
    const types = [
        { key: 'translation', name: '文章翻译', color: 'translation' },
        { key: 'fillblank', name: '选词填空', color: 'fillblank' },
        { key: 'synonym', name: '同义词替换', color: 'synonym' },
    ];
    
    const total = Object.values(typeStats).reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        container.innerHTML = '<div class="empty-state"><p>暂无数据</p></div>';
        return;
    }
    
    container.innerHTML = types.map(type => {
        const count = typeStats[type.key] || 0;
        const percentage = Math.round(count / total * 100);
        
        return `
            <div class="type-chart-item">
                <div class="type-chart-label">${type.name}</div>
                <div class="type-chart-bar">
                    <div class="type-chart-fill ${type.color}" style="width: ${percentage}%">
                        ${percentage > 10 ? `<span class="type-chart-value">${percentage}%</span>` : ''}
                    </div>
                </div>
                <div class="type-chart-count">${count}</div>
            </div>
        `;
    }).join('');
}

// 加载最近活动
async function loadRecentActivity() {
    try {
        const response = await api('/api/records');
        if (response.success) {
            const records = response.data.slice(0, 5); // 最近5条
            renderRecentActivity(records);
        }
    } catch (error) {
        console.error('加载最近活动失败:', error);
    }
}

// 渲染最近活动
function renderRecentActivity(records) {
    const container = document.getElementById('recent-activity');
    
    if (records.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>暂无活动</p></div>';
        return;
    }
    
    const typeIcons = {
        translation: '📝',
        fillblank: '🔤',
        synonym: '🔄',
    };
    
    container.innerHTML = records.map(record => {
        const percentage = Math.round(record.score / record.total * 100);
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${record.type}">
                    ${typeIcons[record.type] || '✏️'}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${record.bank_name}</div>
                    <div class="activity-time">${formatDate(record.created_at)}</div>
                </div>
                <div class="activity-score">${percentage}分</div>
            </div>
        `;
    }).join('');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
});
