// 完全无CORS的解决方案 - oauth.js
const GITHUB_CONFIG = {
    owner: 'hafrey1',
    repo: 'LunaTV-config',
    requiredScopes: ['repo']
};

// 全局变量
let accessToken = localStorage.getItem('github_access_token');
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
                localStorage.removeItem('github_access_token');
                accessToken = null;
            }
        });
    }
}

// 绑定事件
function bindEvents() {
    document.getElementById('login-btn').addEventListener('click', showTokenInstructions);
    document.getElementById('token-submit-btn').addEventListener('click', submitToken);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('load-file-btn').addEventListener('click', loadFile);
    document.getElementById('format-btn').addEventListener('click', formatJSON);
    document.getElementById('validate-btn').addEventListener('click', validateJSON);
    document.getElementById('save-btn').addEventListener('click', saveFile);
}

// 显示Token获取说明
function showTokenInstructions() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔑 获取GitHub访问令牌</h2>
            <p>由于浏览器CORS限制，请手动创建GitHub Personal Access Token：</p>
            
            <div class="instruction-steps">
                <h3>📋 操作步骤：</h3>
                <ol>
                    <li>点击下方链接打开GitHub设置页面：<br>
                        <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" class="link-button">
                            🔗 创建Personal Access Token
                        </a>
                    </li>
                    <li>填写Token信息：
                        <ul>
                            <li><strong>Token name</strong>: LunaTV Config Editor</li>
                            <li><strong>Expiration</strong>: 选择合适的过期时间</li>
                            <li><strong>Repository access</strong>: 选择 "Selected repositories" 并选择 "hafrey1/LunaTV-config"</li>
                        </ul>
                    </li>
                    <li>在 <strong>Permissions</strong> 部分，勾选：
                        <ul>
                            <li>✅ <strong>Contents</strong> (Read and Write) - 读取和修改文件</li>
                            <li>✅ <strong>Metadata</strong> (Read) - 读取仓库信息</li>
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
                    <button onclick="closeModal()" class="secondary-btn">取消</button>
                </div>
            </div>
            
            <div class="security-note">
                <h4>🔒 安全说明：</h4>
                <p>• Token仅保存在您的浏览器本地存储中</p>
                <p>• 建议设置适当的过期时间</p>
                <p>• 如需撤销，可在GitHub设置中删除此Token</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 提交并验证Token
async function submitToken() {
    const tokenInput = document.getElementById('token-input');
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
            } else {
                throw new Error('Token没有访问指定仓库的权限');
            }
        } else if (response.status === 401) {
            throw new Error('Token无效或已过期');
        } else {
            throw new Error(`验证失败: HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Token verification error:', error);
        showStatus(`验证失败: ${error.message}`, 'error');
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
                <p class="token-status">✅ Token已验证</p>
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
    localStorage.removeItem('github_access_token');
    
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

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}
