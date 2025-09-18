let editor;
let currentConfig = '';
let githubToken = '';

// 初始化Monaco编辑器
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.40.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('json-editor'), {
        value: '// 请先加载配置文件',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on'
    });
    
    editor.onDidChangeModelContent(() => {
        const saveBtn = document.getElementById('save-btn');
        if (githubToken && editor.getValue() !== currentConfig) {
            saveBtn.disabled = false;
            saveBtn.textContent = '保存配置 *';
        } else {
            saveBtn.disabled = true;
            saveBtn.textContent = '保存配置';
        }
    });
});

function updateStatus(message, type = 'normal') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = type;
}

async function loadConfig() {
    const tokenInput = document.getElementById('github-token');
    githubToken = tokenInput.value.trim();
    
    if (!githubToken) {
        updateStatus('请输入GitHub Personal Access Token', 'error');
        return;
    }
    
    updateStatus('正在加载配置文件...', 'loading');
    
    try {
        const response = await fetch('https://api.github.com/repos/hafrey1/LunaTV-config/contents/luna-tv-config.json', {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Luna-TV-Config-Editor'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = atob(data.content);
        
        // 验证JSON格式
        try {
            JSON.parse(content);
            currentConfig = content;
            editor.setValue(content);
            updateStatus('配置文件加载成功', 'success');
            document.getElementById('save-btn').disabled = false;
        } catch (jsonError) {
            throw new Error('配置文件不是有效的JSON格式');
        }
        
    } catch (error) {
        updateStatus(`加载失败: ${error.message}`, 'error');
        console.error('Error loading config:', error);
    }
}

async function saveConfig() {
    if (!githubToken) {
        updateStatus('请先输入Token并加载配置', 'error');
        return;
    }
    
    const newContent = editor.getValue();
    
    // 验证JSON格式
    try {
        JSON.parse(newContent);
    } catch (error) {
        updateStatus('保存失败: JSON格式无效', 'error');
        return;
    }
    
    updateStatus('正在保存配置文件...', 'loading');
    
    try {
        // 获取文件的当前SHA
        const getResponse = await fetch('https://api.github.com/repos/hafrey1/LunaTV-config/contents/luna-tv-config.json', {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Luna-TV-Config-Editor'
            }
        });
        
        if (!getResponse.ok) {
            throw new Error(`获取文件信息失败: ${getResponse.status}`);
        }
        
        const fileData = await getResponse.json();
        const sha = fileData.sha;
        
        // 保存文件
        const saveResponse = await fetch('https://api.github.com/repos/hafrey1/LunaTV-config/contents/luna-tv-config.json', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Luna-TV-Config-Editor',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Update luna-tv-config.json via web editor - ${new Date().toISOString()}`,
                content: btoa(unescape(encodeURIComponent(newContent))),
                sha: sha,
                branch: 'main'
            })
        });
        
        if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(`保存失败: ${errorData.message || saveResponse.statusText}`);
        }
        
        currentConfig = newContent;
        updateStatus('配置文件保存成功', 'success');
        document.getElementById('save-btn').disabled = true;
        document.getElementById('save-btn').textContent = '保存配置';
        
    } catch (error) {
        updateStatus(`保存失败: ${error.message}`, 'error');
        console.error('Error saving config:', error);
    }
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (!document.getElementById('save-btn').disabled) {
            saveConfig();
        }
    }
});
