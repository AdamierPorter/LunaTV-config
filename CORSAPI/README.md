# API 代理 & JSON 订阅器

这是一个基于 **Cloudflare Workers** 的中转代理 + JSON 配置前缀替换工具。
支持将 API 请求通过 Worker 转发，并自动为 JSON 配置中的 `api` 字段添加/替换前缀。
同时支持生成 **Base58 编码的订阅格式**，方便在外部应用中快速使用。

---

## ✨ 功能

1. **通用 API 代理**

   * 使用 `?url=` 参数转发任意 API 请求
   * 示例：

     ```
     https://<你的域名>/?url=https://ikunzyapi.com/api.php/provide/vod
     ```

2. **JSON 配置前缀替换**

   * 使用 `?config=1` 参数获取远程 JSON，并将所有 `api` 字段加上自己的API代理
   * 默认前缀为：

   * 示例：

     ```
     https://<你的域名>/?config=1
     ```

3. **Base58 订阅**

   * 使用 `?config=1&encode=base58` 参数，可以获取自己API代理完整 JSON 的 **Base58 编码订阅**
   * 示例：

     ```
     https://<你的域名>/?config=1&encode=base58
     ```

4. **动态示例生成**

   * HTML 页面会根据当前域名自动生成示例链接，无需手动修改。

---

## 🚀 部署方法

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 新建一个 **Workers & Pages → Worker**
3. 将 `worker.js` 代码粘贴到编辑器中
4. 保存并部署

---

## 🔗 使用示例

假设你的 Worker 部署在：

```
https://api.example.workers.dev
```

那么你可以这样使用：

* **代理任意 API**

  ```
  https://api.example.workers.dev/?url=https://ikunzyapi.com/api.php/provide/vod
  ```
* **获取原始 JSON 配置**   
  ```
  https://api.example.workers.dev/?config=0
  ```
* **获取 JSON 配置并使用自己的API代理**

  ```
  https://api.example.workers.dev/?config=1
  ```

* **获取 Base58 订阅并使用自己的API代理**

  ```
  https://api.example.workers.dev/?config=1&encode=base58
  ```

---

## 🛠️ 参数说明

| 参数              | 说明                               | 示例                                               |
| --------------- | -------------------------------- | ------------------------------------------------ |
| `url`           | 代理任意 API 请求                      | `?url=https://...`                               |
| `config=0`      | 返回原始 JSON 配置                 | `?config=0`                                      |
| `config=1`      | 返回替换前缀后的 JSON 配置                 | `?config=1`                                      |
| `encode=base58` | 将 JSON 配置结果编码为 Base58            | `?config=1&encode=base58`                        |
| (可选)`prefix`    | 手动指定API代理，默认使用 `https://<域名>/?url=` | `?config=1&prefix=https://api.example.com/?url=` |

---

## 📌 注意事项

* **Workers 免费额度**：每天 10 万次请求，适合轻量使用。
* **API代理替换逻辑**：如果 JSON 中 `api` 字段已包含 `?url=` 前缀，会先去掉旧前缀，再加上新前缀。
* **Base58 输出**：适合直接作为订阅链接在部分客户端中使用。

---
