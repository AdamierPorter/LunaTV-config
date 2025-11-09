# API 代理 & JSON 订阅器

这是一个基于 **Cloudflare Workers** 的中转代理 + JSON 配置前缀替换工具。

支持将 API 请求通过 Worker 转发，并自动为 JSON 配置中的 `api` 字段添加/替换前缀。

同时支持生成 **Base58 编码的订阅格式**，并提供**多种配置源选择**，方便在外部应用中快速使用。

---

## ✨ 功能特性

### 1. 通用 API 代理

使用 `?url=` 参数转发任意 API 请求

**示例：**

```
https://<你的域名>/?url=https://ikunzyapi.com/api.php/provide/vod/
```

### 2. 多配置源支持

使用 `?source=` 参数选择不同的资源配置：

- **`source=jin18`** - 精简版（31个资源，仅普通内容）
- **`source=jingjian`** - 精简+成人版（61个资源）
- **`source=full`** - 完整版（88个资源，**默认**）

### 3. JSON 配置前缀替换

使用 `?config=1` 参数获取远程 JSON，并将所有 `api` 字段加上你的 API 代理前缀

**默认前缀格式：**

```
https://<你的域名>/?url=
```

**示例：**

```
https://<你的域名>/?config=1&source=jin18
```

### 4. Base58 编码订阅

使用 `?config=1&encode=base58` 参数，获取经过 API 代理处理的完整 JSON 的 **Base58 编码订阅**

**示例：**

```
https://<你的域名>/?config=1&source=full&encode=base58
```

### 5. 动态示例生成

HTML 页面会根据当前域名自动生成示例链接，无需手动修改

---

## 🚀 部署方法

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 新建一个 **Workers & Pages → Worker**
3. 将 `worker.js` 代码粘贴到编辑器中
4. 保存并部署
5. 绑定自定义域名（可选）

---

## 🔗 使用示例

假设你的 Worker 部署在：[`https://api.example.workers.dev`](https://api.example.workers.dev)

### 示例 1：代理任意 API

```
https://api.example.workers.dev/?url=https://ikunzyapi.com/api.php/provide/vod/
```

### 示例 2：获取原始 JSON 配置（精简版）

```
https://api.example.workers.dev/?config=0&source=jin18
```

### 示例 3：获取带代理前缀的 JSON 配置（完整版）

```
https://api.example.workers.dev/?config=1&source=full
```

### 示例 4：获取 Base58 编码订阅（精简+成人版）

```
https://api.example.workers.dev/?config=1&source=jingjian&encode=base58
```

### 示例 5：自定义代理前缀

```
https://api.example.workers.dev/?config=1&source=jin18&prefix=https://myproxy.com/?url=
```

---

## 🛠️ 参数说明

| 参数 | 说明 | 可选值 | 示例 |
| --- | --- | --- | --- |
| `url` | 代理任意 API 请求 | 任意有效 URL | `?url=https://...` |
| `config` | 配置模式 | `0` = 原始 JSON
`1` = 添加代理前缀 | `?config=1` |
| `source` | 配置源选择 | `jin18` = 精简版（31个）
`jingjian` = 精简+成人（61个）
`full` = 完整版（88个，默认） | `?source=jin18` |
| `encode` | 编码方式 | `base58` = Base58 编码输出 | `?encode=base58` |
| `prefix` | 自定义代理前缀 | 任意代理地址 | `?prefix=https://.../?url=` |

---

## 📦 配置源对比

| 配置源 | 资源数量 | 包含成人内容 | 适用场景 |
| --- | --- | --- | --- |
| **jin18** | 31个 | ❌ 否 | 家庭使用、轻量级应用 |
| **jingjian** | 61个 | ✅ 是 | 个人使用、中等需求 |
| **full** | 88个 | ✅ 是 | 完整功能、最大兼容性 |

---

## 📋 完整订阅链接模板

将 `<你的域名>` 替换为你的实际 Worker 地址：

### 精简版（jin18）

```
# 原始 JSON
https://<你的域名>/?config=0&source=jin18

# 带代理前缀的 JSON
https://<你的域名>/?config=1&source=jin18

# Base58 编码订阅
https://<你的域名>/?config=1&source=jin18&encode=base58
```

### 精简+成人版（jingjian）

```
# 原始 JSON
https://<你的域名>/?config=0&source=jingjian

# 带代理前缀的 JSON
https://<你的域名>/?config=1&source=jingjian

# Base58 编码订阅
https://<你的域名>/?config=1&source=jingjian&encode=base58
```

### 完整版（full，默认）

```
# 原始 JSON
https://<你的域名>/?config=0&source=full

# 带代理前缀的 JSON
https://<你的域名>/?config=1&source=full

# Base58 编码订阅
https://<你的域名>/?config=1&source=full&encode=base58
```

---

## 📌 注意事项

- **Workers 免费额度**：每天 10 万次请求，适合轻量使用。超出后需升级付费套餐。
- **代理替换逻辑**：如果 JSON 中 `api` 字段已包含 `?url=` 前缀，会先去掉旧前缀，再加上新前缀。
- **Base58 输出**：适合直接作为订阅链接在支持该格式的客户端中使用。
- **配置源更新**：配置源来自 GitHub，内容会定期更新。Worker 会缓存 7200 秒（2小时）。
- **超时设置**：默认请求超时时间为 9 秒，超时后会返回错误信息。
- **CORS 支持**：已启用完整的 CORS 支持，可直接在前端应用中调用。

---

## 🔧 高级配置

### 修改配置源地址

在 `worker.js` 中找到 `JSON_SOURCES` 对象并修改：

```jsx
const JSON_SOURCES = {
  'jin18': 'https://raw.githubusercontent.com/your-repo/jin18.json',
  'jingjian': 'https://raw.githubusercontent.com/your-repo/jingjian.json',
  'full': 'https://raw.githubusercontent.com/your-repo/full.json'
}
```

### 修改超时时间

找到以下代码并修改超时毫秒数：

```jsx
const timeoutId = setTimeout(() => controller.abort(), 9000) // 改为其他值
```

### 添加访问日志

可以在代码中添加日志记录：

```jsx
console.log(`Request from: ${request.headers.get('cf-connecting-ip')}`)
```

---

## ❓ 常见问题

### Q: 如何查看我的 Worker 地址？

A: 部署后在 Cloudflare Dashboard 的 Workers 页面可以看到，格式通常为 [`https://worker-name.your-subdomain.workers.dev`](https://worker-name.your-subdomain.workers.dev)

### Q: 可以绑定自定义域名吗？

A: 可以！在 Worker 设置中点击「Triggers」→「Add Custom Domain」，添加你的域名即可。

### Q: 为什么返回 502 错误？

A: 可能是目标 API 超时或无法访问，检查目标 URL 是否正确，或者尝试增加超时时间。

### Q: Base58 编码后如何解码？

A: 需要使用支持 Base58 解码的库或客户端，解码后即可得到原始 JSON 配置。

### Q: 配置源多久更新一次？

A: 根据 JSON 中的 `cache_time: 7200`（秒），建议客户端每 2 小时刷新一次配置。

---

## 📄 许可证

MIT License - 自由使用、修改和分发

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 改进此项目！

---

⭐ **如果这个项目对你有帮助，请给个 Star 支持一下！**
