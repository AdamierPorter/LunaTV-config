// GitHub OAuth 配置 - Device Flow
const GITHUB_CONFIG = {
    clientId: 'Ov23ligWR1OA4D8xEHN4',
    scope: 'repo'
};

// 全局变量
let accessToken = sessionStorage.getItem('github_access_token');
let currentUser = null;
let fileContent = null;
let fileSha = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    bindEvents();
});

// 初始化应用
function initializeApp() {
    if (accessToken) {
        verifyToken().then(user => {
            if (user) {
                currentUser = user;
                showUserInfo();
                showRepoSection();
            } else {
                sessionStorage.removeItem('github_access_token');
                accessToken = null;
            }
        });
    }
}

// 绑定事件
function bindEvents() {
    document.getElementById('login-btn').addEventListener('click', startDeviceFlow);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('load-file-btn').addEventListener('click', loadFile);
    document.getElementById('format-btn').addEventListener('click', formatJSON);
    document.getElementById('validate-btn').addEventListener('click', validateJSON);
    document.getElementById('save-btn').addEventListener('click', saveFile);
}

// 开始 Device Flow 授权
async function startDeviceFlow() {
    showStatus('正在获取设备代码...', 'loading');
    
    try {
        // 步骤1：获取设备代码
        const deviceResponse = await fetch('https://github.com/login/device/code', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CONFIG.clientId,
                scope: GITHUB_CONFIG.scope
            })
        });
        
        const deviceData = await deviceResponse.json();
        
        if (deviceData.error) {
            throw new Error(deviceData.error_description || '获取设备代码失败');
        }
        
        // 显示用户代码和验证链接
        showDeviceCodeModal(deviceData);
        
        // 步骤2：轮询获取访问令牌
        pollForAccessToken(deviceData.device_code, deviceData.interval || 5);
        
    } catch (error) {
        console.error('Device Flow error:', error);
        showStatus(`授权失败: ${error.message}`, 'error');
    }
}

// 显示设备代码模态框
function showDeviceCodeModal(deviceData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔐 GitHub 设备授权</h2>
            <p>请按照以下步骤完成授权：</p>
            <ol>
                <li>打开链接：<a href="${deviceData.verification_uri}" target="_blank">${deviceData.verification_uri}</a></li>
                <li>输入用户代码：<strong class="user-code">${deviceData.user_code}</strong></li>
                <li>完成授权后，此窗口会自动关闭</li>
            </ol>
            <div class="code-display">
                <span>用户代码：</span>
                <code class="user-code-large">${deviceData.user_code}</code>
                <button onclick="copyToClipboard('${deviceData.user_code}')">复制代码</button>
            </div>
            <button onclick="closeModal()" class="secondary-btn">取消</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 自动打开GitHub授权页面
    window.open(deviceData.verification_uri, '_blank');
}

// 轮询获取访问令牌
async function pollForAccessToken(deviceCode, interval) {
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: GITHUB_CONFIG.clientId,
                    device_code: deviceCode,
                    grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                })
            });
            
            const data = await response.json();
            
            if (data.access_token) {
                clearInterval(pollInterval);
                closeModal();
                
                accessToken = data.access_token;
                sessionStorage.setItem('github_access_token', accessToken);
                
                const user = await verifyToken();
                if (user) {
                    currentUser = user;
                    showUserInfo();
                    showRepoSection();
                    showStatus('登录成功！', 'success');
                }
            } else if (data.error === 'authorization_pending') {
                // 继续轮询
                showStatus('等待用户授权...', 'loading');
            } else if (data.error === 'slow_down') {
                // 减慢轮询速度
                clearInterval(pollInterval);
                setTimeout(() => pollForAccessToken(deviceCode, interval + 5), (interval + 5) * 1000);
            } else if (data.error) {
                clearInterval(pollInterval);
                closeModal();
                throw new Error(data.error_description || '获取访问令牌失败');
            }
        } catch (error) {
            clearInterval(pollInterval);
            closeModal();
            console.error('Polling error:', error);
            showStatus(`授权失败: ${error.message}`, 'error');
        }
    }, interval * 1000);
    
    // 5分钟后超时
    setTimeout(() => {
        clearInterval(pollInterval);
        closeModal();
        showStatus('授权超时，请重试', 'error');
    }, 300000);
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showStatus('用户代码已复制到剪贴板', 'success');
    });
}

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// 验证访问令牌
async function verifyToken() {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

// 显示用户信息
function showUserInfo() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    
    document.getElementById('user-details').innerHTML = `
        <div class="user-card">
            <img src="${currentUser.avatar_url}" alt="头像" class="avatar">
            <div class="user-details">
                <h3>${currentUser.name || currentUser.login}</h3>
                <p>@${currentUser.login}</p>
            </div>
        </div>
    `;
}

// 显示仓库配置区域
function showRepoSection() {
    document.getElementById('repo-section').style.display = 'block';
}

// 退出登录
function logout() {
    accessToken = null;
    currentUser = null;
    sessionStorage.removeItem('github_access_token');
    
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('repo-section').style.display = 'none';
    document.getElementById('editor-section').style.display = 'none';
    
    showStatus('已退出登录', 'info');
}

// 加载文件
async function loadFile() {
    const owner = document.getElementById('owner-input').value.trim();
    const repo = document.getElementById('repo-input').value.trim();
    
    if (!owner || !repo) {
        showStatus('请输入仓库所有者和仓库名称', 'error');
        return;
    }
    
    showStatus('正在加载文件...', 'loading');
    
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/luna-tv-config.json`, {
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            fileContent = atob(data.content);
            fileSha = data.sha;
            
            document.getElementById('json-editor').value = fileContent;
            document.getElementById('editor-section').style.display = 'block';
            
            showStatus('文件加载成功！', 'success');
            formatJSON(); // 自动格式化
        } else if (response.status === 404) {
            showStatus('未找到 luna-tv-config.json 文件', 'error');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Load file error:', error);
        showStatus(`加载文件失败: ${error.message}`, 'error');
    }
}

// 格式化 JSON
function formatJSON() {
    const editor = document.getElementById('json-editor');
    try {
        const parsed = JSON.parse(editor.value);
        editor.value = JSON.stringify(parsed, null, 2);
        showStatus('JSON 格式化成功', 'success');
    } catch (error) {
        showStatus('JSON 格式错误，无法格式化', 'error');
    }
}

// 验证 JSON
function validateJSON() {
    const editor = document.getElementById('json-editor');
    const resultEl = document.getElementById('validation-result');
    
    try {
        JSON.parse(editor.value);
        resultEl.innerHTML = '<div class="validation-success">✅ JSON 格式正确</div>';
        showStatus('JSON 验证通过', 'success');
    } catch (error) {
        resultEl.innerHTML = `<div class="validation-error">❌ JSON 格式错误: ${error.message}</div>`;
        showStatus('JSON 验证失败', 'error');
    }
}

// 保存文件
async function saveFile() {
    const editor = document.getElementById('json-editor');
    const owner = document.getElementById('owner-input').value.trim();
    const repo = document.getElementById('repo-input').value.trim();
    
    // 验证 JSON
    try {
        JSON.parse(editor.value);
    } catch (error) {
        showStatus('请先修复 JSON 格式错误', 'error');
        return;
    }
    
    if (!fileSha) {
        showStatus('请先加载文件', 'error');
        return;
    }
    
    showStatus('正在保存文件...', 'loading');
    
    try {
        const content = btoa(unescape(encodeURIComponent(editor.value)));
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/luna-tv-config.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `更新 luna-tv-config.json - ${new Date().toLocaleString('zh-CN')}`,
                content: content,
                sha: fileSha
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            fileSha = data.content.sha; // 更新 SHA
            showStatus('文件保存成功！', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Save file error:', error);
        showStatus(`保存文件失败: ${error.message}`, 'error');
    }
}

// 显示状态消息
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    if (type !== 'loading') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 5000);
    }
}
