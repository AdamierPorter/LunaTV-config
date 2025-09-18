// GitHub OAuth 配置信息
const CLIENT_ID = 'Ov23ligWR1OA4D8xEHN4'; // 你的 GitHub 客户端 ID
const CLIENT_SECRET = '85babf4aed3d705c7aa51ec65fbc6a5989d91f92'; // 你的 GitHub 客户端密钥
const REDIRECT_URI = 'https://hafrey1.github.io/LunaTV-config/web-editor/callback.html'; // GitHub OAuth 回调 URL
const REPO = 'hafrey1/LunaTV-config'; // GitHub 仓库
const FILE_PATH = 'luna-tv-config.json'; // 配置文件路径

// DOM 元素
const loginBtn = document.getElementById('loginBtn');
const loadBtn = document.getElementById('loadBtn');
const configContent = document.getElementById('configContent');
const saveBtn = document.getElementById('saveBtn');
const statusElement = document.getElementById('status');

// 登录按钮点击事件
loginBtn.addEventListener('click', () => {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo`;
    window.location.href = authUrl; // 跳转到 GitHub OAuth 登录页面
});

// 获取 URL 中的授权码
function getAuthCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

// 获取 OAuth Access Token
async function getAccessToken(code) {
    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code
            }),
        });
        const data = await response.text();
        const params = new URLSearchParams(data);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            return accessToken;
        } else {
            throw new Error('Access token not found in response');
        }
    } catch (error) {
        console.error('Error getting access token:', error);
        statusElement.textContent = '获取访问令牌失败，请重试。';
        statusElement.style.color = 'red';
        return null;
    }
}

// 获取配置文件内容
async function getConfigFile(token) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const configData = atob(response.data.content); // 解码 base64 内容
        return configData;
    } catch (error) {
        console.error('Error getting config file:', error);
        statusElement.textContent = '加载配置文件失败，请稍后重试。';
        statusElement.style.color = 'red';
    }
}

// 更新配置文件内容
async function updateConfigFile(token, newConfig, sha) {
    try {
        const response = await axios.put(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            message: 'Update luna-tv-config.json via Web editor',
            content: btoa(newConfig), // 将内容编码为 base64
            sha: sha // 传递文件的 sha 值来更新文件
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating config file:', error);
        statusElement.textContent = '更新配置文件失败，请稍后重试。';
        statusElement.style.color = 'red';
    }
}

// 获取文件的 SHA 值
async function getFileSha(token) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.sha;
    } catch (error) {
        console.error('Error getting file SHA:', error);
        statusElement.textContent = '获取文件 SHA 失败。';
        statusElement.style.color = 'red';
    }
}

// 处理 OAuth 回调
async function handleAuthCallback() {
    const code = getAuthCodeFromUrl();
    if (code) {
        const accessToken = await getAccessToken(code); // 获取 access token
        if (accessToken) {
            localStorage.setItem('access_token', accessToken); // 将 access token 存储在本地
            loginBtn.style.display = 'none'; // 隐藏登录按钮
            loadBtn.style.display = 'inline-block'; // 显示加载配置按钮

            loadBtn.addEventListener('click', async () => {
                const token = localStorage.getItem('access_token');
                const configData = await getConfigFile(token); // 获取配置文件内容
                configContent.style.display = 'block';
                configContent.value = configData; // 显示文件内容在 textarea 中
                saveBtn.style.display = 'inline-block'; // 显示保存按钮
                saveBtn.addEventListener('click', async () => {
                    const sha = await getFileSha(token); // 获取文件的 SHA 值
                    const newConfig = configContent.value; // 获取修改后的内容
                    await updateConfigFile(token, newConfig, sha); // 更新配置文件
                    statusElement.textContent = '配置文件已保存！';
                    statusElement.style.color = 'green';
                });
            });
        }
    }
}

// 调用 handleAuthCallback 处理 OAuth 回调
if (window.location.href.includes('callback.html')) {
    handleAuthCallback();
}
