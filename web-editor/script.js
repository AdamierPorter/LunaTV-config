// 全局变量
let editor;
let currentConfig = '';
let githubToken = '';
let currentSha = '';
let history = [];
let currentHistoryIndex = -1;
let isFullscreen = false;

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
    // UTF-8编码解码
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
    
    // 翻译JSON错误信息
    static translateJsonError(error) {
        let message = error.message;
        
        Object.entries(JSON_ERROR_TRANSLATIONS).forEach(([en, zh]) => {
            message = message.replace(new RegExp(en, 'gi'), zh);
        });
        
        // 处理位置信息
        message = message.replace(/at position (\d+)/gi, '在位置 $1');
        message = message.replace(/line (\d+)/gi, '第$1行');
        message = message.replace(/column (\d+)/gi, '第$1列');
        
        return message;
    }
    
    // 格式化文件大小
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 生成时间戳
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

// Token管理类
class TokenManager {
    static saveToken(token) {
        try {
            if (token && token.length > 10) {
                // 只保存提示信息，不保存完整token
                const hint = token.substring(0, 8) + '...' + token.substring(token.length - 4);
                localStorage.setItem('lunatv-token-hint', hint);
                localStorage.setItem('lunatv-token-timestamp', Date.now().toString());
                
                // 会话级别保存完整token
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
        
        // 检查是否过期（7天）
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
        tokenInput.value = '';
        tokenInput.placeholder = '请输入 GitHub Personal Access Token';
        
        githubToken = '';
        MessageManager.show('Token已清除', 'info');
    }
    
    static restoreToken() {
        const token = this.getToken();
        const hint = this.getTokenHint();
        
        if (token) {
            const tokenInput = document.getElementById('github-token');
            tokenInput.value = token;
            tokenInput.placeholder = hint || '已恢复Token';
            githubToken = token;
            return true;
        }
        
        return false;
    }
}

// 消息管理类
class MessageManager {
    static show(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('message-toast');
        toast.textContent = message;
        toast.className = `message-toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
    
    static confirm(message, callback) {
        const modal = document.getElementById('confirm-dialog');
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
    }
}

// 历史记录管理类
class HistoryManager {
    static save(content, description = '') {
        const timestamp = Utils.getTimestamp();
        const entry = {
            id: Date.now(),
            content,
            description: description || `版本 ${timestamp}`,
            timestamp
        };
        
        history.unshift(entry);
        
        // 限制历史记录数量
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        this.updateHistorySelect();
        this.saveToStorage();
        
        MessageManager.show(`已保存版本: ${entry.description}`, 'success');
    }
    
    static load(id) {
        const entry = history.find(h => h.id === id);
        if (entry) {
            editor.setValue(entry.content);
            MessageManager.show(`已加载版本: ${entry.description}`, 'info');
            return true;
        }
        return false;
    }
    
    static clear() {
        MessageManager.confirm('确认清空所有历史记录吗？', (confirmed) => {
            if (confirmed) {
                history = [];
                this.updateHistorySelect();
                this.saveToStorage();
                MessageManager.show('历史记录已清空', 'info');
            }
        });
    }
    
    static updateHistorySelect() {
        const select = document.getElementById('history-select');
        select.innerHTML = '<option value="">选择历史版本</option>';
        
        history.forEach(entry => {
            const option = document.createElement('option');
            option.value = entry.id;
            option.textContent = entry.description;
            select.appendChild(option);
        });
    }
    
    static saveToStorage() {
        try {
            localStorage.setItem('lunatv-history', JSON.stringify(history));
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }
    
    static loadFromStorage() {
        try {
            const saved = localStorage.getItem('lunatv-history');
            if (saved) {
                history = JSON.parse(saved);
                this.updateHistorySelect();
            }
        } catch (error) {
            console.error('加载历史记录失败:', error);
            history = [];
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
            
            // 验证JSON格式
            try {
                JSON.parse(content);
                currentConfig = content;
                editor.setValue(content);
                
                setTimeout(() => {
                    editor.getAction('editor.action.formatDocument').run();
                }, 100);
                
                StatusManager.updateFileInfo({
                    size: data.size,
                    lastModified: data.sha
                });
                
                MessageManager.show('配置文件加载成功！', 'success');
                return true;
                
            } catch (jsonError) {
                const translatedError = Utils.translateJsonError(jsonError);
                MessageManager.show(`JSON格式错误: ${translatedError}`, 'error');
                editor.setValue(content); // 仍然显示内容以便修复
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
        
        const content = editor.getValue();
        
        // 验证JSON格式
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
            sizeEl.textContent = Utils.formatFileSize(info.size);
        }
        
        if (info.lastSaved) {
            const savedEl = document.getElementById('last-saved');
            savedEl.textContent = `最后保存: ${info.lastSaved}`;
        }
        
        if (info.lastModified) {
            const statusEl = document.getElementById('file-status');
            statusEl.textContent = `SHA: ${info.lastModified.substring(0, 7)}`;
        }
    }
    
    static updateCursorPosition(line, column) {
        const posEl = document.getElementById('cursor-position');
        posEl.textContent = `行: ${line}, 列: ${column}`;
    }
    
    static updateCharacterCount(count, lines) {
        const charEl = document.getElementById('character-count');
        const lineEl = document.getElementById('line-count');
        charEl.textContent = `字符: ${count}`;
        lineEl.textContent = `行数: ${lines}`;
    }
    
    static updateValidationStatus(isValid, message = '') {
        const statusEl = document.getElementById('validation-status');
        if (isValid) {
            statusEl.textContent = '✅ JSON格式正确';
            statusEl.className = 'validation-status valid';
        } else {
            statusEl.textContent = `❌ ${message}`;
            statusEl.className = 'validation-status invalid';
        }
    }
}

// JSON树视图类
class TreeView {
    static generateTree(obj, container) {
        container.innerHTML = '';
        const tree = this.createTreeNode(obj, '', 0);
        container.appendChild(tree);
    }
    
    static createTreeNode(value, key, depth) {
        const item = document.createElement('div');
        item.className = 'tree-item';
        item.style.paddingLeft = `${depth * 20}px`;
        
        if (typeof value === 'object' && value !== null) {
            const isArray = Array.isArray(value);
            const keys = Object.keys(value);
            
            if (keys.length > 0) {
                item.className += ' tree-expandable tree-expanded';
                
                const header = document.createElement('div');
                header.className = 'tree-header';
                header.innerHTML = `
                    <span class="tree-toggle">▼</span>
                    ${key ? `<span class="tree-key">${key}</span>: ` : ''}
                    <span class="tree-bracket">${isArray ? '[' : '{'}</span>
                    <span class="tree-count">(${keys.length})</span>
                `;
                
                header.addEventListener('click', () => {
                    item.classList.toggle('tree-expanded');
                    item.classList.toggle('tree-collapsed');
                    const toggle = header.querySelector('.tree-toggle');
                    toggle.textContent = item.classList.contains('tree-expanded') ? '▼' : '▶';
                });
                
                item.appendChild(header);
                
                const content = document.createElement('div');
                content.className = 'tree-content';
                
                keys.forEach((k, index) => {
                    const child = this.createTreeNode(value[k], isArray ? `[${k}]` : k, depth + 1);
                    content.appendChild(child);
                });
                
                const footer = document.createElement('div');
                footer.className = 'tree-item';
                footer.style.paddingLeft = `${depth * 20}px`;
                footer.innerHTML = `<span class="tree-bracket">${isArray ? ']' : '}'}</span>`;
                content.appendChild(footer);
                
                item.appendChild(content);
            } else {
                item.innerHTML = `
                    ${key ? `<span class="tree-key">${key}</span>: ` : ''}
                    <span class="tree-bracket">${isArray ? '[]' : '{}'}</span>
                `;
            }
        } else {
            const valueClass = this.getValueClass(value);
            const displayValue = this.formatValue(value);
            
            item.innerHTML = `
                ${key ? `<span class="tree-key">${key}</span>: ` : ''}
                <span class="tree-value ${valueClass}">${displayValue}</span>
            `;
        }
        
        return item;
    }
    
    static getValueClass(value) {
        if (typeof value === 'string') return 'tree-string';
        if (typeof value === 'number') return 'tree-number';
        if (typeof value === 'boolean') return 'tree-boolean';
        if (value === null) return 'tree-null';
        return 'tree-value';
    }
    
    static formatValue(value) {
        if (typeof value === 'string') {
            return `"${value}"`;
        }
        if (value === null) {
            return 'null';
        }
        return String(value);
    }
}

// JSON操作类
class JSONOperations {
    static format() {
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
        MessageManager.confirm('确认清空编辑器内容吗？', (confirmed) => {
            if (confirmed) {
                editor.setValue('{}');
                MessageManager.show('编辑器已清空', 'info');
            }
        });
    }
}

// 文件操作类
class FileOperations {
    static upload() {
        const input = document.getElementById('file-input');
        input.click();
    }
    
    static handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.json')) {
            MessageManager.show('请选择JSON文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                JSON.parse(content); // 验证JSON格式
                editor.setValue(content);
                MessageManager.show(`文件 "${file.name}" 上传成功`, 'success');
            } catch (error) {
                const translatedError = Utils.translateJsonError(error);
                MessageManager.show(`文件格式错误: ${translatedError}`, 'error');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // 清空input
    }
    
    static download() {
        try {
            const content = editor.getValue();
            JSON.parse(content); // 验证JSON格式
            
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `luna-tv-config-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            MessageManager.show('文件下载成功', 'success');
        } catch (error) {
            const translatedError = Utils.translateJsonError(error);
            MessageManager.show(`下载失败: ${translatedError}`, 'error');
        }
    }
}

// 编辑器操作类
class EditorOperations {
    static copy() {
        const content = editor.getValue();
        navigator.clipboard.writeText(content).then(() => {
            MessageManager.show('内容已复制到剪贴板', 'success');
        }).catch(() => {
            MessageManager.show('复制失败', 'error');
        });
    }
    
    static search() {
        editor.getAction('actions.find').run();
    }
    
    static toggleFullscreen() {
        const container = document.querySelector('.app-container');
        const btn = document.getElementById('fullscreen-btn');
        
        if (!isFullscreen) {
            container.classList.add('fullscreen-mode');
            btn.textContent = '🔍 退出全屏';
            isFullscreen = true;
            MessageManager.show('已进入全屏模式', 'info');
        } else {
            container.classList.remove('fullscreen-mode');
            btn.textContent = '🔍 全屏';
            isFullscreen = false;
            MessageManager.show('已退出全屏模式', 'info');
        }
        
        // 重新计算编辑器大小
        setTimeout(() => {
            editor.layout();
        }, 100);
    }
}

// 初始化Monaco编辑器
function initializeEditor() {
    require.config({ 
        paths: { 
            'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' 
        } 
    });
    
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('json-editor'), {
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
            foldingHighlight: true,
            showFoldingControls: 'always',
            bracketPairColorization: {
                enabled: true
            }
        });
        
        // 编辑器事件监听
        editor.onDidChangeModelContent(() => {
            JSONOperations.validate();
            updateEditorStats();
            updateTreeView();
            updateSaveButton();
        });
        
        editor.onDidChangeCursorPosition((e) => {
            StatusManager.updateCursorPosition(e.position.lineNumber, e.position.column);
        });
        
        // 初始化完成
        updateEditorStats();
        updateTreeView();
        MessageManager.show('编辑器初始化完成', 'success');
    });
}

// 更新编辑器统计信息
function updateEditorStats() {
    if (!editor) return;
    
    const content = editor.getValue();
    const lines = content.split('\n').length;
    const chars = content.length;
    
    StatusManager.updateCharacterCount(chars, lines);
    
    const blob = new Blob([content]);
    StatusManager.updateFileInfo({ size: blob.size });
}

// 更新树状视图
function updateTreeView() {
    const treeContainer = document.getElementById('json-tree');
    if (!treeContainer || !editor) return;
    
    try {
        const content = editor.getValue();
        const parsed = JSON.parse(content);
        TreeView.generateTree(parsed, treeContainer);
    } catch (error) {
        treeContainer.innerHTML = `<div class="error-message">JSON格式错误，无法生成树状视图</div>`;
    }
}

// 更新保存按钮状态
function updateSaveButton() {
    const saveBtn = document.getElementById('save-btn');
    if (!editor || !githubToken) {
        saveBtn.disabled = true;
        return;
    }
    
    const hasChanges = editor.getValue() !== currentConfig;
    saveBtn.disabled = !hasChanges;
    saveBtn.textContent = hasChanges ? '💾 保存配置 *' : '💾 保存配置';
}

// 标签页切换
function switchTab(tabName) {
    // 隐藏所有标签页内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签页
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 如果是编辑器标签页，重新计算布局
    if (tabName === 'editor') {
        setTimeout(() => {
            editor.layout();
        }, 100);
    }
    
    // 如果是树状视图，更新树状视图
    if (tabName === 'tree') {
        updateTreeView();
    }
    
    // 如果是预览标签页，更新预览内容
    if (tabName === 'preview') {
        updatePreview();
    }
}

// 更新预览内容
function updatePreview() {
    const previewContent = document.getElementById('json-preview-content');
    if (!previewContent || !editor) return;
    
    try {
        const content = editor.getValue();
        const parsed = JSON.parse(content);
        previewContent.textContent = JSON.stringify(parsed, null, 2);
    } catch (error) {
        previewContent.textContent = `JSON格式错误，无法生成预览:\n${error.message}`;
    }
}

// 事件监听器设置
function setupEventListeners() {
    // Token输入框
    const tokenInput = document.getElementById('github-token');
    tokenInput.addEventListener('input', (e) => {
        githubToken = e.target.value.trim();
        if (githubToken) {
            TokenManager.saveToken(githubToken);
        }
    });
    
    // 按钮事件
    document.getElementById('load-btn').addEventListener('click', GitHubAPI.loadConfig);
    document.getElementById('save-btn').addEventListener('click', GitHubAPI.saveConfig);
    document.getElementById('clear-token-btn').addEventListener('click', TokenManager.clearToken);
    
    document.getElementById('upload-btn').addEventListener('click', FileOperations.upload);
    document.getElementById('download-btn').addEventListener('click', FileOperations.download);
    document.getElementById('file-input').addEventListener('change', FileOperations.handleFileUpload);
    
    document.getElementById('format-btn').addEventListener('click', JSONOperations.format);
    document.getElementById('minify-btn').addEventListener('click', JSONOperations.minify);
    document.getElementById('validate-btn').addEventListener('click', JSONOperations.validate);
    document.getElementById('clear-btn').addEventListener('click', JSONOperations.clear);
    
    document.getElementById('copy-btn').addEventListener('click', EditorOperations.copy);
    document.getElementById('search-btn').addEventListener('click', EditorOperations.search);
    document.getElementById('fullscreen-btn').addEventListener('click', EditorOperations.toggleFullscreen);
    
    // 历史记录
    document.getElementById('save-history-btn').addEventListener('click', () => {
        const content = editor.getValue();
        HistoryManager.save(content);
    });
    
    document.getElementById('history-select').addEventListener('change', (e) => {
        if (e.target.value) {
            HistoryManager.load(parseInt(e.target.value));
        }
    });
    
    document.getElementById('clear-history-btn').addEventListener('click', HistoryManager.clear);
    
    // 编辑器选项
    document.getElementById('tree-view-toggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            updateTreeView();
        }
    });
    
    document.getElementById('word-wrap-toggle').addEventListener('change', (e) => {
        editor.updateOptions({ wordWrap: e.target.checked ? 'on' : 'off' });
    });
    
    document.getElementById('minimap-toggle').addEventListener('change', (e) => {
        editor.updateOptions({ minimap: { enabled: e.target.checked } });
    });
    
    document.getElementById('line-numbers-toggle').addEventListener('change', (e) => {
        editor.updateOptions({ lineNumbers: e.target.checked ? 'on' : 'off' });
    });
    
    document.getElementById('theme-select').addEventListener('change', (e) => {
        monaco.editor.setTheme(e.target.value);
    });
    
    document.getElementById('font-size-slider').addEventListener('input', (e) => {
        const fontSize = parseInt(e.target.value);
        editor.updateOptions({ fontSize });
        document.getElementById('font-size-value').textContent = `${fontSize}px`;
    });
    
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    GitHubAPI.saveConfig();
                    break;
                case 'o':
                    e.preventDefault();
                    GitHubAPI.loadConfig();
                    break;
                case 'u':
                    e.preventDefault();
                    FileOperations.upload();
                    break;
                case 'd':
                    e.preventDefault();
                    FileOperations.download();
                    break;
            }
        }
        
        if (e.key === 'F11') {
            e.preventDefault();
            EditorOperations.toggleFullscreen();
        }
    });
}

// 应用初始化
function initializeApp() {
    // 恢复Token
    TokenManager.restoreToken();
    
    // 加载历史记录
    HistoryManager.loadFromStorage();
    
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
document.addEventListener('DOMContentLoaded', initializeApp);

// 页面卸载前保存状态
window.addEventListener('beforeunload', (e) => {
    if (editor && editor.getValue() !== currentConfig && editor.getValue().trim() !== '') {
        e.preventDefault();
        e.returnValue = '您有未保存的更改，确定要离开吗？';
    }
});

console.log('🌙 Luna TV配置编辑器已启动');
console.log('✨ 功能包括: JSON编辑、GitHub同步、历史记录、树状视图等');
