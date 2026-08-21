/**
 * 100% 免费版 Cloudflare Worker / Snippet 边缘 400 拦截器
 * 严格白名单过滤 + HMAC-SHA256 密码学签名防伪验签: 篡改任何数字/字符立即拦截并下发 HTTP 400 Bad Request
 * 适用环境: Cloudflare Free 免费版计划 (每日 100,000 次免费请求额度)
 * 路由绑定: accounts.yaoxi.cloud/*
 */

const SSO_HANDSHAKE_SECRET = 'yaoxi_sso_handshake_secret_key_v1_auth_guard_2026';

const ALLOWED_PARAMS = new Set([
  'client_request_token',
  'client_id',
  'redirect_uri',
  'target_domain',
  'response_type',
  'scope',
  'state',
  'cf_sitekey'
]);

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
      请求无效：客户端请求凭证签名非法、已被篡改或参数未授权。
    </p>
    <div class="g-400-param-box">
      HTTP Status: 400 Bad Request (Cryptographic Signature Verification Failed)<br>
      SSO Gateway: accounts.yaoxi.cloud
    </div>
    <p class="g-400-body">
      该单点登录节点仅受理由 <strong>blog.yaoxi.wiki</strong> 携带经密码学签名的合法 Token 发起的跨域握手，严禁伪造或篡改。
    </p>
    <div class="g-400-footer-hint">这就是我们知道的全部信息。</div>
  </div>
</body>
</html>`;

async function verifyCryptographicTokenSignature(token, targetDomain = 'blog.yaoxi.wiki') {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 5 || parts[0] !== 'crt' || parts[1] !== 'v1') return false;

  const [_, version, timestampStr, nonce, receivedSig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  const now = Date.now();
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 300 * 1000) return false;

  try {
    const payload = `v1.${timestampStr}.${nonce}.${targetDomain}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SSO_HANDSHAKE_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const expectedSig = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('').substring(0, 32);

    return receivedSig === expectedSig;
  } catch (e) {
    return false;
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // 1. 放行静态资源文件 (.css, .js, .png, .ico 等)
    if (
      pathname.endsWith('.css') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.svg') ||
      pathname.includes('client-blog.html')
    ) {
      return fetch(request);
    }

    // 2. 严格参数白名单校验: 携带任何非法/未授权参数直接返回 400
    for (const key of url.searchParams.keys()) {
      if (!ALLOWED_PARAMS.has(key)) {
        return new Response(GOOGLE_400_HTML, {
          status: 400,
          statusText: 'Bad Request',
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            'X-Robots-Tag': 'noindex, nofollow'
          }
        });
      }
    }

    // 3. 严格校验 client_request_token 密码学防伪签名
    const token = url.searchParams.get('client_request_token');
    const targetDomain = url.searchParams.get('target_domain') || 'blog.yaoxi.wiki';
    const isValidSignature = await verifyCryptographicTokenSignature(token, targetDomain);

    if (!isValidSignature) {
      return new Response(GOOGLE_400_HTML, {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'X-Robots-Tag': 'noindex, nofollow'
        }
      });
    }

    // 4. 密码学验签通过 -> 放行至登录中心页面
    return fetch(request);
  }
};
