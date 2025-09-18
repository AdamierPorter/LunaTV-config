function loadConfig() {
    const token = localStorage.getItem('github_token');
    if (!token) {
        alert('未授权，请先登录');
        window.location.href = 'https://hafrey1.github.io/LunaTV-config/web-editor';
        return;
    }

    fetch('https://api.github.com/repos/hafrey1/LunaTV-config/contents/luna-tv-config.json', {
        headers: {
            'Authorization': `token ${token}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            const jsonContent = decodeURIComponent(escape(atob(data.content)));
            document.getElementById('json-editor').value = jsonContent;
            localStorage.setItem('file_sha', data.sha);  // 存储文件的 SHA
        }
    })
    .catch(error => {
        console.error('加载配置失败:', error);
        alert('加载配置失败。');
    });
}

function saveConfig() {
    const token = localStorage.getItem('github_token');
    const sha = localStorage.getItem('file_sha');
    const content = document.getElementById('json-editor').value;

    if (!token) {
        alert('未授权，请先登录');
        return;
    }

    fetch('https://api.github.com/repos/hafrey1/LunaTV-config/contents/luna-tv-config.json', {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: '更新配置文件',
            content: btoa(unescape(encodeURIComponent(content))),  // Base64 编码
            sha: sha  // 文件的 SHA
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.content) {
            alert('配置已保存！');
        } else {
            alert('保存失败！');
        }
    })
    .catch(error => {
        console.error('保存失败:', error);
        alert('保存失败！');
    });
}

// 页面加载时，尝试加载配置文件
window.onload = loadConfig;
