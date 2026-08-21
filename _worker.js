/**
 * Cloudflare Worker / Pages Advanced Mode Worker
 * Enforces HTTP 400 Bad Request Status & 1:1 Google Error Page on Direct Access
 */

const GOOGLE_400_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>400. 错误。这就是我们知道的全部信息。</title>
  <style>
    :root {
      --bg: #131314;
      --text: #e3e3e3;
      --text-sec: #c4c7c5;
      --text-ter: #8e918f;
      --border: #ea4335;
      --card-bg: #1e1f20;
      --code-text: #f28b82;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #ffffff;
        --text: #1f1f1f;
        --text-sec: #444746;
        --text-ter: #5e5e5e;
        --border: #ea4335;
        --card-bg: #f8fafd;
        --code-text: #b3261e;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 32px 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .g-400-container {
      max-width: 680px;
      margin: 40px auto 0;
      animation: fadeIn 0.3s ease-out;
      width: 100%;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .g-400-logo { margin-bottom: 24px; }
    .g-400-title {
      font-size: 28px;
      font-weight: 500;
      color: var(--text);
      margin-bottom: 16px;
    }
    .g-400-title strong { font-weight: 700; }
    .g-400-body {
      font-size: 15px;
      color: var(--text-sec);
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .g-400-param-box {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 13px;
      color: var(--code-text);
      line-height: 1.6;
    }
    .g-400-footer-hint {
      font-size: 13px;
      color: var(--text-ter);
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="g-400-container">
    <div class="g-400-logo">
      <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
    </div>
    <h1 class="g-400-title"><strong>400.</strong> 错误。</h1>
    <p class="g-400-body">
      请求无效：缺少必需的客户端请求凭证（<code>client_request_token</code>）。
    </p>
    <div class="g-400-param-box">
      HTTP Status: 400 Bad Request (Invalid OAuth Handshake)<br>
      Missing required parameter: client_request_token<br>
      SSO Gateway: accounts.yaoxi.cloud
    </div>
    <p class="g-400-body">
      该单点登录节点仅受理由 <strong>blog.yaoxi.wiki</strong> 携带合法 Token 授权发起的跨域握手，不支持外部直接访问。
    </p>
    <div class="g-400-footer-hint">这就是我们知道的全部信息。</div>
  </div>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // 1. Static asset bypass
    if (
      pathname.endsWith('.css') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.svg') ||
      pathname.endsWith('.json') ||
      pathname.includes('client-blog.html')
    ) {
      return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
    }

    // 2. Token validation
    const token = url.searchParams.get('client_request_token');

    if (!token || token.trim() === '') {
      return new Response(GOOGLE_400_HTML, {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      });
    }

    // 3. Valid Token -> Pass through to static assets
    return env.ASSETS ? env.ASSETS.fetch(request) : fetch(request);
  }
};
