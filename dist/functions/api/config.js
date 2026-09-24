/**
 * Cloudflare Pages Functions API: /api/config
 * 统一身份认证中心配置存储接口 (支持 Cloudflare KV 绑定与持久化)
 */

const DEFAULT_CONFIG = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  security: {
    ssoIssuer: "https://accounts.yaoxi.cloud",
    handshakeSecret: "yaoxi_sso_handshake_secret_key_v1_auth_guard_2026",
    tokenTtl: 7200,
    kid: "yaoxi_cloud_sso_2026",
    preventReplay: true,
    strictWhitelist: true
  },
  turnstile: {
    enabled: true,
    siteKey: "0x4AAAAAAEXamT3iIRWjGCmk",
    secretKey: ""
  },
  branding: {
    systemTitle: "Google 帐号 - 统一身份认证",
    welcomeTitle: "欢迎",
    bannerNotice: "不妨选择“试试其他方式”，改用通行密钥更轻松更安全地登录",
    defaultTheme: "light",
    defaultLang: "zh-CN",
    showPasswordToggle: true
  },
  domains: [
    { id: "dom_1", name: "耀西极客博客", pattern: "*.yaoxi.wiki", type: "wildcard", enabled: true, createdAt: "2026-09-24" },
    { id: "dom_2", name: "耀西云全子域", pattern: "*.yaoxi.cloud", type: "wildcard", enabled: true, createdAt: "2026-09-24" },
    { id: "dom_3", name: "本地开发测试", pattern: "localhost", type: "exact", enabled: true, createdAt: "2026-09-24" },
    { id: "dom_4", name: "本地回环地址", pattern: "127.0.0.1", type: "exact", enabled: true, createdAt: "2026-09-24" }
  ],
  users: [
    {
      id: "usr_yaoxi",
      username: "yaoxi",
      displayName: "耀西 (Super Admin)",
      email: "yaoxiov0@gmail.com",
      password: "yaoxi",
      roles: ["admin", "author", "super_user"],
      status: "active",
      passkeyBound: true,
      lastLogin: new Date().toISOString()
    }
  ],
  clients: [
    {
      id: "cli_1",
      clientId: "yaoxi-blog",
      clientName: "耀西极客博客",
      targetDomain: "blog.yaoxi.wiki",
      redirectUri: "https://blog.yaoxi.wiki",
      scope: "openid profile email admin",
      enabled: true
    },
    {
      id: "cli_2",
      clientId: "yaoxi-app",
      clientName: "耀西云全平台默认客户端",
      targetDomain: "yaoxi.cloud",
      redirectUri: "https://accounts.yaoxi.cloud",
      scope: "openid profile email",
      enabled: true
    }
  ],
  auditLogs: [
    {
      id: "log_init",
      timestamp: new Date().toISOString(),
      action: "SYSTEM_INIT",
      operator: "system",
      details: "统一身份认证管理面板初始化完成",
      ip: "127.0.0.1"
    }
  ]
};

export async function onRequestGet(context) {
  try {
    let config = null;
    if (context.env && context.env.SSO_CONFIG_KV) {
      const kvData = await context.env.SSO_CONFIG_KV.get('sso_global_config');
      if (kvData) {
        config = JSON.parse(kvData);
      }
    }
    if (!config) {
      config = DEFAULT_CONFIG;
    }
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify(DEFAULT_CONFIG), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const newConfig = await context.request.json();
    if (!newConfig || typeof newConfig !== 'object') {
      return new Response(JSON.stringify({ success: false, error: '无效的配置格式' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    newConfig.lastUpdated = new Date().toISOString();

    if (context.env && context.env.SSO_CONFIG_KV) {
      await context.env.SSO_CONFIG_KV.put('sso_global_config', JSON.stringify(newConfig));
    }

    return new Response(JSON.stringify({ success: true, config: newConfig }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
