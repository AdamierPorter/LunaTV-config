// GitHub配置
const GITHUB_CONFIG = {
    owner: 'hafrey1',
    repo: 'LunaTV-config'
};

// 全局变量
let accessToken = localStorage.getItem('github_access_token');
let currentUser = null;
let fileContent = null;
let fileSha = null;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    initializeApp();
    bindEvents();
});

// 如果DOM已经加载，直接执行
if (document.readyState === 'loading') {
    // DOM还在加载，等待DOMContentLoaded事件
} else {
    // DOM已加载完成
    console.log('DOM已加载，立即初始化...');
    initializeApp();
    bindEvents();
}

// 初始化应用
function initializeApp() {
    console.log('初始化应用...');
    if (accessToken) {
        console.log('发现已保存的token，验证中...');
        verifyToken().then(user => {
            if (user) {
                currentUser = user;
                showUserInfo();
                showRepoSection();
                console.log('用户已登录:', user.login);
            } else {
                localStorage.removeItem('github_access_token');
                accessToken = null;
                console.log('token无效，已清除');
            }
        }).catch(err => {
            console.error('验证token失败:', err);
            localStorage.removeItem('github_access_token');
            accessToken = null;
        });
    }
}

// 绑定事件监听器
function bindEvents() {
    console.log('绑定事件监听器...');
    
    // 获取按钮元素并检查
    const loginBtn = document.getElementById('login-btn');
    console.log('登录按钮:', loginBtn);
    
    if (loginBtn) {
        // 移除旧的事件监听器（如果存在）
        loginBtn.removeEventListener('click', showTokenInstructions);
        // 添加新的事件监听器
        loginBtn.addEventListener('click', function(e) {
            console.log('登录按钮被点击');
            e.preventDefault();
            showTokenInstructions();
        });
        console.log('登录按钮事件已绑定');
    } else {
        console.error('找不到登录按钮 (id: login-btn)');
    }
    
    // 绑定其他按钮（使用事件委托）
    document.addEventListener('click', function(e) {
        if (e.target.id === 'token-submit-btn') {
            e.preventDefault();
            submitToken();
        } else if (e.target.id === 'logout-btn') {
            e.preventDefault();
            logout();
        } else if (e.target.id === 'load-file-btn') {
            e.preventDefault();
            loadFile();
        } else if (e.target.id === 'format-btn') {
            e.preventDefault();
            formatJSON();
        } else if (e.target.id === 'validate-btn') {
            e.preventDefault();
            validateJSON();
        } else if (e.target.id === 'save-btn') {
            e.preventDefault();
            saveFile();
        } else if (e.target.className === 'close-modal' || e.target.className === 'modal-overlay') {
            closeModal();
        }
    });
    
    console.log('所有事件监听器已设置');
}

// 显示Token获取说明
function showTokenInstructions() {
    console.log('显示Token获取说明');
    
    // 先关闭已有的模态框
    closeModal();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔑 获取GitHub访问令牌</h2>
                <button class="close-modal" style="float: right; border: none; background: none; font-size: 20px; cursor: pointer;">&times;</button>
            </div>
            <p>由于浏览器CORS限制，请手动创建GitHub Personal Access Token：</p>
            
            <div class="instruction-steps">
                <h3>📋 操作步骤：</h3>
                <ol>
                    <li>
                        <strong>打开GitHub设置页面：</strong><br>
                        <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" class="link-button">
                            🔗 创建Personal Access Token
                        </a>
                    </li>
                    <li>
                        <strong>填写Token信息：</strong>
                        <ul>
                            <li><strong>Token name:</strong> LunaTV Config Editor</li>
                            <li><strong>Expiration:</strong> 选择合适的过期时间（建议30-90天）</li>
                            <li><strong>Repository access:</strong> 选择 "Selected repositories" 并选择 "hafrey1/LunaTV-config"</li>
                        </ul>
                    </li>
                    <li>
                        <strong>设置权限 (Permissions)：</strong>
                        <ul>
                            <li>✅ <strong>Contents</strong> → Read and Write (读取和修改文件)</li>
                            <li>✅ <strong>Metadata</strong> → Read (读取仓库信息)</li>
                        </ul>
                    </li>
                    <li>点击 <strong>"Generate token"</strong></li>
                    <li>复制生成的token（以 'ghp_' 开头）</li>
                    <li>将token粘贴到下方输入框中</li>
                </ol>
            </div>
            
            <div class="token-input-section">
                <label for="token-input">🔐 请输入您的GitHub Personal Access Token：</label>
                <input type="password" id="token-input" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" class="token-input">
                <div class="token-buttons">
                    <button id="token-submit-btn" class="primary-btn">验证并保存Token</button>
                    <button class="close-modal secondary-btn">取消</button>
                </div>
            </div>
            
            <div class="security-note">
                <h4>🔒 安全说明：</h4>
                <p>• Token仅保存在您的浏览器本地存储中，不会发送到任何服务器</p>
                <p>• 建议设置适当的过期时间以提高安全性</p>
                <p>• 如需撤销，可在GitHub设置中删除此Token</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    console.log('模态框已显示');
    
    // 聚焦到输入框
    setTimeout(() => {
        const tokenInput = document.getElementById('token-input');
        if (tokenInput) {
            tokenInput.focus();
        }
    }, 100);
}

// 提交并验证Token
async function submitToken() {
    console.log('提交Token验证');
    
    const tokenInput = document.getElementById('token-input');
    if (!tokenInput) {
        showStatus('找不到输入框', 'error');
        return;
    }
    
    const token = tokenInput.value.trim();
    
    if (!token) {
        showStatus('请输入访问令牌', 'error');
        return;
    }
    
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        showStatus('Token格式不正确，应该以 ghp_ 或 github_pat_ 开头', 'error');
        return;
    }
    
    showStatus('正在验证访问令牌...', 'loading');
    
    try {
        // 验证token并获取用户信息
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log('用户验证成功:', user.login);
            
            // 验证是否有仓库访问权限
            const repoResponse = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (repoResponse.ok || repoResponse.status === 404) {
                // 保存token和用户信息
                accessToken = token;
                currentUser = user;
                localStorage.setItem('github_access_token', token);
                
                // 更新界面
                closeModal();
                showUserInfo();
                showRepoSection();
                showStatus('Token验证成功，已成功登录！', 'success');
                
                console.log('登录成功，用户:', user.login);
            } else {
                throw new Error('Token没有访问指定仓库的权限，请检查Repository access设置');
            }
        } else if (response.status === 401) {
            throw new Error('Token无效或已过期');
        } else {
            throw new Error(`验证失败: HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Token验证错误:', error);
        showStatus(`验证失败: ${error.message}`, 'error');
    }
}

// 验证访问令牌
async function verifyToken() {
    if (!accessToken) return null;
    
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
        console.error('Token验证失败:', error);
        return null;
    }
}

// 显示用户信息
function showUserInfo() {
    const loginSection = document.getElementById('login-section');
    const userInfoSection = document.getElementById('user-info');
    
    if (loginSection) loginSection.style.display = 'none';
    if (userInfoSection) userInfoSection.style.display = 'block';
    
    const userDetails = document.getElementById('user-details');
    if (userDetails && currentUser) {
        userDetails.innerHTML = `
            <div class="user-card">
                <img src="${currentUser.avatar_url}" alt="头像" class="avatar">
                <div class="user-details">
                    <h3>${currentUser.name || currentUser.login}</h3>
                    <p>@${currentUser.login}</p>
                    <p class="token-status">✅ Token已验证</p>
                </div>
            </div>
        `;
    }
}

// 显示仓库配置区域
function showRepoSection() {
    const repoSection = document.getElementById('repo-section');
    if (repoSection) {
        repoSection.style.display = 'block';
    }
}

// 退出登录
function logout() {
    accessToken = null;
    currentUser = null;
    localStorage.removeItem('github_access_token');
    
    const loginSection = document.getElementById('login-section');
    const userInfoSection = document.getElementById('user-info');
    const repoSection = document.getElementById('repo-section');
    const editorSection = document.getElementById('editor-section');
    
    if (loginSection) loginSection.style.display = 'block';
    if (userInfoSection) userInfoSection.style.display = 'none';
    if (repoSection) repoSection.style.display = 'none';
    if (editorSection) editorSection.style.display = 'none';
    
    showStatus('已退出登录', 'info');
}

// 加载文件
async function loadFile() {
    const ownerInput = document.getElementById('owner-input');
    const repoInput = document.getElementById('repo-input');
    
    const owner = ownerInput ? ownerInput.value.trim() : GITHUB_CONFIG.owner;
    const repo = repoInput ? repoInput.value.trim() : GITHUB_CONFIG.repo;
    
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
            
            const jsonEditor = document.getElementById('json-editor');
            if (jsonEditor) {
                jsonEditor.value = fileContent;
            }
            
            const editorSection = document.getElementById('editor-section');
            if (editorSection) {
                editorSection.style.display = 'block';
            }
            
            showStatus('文件加载成功！', 'success');
            formatJSON(); // 自动格式化
        } else if (response.status === 404) {
            showStatus('未找到 luna-tv-config.json 文件', 'error');
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('加载文件错误:', error);
        showStatus(`加载文件失败: ${error.message}`, 'error');
    }
}

// 格式化 JSON
function formatJSON() {
    const editor = document.getElementById('json-editor');
    if (!editor) return;
    
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
    
    if (!editor) return;
    
    try {
        JSON.parse(editor.value);
        if (resultEl) {
            resultEl.innerHTML = '<div class="validation-success">✅ JSON 格式正确</div>';
        }
        showStatus('JSON 验证通过', 'success');
    } catch (error) {
        if (resultEl) {
            resultEl.innerHTML = `<div class="validation-error">❌ JSON 格式错误: ${error.message}</div>`;
        }
        showStatus('JSON 验证失败', 'error');
    }
}

// 保存文件
async function saveFile() {
    const editor = document.getElementById('json-editor');
    const ownerInput = document.getElementById('owner-input');
    const repoInput = document.getElementById('repo-input');
    
    if (!editor) {
        showStatus('找不到编辑器', 'error');
        return;
    }
    
    const owner = ownerInput ? ownerInput.value.trim() : GITHUB_CONFIG.owner;
    const repo = repoInput ? repoInput.value.trim() : GITHUB_CONFIG.repo;
    
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
        console.error('保存文件错误:', error);
        showStatus(`保存文件失败: ${error.message}`, 'error');
    }
}

// 显示状态消息
function showStatus(message, type = 'info') {
    console.log('状态:', message, type);
    
    // 清除现有的状态消息
    const existingStatus = document.querySelector('.status-message');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // 创建状态消息元素
    const statusEl = document.createElement('div');
    statusEl.className = `status-message ${type}`;
    statusEl.textContent = message;
    statusEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        min-width: 300px;
        text-align: center;
        animation: slideIn 0.3s ease;
    `;
    
    // 根据类型设置背景色
    switch (type) {
        case 'success':
            statusEl.style.backgroundColor = '#38a169';
            break;
        case 'error':
            statusEl.style.backgroundColor = '#e53e3e';
            break;
        case 'info':
            statusEl.style.backgroundColor = '#3182ce';
            break;
        case 'loading':
            statusEl.style.backgroundColor = '#805ad5';
            break;
        default:
            statusEl.style.backgroundColor = '#4a5568';
    }
    
    document.body.appendChild(statusEl);
    
    // 自动隐藏（除了loading状态）
    if (type !== 'loading') {
        setTimeout(() => {
            if (statusEl && statusEl.parentNode) {
                statusEl.remove();
            }
        }, 5000);
    }
}

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
        console.log('模态框已关闭');
    }
}

// 添加一些CSS样式（如果不存在）
if (!document.querySelector('#dynamic-styles')) {
    const styles = document.createElement('style');
    styles.id = 'dynamic-styles';
    styles.textContent = `
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
        
        .modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.8) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 2000 !important;
        }
        
        .modal-content {
            background: white !important;
            border-radius: 16px !important;
            padding: 30px !important;
            max-width: 600px !important;
            width: 90% !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
        }
    `;
    document.head.appendChild(styles);
}

console.log('OAuth.js 加载完成');
