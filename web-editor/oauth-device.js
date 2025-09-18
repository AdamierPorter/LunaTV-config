const CLIENT_ID = 'Ov23ligWR1OA4D8xEHN4';
const REPO = 'hafrey1/LunaTV-config';
const FILE_PATH = 'luna-tv-config.json';

const loginBtn = document.getElementById('loginBtn');
const loadBtn = document.getElementById('loadBtn');
const configContent = document.getElementById('configContent');
const saveBtn = document.getElementById('saveBtn');
const statusElement = document.getElementById('status');
const infoElement = document.getElementById('info');

let token = localStorage.getItem('access_token');

async function startDeviceFlow() {
    try {
        // 获取 device code
        const res = await axios.post('https://github.com/login/device/code', 
            `client_id=${CLIENT_ID}&scope=repo`, 
            { headers: { 'Content-Type':'application/x-www-form-urlencoded' } }
        );
        const data = res.data;
        console.log('Device Flow Info:', data);

        infoElement.innerHTML = `请在 <a href="${data.verification_uri}" target="_blank">GitHub 验证页面</a> 输入验证码: <b>${data.user_code}</b>`;
        statusElement.textContent = '等待用户授权...';

        // 轮询获取 token
        const interval = data.interval * 1000;
        let polling = setInterval(async () => {
            try {
                const tokenRes = await axios.post('https://github.com/login/oauth/access_token',
                    `client_id=${CLIENT_ID}&device_code=${data.device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
                    { headers: { 'Content-Type':'application/x-www-form-urlencoded', 'Accept':'application/json' } }
                );
                if (tokenRes.data.access_token) {
                    clearInterval(polling);
                    token = tokenRes.data.access_token;
                    localStorage.setItem('access_token', token);
                    statusElement.textContent = '授权成功！';
                    loginBtn.style.display = 'none';
                    loadBtn.style.display = 'inline-block';
                    console.log('Access Token:', token);
                }
            } catch(e) { /* 等待授权 */ }
        }, interval);

    } catch(e) {
        console.error('Device Flow 错误:', e);
        statusElement.textContent = '启动授权失败';
    }
}

loginBtn.addEventListener('click', startDeviceFlow);

// 加载配置
loadBtn.addEventListener('click', async () => {
    if (!token) { alert('未获取 token'); return; }
    try {
        const res = await axios.get(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = atob(res.data.content);
        configContent.style.display = 'block';
        configContent.value = data;
        saveBtn.style.display = 'inline-block';
        statusElement.textContent = '配置文件加载成功';
        console.log('文件内容:', data);
    } catch(e) {
        console.error('加载失败', e);
        statusElement.textContent = '加载配置失败';
    }
});

// 保存配置
saveBtn.addEventListener('click', async () => {
    if (!token) { alert('未获取 token'); return; }
    try {
        const shaRes = await axios.get(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const sha = shaRes.data.sha;
        const newConfig = configContent.value;
        await axios.put(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            message: 'Update via Web Editor',
            content: btoa(newConfig),
            sha: sha
        }, { headers: { Authorization: `Bearer ${token}` }});
        statusElement.textContent = '更新成功！';
    } catch(e) {
        console.error('更新失败', e);
        statusElement.textContent = '更新失败';
    }
});

// 页面刷新自动显示 load 按钮
if (token) {
    loginBtn.style.display = 'none';
    loadBtn.style.display = 'inline-block';
}
