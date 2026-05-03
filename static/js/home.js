// ==================== 首页逻辑 ====================

// 加载统计数据
async function loadQuickStats() {
    try {
        // 获取题库数量
        const banksRes = await api('/api/banks');
        const banks = banksRes.data || [];
        
        // 获取练习记录
        const recordsRes = await api('/api/records');
        const records = recordsRes.data || [];
        
        // 计算题目总数
        let questionCount = 0;
        for (const bank of banks) {
            questionCount += bank.question_count || 0;
        }
        
        // 更新显示
        document.getElementById('quick-total').textContent = records.length;
        document.getElementById('quick-banks').textContent = banks.length;
        document.getElementById('quick-questions').textContent = questionCount;
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadQuickStats();
});
