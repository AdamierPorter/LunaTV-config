class GitHubAPI {
    constructor() {
        this.token = localStorage.getItem('github_token');
        this.user = null;
        this.repo = 'hafrey1/LunaTV-config';
        this.filePath = 'luna-tv-config.json';
        this.baseURL = 'https://api.github.com';
    }

    // GitHub OAuth 登录
    async login() {
        const clientId = 'your_github_app_client_id'; // 需要创建GitHub App
        const redirectUri = window.location.origin + '/web-editor/';
        const scope = 'repo';
        
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
        
        // 打开授权窗口
        const popup = window.open(authUrl, 'github-auth', 'width=600,height=600');
        
        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    // 检查是否获得了token
                    const token = localStorage.getItem('github_token');
                    if (token) {
                        this.token = token;
                        this.getUserInfo().then(resolve).catch(reject);
                    } else {
                        reject(new Error('登录已取消'));
                    }
                }
            }, 1000);
        });
    }

    // 获取用户信息
    async getUserInfo() {
        if (!this.token) throw new Error('未登录');
        
        const response = await fetch(`${this.baseURL}/user`, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('获取用户信息失败');
        
        this.user = await response.json();
        return this.user;
    }

    // 获取文件内容
    async getFile() {
        if (!this.token) throw new Error('未登录');
        
        const response = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${this.filePath}`, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) throw new Error('获取文件失败');
        
        const data = await response.json();
        const content = atob(data.content);
        
        return {
            content: JSON.parse(content),
            sha: data.sha,
            size: data.size,
            lastModified: data.commit?.committer?.date || new Date().toISOString()
        };
    }

    // 保存文件
    async saveFile(content, message = '更新配置文件') {
        if (!this.token) throw new Error('未登录');
        
        // 首先获取当前文件的SHA
        const currentFile = await this.getFile();
        
        const requestBody = {
            message: message,
            content: btoa(JSON.stringify(content, null, 2)),
            sha: currentFile.sha,
            committer: {
                name: this.user.name || this.user.login,
                email: this.user.email || `${this.user.login}@users.noreply.github.com`
            }
        };
        
        const response = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${this.filePath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`保存失败: ${error.message}`);
        }
        
        return await response.json();
    }

    // 登出
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('github_token');
    }

    // 检查是否已登录
    isLoggedIn() {
        return !!this.token;
    }
}

// 处理GitHub OAuth回调
if (window.location.search.includes('code=')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // 这里需要通过后端服务器交换access token
    // 由于安全原因，不能在前端直接使用client_secret
    // 简化版本：假设您有后端API来处理这个交换
    fetch('/api/github-oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            localStorage.setItem('github_token', data.access_token);
            window.close(); // 关闭弹窗
        }
    })
    .catch(error => console.error('OAuth交换失败:', error));
}
