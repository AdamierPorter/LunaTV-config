/**
 * Worker 入口点
 * 这个脚本处理 CORS 请求并将它们代理到指定的 URL。
 * 你可以通过查询参数传递目标 URL: ?url=<目标_URL>
 * 示例: https://your-worker.example.com/?url=https://caiji.kuaichezy.org/api.php/provide/vod
 */

// Cloudflare Worker - CORS 代理处理

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))  // 监听所有请求并调用处理函数
})

async function handleRequest(request) {
  // 获取查询参数 'url' 的值
  const urlParam = new URL(request.url).searchParams.get('url')

  if (!urlParam) {
    return new Response('缺少 "url" 查询参数', { status: 400 })  // 如果没有提供 url 参数，返回错误
  }

  // 验证传入的 URL 是否有效
  let targetUrl
  try {
    targetUrl = new URL(urlParam)  // 尝试解析目标 URL
  } catch (e) {
    return new Response('无效的 "url" 查询参数', { status: 400 })  // 如果 URL 格式无效，返回错误
  }

  // 检查是否是有效的 HTTP 或 HTTPS 协议
  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return new Response('只允许 HTTP/HTTPS 协议的 URL', { status: 400 })  // 如果协议不是 HTTP 或 HTTPS，返回错误
  }

  // 转发请求到目标 URL
  const response = await fetch(targetUrl, {
    method: request.method,  // 保留请求方法（如 GET, POST 等）
    headers: request.headers,  // 保留请求头部信息
    body: request.method === 'POST' || request.method === 'PUT' ? await request.text() : null,  // 如果是 POST 或 PUT 请求，传递请求体
  })

  // 克隆响应以便修改 CORS 头部
  const modifiedResponse = new Response(response.body, response)

  // 设置 CORS 头部，允许所有来源进行跨域请求
  modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')  // 允许所有来源
  modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')  // 允许的 HTTP 方法
  modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')  // 允许的请求头部

  // 返回修改后的响应
  return modifiedResponse
}
