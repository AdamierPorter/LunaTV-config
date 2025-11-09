# MoonTV/LunaTV 配置编辑器（自用）
https://hafrey1.github.io/LunaTV-config  

--- 

##  MoonTV/LunaTV配置
订阅使用：复制下面链接  

👉 Base58编码订阅链接[精简版🎬源链接](https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/jin18.txt)    （推荐使用自己部署的代理）精简版禁18源

```bash
https://j18pz.hafrey.dpdns.org?config=0&encode=base58
```
```bash
https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/jin18.txt
```
👉 Base58编码订阅链接[精简版🎬+🔞源链接](https://jjpz.hafrey.dpdns.org?config=0&encode=base58) （推荐使用自己部署的代理）精简版剔除无搜索结果和污染搜索结果源                             
```bash
https://jjpz.hafrey.dpdns.org?config=0&encode=base58
```
```bash
https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/jingjian.txt
```

--- 

# 🌐 CORSAPI（API 代理 & JSON 订阅器）

> 基于 Cloudflare Workers 的 API 中转与 JSON 前缀替换工具，支持代理任意 API、自动添加中转、生成 Base58 订阅格式。一键部署即可拥有自己的中转 API 与订阅链接！

<details>
<summary>🚀 部署方法</summary>
  
#   
  
**部署代码：**  
- [精简版代码](https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/CORSAPI/jingjian_worker.js)  
- [禁18版代码](https://raw.githubusercontent.com/hafrey1/LunaTV-config/refs/heads/main/CORSAPI/jin18_worker.js)

### 🧭 部署步骤
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)  
2. 新建 **Workers & Pages → Worker**  
3. 将上述 `worker.js` 代码粘贴到编辑器中  
4. 保存并部署  

部署完成后，你就拥有了自己的 API 代理与订阅转换服务！

---   

</details>

<details>
<summary>🔗 使用示例</summary>
  
#  

```bash
假设你的 Worker 部署在：

https://api.example.workers.dev

### ① 代理任意 API  
https://api.example.workers.dev/?url=https://ikunzyapi.com/api.php/provide/vod

### ② 获取原始 JSON 配置  
https://api.example.workers.dev/?config=0

### ③ 获取API 代理的 JSON 配置  
https://api.example.workers.dev/?config=1

### ④ 获取API 代理的 Base58 编码订阅  
https://api.example.workers.dev/?config=1&encode=base58
```
---   
  
</details>

<details>
<summary>🛠️ 参数说明</summary>
  
# 
  
| 参数 | 说明 | 示例 |
|------|------|------|
| `url` | 代理任意 API 请求 | `?url=https://...` |
| `config=0` | 返回原始 JSON 配置 | `?config=0` |
| `config=1` | 返回使用api代理的 JSON 配置 | `?config=1` |
| `encode=base58` | 将 JSON 配置编码为 Base58 | `?config=1&encode=base58` |
| `(可选) prefix` | 手动指定 API 代理前缀，默认使用当前域名 | `?config=1&prefix=https://api.example.com/?url=` |

🧩 **前缀替换逻辑**  
- 若 JSON 中的 `api` 字段已包含旧前缀（`?url=`），系统会自动去除旧前缀并替换为新的代理前缀。  
- 可自定义代理路径，方便接入私有 API 或多 Worker 配置。
  
---   
  
</details>

<details>
<summary>📌 注意事项</summary>
  
# 
  
- ☁️ **Workers 免费额度：**  
  每日 10 万次请求，适合轻量部署与个人订阅使用。  

- 🔄 **API代理逻辑：**  
  自动替换 JSON 中的 `api` 字段前缀，保证所有接口都经过中转代理。  

- 💾 **Base58 编码：**  
  生成的 Base58 结果可直接导入支持订阅的客户端。  

---   
  
</details>


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

## API 状态（最近更新：2025-11-09 18:37 CST）

- 总 API 数量：79
- 成功 API 数量：77
- 失败 API 数量：2
- 平均可用率：98.4%
- 完美可用率（100%）：50 个
- 高可用率（80%-99%）：28 个
- 中等可用率（50%-79%）：1 个
- 低可用率（<50%）：0 个

<div style="font-size: 11px;">

<!-- API_TABLE_START -->
| 状态 | 名称 | 地址 | 采集接口 | 成功次数 | 失败次数 | 可用率 | 连续失败 | 最近7天趋势 |
|------|-----|------|---------|----------:|----------:|--------:|-----------:|--------------|
| ✅ | 🎬优质资源 | [🔗](https://1080zyk4.com) | [api.yzzy-api.com](https://api.yzzy-api.com/inc/apijson.php "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬光速资源 | [🔗](https://api.guangsuapi.com) | [api.guangsuapi.com](https://api.guangsuapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬最大点播 | [🔗](https://zuidazy.co) | [zuidazy.me](https://zuidazy.me/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬最大资源 | [🔗](https://zuida.xyz) | [api.zuidapi.com](https://api.zuidapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬卧龙影视 | [🔗](https://collect.wolongzyw.com) | [collect.wolongzyw.com](https://collect.wolongzyw.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬卧龙资源 | [🔗](https://wolongzyw.com) | [wolongzyw.com](https://wolongzyw.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬天涯影视 | [🔗](https://tyyszy.com) | [tyyszy.com](https://tyyszy.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬快车资源 | [🔗](https://kuaichezy.com) | [caiji.kuaichezy.org](https://caiji.kuaichezy.org/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬新浪资源 | [🔗](https://xinlangapi.com) | [api.xinlangapi.com](https://api.xinlangapi.com/xinlangapi.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬无尽影视 | [🔗](https://wujinzy.com) | [api.wujinapi.com](https://api.wujinapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬无尽资源 | [🔗](https://wujinzy.com) | [api.wujinapi.me](https://api.wujinapi.me/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬旺旺短剧 | [🔗](https://wwzy.tv) | [wwzy.tv](https://wwzy.tv/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬旺旺资源 | [🔗](https://api.wwzy.tv) | [api.wwzy.tv](https://api.wwzy.tv/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬暴风资源 | [🔗](https://bfzy.tv) | [bfzyapi.com](https://bfzyapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬极速资源 | [🔗](https://jszyapi.com) | [jszyapi.com](https://jszyapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬樱花资源 | [🔗](https://yhzy.cc) | [m3u8.apiyhzy.com](https://m3u8.apiyhzy.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬猫眼资源 | [🔗](https://www.maoyanzy.com) | [api.maoyanapi.top](https://api.maoyanapi.top/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬百度云zy | [🔗](https://bdzy1.com) | [jjpz.hafrey.dpdns.org](https://jjpz.hafrey.dpdns.org/?url=https://api.apibdzy.com/api.php/provide/vod "点击访问完整 API") | 95 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬红牛资源 | [🔗](https://www.hongniuzy.com) | [hongniuzy2.com](https://www.hongniuzy2.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬索尼资源 | [🔗](https://suonizy.net) | [suoniapi.com](https://suoniapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬茅台资源 | [🔗](https://mtzy.me) | [caiji.maotaizy.cc](https://caiji.maotaizy.cc/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬虎牙资源 | [🔗](https://www.huyaapi.com) | [huyaapi.com](https://www.huyaapi.com/api.php/provide/vod "点击访问完整 API") | 9 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬豪华资源 | [🔗](https://www.haohuazy.com) | [jjpz.hafrey.dpdns.org](https://jjpz.hafrey.dpdns.org/?url=https://hhzyapi.com/api.php/provide/vod "点击访问完整 API") | 68 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬量子影视 | [🔗](https://lzizy.net) | [cj.lziapi.com](https://cj.lziapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬量子资源 | [🔗](https://cj.lzcaiji.com) | [cj.lzcaiji.com](https://cj.lzcaiji.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬闪电资源 | [🔗](https://shandianzy.com) | [xsd.sdzyapi.com](https://xsd.sdzyapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬非凡资源 | [🔗](https://cj.ffzyapi.com) | [api.ffzyapi.com](https://api.ffzyapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬魔都动漫 | [🔗](https://caiji.moduapi.cc) | [caiji.moduapi.cc](https://caiji.moduapi.cc/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬魔都资源 | [🔗](https://www.moduzy.net) | [mdzyapi.com](https://www.mdzyapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬鸭鸭资源 | [🔗](https://yayazy3.com) | [cj.yayazy.net](https://cj.yayazy.net/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞 CK-资源 | [🔗](https://ckzy.me) | [ckzy.me](https://ckzy.me/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞--AIvin- | [🔗](http://lbapiby.com) | [lbapiby.com](http://lbapiby.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-大奶子- | [🔗](https://apidanaizi.com) | [apidanaizi.com](https://apidanaizi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-幸资源- | [🔗](https://xzytv.com) | [xzybb2.com](https://xzybb2.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-老色逼- | [🔗](https://apilsbzy1.com) | [apilsbzy1.com](https://apilsbzy1.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-色南国- | [🔗](https://api.sexnguon.com) | [api.sexnguon.com](https://api.sexnguon.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞155-资源 | [🔗](https://155zy2.com) | [155api.com](https://155api.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞jkun资源 | [🔗](https://jkunzyapi.com) | [jkunzyapi.com](https://jkunzyapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞souavZY | [🔗](https://api.souavzy.vip) | [api.souavzy.vip](https://api.souavzy.vip/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞乐播资源 | [🔗](https://lbapi9.com) | [lbapi9.com](https://lbapi9.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞优优资源 | [🔗](https://www.yyzywcj.com) | [yyzywcj.com](https://www.yyzywcj.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞最色资源 | [🔗](https://zuisezy.com) | [api.zuiseapi.com](https://api.zuiseapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞滴滴资源 | [🔗](https://didizy.com) | [api.ddapi.cc](https://api.ddapi.cc/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞玉兔资源 | [🔗](https://apiyutu.com) | [apiyutu.com](https://apiyutu.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞番号资源 | [🔗](http://fhapi9.com) | [fhapi9.com](http://fhapi9.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞百万资源 | [🔗](https://api.bwzym3u8.com) | [api.bwzyz.com](https://api.bwzyz.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞精品资源 | [🔗](https://www.jingpinx.com) | [jingpinx.com](https://www.jingpinx.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞辣椒资源 | [🔗](https://apilj.com) | [apilj.com](https://apilj.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞鲨鱼资源 | [🔗](https://shayuapi.com) | [shayuapi.com](https://shayuapi.com/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞黄色仓库 | [🔗](https://hsckzy.xyz) | [hsckzy.xyz](https://hsckzy.xyz/api.php/provide/vod "点击访问完整 API") | 100 | 0 | 100.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬-爱奇艺- | [🔗](https://iqiyizyapi.com) | [iqiyizyapi.com](https://iqiyizyapi.com/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅✅✅❌✅✅✅ |
| ✅ | 🎬山海资源 | [🔗](https://zy.sh0o.cn) | [zy.sh0o.cn](https://zy.sh0o.cn/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅❌✅✅✅✅✅ |
| ✅ | 🎬建安资源 | [🔗](http://154.219.117.232:9981) | [154.219.117.232](http://154.219.117.232:9981/jacloudapi.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅✅✅❌✅✅✅ |
| ✅ | 🎬速播资源 | [🔗](https://www.subozy.com) | [subocaiji.com](https://subocaiji.com/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬金鹰点播 | [🔗](https://jinyingzy.com) | [jinyingzy.com](https://jinyingzy.com/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬飘零资源 | [🔗](https://p2100.net) | [p2100.net](https://p2100.net/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞-美少女- | [🔗](https://www.msnii.com) | [msnii.com](https://www.msnii.com/api/json.php "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅❌✅✅✅✅✅ |
| ✅ | 🔞-黄AVZY | [🔗](https://www.pgxdy.com) | [pgxdy.com](https://www.pgxdy.com/api/json.php "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅❌✅✅✅✅✅ |
| ✅ | 🔞91-精品- | [🔗](https://91jpzyw.com) | [91jpzyw.com](https://91jpzyw.com/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞小鸡资源 | [🔗](https://xiaojizy.live) | [api.xiaojizy.live](https://api.xiaojizy.live/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅❌✅✅✅✅✅ |
| ✅ | 🔞森林资源 | [🔗](https://slapibf.com) | [beiyong.slapibf.com](https://beiyong.slapibf.com/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞细胞资源 | [🔗](https://www.xxibaozyw.com) | [xxibaozyw.com](https://www.xxibaozyw.com/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅❌✅✅✅✅✅ |
| ✅ | 🔞香蕉资源 | [🔗](https://www.xiangjiaozyw.com) | [xiangjiaozyw.com](https://www.xiangjiaozyw.com/api.php/provide/vod "点击访问完整 API") | 99 | 1 | 99.0% | 0 | ✅❌✅✅✅✅✅ |
| ❌ | 🎬360 资源 | [🔗](https://360zy.com) | [360zy.com](https://360zy.com/api.php/provide/vod "点击访问完整 API") | 98 | 2 | 98.0% | 1 | ✅✅✅✅❌✅❌ |
| ✅ | 🔞-奥斯卡- | [🔗](https://aosikazy.com) | [aosikazy.com](https://aosikazy.com/api.php/provide/vod "点击访问完整 API") | 98 | 2 | 98.0% | 0 | ❌❌✅✅✅✅✅ |
| ✅ | 🔞奶香资源 | [🔗](https://Naixxzy.com) | [naixxzy.com](https://Naixxzy.com/api.php/provide/vod "点击访问完整 API") | 98 | 2 | 98.0% | 0 | ❌❌✅✅✅✅✅ |
| ✅ | 🔞桃花资源 | [🔗](https://thzy8.me) | [thzy1.me](https://thzy1.me/api.php/provide/vod "点击访问完整 API") | 98 | 2 | 98.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞白嫖资源 | [🔗](https://www.kxgav.com) | [kxgav.com](https://www.kxgav.com/api/json.php "点击访问完整 API") | 98 | 2 | 98.0% | 0 | ❌❌✅✅✅✅✅ |
| ✅ | 🔞色猫资源 | [🔗](https://semaozy1.com) | [caiji.semaozy.net](https://caiji.semaozy.net/inc/apijson_vod.php/provide/vod "点击访问完整 API") | 98 | 2 | 98.0% | 0 | ❌❌✅✅✅✅✅ |
| ✅ | 🔞豆豆资源 | [🔗](https://doudouzy.com) | [api.douapi.cc](https://api.douapi.cc/api.php/provide/vod "点击访问完整 API") | 98 | 2 | 98.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞麻豆视频 | [🔗](https://91md.me) | [91md.me](https://91md.me/api.php/provide/vod "点击访问完整 API") | 97 | 3 | 97.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬iKun资源 | [🔗](https://ikunzy.com) | [ikunzyapi.com](https://ikunzyapi.com/api.php/provide/vod "点击访问完整 API") | 95 | 5 | 95.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬电影天堂 | [🔗](http://caiji.dyttzyapi.com) | [caiji.dyttzyapi.com](http://caiji.dyttzyapi.com/api.php/provide/vod "点击访问完整 API") | 95 | 5 | 95.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬如意资源 | [🔗](https://www.ryzyw.com) | [jjpz.hafrey.dpdns.org](https://jjpz.hafrey.dpdns.org/?url=https://cj.rycjapi.com/api.php/provide/vod "点击访问完整 API") | 94 | 6 | 94.0% | 0 | ❌✅✅✅❌✅✅ |
| ✅ | 🎬豆瓣资源 | [🔗](https://dbzy.tv) | [caiji.dbzy5.com](https://caiji.dbzy5.com/api.php/provide/vod "点击访问完整 API") | 93 | 7 | 93.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🎬U酷影视 | [🔗](https://www.ukuzy.com) | [api.ukuapi88.com](https://api.ukuapi88.com/api.php/provide/vod "点击访问完整 API") | 92 | 8 | 92.0% | 0 | ✅✅✅✅✅✅✅ |
| ✅ | 🔞杏吧资源 | [🔗](https://xingba111.com) | [jjpz.hafrey.dpdns.org](https://jjpz.hafrey.dpdns.org/?url=https://xingba222.com/api.php/provide/vod "点击访问完整 API") | 8 | 1 | 88.9% | 0 | ✅❌✅✅✅✅✅ |
| ✅ | 🔞大地资源 | [🔗](https://dadizy11.com) | [dadiapi.com](https://dadiapi.com/feifei "点击访问完整 API") | 9 | 2 | 81.8% | 0 | ❌❌✅✅✅✅✅ |
| ❌ | 🔞丝袜资源 | [🔗](https://siwazyw.tv) | [siwazyw.tv](https://siwazyw.tv/api.php/provide/vod "点击访问完整 API") | 6 | 3 | 66.7% | 1 | ❌❌✅✅✅✅❌ |
<!-- API_TABLE_END -->













































































































































































