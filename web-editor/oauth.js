// GitHub OAuth 配置
const GITHUB_CONFIG = {
    clientId: 'Ov23ligWR1OA4D8xEHN4',
    clientSecret: '85babf4aed3d705c7aa51ec65fbc6a5989d91f92', // 注意：在生产环境中应该在后端处理
    redirectUri: 'https://hafrey1.github.io/LunaTV-config/web-editor/callback.html',
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
    
    // 检查是否有授权码（从 localStorage）
    const code = localStorage.getItem('github_oauth_code');
    if (code) {
        localStorage.removeItem('github_oauth_code');
        exchangeCodeForToken(code);
    }
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
                // Token 无效，清除
                sessionStorage.removeItem('github_access_token');
                accessToken = null;
            }
        });
    }
}

// 绑定事件
function bindEvents() {
    document.getElementById('login-btn').addEventListener('click', startOAuthFlow);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('load-file-btn').addEventListener('click', loadFile);
    document.getElementById('format-btn').addEventListener('click', formatJSON);
    document.getElementById('validate-btn').addEventListener('click', validateJSON);
    document.getElementById('save-btn').addEventListener('click', saveFile);
    
    // 监听来自弹出窗口的消息
    window.addEventListener('message', handleOAuthCallback);
}

// 开始 OAuth 授权流程
function startOAuthFlow() {
    const state = generateRandomString(32);
    localStorage.setItem('github_oauth_state', state);
    
    const params = new URLSearchParams({
        client_id: GITHUB_CONFIG.clientId,
        redirect_uri: GITHUB_CONFIG.redirectUri,
        scope: GITHUB_CONFIG.scope,
        state: state
    });
    
    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    
    // 使用弹出窗口进行授权
    const popup = window.open(authUrl, 'github-oauth', 'width=600,height=700');
    
    // 检查弹出窗口是否被阻止
    if (!popup) {
        showStatus('弹出窗口被阻止，请允许弹出窗口或直接跳转', 'error');
        window.location.href = authUrl;
    }
}

// 处理 OAuth 回调
function handleOAuthCallback(event) {
    if (event.data.type === 'github_oauth_callback') {
        exchangeCodeForToken(event.data.code);
    }
}

// 交换授权码为访问令牌
async function exchangeCodeForToken(code) {
    showStatus('正在获取访问令牌...', 'loading');
    
    try {
        // 注意：在实际生产环境中，这应该在后端完成以保护 client_secret
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: GITHUB_CONFIG.clientId,
                client_secret: GITHUB_CONFIG.clientSecret,
                code: code
            })
        });
        
        const data = await response.json();
        
        if (data.access_token) {
            accessToken = data.access_token;
            sessionStorage.setItem('github_access_token', accessToken);
            
            const user = await verifyToken();
            if (user) {
                currentUser = user;
                showUserInfo();
                showRepoSection();
                showStatus('登录成功！', 'success');
            }
        } else {
            throw new Error(data.error_description || '获取访问令牌失败');
        }
    } catch (error) {
        console.error('OAuth error:', error);
        showStatus(`授权失败: ${error.message}`, 'error');
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
    localStorage.removeItem('github_oauth_state');
    
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

// 生成随机字符串
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
