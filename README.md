# MoonTV/LunaTV 配置编辑器（自用）
https://hafrey1.github.io/LunaTV-config  

--- 

##  MoonTV/LunaTV配置
订阅使用：复制下面链接  

👉 Base58编码订阅链接[精简版🎬源链接](https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/jin18.txt)    （推荐使用自己部署的代理）精简版禁18源

```bash
https://pz.v88.qzz.io?format=2&source=jin18
```
```bash
https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/jin18.txt
```
👉 Base58编码订阅链接[精简版🎬+🔞源链接](https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/jingjian.txt) （推荐使用自己部署的代理）精简版剔除无搜索结果和污染搜索结果源                             
```bash
https://pz.v88.qzz.io?format=2&source=jingjian
```
```bash
https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/jingjian.txt
```

👉 Base58编码订阅链接[完整版🎬+🔞源链接](https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/LunaTV-config.txt) （推荐使用自己部署的代理）                          
```bash
https://pz.v88.qzz.io?format=2&source=full
```
```bash
https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/LunaTV-config.txt
```

--- 

# 🌐 CORSAPI（API 代理 & JSON 订阅器）

这是一个基于 **Cloudflare Workers** 的中转代理 + JSON 配置前缀替换工具。

支持将 API 请求通过 Worker 转发，并自动为 JSON 配置中的 `api` 字段添加/替换前缀。

同时支持生成 **Base58 编码的订阅格式**，并提供**多种配置源选择**，方便在外部应用中快速使用。

---

<details>
  
<summary>✨ 功能特性</summary>
  
# 

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

### 3. 统一的 format 参数

使用 `?format=` 参数控制输出格式

- **`format=0`** 或 **`format=raw`** - 原始 JSON
- **`format=1`** 或 **`format=proxy`** - 添加代理前缀的 JSON
- **`format=2`** 或 **`format=base58`** - 原始 JSON 的 Base58 编码
- **`format=3`** 或 **`format=proxy-base58`** - 代理前缀 JSON 的 Base58 编码

--- 

</details>

<details>
  
<summary>🚀 部署方法</summary>
  
#   

🌐 部署到 Cloudflare Workers

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)。
2. 进入 Workers & Pages → 创建应用程序（Create Application） → Workers → 从 Hello World! 开始 → 项目命名 → 部署 → 编辑代码。
3. 将项目中的 _worker.js 文件内容复制到在线编辑器中。
4. 点击 保存并部署（Save and Deploy） 完成上线。
5. （可选）若项目使用 KV 存储：
- 存储和数据库 → Workers KV → Ceate instance  → 命名空间名称（KV Namespaces） 创建一个新的命名空间。
- 命名空间名称可自定义，例如：MyKVNamespace。
- 在 Worker设置 绑定 → 添加绑定 → KV命名空间 → 添加绑定 → 变量名为：CONFIG_KV → 创建的KV命名空间 → 添加绑定 。
6. （可选）绑定自定义域名：打开 Worker 设置 → Triggers(域和路由) → 添加 → Custom Domains(自定义域名)，添加你的域名并保存。

📦 部署到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)。
2. 下载仓库中的 _worker.js 文件。
3. 在本地新建一个空文件夹（名称随意），将 _worker.js 放入其中。
4. 前往 Workers & Pages → 创建应用程序（Create Application） → Pages → 上传资产（Upload Assets） → 项目命名 → 创建项目 → 从计算机中选择 → 上传文件夹 → 选择新建的文件 → 部署站点（Deploy Site）。
5. （可选）如需使用 KV：
-存储和数据库 → Workers KV → Ceate instance  → 命名空间名称（KV Namespaces） 创建一个KV命名空间。
- 新建命名空间（名称随意），绑定变量名为：CONFIG_KV。
- 部署完成后，前往 Pages 控制台 → 设置 → 绑定（Bindings） → 添加 → KV 命名空间  →  变量名为：CONFIG_KV → 选择创建的KV空间 → 保存。
- 保存后返回 “部署” 选项卡。
8. 点击 创建新部署（Create New Deployment），重新上传文件并点击 保存并部署 即可。


部署完成后，你就拥有了自己的 API 代理与订阅转换服务！

---   

</details>

<details>
<summary>🔗 使用示例</summary>
  
#  

假设你的 Worker 部署在：[`https://api.example.workers.dev`](https://api.example.workers.dev)

### 示例 1：代理任意 API

```
https://api.example.workers.dev/?url=https://ikunzyapi.com/api.php/provide/vod/
```

### 示例 2：获取原始 JSON 配置（精简+成人版）

```jsx
https://api.example.workers.dev/?format=0&source=jingjian
```

### 示例 3：获取代理前缀的 JSON 配置（精简+成人版）

```jsx
https://api.example.workers.dev/?format=1&source=jingjian
```

### 示例 4：获取原始 Base58 编码（精简+成人版）

```jsx
https://api.example.workers.dev/?format=2&source=jingjian
```

### 示例 5：获取代理前缀的 Base58 编码订阅（精简+成人版）

```jsx
https://api.example.workers.dev/?format=3&source=jingjian
```

### 示例 6：自定义代理前缀

```jsx
https://api.example.workers.dev/?format=1&source=full&prefix=https://my-proxy.com/?url=
```

---   
  
</details>

<details>
<summary>🛠️ 参数说明</summary>
  
# 
  
| 参数     | 说明             | 可选值                          | 示例         |        
| -------- | ---------------- | ------------------------------- | ------------ |
| `url`    | 代理任意 API 请求 | 任意有效 URL                     | `?url=https://...` |
| `format` | 配置模式         | `format=0 或 raw - 原始 JSON` <br> `format=1 或 proxy - 添加代理前缀` <br> `format=2 或 base58 - 原始 Base58` <br> `format=3 或 proxy-base58 - 代理 Base58` | `?format=0` |
| `source` | 配置源选择       | `source=jin18` - 精简版 <br> `source=jingjian` - 精简+成人 <br> `source=full` - 完整版） | `?source=jin18` |
| `prefix` | 自定义代理前缀   | 任意代理地址                      | `?prefix=https://.../?url=` |
| `errors&limit=10` | 查看错误日志 | `errors&limit=10`                 | `https://<你的域名>?errors&limit=10` |

---  

## 📦 配置源对比

| 配置源 | 资源数量 | 包含成人内容 | 适用场景 |
| --- | --- | --- | --- |
| **jin18** | 31个 | ❌ 否 | 家庭使用、轻量级应用 |
| **jingjian** | 61个 | ✅ 是 | 个人使用、中等需求 |
| **full** | 88个 | ✅ 是 | 完整功能、最大兼容性 |


🧩 **前缀替换逻辑**  
- 若 JSON 中的 `api` 字段已包含旧前缀（`?url=`），系统会自动去除旧前缀并替换为新的代理前缀。  
- 可自定义代理路径，方便接入私有 API 或多 Worker 配置。
  
---   
  
</details>

<details>
<summary> 📋 完整订阅链接模板</summary>
  
# 

将 `\<你的域名\>` 替换为你的实际 Worker 地址：

### 精简版（jin18）

```jsx
# 原始 JSON
https://<你的域名>/?format=0&source=jin18

# 带代理前缀的 JSON
https://<你的域名>/?format=1&source=jin18

# 原始 Base58 编码
https://<你的域名>/?format=2&source=jin18

# 代理 Base58 编码（推荐用于订阅）
https://<你的域名>/?format=3&source=jin18
```

### 精简+成人版（jingjian）

```jsx
# 原始 JSON
https://<你的域名>/?format=0&source=jingjian

# 带代理前缀的 JSON
https://<你的域名>/?format=1&source=jingjian

# 原始 Base58 编码
https://<你的域名>/?format=2&source=jingjian

# 代理 Base58 编码（推荐用于订阅）
https://<你的域名>/?format=3&source=jingjian
```

### 完整版（full，默认）

```jsx
# 原始 JSON
https://<你的域名>/?format=0&source=full

# 带代理前缀的 JSON
https://<你的域名>/?format=1&source=full

# 原始 Base58 编码
https://<你的域名>/?format=2&source=full

# 代理 Base58 编码（推荐用于订阅）
https://<你的域名>/?format=3&source=full
```

---   

</details>

<details>
<summary>📌 注意事项</summary>
  
# 
  
- **Workers 免费额度**：每天 10 万次请求，适合轻量使用。超出后需升级付费套餐。
- **代理替换逻辑**：如果 JSON 中 `api` 字段已包含 `?url=` 前缀，会先去掉旧前缀，再加上新前缀。
- **Base58 输出**：适合直接作为订阅链接在支持该格式的客户端中使用。
- **配置源更新**：配置源来自 GitHub，内容会定期更新。Worker 会缓存 7200 秒（2小时）。
- **超时设置**：默认请求超时时间为 9 秒，超时后会返回错误信息。
- **CORS 支持**：已启用完整的 CORS 支持，可直接在前端应用中调用。

---   
  
</details>

<details>
<summary>🔧 高级配置</summary>
  
# 

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

</details>

---

## 🆕 更新内容

- 📄 **Luna-TV配置编辑器**：专业的 JSON 配置文件可视化编辑器。  
- 🔍 **自动检测API状态**：每 1 小时检测一次 API 可用性，并记录最近 100 次测试报告。  
- 🧩 **源名称前添加图标**：源名称前添加图标，方便区分。  
- 🌐 **被墙资源自动中转**：为受限 API 提供 CF Worker 中转能力。  
  
---   

## 🧪 测试与示例

### ✅ 使用中转API测试
- 通过 CORSAPI 转发后，大幅提升视频源可用率。  
- 可“复活”原本无法访问的资源。  

### ⚙️ 精简版源更新
- 去除污染源与无搜索结果源（如 🎬虎牙、🔞丝袜、🔞色猫）。  
- 精简后共 **57 个可用源**，在中转代理下全部可访问。  
<details>
<summary>示例</summary>
<img width="1025" height="486" alt="61" src="https://github.com/user-attachments/assets/81c80108-7c03-4583-87ab-b7b57cdfd3bd" />
  
  
</details>

---   
  
# API 健康报告（每日自动检测API状态）

## API 状态（最近更新：2025-11-11 18:24 CST）

- 总 API 数量：79
- 成功 API 数量：79
- 失败 API 数量：0
- 平均可用率：95.6%
- 完美可用率（100%）：39 个
- 高可用率（80%-99%）：40 个
- 中等可用率（50%-79%）：0 个
- 低可用率（<50%）：0 个

<div style="font-size: 11px;">

<!-- API_TABLE_START -->
| 状态 | 资源名称 | 地址 | API | 搜索功能 | 成功次数 | 失败次数 | 成功率 | 最近7天趋势 |
|------|---------|-----|-----|---------|---------:|--------:|-------:|--------------|
| ✅ | 🎬-爱奇艺- | [🔗](https://iqiyizyapi.com) | [🔗](https://iqiyizyapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬iKun资源 | [🔗](https://ikunzy.com) | [🔗](https://ikunzyapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬U酷影视 | [🔗](https://www.ukuzy.com) | [🔗](https://api.ukuapi88.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬光速资源 | [🔗](https://api.guangsuapi.com) | [🔗](https://api.guangsuapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬最大点播 | [🔗](https://zuidazy.co) | [🔗](https://zuidazy.me/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬最大资源 | [🔗](https://zuida.xyz) | [🔗](https://api.zuidapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬天涯影视 | [🔗](https://tyyszy.com) | [🔗](https://tyyszy.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬建安资源 | [🔗](http://154.219.117.232:9981) | [🔗](http://154.219.117.232:9981/jacloudapi.php/provide/vod) | 不匹配 | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬快车资源 | [🔗](https://kuaichezy.com) | [🔗](https://caiji.kuaichezy.org/api.php/provide/vod) | ❌ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬新浪资源 | [🔗](https://xinlangapi.com) | [🔗](https://api.xinlangapi.com/xinlangapi.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬无尽影视 | [🔗](https://wujinzy.com) | [🔗](https://api.wujinapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬无尽资源 | [🔗](https://wujinzy.com) | [🔗](https://api.wujinapi.me/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬旺旺短剧 | [🔗](https://wwzy.tv) | [🔗](https://wwzy.tv/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬旺旺资源 | [🔗](https://api.wwzy.tv) | [🔗](https://api.wwzy.tv/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬暴风资源 | [🔗](https://bfzy.tv) | [🔗](https://bfzyapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬极速资源 | [🔗](https://jszyapi.com) | [🔗](https://jszyapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬樱花资源 | [🔗](https://yhzy.cc) | [🔗](https://m3u8.apiyhzy.com/api.php/provide/vod) | ❌ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬百度云zy | [🔗](https://bdzy1.com) | [🔗](https://pz.168188.dpdns.org/?url=https://api.apibdzy.com/api.php/provide/vod) | ✅ | 20 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬红牛资源 | [🔗](https://www.hongniuzy.com) | [🔗](https://www.hongniuzy2.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬索尼资源 | [🔗](https://suonizy.net) | [🔗](https://suoniapi.com/api.php/provide/vod) | ❌ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬茅台资源 | [🔗](https://mtzy.me) | [🔗](https://caiji.maotaizy.cc/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬虎牙资源 | [🔗](https://www.huyaapi.com) | [🔗](https://www.huyaapi.com/api.php/provide/vod) | 不匹配 | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬豪华资源 | [🔗](https://www.haohuazy.com) | [🔗](https://pz.168188.dpdns.org/?url=https://hhzyapi.com/api.php/provide/vod) | ✅ | 20 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬量子影视 | [🔗](https://lzizy.net) | [🔗](https://cj.lziapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬量子资源 | [🔗](https://cj.lzcaiji.com) | [🔗](https://cj.lzcaiji.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬金鹰点播 | [🔗](https://jinyingzy.com) | [🔗](https://jinyingzy.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬闪电资源 | [🔗](https://shandianzy.com) | [🔗](https://xsd.sdzyapi.com/api.php/provide/vod) | ❌ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬飘零资源 | [🔗](https://p2100.net) | [🔗](https://p2100.net/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬魔都动漫 | [🔗](https://caiji.moduapi.cc) | [🔗](https://caiji.moduapi.cc/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬魔都资源 | [🔗](https://www.moduzy.net) | [🔗](https://www.mdzyapi.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬鸭鸭资源 | [🔗](https://yayazy3.com) | [🔗](https://cj.yayazy.net/api.php/provide/vod) | ❌ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-老色逼- | [🔗](https://apilsbzy1.com) | [🔗](https://apilsbzy1.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞155-资源 | [🔗](https://155zy2.com) | [🔗](https://155api.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞91-精品- | [🔗](https://91jpzyw.com) | [🔗](https://91jpzyw.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞souavZY | [🔗](https://api.souavzy.vip) | [🔗](https://api.souavzy.vip/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞玉兔资源 | [🔗](https://apiyutu.com) | [🔗](https://apiyutu.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞百万资源 | [🔗](https://api.bwzym3u8.com) | [🔗](https://api.bwzyz.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞精品资源 | [🔗](https://www.jingpinx.com) | [🔗](https://www.jingpinx.com/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞麻豆视频 | [🔗](https://91md.me) | [🔗](https://91md.me/api.php/provide/vod) | ✅ | 30 | 0 | 100.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬优质资源 | [🔗](https://1080zyk4.com) | [🔗](https://api.yzzy-api.com/inc/apijson.php) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬卧龙影视 | [🔗](https://collect.wolongzyw.com) | [🔗](https://collect.wolongzyw.com/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬卧龙资源 | [🔗](https://wolongzyw.com) | [🔗](https://wolongzyw.com/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬山海资源 | [🔗](https://zy.sh0o.cn) | [🔗](https://zy.sh0o.cn/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬猫眼资源 | [🔗](https://www.maoyanzy.com) | [🔗](https://api.maoyanapi.top/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅❌✅✅✅✅✅ |
| ✅ | 🎬电影天堂 | [🔗](http://caiji.dyttzyapi.com) | [🔗](http://caiji.dyttzyapi.com/api.php/provide/vod) | ❌ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬速播资源 | [🔗](https://www.subozy.com) | [🔗](https://subocaiji.com/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬非凡资源 | [🔗](https://cj.ffzyapi.com) | [🔗](https://api.ffzyapi.com/api.php/provide/vod) | ❌ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞--AIvin- | [🔗](http://lbapiby.com) | [🔗](http://lbapiby.com/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-大奶子- | [🔗](https://apidanaizi.com) | [🔗](https://apidanaizi.com/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞优优资源 | [🔗](https://www.yyzywcj.com) | [🔗](https://www.yyzywcj.com/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞小鸡资源 | [🔗](https://xiaojizy.live) | [🔗](https://api.xiaojizy.live/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞桃花资源 | [🔗](https://thzy8.me) | [🔗](https://thzy1.me/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞黄色仓库 | [🔗](https://hsckzy.xyz) | [🔗](https://hsckzy.xyz/api.php/provide/vod) | ✅ | 29 | 1 | 96.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬如意资源 | [🔗](https://www.ryzyw.com) | [🔗](https://pz.168188.dpdns.org/?url=https://cj.rycjapi.com/api.php/provide/vod) | ✅ | 19 | 1 | 95.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬豆瓣资源 | [🔗](https://dbzy.tv) | [🔗](https://caiji.dbzy5.com/api.php/provide/vod) | ✅ | 28 | 2 | 93.3% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞jkun资源 | [🔗](https://jkunzyapi.com) | [🔗](https://jkunzyapi.com/api.php/provide/vod) | ✅ | 28 | 2 | 93.3% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞乐播资源 | [🔗](https://lbapi9.com) | [🔗](https://lbapi9.com/api.php/provide/vod) | ✅ | 28 | 2 | 93.3% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞森林资源 | [🔗](https://slapibf.com) | [🔗](https://beiyong.slapibf.com/api.php/provide/vod) | ✅ | 28 | 2 | 93.3% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞番号资源 | [🔗](http://fhapi9.com) | [🔗](http://fhapi9.com/api.php/provide/vod) | ✅ | 28 | 2 | 93.3% | ✅✅✅✅✅✅✅ |
| ✅ | 🎬360 资源 | [🔗](https://360zy.com) | [🔗](https://360zy.com/api.php/provide/vod) | ✅ | 27 | 3 | 90.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-幸资源- | [🔗](https://xzytv.com) | [🔗](https://xzybb2.com/api.php/provide/vod) | ✅ | 27 | 3 | 90.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞鲨鱼资源 | [🔗](https://shayuapi.com) | [🔗](https://shayuapi.com/api.php/provide/vod) | ✅ | 27 | 3 | 90.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞 CK-资源 | [🔗](https://ckzy.me) | [🔗](https://ckzy.me/api.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-奥斯卡- | [🔗](https://aosikazy.com) | [🔗](https://aosikazy.com/api.php/provide/vod) | ❌ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-美少女- | [🔗](https://www.msnii.com) | [🔗](https://www.msnii.com/api/json.php) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-色南国- | [🔗](https://api.sexnguon.com) | [🔗](https://api.sexnguon.com/api.php/provide/vod) | 无结果 | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-黄AVZY | [🔗](https://www.pgxdy.com) | [🔗](https://www.pgxdy.com/api/json.php) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞最色资源 | [🔗](https://zuisezy.com) | [🔗](https://api.zuiseapi.com/api.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞大地资源 | [🔗](https://dadizy11.com) | [🔗](https://dadiapi.com/feifei) | 不匹配 | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞奶香资源 | [🔗](https://Naixxzy.com) | [🔗](https://Naixxzy.com/api.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞滴滴资源 | [🔗](https://didizy.com) | [🔗](https://api.ddapi.cc/api.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞白嫖资源 | [🔗](https://www.kxgav.com) | [🔗](https://www.kxgav.com/api/json.php) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞色猫资源 | [🔗](https://semaozy1.com) | [🔗](https://caiji.semaozy.net/inc/apijson_vod.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞豆豆资源 | [🔗](https://doudouzy.com) | [🔗](https://api.douapi.cc/api.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞辣椒资源 | [🔗](https://apilj.com) | [🔗](https://apilj.com/api.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞香蕉资源 | [🔗](https://www.xiangjiaozyw.com) | [🔗](https://www.xiangjiaozyw.com/api.php/provide/vod) | ✅ | 26 | 4 | 86.7% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞杏吧资源 | [🔗](https://xingba111.com) | [🔗](https://pz.168188.dpdns.org/?url=https://xingba222.com/api.php/provide/vod) | ✅ | 17 | 3 | 85.0% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞丝袜资源 | [🔗](https://siwazyw.tv) | [🔗](https://siwazyw.tv/api.php/provide/vod) | 不匹配 | 25 | 5 | 83.3% | ✅✅✅✅✅✅✅ |
| ✅ | 🔞细胞资源 | [🔗](https://www.xxibaozyw.com) | [🔗](https://www.xxibaozyw.com/api.php/provide/vod) | ✅ | 25 | 5 | 83.3% | ✅✅✅✅✅✅✅ |
<!-- API_TABLE_END -->





































































































































































































