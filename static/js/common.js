// ==================== 通用工具函数 ====================

const API_BASE = '';

// 发送API请求
async function api(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });
    return response.json();
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// 获取题型名称
function getTypeName(type) {
    const names = {
        translation: '📝 文章翻译',
        fillblank: '🔤 选词填空',
        synonym: '🔄 同义词替换',
    };
    return names[type] || type;
}

// 获取题型标签样式
function getTypeTagClass(type) {
    return `tag-${type}`;
}

// 显示提示
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 确认对话框
function confirmDialog(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = 'display: flex; z-index: 9999;';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-body" style="text-align: center; padding: 32px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <p style="font-size: 16px; margin-bottom: 24px;">${message}</p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button class="btn btn-secondary" id="confirm-cancel">取消</button>
                        <button class="btn btn-danger" id="confirm-ok">确定</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('#confirm-cancel').onclick = () => {
            modal.remove();
            resolve(false);
        };
        modal.querySelector('#confirm-ok').onclick = () => {
            modal.remove();
            resolve(true);
        };
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        };
    });
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
