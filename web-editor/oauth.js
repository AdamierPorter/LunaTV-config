const clientId = 'Ov23ligWR1OA4D8xEHN4';
const redirectUri = 'https://hafrey1.github.io/LunaTV-config/web-editor/callback.html';
const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;

function startOAuthFlow() {
    window.location.href = authUrl;
}

function getAccessToken() {
    const code = localStorage.getItem('github_oauth_code');
    if (!code) {
        alert('请先授权登录！');
        return;
    }

    fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: '85babf4aed3d705c7aa51ec65fbc6a5989d91f92',
            code: code,
            redirect_uri: redirectUri
        })
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('github_access_token', data.access_token);
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('editorContainer').classList.remove('hidden');
        loadConfig();
    })
    .catch(error => {
        console.error('OAuth 认证失败:', error);
    });
}

function loadConfig() {
    const accessToken = localStorage.getItem('github_access_token');
    fetch('https://api.github.com/repos/hafrey1/LunaTV-config/contents/luna-tv-config.json', {
        headers: {
            'Authorization': `token ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            const decodedContent = atob(data.content);
            document.getElementById('jsonEditor').value = decodedContent;
        }
    })
    .catch(error => {
        console.error('加载配置失败:', error);
    });
}
