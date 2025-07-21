// 全局变量
let currentUser = null;
let selectedFiles = [];
let currentFeature = 'watermark';
let currentPlanType = 'subscription';

// Supabase配置（将在部署时通过环境变量注入）
const SUPABASE_URL = window.location.origin;
const API_BASE = window.location.origin + '/api';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    // 隐藏加载动画
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);

    // 检查用户登录状态
    checkAuthStatus();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化价格方案
    initializePricing();
    
    // 初始化文件上传
    initializeFileUpload();
}

// 检查用户认证状态
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const response = await fetch(`${API_BASE}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                setCurrentUser(userData);
                updateUIForLoggedInUser();
            } else {
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('检查认证状态失败:', error);
            localStorage.removeItem('authToken');
        }
    }
}

// 设置当前用户
function setCurrentUser(userData) {
    currentUser = userData;
    updateUserStatus();
}

// 更新用户状态显示
function updateUserStatus() {
    if (!currentUser) return;
    
    const userStatus = document.getElementById('userStatus');
    const statusText = document.getElementById('statusText');
    const usageText = document.getElementById('usageText');
    const uploadLimitText = document.getElementById('uploadLimitText');
    
    // 显示用户状态栏
    userStatus.style.display = 'block';
    
    // 更新状态文本
    const userTypeMap = {
        'free': '免费用户',
        'paid': '付费用户',
        'vip': 'VIP用户'
    };
    
    statusText.textContent = userTypeMap[currentUser.user_type] || '免费用户';
    
    // 更新使用次数
    if (currentUser.user_type === 'free') {
        usageText.textContent = `今日使用: ${currentUser.daily_usage}/3`;
        uploadLimitText.textContent = '免费用户: 最大50MB, 每日3次';
    } else if (currentUser.user_type === 'paid') {
        usageText.textContent = '无限制使用';
        uploadLimitText.textContent = '付费用户: 最大500MB, 无限次数';
    } else {
        usageText.textContent = 'VIP无限制';
        uploadLimitText.textContent = 'VIP用户: 最大2GB, 批量处理';
    }
}

// 更新登录用户的UI
function updateUIForLoggedInUser() {
    // 隐藏登录注册按钮
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    
    // 显示用户菜单
    const userMenu = document.getElementById('userMenu');
    userMenu.style.display = 'block';
    
    // 更新用户名
    document.getElementById('userName').textContent = currentUser.username;
    
    // 更新用户类型
    const userTypeMap = {
        'free': '免费用户',
        'paid': '付费用户',
        'vip': 'VIP用户'
    };
    document.getElementById('userType').textContent = userTypeMap[currentUser.user_type];
}

// 绑定事件监听器
function bindEventListeners() {
    // 导航按钮
    document.getElementById('loginBtn').addEventListener('click', () => showModal('loginModal'));
    document.getElementById('registerBtn').addEventListener('click', () => showModal('registerModal'));
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 模态框关闭
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            hideModal(e.target.dataset.modal);
        });
    });
    
    // 模态框切换
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('loginModal');
        showModal('registerModal');
    });
    
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        hideModal('registerModal');
        showModal('loginModal');
    });
    
    // 表单提交
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 功能选项卡
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const feature = e.currentTarget.dataset.feature;
            selectFeature(feature);
        });
    });
    
    // 价格方案类型
    document.querySelectorAll('.plan-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            selectPlanType(type);
        });
    });
    
    // 文件选择
    document.getElementById('selectFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    // 处理按钮
    document.getElementById('processBtn').addEventListener('click', processFiles);
    
    // 升级按钮
    document.getElementById('upgradeStatusBtn').addEventListener('click', () => {
        document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// 显示模态框
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// 隐藏模态框
function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            setCurrentUser(data.user);
            updateUIForLoggedInUser();
            hideModal('loginModal');
            showNotification('登录成功！', 'success');
        } else {
            showNotification(data.error || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 处理注册
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            setCurrentUser(data.user);
            updateUIForLoggedInUser();
            hideModal('registerModal');
            showNotification('注册成功！欢迎使用！', 'success');
        } else {
            showNotification(data.error || '注册失败', 'error');
        }
    } catch (error) {
        console.error('注册错误:', error);
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    
    // 重置UI
    document.getElementById('loginBtn').style.display = 'inline-flex';
    document.getElementById('registerBtn').style.display = 'inline-flex';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('userStatus').style.display = 'none';
    
    showNotification('已退出登录', 'info');
}

// 选择功能
function selectFeature(feature) {
    // 检查VIP功能权限
    if (feature === 'batch' && (!currentUser || currentUser.user_type !== 'vip')) {
        showNotification('批量处理功能需要VIP会员', 'warning');
        document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    currentFeature = feature;
    
    // 更新选项卡状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-feature="${feature}"]`).classList.add('active');
    
    // 更新上传区域文本
    const featureTexts = {
        'watermark': '上传需要去除水印的视频',
        'subtitle': '上传需要去除字幕的视频',
        'batch': '上传多个视频进行批量处理'
    };
    
    document.querySelector('.upload-content h3').textContent = featureTexts[feature];
}

// 选择价格方案类型
function selectPlanType(type) {
    currentPlanType = type;
    
    // 更新按钮状态
    document.querySelectorAll('.plan-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    
    // 更新价格卡片
    updatePricingCards(type);
}

// 初始化价格方案
function initializePricing() {
    updatePricingCards('subscription');
}

// 更新价格卡片
function updatePricingCards(type) {
    const pricingData = {
        subscription: [
            {
                name: '免费版',
                price: '¥0',
                period: '永久免费',
                features: [
                    '每日3次处理',
                    '最大文件50MB',
                    '基础去水印功能',
                    '基础去字幕功能',
                    '邮件支持'
                ],
                buttonText: '当前方案',
                buttonClass: 'btn-outline',
                disabled: true
            },
            {
                name: '月度会员',
                price: '¥19',
                period: '每月',
                features: [
                    '无限次处理',
                    '最大文件500MB',
                    '高质量处理',
                    '优先处理队列',
                    '邮件技术支持'
                ],
                buttonText: '选择方案',
                buttonClass: 'btn-primary',
                recommended: true
            },
            {
                name: '年度会员',
                price: '¥199',
                period: '每年',
                originalPrice: '¥228',
                features: [
                    '无限次处理',
                    '最大文件500MB',
                    '高质量处理',
                    '优先处理队列',
                    '专属客服支持',
                    '年度优惠12%'
                ],
                buttonText: '选择方案',
                buttonClass: 'btn-primary'
            }
        ],
        buyout: [
            {
                name: '终身会员',
                price: '¥599',
                period: '一次付费，终身使用',
                features: [
                    '终身无限处理',
                    '最大文件2GB',
                    '批量处理功能',
                    '最高优先级',
                    '专属VIP客服',
                    '所有未来功能'
                ],
                buttonText: '立即购买',
                buttonClass: 'btn-success',
                recommended: true
            }
        ],
        payperuse: [
            {
                name: '按次付费',
                price: '¥2',
                period: '每次处理',
                features: [
                    '单次视频处理',
                    '最大文件200MB',
                    '标准处理质量',
                    '24小时内完成',
                    '基础技术支持'
                ],
                buttonText: '立即支付',
                buttonClass: 'btn-primary'
            },
            {
                name: '处理包',
                price: '¥15',
                period: '10次处理',
                features: [
                    '10次视频处理',
                    '最大文件500MB',
                    '高质量处理',
                    '优先处理',
                    '邮件技术支持',
                    '30天有效期'
                ],
                buttonText: '购买处理包',
                buttonClass: 'btn-primary',
                recommended: true
            }
        ],
        credits: [
            {
                name: '基础积分包',
                price: '¥50',
                period: '500积分',
                features: [
                    '500处理积分',
                    '1积分=1次处理',
                    '最大文件500MB',
                    '高质量处理',
                    '90天有效期'
                ],
                buttonText: '购买积分',
                buttonClass: 'btn-primary'
            },
            {
                name: '超值积分包',
                price: '¥200',
                period: '2500积分',
                features: [
                    '2500处理积分',
                    '赠送500积分',
                    '最大文件1GB',
                    '批量处理功能',
                    '180天有效期',
                    '专属客服支持'
                ],
                buttonText: '购买积分',
                buttonClass: 'btn-primary',
                recommended: true
            }
        ]
    };
    
    const cards = pricingData[type];
    const container = document.getElementById('pricingCards');
    
    container.innerHTML = cards.map(card => `
        <div class="pricing-card ${card.recommended ? 'recommended' : ''}">
            ${card.recommended ? '<div class="recommended-badge">推荐</div>' : ''}
            <div class="plan-name">${card.name}</div>
            <div class="plan-price">
                ${card.price}
                ${card.originalPrice ? `<span style="text-decoration: line-through; font-size: 1rem; color: #94a3b8; margin-left: 0.5rem;">${card.originalPrice}</span>` : ''}
            </div>
            <div class="plan-period">${card.period}</div>
            <ul class="plan-features">
                ${card.features.map(feature => `
                    <li><i class="fas fa-check"></i> ${feature}</li>
                `).join('')}
            </ul>
            <button class="btn ${card.buttonClass} btn-full" 
                    onclick="selectPlan('${type}', '${card.name}', '${card.price}')"
                    ${card.disabled ? 'disabled' : ''}>
                ${card.buttonText}
            </button>
        </div>
    `).join('');
}

// 选择价格方案
function selectPlan(mode, type, price) {
    if (!currentUser) {
        showNotification('请先登录后再选择方案', 'warning');
        showModal('loginModal');
        return;
    }
    
    // 设置支付信息
    document.getElementById('paymentAmount').textContent = price;
    
    // 显示支付模态框
    showModal('paymentModal');
    
    // 绑定支付方式选择
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.onclick = () => processPayment(mode, type, price, btn.dataset.method);
    });
}

// 处理支付
async function processPayment(mode, type, price, method) {
    try {
        const response = await fetch(`${API_BASE}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                mode,
                type,
                amount: parseFloat(price.replace('¥', '')),
                payment_method: method
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 模拟支付成功
            setTimeout(() => {
                hideModal('paymentModal');
                showNotification('支付成功！正在升级您的账户...', 'success');
                
                // 更新用户状态
                setTimeout(() => {
                    checkAuthStatus();
                    showNotification('账户升级成功！', 'success');
                }, 2000);
            }, 1000);
        } else {
            showNotification(data.error || '支付失败', 'error');
        }
    } catch (error) {
        console.error('支付错误:', error);
        showNotification('支付处理失败，请稍后重试', 'error');
    }
}

// 初始化文件上传
function initializeFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files);
    });
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFileSelection(files);
    });
}

// 处理文件选择
function handleFileSelection(files) {
    // 检查登录状态
    if (!currentUser) {
        showNotification('请先登录后再上传文件', 'warning');
        showModal('loginModal');
        return;
    }
    
    // 检查文件类型
    const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
        showNotification('请选择有效的视频文件格式', 'error');
        return;
    }
    
    // 检查文件大小限制
    const maxSize = getMaxFileSize();
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024);
        showNotification(`文件大小超出限制，最大允许${maxSizeMB}MB`, 'error');
        return;
    }
    
    // 检查批量处理权限
    if (files.length > 1 && currentUser.user_type !== 'vip') {
        showNotification('批量处理功能需要VIP会员', 'warning');
        return;
    }
    
    // 添加文件到列表
    selectedFiles = [...selectedFiles, ...files];
    updateFileList();
    
    // 显示处理控制
    document.getElementById('processControls').style.display = 'block';
}

// 获取最大文件大小
function getMaxFileSize() {
    if (!currentUser) return 50 * 1024 * 1024; // 50MB
    
    const limits = {
        'free': 50 * 1024 * 1024,      // 50MB
        'paid': 500 * 1024 * 1024,     // 500MB
        'vip': 2 * 1024 * 1024 * 1024  // 2GB
    };
    
    return limits[currentUser.user_type] || limits.free;
}

// 更新文件列表
function updateFileList() {
    const fileList = document.getElementById('fileList');
    
    if (selectedFiles.length === 0) {
        fileList.style.display = 'none';
        return;
    }
    
    fileList.style.display = 'block';
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-file-video"></i>
                </div>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${formatFileSize(file.size)} • ${file.type}</p>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-small btn-outline" onclick="removeFile(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 移除文件
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    
    if (selectedFiles.length === 0) {
        document.getElementById('processControls').style.display = 'none';
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理文件
async function processFiles() {
    if (selectedFiles.length === 0) {
        showNotification('请先选择要处理的文件', 'warning');
        return;
    }
    
    // 检查使用限制
    if (currentUser.user_type === 'free' && currentUser.daily_usage >= 3) {
        showNotification('免费用户每日限制3次，请升级会员', 'warning');
        document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // 显示进度模态框
    showModal('progressModal');
    
    // 模拟处理过程
    simulateProcessing();
}

// 模拟处理过程
function simulateProcessing() {
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressStatus = document.getElementById('progressStatus');
    const progressDetails = document.getElementById('progressDetails');
    
    let progress = 0;
    const steps = [
        { percent: 10, status: '上传文件中...', detail: '正在上传视频文件到服务器...' },
        { percent: 30, status: '分析视频...', detail: '正在分析视频内容和水印位置...' },
        { percent: 50, status: '处理中...', detail: '正在使用AI算法去除水印...' },
        { percent: 80, status: '优化质量...', detail: '正在优化视频质量和细节...' },
        { percent: 100, status: '处理完成', detail: '视频处理完成，准备下载...' }
    ];
    
    let stepIndex = 0;
    
    const updateProgress = () => {
        if (stepIndex < steps.length) {
            const step = steps[stepIndex];
            progress = step.percent;
            
            progressFill.style.width = progress + '%';
            progressPercent.textContent = progress + '%';
            progressStatus.textContent = step.status;
            progressDetails.textContent = step.detail;
            
            stepIndex++;
            
            if (progress < 100) {
                setTimeout(updateProgress, 1500);
            } else {
                // 处理完成
                setTimeout(() => {
                    hideModal('progressModal');
                    showProcessingResult();
                }, 1000);
            }
        }
    };
    
    updateProgress();
}

// 显示处理结果
function showProcessingResult() {
    // 清空文件列表
    selectedFiles = [];
    updateFileList();
    document.getElementById('processControls').style.display = 'none';
    
    // 更新用户使用次数
    if (currentUser.user_type === 'free') {
        currentUser.daily_usage++;
        updateUserStatus();
    }
    
    // 显示成功消息
    showNotification('视频处理完成！文件已自动下载', 'success');
    
    // 模拟文件下载
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#';
        link.download = 'processed_video.mp4';
        link.textContent = '下载处理后的视频';
        link.style.display = 'none';
        document.body.appendChild(link);
        // link.click(); // 实际项目中会触发真实下载
        document.body.removeChild(link);
    }, 500);
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 绑定关闭事件
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // 自动关闭
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// 获取通知图标
function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// 获取通知颜色
function getNotificationColor(type) {
    const colors = {
        'success': '#4CAF50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196F3'
    };
    return colors[type] || '#2196F3';
}

// 添加通知动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        font-size: 1rem;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// 错误处理
window.addEventListener('error', function(e) {
    console.error('JavaScript错误:', e.error);
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
    e.preventDefault();
});
