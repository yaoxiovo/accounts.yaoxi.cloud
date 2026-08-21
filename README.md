# Google 帐号身份认证与授权服务 (Google Sign-In UI)

1:1 Google Material 3 官方规范的身份认证与 OAuth 2.0 / Passkey (WebAuthn) 登录授权服务。

---

## 📁 项目结构

```text
google-login-ui/
├── index.html         # 🎯 核心登录与身份授权服务页面 (1:1 Google Material 3)
├── style.css          # 🎨 Material 3 主题样式 (深色/浅色自适应、矢量插画与动画)
├── script.js          # ⚡ 账号核验、WebAuthn 通行密钥断言与 OAuth 2.0 签名握手
├── push_to_github.sh  # 🚀 GitHub 推送脚本
└── README.md          # 📖 说明文档
```

---

## 🚀 访问与调用

### 本地启动
```bash
python3 -m http.server 8080
```
浏览器访问: `http://localhost:8080/`

### OAuth 2.0 / SSO 接入参数
支持作为独立认证网关被第三方应用调起：

```text
http://localhost:8080/?client_id=my-app&target_domain=blog.example.com&redirect_uri=https://blog.example.com/callback
```
