let editor;
let currentConfig = '';
let githubToken = '';
let currentSha = '';

// GitHub API 配置
const GITHUB_CONFIG = {
    owner: 'hafrey1',
    repo: 'LunaTV-config',
    path: 'luna-tv-config.json',
    branch: 'main'
};

// Token 存储配置（加密存储）
const TOKEN_STORAGE_KEY = 'lunatv_editor_token_encrypted';
const TOKEN_HINT_KEY = 'lunatv_editor_token_hint';

// 简单的加密/解密函数（基于浏览器指纹）
function getFingerprint() {
    return btoa(navigator.userAgent + navigator.language + screen.width + screen.height).slice(0, 16);
}

function encryptToken(token) {
    const key = getFingerprint();
    let encrypted = '';
    for (let i = 0; i < token.length; i++) {
        encrypted += String.fromCharCode(token.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted);
}

function decryptToken(encrypted) {
    try {
        const decoded = atob(encrypted);
        const key = getFingerprint();
        let decrypted = '';
        for (let i = 0; i < decoded.length; i++) {
            decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return decrypted;
    } catch {
        return null;
    }
}

// 初始化Monaco编辑器
require.config({ 
    paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } 
});

require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('json-editor'), {
        value: '// 🌙 Luna TV 配置编辑器\n// 请先输入 GitHub Token 并点击"加载配置"按钮\n\n{\n  "message": "请加载配置文件开始编辑"\n}',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        smoothScrolling: true,
        cursorSmoothCaretAnimation: true
    });
    
    // 编辑器内容变化监听
    editor.onDidChangeModelContent(() => {
        validateJson();
        updateSaveButton();
        updateFileSize();
    });
    
    // 设置编辑器选项监听
    setupEditorOptions();
    
    // 尝试恢复保存的Token
    loadSavedToken();
    
    updateStatus('🌙 欢迎使用 Luna TV 配置编辑器！', 'normal');
});

// 🔧 修复UTF-8编码的关键函数
function decodeBase64Unicode(str) {
    try {
        const bytes = Uint8Array.from(atob(str), c => c.charCodeAt(0));
        return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
        console.error('UTF-8解码失败:', error);
        return decodeURIComponent(escape(atob(str)));
    }
}

function encodeBase64Unicode(str) {
    try {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        return btoa(String.fromCharCode(...bytes));
    } catch (error) {
        console.error('UTF-8编码失败:', error);
        return btoa(unescape(encodeURIComponent(str)));
    }
}

// 💾 Token本地保存和恢复
function saveToken(token) {
    try {
        if (token && token.length > 10) {
            const encrypted = encryptToken(token);
            localStorage.setItem(TOKEN_STORAGE_KEY, encrypted);
            localStorage.setItem(TOKEN_HINT_KEY, `已保存Token (${token.slice(0, 4)}...${token.slice(-4)})`);
            
            // 设置过期时间（7天）
            const expiry = Date.now() + (7 * 24 * 60 * 60 * 1000);
            localStorage.setItem(TOKEN_STORAGE_KEY + '_expiry', expiry.toString());
            
            updateStatus('💾 Token已安全保存到本地（7天有效期）', 'success');
        }
    } catch (error) {
        console.error('Token保存失败:', error);
    }
}

function loadSavedToken() {
    try {
        const expiry = localStorage.getItem(TOKEN_STORAGE_KEY + '_expiry');
        
        // 检查是否过期
        if (expiry && Date.now() > parseInt(expiry)) {
            clearSavedToken();
            return;
        }
        
        const encrypted = localStorage.getItem(TOKEN_STORAGE_KEY);
        const hint = localStorage.getItem(TOKEN_HINT_KEY);
        
        if (encrypted) {
            const token = decryptToken(encrypted);
            if (token) {
                const tokenInput = document.getElementById('github-token');
                tokenInput.value = token;
                tokenInput.placeholder = hint || '已恢复保存的Token';
                githubToken = token;
                
                // 添加自动加载选项
                const loadBtn = document.getElementById('load-btn');
                loadBtn.innerHTML = '🔄 重新加载配置';
                
                updateStatus('🔓 已恢复保存的Token，点击重新加载配置', 'success');
            }
        }
    } catch (error) {
        console.error('Token恢复失败:', error);
        clearSavedToken();
    }
}

function clearSavedToken() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_HINT_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY + '_expiry');
    
    const tokenInput = document.getElementById('github-token');
    tokenInput.value = '';
    tokenInput.placeholder = '请输入 GitHub Personal Access Token (classic)';
    githubToken = '';
    
    updateStatus('🗑️ 已清除保存的Token', 'normal');
}

// 🌐 中文化的JSON错误信息
function translateJsonError(error) {
    const message = error.message.toLowerCase();
    
    // 常见JSON错误的中文翻译映射
    const translations = {
        'unexpected token': '意外的字符',
        'unexpected end of json input': 'JSON输入意外结束',
        'expected property name': '期望属性名称',
        'expected':'期望',
        'unexpected string': '意外的字符串',
        'unexpected number': '意外的数字',
        'invalid character': '无效字符',
        'malformed': '格式错误',
        'duplicate': '重复',
        'trailing comma': '多余的逗号',
        'at position': '位置',
        'in json at position': 'JSON中位置',
        'line': '行',
        'column': '列'
    };
    
    let translatedMessage = error.message;
    
    // 替换常见错误术语
    Object.entries(translations).forEach(([en, zh]) => {
        const regex = new RegExp(en, 'gi');
        translatedMessage = translatedMessage.replace(regex, zh);
    });
    
    // 处理位置信息
    translatedMessage = translatedMessage.replace(/at position (\d+)/gi, '在位置 $1');
    translatedMessage = translatedMessage.replace(/line (\d+)/gi, '第 $1 行');
    translatedMessage = translatedMessage.replace(/column (\d+)/gi, '第 $1 列');
    
    // 如果没有匹配到翻译，提供通用的中文说明
    if (translatedMessage === error.message) {
        return `JSON格式错误: ${error.message}`;
    }
    
    return translatedMessage;
}

// 验证JSON格式（中文化错误提示）
function validateJson() {
    if (!editor) return;
    
    const validationStatus = document.getElementById('validation-status');
    const content = editor.getValue();
    
    if (!content.trim()) {
        validationStatus.textContent = '';
        validationStatus.className = '';
        return;
    }
    
    try {
        JSON.parse(content);
        validationStatus.textContent = '✅ JSON格式正确';
        validationStatus.className = 'json-valid';
    } catch (error) {
        const chineseError = translateJsonError(error);
        validationStatus.textContent = `❌ ${chineseError}`;
        validationStatus.className = 'json-invalid';
    }
}

// 加载配置文件
async function loadConfig() {
    const tokenInput = document.getElementById('github-token');
    githubToken = tokenInput.value.trim();
    
    if (!githubToken) {
        updateStatus('❌ 请先输入 GitHub Personal Access Token', 'error');
        return;
    }
    
    if (!githubToken.startsWith('ghp_') && !githubToken.startsWith('github_pat_')) {
        updateStatus('⚠️ Token格式可能不正确，请确认使用的是 Personal Access Token (classic)', 'warning');
    }
    
    // 保存Token到本地
    saveToken(githubToken);
    
    updateStatus('📥 正在加载配置文件...', 'loading');
    setButtonsLoading(true);
    
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Luna-TV-Config-Editor/1.0'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Token验证失败，请检查Token权限是否包含repo访问权限');
            } else if (response.status === 404) {
                throw new Error('文件未找到，请确认仓库和文件路径正确');
            } else {
                throw new Error(`请求失败 (${response.status}): ${response.statusText}`);
            }
        }
        
        const data = await response.json();
        currentSha = data.sha;
        
        // 🔧 关键修复：使用新的UTF-8解码函数
        const content = decodeBase64Unicode(data.content.replace(/\s/g, ''));
        
        // 验证JSON格式
        try {
            const parsed = JSON.parse(content);
            currentConfig = content;
            editor.setValue(content);
            
            // 格式化JSON以提高可读性
            setTimeout(() => {
                editor.getAction('editor.action.formatDocument').run();
            }, 100);
            
            updateStatus('✅ 配置文件加载成功！中文编码已修复', 'success');
            updateFileInfo(data);
            document.getElementById('save-btn').disabled = true;
            document.getElementById('format-btn').disabled = false;
            
        } catch (jsonError) {
            const chineseError = translateJsonError(jsonError);
            updateStatus(`❌ JSON格式错误: ${chineseError}`, 'error');
            editor.setValue(content); // 仍然显示内容以便修复
        }
        
    } catch (error) {
        updateStatus(`❌ 加载失败: ${error.message}`, 'error');
        console.error('加载配置失败:', error);
    } finally {
        setButtonsLoading(false);
    }
}

// 保存配置文件
async function saveConfig() {
    if (!githubToken) {
        updateStatus('❌ 请先加载配置文件', 'error');
        return;
    }
    
    const newContent = editor.getValue();
    
    // 验证JSON格式
    try {
        JSON.parse(newContent);
    } catch (error) {
        const chineseError = translateJsonError(error);
        updateStatus(`❌ 保存失败：${chineseError}`, 'error');
        return;
    }
    
    if (newContent === currentConfig) {
        updateStatus('ℹ️ 文件未发生变化，无需保存', 'normal');
        return;
    }
    
    updateStatus('💾 正在保存配置文件...', 'loading');
    setButtonsLoading(true);
    
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;
        
        // 🔧 关键修复：使用新的UTF-8编码函数
        const encodedContent = encodeBase64Unicode(newContent);
        
        const saveResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Luna-TV-Config-Editor/1.0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `🌙 通过Web编辑器更新配置 - ${new Date().toLocaleString('zh-CN', {
                    timeZone: 'Asia/Shanghai',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                content: encodedContent,
                sha: currentSha,
                branch: GITHUB_CONFIG.branch
            })
        });
        
        if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(`保存失败 (${saveResponse.status}): ${errorData.message || saveResponse.statusText}`);
        }
        
        const savedData = await saveResponse.json();
        currentSha = savedData.content.sha;
        currentConfig = newContent;
        
        updateStatus('✅ 配置文件保存成功！', 'success');
        document.getElementById('save-btn').disabled = true;
        document.getElementById('save-btn').textContent = '💾 保存配置';
        updateFileInfo(savedData.content);
        
    } catch (error) {
        updateStatus(`❌ 保存失败: ${error.message}`, 'error');
        console.error('保存配置失败:', error);
    } finally {
        setButtonsLoading(false);
    }
}

// 格式化JSON
function formatJson() {
    if (!editor) return;
    
    try {
        const content = editor.getValue();
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        editor.setValue(formatted);
        updateStatus('🎨 JSON格式化完成', 'success');
    } catch (error) {
        const chineseError = translateJsonError(error);
        updateStatus(`❌ 格式化失败: ${chineseError}`, 'error');
    }
}

// 更新保存按钮状态
function updateSaveButton() {
    const saveBtn = document.getElementById('save-btn');
    if (!githubToken || !editor) return;
    
    const currentValue = editor.getValue();
    const hasChanges = currentValue !== currentConfig;
    
    saveBtn.disabled = !hasChanges;
    saveBtn.textContent = hasChanges ? '💾 保存配置 *' : '💾 保存配置';
}

// 更新文件信息
function updateFileInfo(fileData) {
    const sizeElement = document.getElementById('file-size');
    if (fileData && fileData.size) {
        const sizeKB = (fileData.size / 1024).toFixed(2);
        sizeElement.textContent = `📊 大小: ${sizeKB} KB`;
    }
}

// 更新文件大小显示
function updateFileSize() {
    if (!editor) return;
    
    const content = editor.getValue();
    const size = new Blob([content]).size;
    const sizeKB = (size / 1024).toFixed(2);
    
    const sizeElement = document.getElementById('file-size');
    sizeElement.textContent = `📊 大小: ${sizeKB} KB`;
}

// 设置编辑器选项
function setupEditorOptions() {
    // 自动换行
    document.getElementById('word-wrap').addEventListener('change', (e) => {
        editor.updateOptions({ wordWrap: e.target.checked ? 'on' : 'off' });
    });
    
    // 缩略图
    document.getElementById('minimap').addEventListener('change', (e) => {
        editor.updateOptions({ minimap: { enabled: e.target.checked } });
    });
    
    // 主题切换
    document.getElementById('theme-select').addEventListener('change', (e) => {
        monaco.editor.setTheme(e.target.value);
    });
}

// 更新状态显示
function updateStatus(message, type = 'normal') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = type;
}

// 设置按钮加载状态
function setButtonsLoading(loading) {
    const buttons = ['load-btn', 'save-btn', 'format-btn'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        if (loading) {
            btn.style.opacity = '0.7';
            btn.style.cursor = 'wait';
        } else {
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
    });
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (!document.getElementById('save-btn').disabled) {
            saveConfig();
        }
    }
    
    // Alt+Shift+F 格式化
    if (e.altKey && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        if (!document.getElementById('format-btn').disabled) {
            formatJson();
        }
    }
    
    // Ctrl+Alt+C 清除Token
    if (e.ctrlKey && e.altKey && e.key === 'c') {
        e.preventDefault();
        if (confirm('确认要清除本地保存的Token吗？')) {
            clearSavedToken();
        }
    }
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌙 Luna TV 配置编辑器已启动');
    console.log('🔧 已修复中文UTF-8编码问题');
    console.log('💾 已添加Token本地安全保存功能');
    console.log('🌐 已中文化JSON错误提示');
});
