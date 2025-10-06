// 通用 API 中转代理 - Cloudflare Workers 版本
// 作者: hafrey
// 用途: 代理访问被墙或限制的 API 接口

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 解析请求 URL
  const requestUrl = new URL(request.url)
  const targetUrl = requestUrl.searchParams.get('url')
  
  // 重要：保留原始 URL 中的所有查询参数
  // 因为 searchParams.get('url') 可能会截断 URL 中的查询字符串
  const urlMatch = request.url.match(/[?&]url=([^&]+(?:&.*)?)/)
  const fullTargetUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : targetUrl

  // CORS 头配置
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  // 根目录返回使用说明
  if (!fullTargetUrl) {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API 中转代理服务</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #333; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 14px;
    }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .example {
      background: #e8f5e9;
      padding: 15px;
      border-left: 4px solid #4caf50;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>🔄 API 中转代理服务</h1>
  <p>通用 API 中转代理，用于访问被墙或限制的接口。</p>
  
  <h2>使用方法</h2>
  <p>在请求 URL 后添加 <code>?url=目标地址</code> 参数：</p>
  <pre>https://dl.hafrey.dpdns.org/?url=https://example.com/api</pre>
  
  <div class="example">
    <strong>示例：</strong><br>
    <a href="https://dl.hafrey.dpdns.org/?url=https://caiji.kuaichezy.org/api.php/provide/vod" target="_blank">
    https://dl.hafrey.dpdns.org/?url=https://caiji.kuaichezy.org/api.php/provide/vod
    </a>
  </div>
  
  <h2>支持的功能</h2>
  <ul>
    <li>✅ 支持 GET、POST、PUT、DELETE 等所有 HTTP 方法</li>
    <li>✅ 自动转发请求头和请求体</li>
    <li>✅ 保留原始响应头（除敏感信息）</li>
    <li>✅ 完整的 CORS 支持</li>
    <li>✅ 超时保护（30 秒）</li>
  </ul>
</body>
</html>
    `
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders
      }
    })
  }

  // 验证目标 URL
  let targetURL
  try {
    targetURL = new URL(fullTargetUrl)
  } catch (e) {
    return new Response(JSON.stringify({
      error: 'Invalid URL',
      message: '无效的目标 URL 地址',
      url: fullTargetUrl
    }, null, 2), {
      status: 400,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders
      }
    })
  }

  try {
    // 构建代理请求
    const proxyRequest = new Request(targetURL.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    })

    // 发起代理请求（30 秒超时）
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(proxyRequest, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    // 构建响应头（过滤敏感信息）
    const responseHeaders = new Headers(corsHeaders)
    const excludeHeaders = [
      'content-encoding',
      'content-length',
      'transfer-encoding',
      'connection',
      'keep-alive',
      'set-cookie',
      'set-cookie2'
    ]

    for (const [key, value] of response.headers) {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    }

    // 返回代理响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })

  } catch (error) {
    // 错误处理
    const errorResponse = {
      error: 'Proxy Error',
      message: error.message || '代理请求失败',
      target: fullTargetUrl,
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify(errorResponse, null, 2), {
      status: 502,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders
      }
    })
  }
}
