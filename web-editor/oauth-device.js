// GitHub API 相关常量
const REPO = 'hafrey1/LunaTV-config'; // 你的仓库名
const FILE_PATH = 'luna-tv-config.json'; // 配置文件路径

// 获取配置文件内容
async function getConfigFile(token) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const configData = atob(response.data.content); // 解码 base64 内容
        console.log('Config File:', configData); // 打印配置文件内容
        return configData;
    } catch (error) {
        console.error('加载配置文件失败:', error);
        statusElement.textContent = '加载配置文件失败，请稍后重试。';
        statusElement.style.color = 'red';
    }
}

// 获取文件的 SHA 值
async function getFileSha(token) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.sha;
    } catch (error) {
        console.error('获取文件 SHA 值失败:', error);
        statusElement.textContent = '获取文件 SHA 值失败，请重试。';
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
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('更新配置文件:', response.data);
    } catch (error) {
        console.error('更新配置文件失败:', error);
        statusElement.textContent = '更新配置文件失败，请稍后重试。';
        statusElement.style.color = 'red';
    }
}
