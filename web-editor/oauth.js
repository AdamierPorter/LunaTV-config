function oauthLogin() {
    const clientID = 'Ov23ligWR1OA4D8xEHN4';
    const redirectURI = 'https://hafrey1.github.io/LunaTV-config/web-editor/callback.html';
    const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}`;
    window.location.href = url;
}
