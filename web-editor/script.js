// 全局变量
let editor;
let currentConfig = '';
let githubToken = '';
let currentSha = '';
let history = [];
let isFullscreen = false;
let editorLoaded = false; // 添加编辑器加载状态标记

// GitHub配置
const GITHUB_CONFIG = {
    owner: 'hafrey1',
    repo: 'LunaTV-config',
    path: 'luna-tv-config.json',
    branch: 'main'
};

// JSON错误信息中文映射
const JSON_ERROR_TRANSLATIONS = {
    'Unexpected token': '意外的标记',
    'Unexpected end of JSON input': 'JSON输入意外结束',
    'Expected property name': '预期属性名称',
    'Expected': '预期',
    'or': '或',
    'after': '在...之后',
    'before': '在...之前',
    'at position': '在位置',
    'line': '第',
    'column': '列',
    'Invalid': '无效的',
    'Missing': '缺少',
    'Unterminated string': '未结束的字符串',
    'Trailing comma': '多余的逗号',
    'Duplicate key': '重复的键'
};

// 工具类
class Utils {
    static decodeBase64Unicode(str) {
        try {
            const bytes = Uint8Array.from(atob(str.replace(/\s/g, '')), c => c.charCodeAt(0));
            return new TextDecoder('utf-8').decode(bytes);
        } catch (error) {
            console.error('UTF-8解码失败:', error);
            return decodeURIComponent(escape(atob(str)));
        }
    }
    
    static encodeBase64Unicode(str) {
        try {
            const encoder = new TextEncoder();
            const bytes = encoder.encode(str);
            return btoa(String.fromCharCode(...bytes));
        } catch (error) {
            console.error('UTF-8编码失败:', error);
            return btoa(unescape(encodeURIComponent(str)));
        }
    }
    
    static translateJsonError(error) {
        let message = error.message;
        
        Object.entries(JSON_ERROR_TRANSLATIONS).forEach(([en, zh]) => {
            message = message.replace(new RegExp(en, 'gi'), zh);
        });
        
        message = message.replace(/at position (\d+)/gi, '在位置 $1');
        message = message.replace(/line (\d+)/gi, '第$1行');
        message = message.replace(/column (\d+)/gi, '第$1列');
        
        return message;
    }
    
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    static getTimestamp() {
        return new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// 消息管理类
class MessageManager {
    static show(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('message-toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `message-toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    static confirm(message, callback) {
        const modal = document.getElementById('confirm-dialog');
        if (modal) {
            const messageEl = document.getElementById('confirm-message');
            const yesBtn = document.getElementById('confirm-yes');
            const noBtn = document.getElementById('confirm-no');
            
            messageEl.textContent = message;
            modal.classList.add('show');
            
            const handleYes = () => {
                modal.classList.remove('show');
                yesBtn.removeEventListener('click', handleYes);
                noBtn.removeEventListener('click', handleNo);
                callback(true);
            };
            
            const handleNo = () => {
                modal.classList.remove('show');
                yesBtn.removeEventListener('click', handleYes);
                noBtn.removeEventListener('click', handleNo);
                callback(false);
            };
            
            yesBtn.addEventListener('click', handleYes);
            noBtn.addEventListener('click', handleNo);
        } else {
            callback(confirm(message));
        }
    }
}

// Token管理类
class TokenManager {
    static saveToken(token) {
        try {
            if (token && token.length > 10) {
                const hint = token.substring(0, 8) + '...' + token.substring(token.length - 4);
                localStorage.setItem('lunatv-token-hint', hint);
                localStorage.setItem('lunatv-token-timestamp', Date.now().toString());
                sessionStorage.setItem('lunatv-session-token', token);
                MessageManager.show('Token已安全保存', 'success');
                return true;
            }
        } catch (error) {
            console.error('Token保存失败:', error);
            return false;
        }
    }
    
    static getToken() {
        return sessionStorage.getItem('lunatv-session-token') || '';
    }
    
    static getTokenHint() {
        const hint = localStorage.getItem('lunatv-token-hint');
        const timestamp = localStorage.getItem('lunatv-token-timestamp');
        
        if (timestamp && Date.now() - parseInt(timestamp) > 7 * 24 * 60 * 60 * 1000) {
            this.clearToken();
            return null;
        }
        
        return hint;
    }
    
    static hasToken() {
        return !!this.getToken();
    }
    
    static clearToken() {
        localStorage.removeItem('lunatv-token-hint');
        localStorage.removeItem('lunatv-token-timestamp');
        sessionStorage.removeItem('lunatv-session-token');
        
        const tokenInput = document.getElementById('github-token');
        if (tokenInput) {
            tokenInput.value = '';
            tokenInput.placeholder = '请输入 GitHub Personal Access Token';
        }
        
        githubToken = '';
        MessageManager.show('Token已清除', 'info');
    }
    
    static restoreToken() {
        const token = this.getToken();
        const hint = this.getTokenHint();
        
        if (token) {
            const tokenInput = document.getElementById('github-token');
            if (tokenInput) {
                tokenInput.value = token;
                tokenInput.placeholder = hint || '已恢复Token';
            }
            githubToken = token;
            return true;
        }
        
        return false;
    }
}

// 状态管理类
class StatusManager {
    static setLoading(loading) {
        const buttons = ['load-btn', 'save-btn', 'format-btn', 'minify-btn', 'validate-btn'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = loading;
                if (loading) {
                    btn.classList.add('loading');
                } else {
                    btn.classList.remove('loading');
                }
            }
        });
    }
    
    static updateFileInfo(info) {
        if (info.size !== undefined) {
            const sizeEl = document.getElementById('file-size');
            if (sizeEl) sizeEl.textContent = Utils.formatFileSize(info.size);
        }
        
        if (info.lastSaved) {
            const savedEl = document.getElementById('last-saved');
            if (savedEl) savedEl.textContent = `最后保存: ${info.lastSaved}`;
        }
        
        if (info.lastModified) {
            const statusEl = document.getElementById('file-status');
            if (statusEl) statusEl.textContent = `SHA: ${info.lastModified.substring(0, 7)}`;
        }
    }
    
    static updateValidationStatus(isValid, message = '') {
        const statusEl = document.getElementById('validation-status');
        if (statusEl) {
            if (isValid) {
                statusEl.textContent = '✅ JSON格式正确';
                statusEl.className = 'validation-status valid';
            } else {
                statusEl.textContent = `❌ ${message}`;
                statusEl.className = 'validation-status invalid';
            }
        }
    }
}

// GitHub API类
class GitHubAPI {
    static async loadConfig() {
        if (!githubToken) {
            MessageManager.show('请先输入GitHub Token', 'error');
            return false;
        }
        
        if (!editorLoaded) {
            MessageManager.show('编辑器尚未加载完成，请稍后再试', 'warning');
            return false;
        }
        
        try {
            StatusManager.setLoading(true);
            MessageManager.show('正在从GitHub加载配置...', 'info');
            
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Luna-TV-Config-Editor/1.0'
                }
            });
            
            if (!response.ok) {
                throw new Error(this.getErrorMessage(response.status));
            }
            
            const data = await response.json();
            currentSha = data.sha;
            
            const content = Utils.decodeBase64Unicode(data.content);
            
            try {
                JSON.parse(content);
                currentConfig = content;
                
                if (editor && editor.setValue) {
                    editor.setValue(content);
                    
                    setTimeout(() => {
                        if (editor.getAction) {
                            editor.getAction('editor.action.formatDocument').run();
                        }
                    }, 100);
                }
                
                StatusManager.updateFileInfo({ size: data.size, lastModified: data.sha });
                MessageManager.show('配置文件加载成功！', 'success');
                return true;
                
            } catch (jsonError) {
                const translatedError = Utils.translateJsonError(jsonError);
                MessageManager.show(`JSON格式错误: ${translatedError}`, 'error');
                if (editor && editor.setValue) {
                    editor.setValue(content);
                }
                return false;
            }
            
        } catch (error) {
            MessageManager.show(`加载失败: ${error.message}`, 'error');
            return false;
        } finally {
            StatusManager.setLoading(false);
        }
    }
    
    static async saveConfig() {
        if (!githubToken) {
            MessageManager.show('请先加载配置文件', 'error');
            return false;
        }
        
        if (!editorLoaded || !editor) {
            MessageManager.show('编辑器尚未加载完成', 'error');
            return false;
        }
        
        const content = editor.getValue();
        
        try {
            JSON.parse(content);
        } catch (error) {
            const translatedError = Utils.translateJsonError(error);
            MessageManager.show(`保存失败：${translatedError}`, 'error');
            return false;
        }
        
        if (content === currentConfig) {
            MessageManager.show('文件未发生变化，无需保存', 'info');
            return false;
        }
        
        try {
            StatusManager.setLoading(true);
            MessageManager.show('正在保存到GitHub...', 'info');
            
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
            const encodedContent = Utils.encodeBase64Unicode(content);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Luna-TV-Config-Editor/1.0',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `🌙 通过Web编辑器更新配置 - ${Utils.getTimestamp()}`,
                    content: encodedContent,
                    sha: currentSha,
                    branch: GITHUB_CONFIG.branch
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`保存失败 (${response.status}): ${errorData.message || response.statusText}`);
            }
            
            const savedData = await response.json();
            currentSha = savedData.content.sha;
            currentConfig = content;
            
            StatusManager.updateFileInfo({
                size: new Blob([content]).size,
                lastSaved: Utils.getTimestamp()
            });
            
            MessageManager.show('配置文件保存成功！', 'success');
            return true;
            
        } catch (error) {
            MessageManager.show(`保存失败: ${error.message}`, 'error');
            return false;
        } finally {
            StatusManager.setLoading(false);
        }
    }
    
    static getErrorMessage(status) {
        const messages = {
            401: 'Token验证失败，请检查Token权限是否包含repo访问权限',
            403: 'API访问被拒绝，可能是访问频率限制',
            404: '文件未找到，请确认仓库和文件路径正确',
            422: '请求参数无效',
            500: 'GitHub服务器错误'
        };
        
        return messages[status] || `请求失败 (${status})`;
    }
}

// JSON操作类
class JSONOperations {
    static format() {
        if (!editorLoaded || !editor) {
            MessageManager.show('编辑器尚未加载完成', 'error');
            return;
        }
        
        try {
            const content = editor.getValue();
            const parsed = JSON.parse(content);
            const formatted = JSON.stringify(parsed, null, 2);
            editor.setValue(formatted);
            MessageManager.show('JSON格式化完成', 'success');
        } catch (error) {
            const translatedError = Utils.translateJsonError(error);
            MessageManager.show(`格式化失败: ${translatedError}`, 'error');
        }
    }
    
    static minify() {
        if (!editorLoaded || !editor) {
            MessageManager.show('编辑器尚未加载完成', 'error');
            return;
        }
        
        try {
            const content = editor.getValue();
            const parsed = JSON.parse(content);
            const minified = JSON.stringify(parsed);
            editor.setValue(minified);
            MessageManager.show('JSON压缩完成', 'success');
        } catch (error) {
            const translatedError = Utils.translateJsonError(error);
            MessageManager.show(`压缩失败: ${translatedError}`, 'error');
        }
    }
    
    static validate() {
        if (!editorLoaded || !editor) {
            MessageManager.show('编辑器尚未加载完成', 'error');
            return false;
        }
        
        try {
            const content = editor.getValue();
            JSON.parse(content);
            StatusManager.updateValidationStatus(true);
            MessageManager.show('JSON格式验证通过', 'success');
            return true;
        } catch (error) {
            const translatedError = Utils.translateJsonError(error);
            StatusManager.updateValidationStatus(false, translatedError);
            MessageManager.show(`JSON格式错误: ${translatedError}`, 'error');
            return false;
        }
    }
    
    static clear() {
        if (!editorLoaded || !editor) {
            MessageManager.show('编辑器尚未加载完成', 'error');
            return;
        }
        
        MessageManager.confirm('确认清空编辑器内容吗？', (confirmed) => {
            if (confirmed) {
                editor.setValue('{}');
                MessageManager.show('编辑器已清空', 'info');
            }
        });
    }
}

// 初始化Monaco编辑器
function initializeEditor() {
    // 检查Monaco是否已经加载
    if (typeof monaco !== 'undefined') {
        createEditor();
        return;
    }
    
    // 加载Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
    script.onload = () => {
        require.config({ 
            paths: { 
                'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' 
            } 
        });
        
        require(['vs/editor/editor.main'], function () {
            createEditor();
        });
    };
    
    script.onerror = () => {
        MessageManager.show('Monaco编辑器加载失败，请检查网络连接', 'error');
    };
    
    document.head.appendChild(script);
}

function createEditor() {
    const editorContainer = document.getElementById('json-editor');
    if (!editorContainer) {
        MessageManager.show('编辑器容器未找到', 'error');
        return;
    }
    
    try {
        editor = monaco.editor.create(editorContainer, {
            value: `{
  "message": "欢迎使用Luna TV配置编辑器",
  "description": "请点击'加载配置'按钮开始编辑您的配置文件",
  "features": [
    "JSON格式化和验证",
    "GitHub同步",
    "历史记录管理",
    "树状视图",
    "全屏编辑"
  ]
}`,
            language: 'json',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            scrollBeyondLastLine: false,
            renderWhitespace: 'selection',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            folding: true,
            bracketPairColorization: { enabled: true }
        });
        
        // 编辑器事件监听
        editor.onDidChangeModelContent(() => {
            if (editorLoaded) {
                JSONOperations.validate();
                updateSaveButton();
            }
        });
        
        editorLoaded = true;
        MessageManager.show('编辑器初始化完成', 'success');
        
        // 如果有Token则启用加载按钮
        if (githubToken) {
            const loadBtn = document.getElementById('load-btn');
            if (loadBtn) loadBtn.disabled = false;
        }
        
    } catch (error) {
        MessageManager.show(`编辑器创建失败: ${error.message}`, 'error');
        console.error('编辑器创建失败:', error);
    }
}

// 更新保存按钮状态
function updateSaveButton() {
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn || !editor || !githubToken) {
        if (saveBtn) saveBtn.disabled = true;
        return;
    }
    
    const hasChanges = editor.getValue() !== currentConfig;
    saveBtn.disabled = !hasChanges;
    saveBtn.textContent = hasChanges ? '💾 保存配置 *' : '💾 保存配置';
}

// 事件监听器设置
function setupEventListeners() {
    // Token输入框
    const tokenInput = document.getElementById('github-token');
    if (tokenInput) {
        tokenInput.addEventListener('input', (e) => {
            githubToken = e.target.value.trim();
            if (githubToken) {
                TokenManager.saveToken(githubToken);
            }
            
            // 启用/禁用加载按钮
            const loadBtn = document.getElementById('load-btn');
            if (loadBtn) {
                loadBtn.disabled = !githubToken || !editorLoaded;
            }
        });
    }
    
    // 按钮事件
    const buttons = [
        { id: 'load-btn', handler: GitHubAPI.loadConfig },
        { id: 'save-btn', handler: GitHubAPI.saveConfig },
        { id: 'clear-token-btn', handler: TokenManager.clearToken },
        { id: 'format-btn', handler: JSONOperations.format },
        { id: 'minify-btn', handler: JSONOperations.minify },
        { id: 'validate-btn', handler: JSONOperations.validate },
        { id: 'clear-btn', handler: JSONOperations.clear }
    ];
    
    buttons.forEach(({ id, handler }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    if (editorLoaded) GitHubAPI.saveConfig();
                    break;
                case 'o':
                    e.preventDefault();
                    if (editorLoaded) GitHubAPI.loadConfig();
                    break;
            }
        }
    });
}

// 应用初始化
function initializeApp() {
    console.log('🌙 Luna TV配置编辑器启动中...');
    
    // 恢复Token
    TokenManager.restoreToken();
    
    // 初始化编辑器
    initializeEditor();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 显示欢迎消息
    setTimeout(() => {
        MessageManager.show('🌙 欢迎使用Luna TV配置编辑器！', 'info');
    }, 1000);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('🌙 Luna TV配置编辑器已启动');
console.log('✨ 功能包括: JSON编辑、GitHub同步、历史记录、树状视图等');
