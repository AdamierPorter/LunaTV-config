class ConfigEditor {
    constructor() {
        this.github = new GitHubAPI();
        this.currentConfig = null;
        this.isModified = false;
        
        this.initElements();
        this.initEventListeners();
        this.checkLoginStatus();
    }

    initElements() {
        // 按钮元素
        this.loginBtn = document.getElementById('loginBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.loadBtn = document.getElementById('loadBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.formatBtn = document.getElementById('formatBtn');
        this.validateBtn = document.getElementById('validateBtn');

        // 界面元素
        this.userInfo = document.getElementById('userInfo');
        this.username = document.getElementById('username');
        this.userAvatar = document.getElementById('userAvatar');
        this.status = document.getElementById('status');
        this.jsonEditor = document.getElementById('jsonEditor');
        
        // 信息面板
        this.fileSize = document.getElementById('fileSize');
        this.lastModified = document.getElementById('lastModified');
        this.apiCount = document.getElementById('apiCount');
        
        // 模态框
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modalBody');
    }

    initEventListeners() {
        // 认证相关
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        // 编辑器功能
        this.loadBtn.addEventListener('click', () => this.loadConfig());
        this.saveBtn.addEventListener('click', () => this.saveConfig());
        this.formatBtn.addEventListener('click', () => this.formatJSON());
        this.validateBtn.addEventListener('click', () => this.validateJSON());

        // 编辑器内容变化
        this.jsonEditor.addEventListener('input', () => this.handleContentChange());

        // 模态框关闭
        this.modal.querySelector('.close').addEventListener('click', () => this.hideModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    if (this.github.isLoggedIn()) this.saveConfig();
                }
                if (e.key === 'f') {
                    e.preventDefault();
                    this.formatJSON();
                }
            }
        });
    }

    async handleLogin() {
        try {
            this.updateStatus('登录中...', 'loading');
            await this.github.login();
            this.updateLoginUI();
            this.updateStatus('已连接', 'connected');
        } catch (error) {
            this.showError('登录失败: ' + error.message);
            this.updateStatus('登录失败', 'error');
        }
    }

    handleLogout() {
        this.github.logout();
        this.updateLoginUI();
        this.jsonEditor.value = '';
        this.jsonEditor.placeholder = '请先登录GitHub并加载配置文件...';
        this.saveBtn.disabled = true;
        this.updateStatus('未连接');
        this.clearFileInfo();
    }

    async loadConfig() {
        if (!this.github.isLoggedIn()) {
            this.showError('请先登录GitHub');
            return;
        }

        try {
            this.updateStatus('加载中...', 'loading');
            const fileData = await this.github.getFile();
            
            this.currentConfig = fileData.content;
            this.jsonEditor.value = JSON.stringify(fileData.content, null, 2);
            this.isModified = false;
            this.saveBtn.disabled = true;
            
            this.updateFileInfo(fileData);
            this.updateStatus('已加载', 'connected');
            
        } catch (error) {
            this.showError('加载配置失败: ' + error.message);
            this.updateStatus('加载失败', 'error');
        }
    }

    async saveConfig() {
        if (!this.github.isLoggedIn()) {
            this.showError('请先登录GitHub');
            return;
        }

        try {
            const configData = JSON.parse(this.jsonEditor.value);
            
            this.updateStatus('保存中...', 'loading');
            await this.github.saveFile(configData, '通过Web编辑器更新配置');
            
            this.currentConfig = configData;
            this.isModified = false;
            this.saveBtn.disabled = true;
            
            this.updateStatus('已保存', 'connected');
            this.showSuccess('配置已成功保存到GitHub');
            
        } catch (error) {
            if (error instanceof SyntaxError) {
                this.showError('JSON格式错误，请检查语法');
            } else {
                this.showError('保存失败: ' + error.message);
            }
            this.updateStatus('保存失败', 'error');
        }
    }

    formatJSON() {
        try {
            const data = JSON.parse(this.jsonEditor.value);
            this.jsonEditor.value = JSON.stringify(data, null, 2);
            this.handleContentChange();
        } catch (error) {
            this.showError('JSON格式错误，无法格式化');
        }
    }

    validateJSON() {
        try {
            const data = JSON.parse(this.jsonEditor.value);
            
            // 检查基本结构
            let message = '✅ JSON格式正确\n\n';
            
            if (data.sites && Array.isArray(data.sites)) {
                message += `📺 共有 ${data.sites.length} 个视频源\n`;
                
                let validSites = 0;
                let adultSites = 0;
                
                data.sites.forEach(site => {
                    if (site.key && site.name && site.api) {
                        validSites++;
                        if (site.is_adult) adultSites++;
                    }
                });
                
                message += `✅ 有效源: ${validSites}\n`;
                message += `🔞 成人源: ${adultSites}\n`;
            }
            
            this.showInfo('JSON验证结果', message);
            
        } catch (error) {
            this.showError('JSON格式错误: ' + error.message);
        }
    }

    handleContentChange() {
        if (!this.currentConfig) return;
        
        try {
            const currentData = JSON.parse(this.jsonEditor.value);
            this.isModified = JSON.stringify(currentData) !== JSON.stringify(this.currentConfig);
            this.saveBtn.disabled = !this.isModified || !this.github.isLoggedIn();
        } catch (error) {
            this.saveBtn.disabled = true;
        }
    }

    updateLoginUI() {
        const isLoggedIn = this.github.isLoggedIn();
        
        this.loginBtn.classList.toggle('hidden', isLoggedIn);
        this.userInfo.classList.toggle('hidden', !isLoggedIn);
        this.loadBtn.disabled = !isLoggedIn;
        
        if (isLoggedIn && this.github.user) {
            this.username.textContent = this.github.user.login;
            this.userAvatar.src = this.github.user.avatar_url;
        }
    }

    updateStatus(text, type = '') {
        this.status.textContent = text;
        this.status.className = 'status ' + type;
    }

    updateFileInfo(fileData) {
        this.fileSize.textContent = this.formatBytes(fileData.size);
        this.lastModified.textContent = new Date(fileData.lastModified).toLocaleString('zh-CN');
        
        if (fileData.content.sites) {
            this.apiCount.textContent = fileData.content.sites.length;
        }
    }

    clearFileInfo() {
        this.fileSize.textContent = '-';
        this.lastModified.textContent = '-';
        this.apiCount.textContent = '-';
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showModal(title, content, type = 'info') {
        this.modalBody.innerHTML = `
            <h3 class="modal-title ${type}">${title}</h3>
            <div class="modal-message">${content}</div>
        `;
        this.modal.classList.remove('hidden');
    }

    hideModal() {
        this.modal.classList.add('hidden');
    }

    showSuccess(message) {
        this.showModal('✅ 成功', message, 'success');
    }

    showError(message) {
        this.showModal('❌ 错误', message, 'error');
    }

    showInfo(title, message) {
        this.showModal(title, `<pre>${message}</pre>`, 'info');
    }

    async checkLoginStatus() {
        if (this.github.isLoggedIn()) {
            try {
                await this.github.getUserInfo();
                this.updateLoginUI();
                this.updateStatus('已连接', 'connected');
            } catch (error) {
                this.github.logout();
                this.updateLoginUI();
                this.updateStatus('连接失败', 'error');
            }
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ConfigEditor();
});
