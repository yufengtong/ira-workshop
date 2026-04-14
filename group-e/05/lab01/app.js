// Mock 用户数据
const mockUsers = [
    { id: 1, name: '张三', department: '技术部', checkedIn: false, checkInTime: null },
    { id: 2, name: '李四', department: '产品部', checkedIn: false, checkInTime: null },
    { id: 3, name: '王五', department: '设计部', checkedIn: false, checkInTime: null },
    { id: 4, name: '赵六', department: '技术部', checkedIn: false, checkInTime: null },
    { id: 5, name: '孙七', department: '运营部', checkedIn: false, checkInTime: null },
    { id: 6, name: '周八', department: '市场部', checkedIn: false, checkInTime: null },
    { id: 7, name: '吴九', department: '技术部', checkedIn: false, checkInTime: null },
    { id: 8, name: '郑十', department: '人事部', checkedIn: false, checkInTime: null },
    { id: 9, name: '陈明', department: '财务部', checkedIn: false, checkInTime: null },
    { id: 10, name: '林芳', department: '产品部', checkedIn: false, checkInTime: null },
];

// 当前选中的用户
let selectedUser = null;

// DOM 元素
const currentTimeEl = document.getElementById('currentTime');
const userAvatarEl = document.getElementById('userAvatar');
const avatarTextEl = document.getElementById('avatarText');
const userNameEl = document.getElementById('userName');
const userDepartmentEl = document.getElementById('userDepartment');
const checkInBtn = document.getElementById('checkInBtn');
const userListEl = document.getElementById('userList');
const recordsListEl = document.getElementById('recordsList');
const searchInputEl = document.getElementById('searchInput');

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    currentTimeEl.textContent = now.toLocaleDateString('zh-CN', options);
}

// 渲染用户列表
function renderUserList(users = mockUsers) {
    userListEl.innerHTML = users.map(user => `
        <div class="user-item ${selectedUser && selectedUser.id === user.id ? 'selected' : ''}"
             data-id="${user.id}"
             onclick="selectUser(${user.id})">
            <div class="user-item-avatar">${user.name.charAt(0)}</div>
            <div class="user-item-info">
                <div class="user-item-name">${user.name}</div>
                <div class="user-item-department">${user.department}</div>
            </div>
            <span class="user-item-status ${user.checkedIn ? 'status-checked' : 'status-unchecked'}">
                ${user.checkedIn ? '已签到' : '未签到'}
            </span>
        </div>
    `).join('');
}

// 渲染签到记录
function renderRecordsList() {
    const checkedUsers = mockUsers.filter(user => user.checkedIn);

    if (checkedUsers.length === 0) {
        recordsListEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>暂无签到记录</p>
            </div>
        `;
        return;
    }

    // 按签到时间排序（最新的在前）
    checkedUsers.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));

    recordsListEl.innerHTML = checkedUsers.map(user => `
        <div class="record-item">
            <div class="record-avatar">${user.name.charAt(0)}</div>
            <div class="record-info">
                <div class="record-name">${user.name}</div>
                <div class="record-time">${formatTime(user.checkInTime)}</div>
            </div>
            <span class="record-status">已签到</span>
        </div>
    `).join('');
}

// 格式化时间
function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// 选择用户
function selectUser(userId) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

    selectedUser = user;

    // 更新签到卡片
    avatarTextEl.textContent = user.name.charAt(0);
    userNameEl.textContent = user.name;
    userDepartmentEl.textContent = user.department;

    // 更新按钮状态
    if (user.checkedIn) {
        checkInBtn.disabled = true;
        checkInBtn.classList.add('checked-in');
        checkInBtn.querySelector('.btn-text').textContent = '已签到';
    } else {
        checkInBtn.disabled = false;
        checkInBtn.classList.remove('checked-in');
        checkInBtn.querySelector('.btn-text').textContent = '签到';
    }

    // 重新渲染用户列表以更新选中状态
    renderUserList(getFilteredUsers());
}

// 获取过滤后的用户列表
function getFilteredUsers() {
    const keyword = searchInputEl.value.trim().toLowerCase();
    if (!keyword) return mockUsers;

    return mockUsers.filter(user =>
        user.name.toLowerCase().includes(keyword) ||
        user.department.toLowerCase().includes(keyword)
    );
}

// 签到
function checkIn() {
    if (!selectedUser || selectedUser.checkedIn) return;

    const now = new Date();
    selectedUser.checkedIn = true;
    selectedUser.checkInTime = now.toISOString();

    // 更新按钮状态
    checkInBtn.disabled = true;
    checkInBtn.classList.add('checked-in');
    checkInBtn.querySelector('.btn-text').textContent = '已签到';

    // 重新渲染列表
    renderUserList(getFilteredUsers());
    renderRecordsList();

    // 显示签到成功提示
    showNotification(`${selectedUser.name} 签到成功！`);
}

// 显示通知
function showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // 3秒后移除通知
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 搜索用户
function handleSearch() {
    renderUserList(getFilteredUsers());
}

// 初始化
function init() {
    // 更新时间
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 渲染用户列表
    renderUserList();

    // 渲染签到记录
    renderRecordsList();

    // 绑定事件
    checkInBtn.addEventListener('click', checkIn);
    searchInputEl.addEventListener('input', handleSearch);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
