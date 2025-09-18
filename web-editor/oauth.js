const CLIENT_ID = 'Ov23ligWR1OA4D8xEHN4';
const CLIENT_SECRET = '85babf4aed3d705c7aa51ec65fbc6a5989d91f92';
const REDIRECT_URI = 'https://hafrey1.github.io/LunaTV-config/web-editor/callback.html';
const API_URL = 'https://api.github.com/user';
const REPO_OWNER = 'hafrey1';  // 替换为你的 GitHub 用户名
const REPO_NAME = 'LunaTV-config';
const FILE_PATH = 'luna-tv-config.json';  // 配置文件路径

// 定义 oauthLogin 函数
function oauthLogin() {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo`;
  window.location.href = authUrl;  // 跳转到 GitHub OAuth 授权页面
}

// 登录按钮点击事件
document.getElementById('loginBtn').addEventListener('click', oauthLogin);

// 获取授权码后处理
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // 使用 code 获取 access token
  fetch(`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    const accessToken = data.access_token;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      window.location.href = 'index.html';  // 重定向回 index 页面
    } else {
      alert('授权失败');
    }
  });
}

// 读取 GitHub 仓库中的配置文件
function loadConfigFile() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    alert('请先登录');
    return;
  }

  fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.content) {
      const configData = atob(data.content);  // 解码 Base64 内容
      document.getElementById('jsonEditor').value = configData;
      document.getElementById('editorContainer').style.display = 'block';  // 显示编辑器
    } else {
      alert('无法加载配置文件');
    }
  });
}

// 保存配置文件
document.getElementById('saveBtn').addEventListener('click', () => {
  const accessToken = localStorage.getItem('accessToken');
  const newConfig = document.getElementById('jsonEditor').value;

  if (!accessToken) {
    alert('请先登录');
    return;
  }

  // 获取文件内容的 SHA 值
  fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    const sha = data.sha;
    const updateData = {
      message: '更新 luna-tv-config.json 配置',
      content: btoa(newConfig),  // Base64 编码内容
      sha: sha
    };

    // 更新 GitHub 文件内容
    fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.content) {
        alert('配置文件已成功保存！');
      } else {
        alert('保存失败');
      }
    });
  });
}

// 页面加载时读取配置文件
if (window.location.pathname === '/web-editor/index.html') {
  loadConfigFile();
}
