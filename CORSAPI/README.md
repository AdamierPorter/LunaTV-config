# Cloudflare Worker CORS 代理服务

这个项目使用 Cloudflare Workers 构建了一个简单的 CORS 代理服务，可以接收带有 `url` 参数的请求，转发到目标 URL 并返回响应，同时添加 CORS 头部，允许浏览器绕过 CORS 限制，实现跨域访问。

## 功能

- **CORS 代理**：允许跨域请求通过代理服务器进行访问。
- **支持 HTTP/HTTPS**：只允许 HTTP 或 HTTPS 协议的 URL。
- **灵活的查询参数**：用户只需在 URL 中传递目标 URL，即可通过此 Worker 转发请求。

## 使用示例

### 请求方式

你可以通过以下方式使用这个 CORS 代理服务：

https://your-worker.example.com/?url=<目标_URL>

bash
复制代码

### 示例

假设你想访问目标 URL `https://caiji.kuaichezy.org/api.php/provide/vod`，可以这样请求：

https://your-worker.example.com/?url=https://caiji.kuaichezy.org/api.php/provide/vod

markdown
复制代码

此请求会被转发到 `https://caiji.kuaichezy.org/api.php/provide/vod`，并返回响应数据，同时自动添加 CORS 头部，允许浏览器绕过 CORS 错误。

## 部署到 Cloudflare Workers

1. **创建 Cloudflare Worker**：
   - 登录到 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
   - 选择 **Workers**。
   - 点击 **创建 Worker** 按钮。
   - 在编辑器中删除默认代码，粘贴本项目的代码。

2. **配置路由**：
   - 在 **路由** 部分配置路由规则，例如：`https://your-worker.example.com/*`，这样所有请求都会经过该 Worker 进行中转。

3. **保存并部署**：
   - 点击 **保存并部署** 按钮完成部署。

## 代码说明

1. **请求处理**：通过查询参数 `url` 提供目标地址。验证该 URL 是否有效，并检查其协议是否为 HTTP 或 HTTPS。
2. **代理请求**：将原始请求转发到目标 URL，保留原始请求方法和头部，并在转发请求时附加请求体（如果有）。
3. **CORS 头部**：对返回的响应添加以下 CORS 头部：
   - `Access-Control-Allow-Origin: *`：允许所有来源。
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`：支持的 HTTP 方法。
   - `Access-Control-Allow-Headers: Content-Type, Authorization`：允许的请求头部。

## 使用建议

- **API Key 验证**：可以添加 API Key 验证，防止滥用服务。
- **域名限制**：可以限制目标域名，仅允许请求特定的 URL 地址。
- **缓存机制**：可以考虑添加缓存策略，减少对目标服务器的请求次数，提高性能。

## 许可

本项目使用 MIT 许可证，详见 [LICENSE](./LICENSE) 文件。

---

感谢你使用这个简单的 CORS 代理服务！如果你有任何问题或改进建议，欢迎提交 issues 或 PR。

解释
标题和简介：清楚地说明了项目的功能和目的。

使用示例：提供了如何使用此服务的简单示例，帮助用户理解如何构建请求。

部署步骤：详细列出了如何将这个代码部署到 Cloudflare Workers 上的步骤。

代码说明：简要描述了代码的实现逻辑，帮助开发者理解和扩展功能。

使用建议：提出了常见的优化建议，帮助用户根据需要进一步增强服务。

你可以根据这个模板进行修改或增加内容。希望这能帮助你顺利部署和使用 CORS 代理服务！如果有其他问题，随时告知！
