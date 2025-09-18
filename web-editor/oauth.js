function oauthLogin() {
    const clientID = 'Ov23ligWR1OA4D8xEHN4';  // 你的 Client ID
    const redirectURI = 'https://hafrey1.github.io/LunaTV-config/web-editor/callback.html';  // 授权回调 URL
    const scope = 'repo';  // 请求访问仓库的权限
    const state = 'random_string_for_security';  // 防止 CSRF 攻击

    const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scope}&state=${state}`;
    window.location.href = url;  // 重定向到 GitHub 授权页面
}
