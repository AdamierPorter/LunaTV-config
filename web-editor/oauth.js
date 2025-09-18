// oauth.js
// 使用 GitHub 设备授权（Device Flow）在前端无后端完成登录
// 文档参考：POST https://github.com/login/device/code 与 POST https://github.com/login/oauth/access_token

const API_BASE = "https://api.github.com";
const DEVICE_CODE_URL = "https://github.com/login/device/code";
const TOKEN_URL = "https://github.com/login/oauth/access_token";

// 将 token 存在 sessionStorage，页面关闭即清空
const TOKEN_KEY = "gh_device_access_token";

function saveToken(token) {
	sessionStorage.setItem(TOKEN_KEY, token);
}

function loadToken() {
	return sessionStorage.getItem(TOKEN_KEY);
}

function clearToken() {
	sessionStorage.removeItem(TOKEN_KEY);
}

function setAuthStatus(text) {
	document.getElementById("auth-status").textContent = text;
}

function setFileStatus(text) {
	document.getElementById("file-status").textContent = text;
}

function $(id) {
	return document.getElementById(id);
}

// 从 URL 解析 owner 与 repo
function parseRepoUrlToFields() {
	const url = $("repoUrl").value.trim();
	try {
		const u = new URL(url);
		// 期待 https://github.com/{owner}/{repo}
		const parts = u.pathname.split("/").filter(Boolean);
		if (u.hostname !== "github.com" || parts.length < 2) {
			alert("请输入有效的仓库URL，例如：https://github.com/owner/repo");
			return;
		}
		$("owner").value = parts[0];
		$("repo").value = parts[1];
	} catch (e) {
		alert("无效的URL");
	}
}

// 将文本做 Base64（适用于 GitHub contents API）
function base64EncodeUnicode(str) {
	// 处理 UTF-8
	return btoa(unescape(encodeURIComponent(str)));
}

// 将 Base64 内容解码为文本
function base64DecodeUnicode(str) {
	return decodeURIComponent(escape(atob(str)));
}

// 开始设备授权流
async function startDeviceFlow() {
	const client_id = window.GITHUB_CLIENT_ID;
	if (!client_id) {
		alert("缺少 GITHUB_CLIENT_ID");
		return;
	}

	// 请求 device_code
	const form = new URLSearchParams();
	form.set("client_id", client_id);
	// 可按需指定 scope，这里需要对 repo 内容读写：'repo'
	// 如果你的仓库是公开的，最小可用 scope 是 'public_repo'（只能操作公共仓库）
	form.set("scope", "repo");

	const res = await fetch(DEVICE_CODE_URL, {
		method: "POST",
		headers: { "Accept": "application/json" },
		body: form
	});
	if (!res.ok) {
		const t = await res.text();
		throw new Error("获取 device_code 失败: " + t);
	}
	const data = await res.json();
	// 展示给用户
	showDeviceModal(data);

	// 轮询换取 access_token
	const { device_code, interval } = data;
	const pollInterval = Math.max(5, interval || 5) * 1000;

	return new Promise((resolve, reject) => {
		let stopped = false;

		async function poll() {
			if (stopped) return;
			try {
				const tokenRes = await fetch(TOKEN_URL, {
					method: "POST",
					headers: { "Accept": "application/json" },
					body: new URLSearchParams({
						client_id,
						device_code,
						grant_type: "urn:ietf:params:oauth:grant-type:device_code"
					})
				});
				const tokenData = await tokenRes.json();
				// 可能状态：authorization_pending / slow_down / access_denied / expired_token / 正常返回
				if (tokenData.error) {
					if (tokenData.error === "authorization_pending") {
						setTimeout(poll, pollInterval);
						return;
					}
					if (tokenData.error === "slow_down") {
						setTimeout(poll, pollInterval + 5000);
						return;
					}
					hideDeviceModal();
					reject(new Error("授权失败: " + tokenData.error_description || tokenData.error));
					return;
				}
				// 成功
				hideDeviceModal();
				resolve(tokenData.access_token);
			} catch (e) {
				hideDeviceModal();
				reject(e);
			}
		}

		// 提供取消
		$("btn-cancel-device").onclick = () => {
			stopped = true;
			hideDeviceModal();
			reject(new Error("用户取消授权"));
		};

		setTimeout(poll, pollInterval);
	});
}

function showDeviceModal(data) {
	$("verify-link").href = data.verification_uri;
	$("user-code").textContent = data.user_code;
	$("device-modal").classList.remove("hidden");
}

function hideDeviceModal() {
	$("device-modal").classList.add("hidden");
}

// 使用 token 请求 GitHub API
async function ghFetch(path, options = {}) {
	const token = loadToken();
	if (!token) throw new Error("尚未登录");
	const res = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			"Accept": "application/vnd.github+json",
			"Authorization": `Bearer ${token}`,
			"X-GitHub-Api-Version": "2022-11-28",
			...(options.headers || {})
		}
	});
	if (res.status === 401) {
		throw new Error("token 无效或已过期，请重新登录");
	}
	return res;
}

// 加载文件
async function loadConfig() {
	const owner = $("owner").value.trim();
	const repo = $("repo").value.trim();
	if (!owner || !repo) {
		alert("请先填写 owner 与 repo");
		return;
	}
	setFileStatus("加载中…");
	const res = await ghFetch(`/repos/${owner}/${repo}/contents/luna-tv-config.json`);
	if (res.status === 404) {
		setFileStatus("未找到 luna-tv-config.json，将创建新文件。");
		$("editor").value = "{\n  \n}";
		$("editor").dataset.sha = ""; // 新文件没有 sha
		return;
	}
	if (!res.ok) {
		const t = await res.text();
		throw new Error("加载失败：" + t);
	}
	const json = await res.json();
	const content = base64DecodeUnicode(json.content.replace(/\n/g, ""));
	$("editor").value = content;
	$("editor").dataset.sha = json.sha || "";
	setFileStatus(`已加载，最后提交SHA：${json.sha?.slice(0,7) || "-"}`);
}

// 保存文件
async function saveConfig() {
	const owner = $("owner").value.trim();
	const repo = $("repo").value.trim();
	if (!owner || !repo) {
		alert("请先填写 owner 与 repo");
		return;
	}
	const raw = $("editor").value;
	// 校验 JSON
	try {
		JSON.parse(raw);
	} catch (e) {
		if (!confirm("JSON 校验失败，仍要强制保存吗？\n\n" + e.message)) return;
	}
	const message = $("commitMessage").value.trim() || "更新 luna-tv-config.json";
	const sha = $("editor").dataset.sha || "";

	const body = {
		message,
		content: base64EncodeUnicode(raw)
	};
	if (sha) body.sha = sha; // 更新需要 sha；新建不需要

	setFileStatus("保存中…");
	const res = await ghFetch(`/repos/${owner}/${repo}/contents/luna-tv-config.json`, {
		method: "PUT",
		body: JSON.stringify(body)
	});
	const data = await res.json();
	if (!res.ok) {
		throw new Error("保存失败：" + (data?.message || res.statusText));
	}
	// 更新本地 sha
	$("editor").dataset.sha = data.content?.sha || "";
	setFileStatus(`保存成功！新提交：${data.commit?.sha?.slice(0,7) || "-"}`);
	alert("保存成功");
}

// 美化 JSON
function prettyJson() {
	try {
		const obj = JSON.parse($("editor").value);
		$("editor").value = JSON.stringify(obj, null, 2);
	} catch {
		alert("当前内容不是有效的 JSON。");
	}
}

// 校验 JSON
function validateJson() {
	try {
		JSON.parse($("editor").value);
		alert("JSON 校验通过。");
	} catch (e) {
		alert("JSON 校验失败：\n" + e.message);
	}
}

// 初始化事件
function init() {
	$("btn-parse-url").onclick = parseRepoUrlToFields;

	$("btn-login").onclick = async () => {
		try {
			setAuthStatus("正在发起授权…");
			const token = await startDeviceFlow();
			saveToken(token);
			setAuthStatus("已登录");
		} catch (e) {
			console.error(e);
			setAuthStatus("未登录（授权失败或已取消）");
			alert(e.message || String(e));
		}
	};

	$("btn-logout").onclick = () => {
		clearToken();
		setAuthStatus("已清除令牌，未登录");
	};

	$("btn-load").onclick = () => {
		loadConfig().catch(err => {
			console.error(err);
			setFileStatus("加载失败");
			alert(err.message || String(err));
		});
	};

	$("btn-save").onclick = () => {
		saveConfig().catch(err => {
			console.error(err);
			setFileStatus("保存失败");
			alert(err.message || String(err));
		});
	};

	$("btn-pretty").onclick = prettyJson;
	$("btn-validate").onclick = validateJson;

	// 从 URL 参数预填 owner/repo
	const sp = new URLSearchParams(location.search);
	if (sp.get("owner")) $("owner").value = sp.get("owner");
	if (sp.get("repo")) $("repo").value = sp.get("repo");

	// 显示登录状态
	setAuthStatus(loadToken() ? "已登录" : "未登录");
}

document.addEventListener("DOMContentLoaded", init);
