/**
 * Modern Blog Authentication Portal Controller
 * Integrates Google M3 Modal, GitHub Auth, Passkey (WebAuthn), OTP Code & Password Flows
 */

(function () {
  'use strict';

  // --- State Management ---
  const STORAGE_KEY = 'tech_blog_user_session';
  let currentUser = null;
  let activeTab = 'pwd'; // 'pwd' | 'otp' | 'reg'
  let otpCountdown = 0;
  let otpTimer = null;

  // --- DOM References ---
  const DOM = {
    themeToggleBtn: document.getElementById('b-theme-toggle'),
    themeIcon: document.getElementById('b-theme-icon'),
    authCardForm: document.getElementById('b-auth-form-wrap'),
    authLoggedInView: document.getElementById('b-logged-in-view'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.b-tab-btn'),
    pwdTabContent: document.getElementById('tab-pwd-content'),
    otpTabContent: document.getElementById('tab-otp-content'),
    regTabContent: document.getElementById('tab-reg-content'),
    cardTitle: document.getElementById('b-card-title'),
    cardSubtitle: document.getElementById('b-card-subtitle'),
    
    // Primary Forms
    authForm: document.getElementById('b-auth-form'),
    btnSubmit: document.getElementById('b-btn-submit'),
    btnSubmitText: document.getElementById('b-btn-submit-text'),
    
    // Inputs
    emailInput: document.getElementById('b-input-email'),
    pwdInput: document.getElementById('b-input-password'),
    regNameInput: document.getElementById('b-input-reg-name'),
    regEmailInput: document.getElementById('b-input-reg-email'),
    regPwdInput: document.getElementById('b-input-reg-password'),
    otpPhoneInput: document.getElementById('b-input-otp-phone'),
    otpDigits: document.querySelectorAll('.b-otp-digit'),
    btnSendOtp: document.getElementById('b-btn-send-otp'),

    // Password Eye Toggles
    eyeToggles: document.querySelectorAll('.b-eye-toggle'),

    // Strength Meter
    strengthBox: document.getElementById('b-reg-strength'),
    strengthLabel: document.getElementById('b-strength-text'),
    strengthBars: document.querySelectorAll('.b-bar-segment'),

    // Social Buttons
    btnGoogle: document.getElementById('b-btn-google'),
    btnGithub: document.getElementById('b-btn-github'),
    btnPasskey: document.getElementById('b-btn-passkey'),

    // User Panel Elements
    userAvatarLg: document.getElementById('b-user-avatar-lg'),
    userNameWelcome: document.getElementById('b-user-name-welcome'),
    userEmailWelcome: document.getElementById('b-user-email-welcome'),
    btnLogout: document.getElementById('b-btn-logout'),

    // Scenario Demos
    btnArticleUnlock: document.getElementById('b-btn-article-unlock'),
    articleGateOverlay: document.getElementById('b-article-gate-overlay'),
    commentInput: document.getElementById('b-comment-input'),
    btnCommentSubmit: document.getElementById('b-btn-comment-submit'),
    commentUserChip: document.getElementById('b-comment-user-chip')
  };

  // --- Initializer ---
  function init() {
    loadSavedSession();
    bindTheme();
    bindTabs();
    bindEyeToggles();
    bindPasswordStrength();
    bindOtpInputs();
    bindSocialLogins();
    bindFormSubmit();
    bindScenarioDemos();
    updateUIState();
  }

  // --- Theme Controller ---
  function bindTheme() {
    const savedTheme = localStorage.getItem('blog_ui_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (DOM.themeToggleBtn) {
      DOM.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('blog_ui_theme', nextTheme);
        updateThemeIcon(nextTheme);
      });
    }
  }

  function updateThemeIcon(theme) {
    if (DOM.themeIcon) {
      DOM.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // --- Tab Switcher ---
  function bindTabs() {
    DOM.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    DOM.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));

    DOM.pwdTabContent.style.display = tab === 'pwd' ? 'block' : 'none';
    DOM.otpTabContent.style.display = tab === 'otp' ? 'block' : 'none';
    DOM.regTabContent.style.display = tab === 'reg' ? 'block' : 'none';

    if (tab === 'pwd') {
      DOM.cardTitle.textContent = '欢迎回来';
      DOM.cardSubtitle.textContent = '输入您的账号和密码访问极客博客';
      DOM.btnSubmitText.textContent = '立即登录';
    } else if (tab === 'otp') {
      DOM.cardTitle.textContent = '免密验证码登录';
      DOM.cardSubtitle.textContent = '无需密码，使用手机/邮箱验证码一键直达';
      DOM.btnSubmitText.textContent = '验证并登录';
    } else if (tab === 'reg') {
      DOM.cardTitle.textContent = '创建新账号';
      DOM.cardSubtitle.textContent = '加入 35,000+ 极客社区，开启技术探索';
      DOM.btnSubmitText.textContent = '注册并开启阅读';
    }

    clearAllErrors();
  }

  // --- Password Show/Hide ---
  function bindEyeToggles() {
    DOM.eyeToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.dataset.target;
        const input = document.getElementById(targetId);
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          toggle.innerHTML = isPassword ? `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ` : `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          `;
        }
      });
    });
  }

  // --- Password Strength Meter ---
  function bindPasswordStrength() {
    if (!DOM.regPwdInput) return;

    DOM.regPwdInput.addEventListener('input', () => {
      const val = DOM.regPwdInput.value;
      if (val.length === 0) {
        DOM.strengthBox.style.display = 'none';
        return;
      }

      DOM.strengthBox.style.display = 'block';
      let score = 0;
      if (val.length >= 6) score++;
      if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      DOM.strengthBars.forEach((bar, idx) => {
        bar.className = 'b-bar-segment';
        if (idx < score) {
          if (score <= 1) bar.classList.add('active-weak');
          else if (score <= 3) bar.classList.add('active-medium');
          else bar.classList.add('active-strong');
        }
      });

      if (score <= 1) {
        DOM.strengthLabel.textContent = '强度：较弱 (建议包含字母与数字)';
      } else if (score <= 3) {
        DOM.strengthLabel.textContent = '强度：良好 (可添加特殊字符更安全)';
      } else {
        DOM.strengthLabel.textContent = '强度：极佳 🔒 完美符合安全规范';
      }
    });
  }

  // --- OTP 6-Digit Auto-advance & Timer ---
  function bindOtpInputs() {
    DOM.otpDigits.forEach((digit, index) => {
      digit.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val && index < DOM.otpDigits.length - 1) {
          DOM.otpDigits[index + 1].focus();
        }
      });

      digit.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          DOM.otpDigits[index - 1].focus();
        }
      });

      digit.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
        if (/^\d+$/.test(pasted)) {
          const chars = pasted.split('').slice(0, 6);
          chars.forEach((c, i) => {
            if (DOM.otpDigits[i]) DOM.otpDigits[i].value = c;
          });
          const lastIdx = Math.min(chars.length, DOM.otpDigits.length) - 1;
          if (lastIdx >= 0) DOM.otpDigits[lastIdx].focus();
        }
      });
    });

    if (DOM.btnSendOtp) {
      DOM.btnSendOtp.addEventListener('click', () => {
        const phoneOrMail = DOM.otpPhoneInput.value.trim();
        if (!phoneOrMail) {
          showError(DOM.otpPhoneInput, '请输入接收验证码的手机或邮箱');
          return;
        }

        clearError(DOM.otpPhoneInput);
        startOtpCountdown();
        
        // Auto fill a mock code for fast demo testing
        setTimeout(() => {
          const mockCode = '839215';
          mockCode.split('').forEach((ch, idx) => {
            if (DOM.otpDigits[idx]) DOM.otpDigits[idx].value = ch;
          });
          showToast('✅ 模拟验证码已发送并自动填入：839215');
        }, 1200);
      });
    }
  }

  function startOtpCountdown() {
    otpCountdown = 60;
    DOM.btnSendOtp.disabled = true;
    updateOtpBtnText();

    clearInterval(otpTimer);
    otpTimer = setInterval(() => {
      otpCountdown--;
      if (otpCountdown <= 0) {
        clearInterval(otpTimer);
        DOM.btnSendOtp.disabled = false;
        DOM.btnSendOtp.textContent = '重新获取';
      } else {
        updateOtpBtnText();
      }
    }, 1000);
  }

  function updateOtpBtnText() {
    DOM.btnSendOtp.textContent = `${otpCountdown}s 后重发`;
  }

  // --- OAuth & Passkey Social Logins ---
  function bindSocialLogins() {
    // 1. Google 1:1 Simulation Modal Integration
    if (DOM.btnGoogle) {
      DOM.btnGoogle.addEventListener('click', () => {
        if (window.GoogleLogin) {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          window.GoogleLogin.open({
            blogName: 'DevLog 极客博客',
            lang: 'zh-CN',
            theme: isDark ? 'dark' : 'light',
            enable2FA: true,
            onSuccess: (data) => {
              handleAuthSuccess({
                name: data.user.name || 'Google Geek',
                email: data.user.email,
                avatar: data.user.avatar,
                provider: 'google'
              });
            }
          });
        }
      });
    }

    // 2. GitHub OAuth Simulator
    if (DOM.btnGithub) {
      DOM.btnGithub.addEventListener('click', () => {
        simulateSocialOAuth('GitHub', 'octocat_dev', 'developer@github.com', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png');
      });
    }

    // 3. Passkey / WebAuthn Biometrics
    if (DOM.btnPasskey) {
      DOM.btnPasskey.addEventListener('click', () => {
        triggerPasskeyAuth();
      });
    }
  }

  function simulateSocialOAuth(provider, name, email, avatar) {
    const btn = provider === 'GitHub' ? DOM.btnGithub : null;
    if (btn) btn.style.opacity = '0.6';

    showToast(`🔄 正在连接 ${provider} 授权网关...`);
    setTimeout(() => {
      if (btn) btn.style.opacity = '1';
      handleAuthSuccess({
        name: name,
        email: email,
        avatar: avatar,
        provider: provider.toLowerCase()
      });
    }, 900);
  }

  function triggerPasskeyAuth() {
    showToast('🔑 正在调用系统生物识别 (Touch ID / Face ID / Windows Hello)...');
    setTimeout(() => {
      handleAuthSuccess({
        name: 'Passkey Verified User',
        email: 'passkey.user@domain.com',
        avatar: '',
        provider: 'passkey'
      });
      showToast('✨ Passkey 生物识别验证通过！');
    }, 1200);
  }

  // --- Form Validation & Submission ---
  function bindFormSubmit() {
    DOM.authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAllErrors();

      if (activeTab === 'pwd') {
        const email = DOM.emailInput.value.trim();
        const pwd = DOM.pwdInput.value;

        if (!email) {
          showError(DOM.emailInput, '请输入登录邮箱或用户名');
          return;
        }
        if (!pwd) {
          showError(DOM.pwdInput, '请输入登录密码');
          return;
        }

        startLoading();
        setTimeout(() => {
          stopLoading();
          handleAuthSuccess({
            name: email.split('@')[0],
            email: email.includes('@') ? email : `${email}@geek.dev`,
            avatar: '',
            provider: 'password'
          });
        }, 800);

      } else if (activeTab === 'otp') {
        const phone = DOM.otpPhoneInput.value.trim();
        let code = '';
        DOM.otpDigits.forEach(d => code += d.value);

        if (!phone) {
          showError(DOM.otpPhoneInput, '请输入手机号或邮箱');
          return;
        }
        if (code.length < 6) {
          showToast('⚠️ 请输入完整的 6 位验证码');
          return;
        }

        startLoading();
        setTimeout(() => {
          stopLoading();
          handleAuthSuccess({
            name: 'Mobile User',
            email: phone,
            avatar: '',
            provider: 'otp'
          });
        }, 800);

      } else if (activeTab === 'reg') {
        const name = DOM.regNameInput.value.trim();
        const email = DOM.regEmailInput.value.trim();
        const pwd = DOM.regPwdInput.value;

        if (!name) {
          showError(DOM.regNameInput, '请输入您的昵称');
          return;
        }
        if (!email || !email.includes('@')) {
          showError(DOM.regEmailInput, '请输入有效的电子邮箱');
          return;
        }
        if (!pwd || pwd.length < 6) {
          showError(DOM.regPwdInput, '密码长度至少为 6 位');
          return;
        }

        startLoading();
        setTimeout(() => {
          stopLoading();
          handleAuthSuccess({
            name: name,
            email: email,
            avatar: '',
            provider: 'register'
          });
        }, 900);
      }
    });

    if (DOM.btnLogout) {
      DOM.btnLogout.addEventListener('click', () => {
        logoutUser();
      });
    }
  }

  // --- Error Handling & Helpers ---
  function showError(inputEl, msg) {
    const group = inputEl.closest('.b-form-group');
    if (group) {
      group.classList.add('has-error');
      const errEl = group.querySelector('.b-error-text');
      if (errEl) {
        errEl.innerHTML = `⚠️ ${msg}`;
        errEl.style.display = 'flex';
      }
    }
    inputEl.focus();
  }

  function clearError(inputEl) {
    const group = inputEl.closest('.b-form-group');
    if (group) {
      group.classList.remove('has-error');
      const errEl = group.querySelector('.b-error-text');
      if (errEl) errEl.style.display = 'none';
    }
  }

  function clearAllErrors() {
    document.querySelectorAll('.b-form-group').forEach(g => {
      g.classList.remove('has-error');
      const err = g.querySelector('.b-error-text');
      if (err) err.style.display = 'none';
    });
  }

  function startLoading() {
    DOM.btnSubmit.classList.add('loading');
  }

  function stopLoading() {
    DOM.btnSubmit.classList.remove('loading');
  }

  // --- Auth Lifecycle ---
  function handleAuthSuccess(user) {
    currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    updateUIState();
    triggerConfetti();
    showToast(`🎉 欢迎，${user.name}！登录成功`);
  }

  function logoutUser() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    updateUIState();
    showToast('👋 已退出当前账号');
  }

  function loadSavedSession() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        currentUser = JSON.parse(saved);
      }
    } catch (e) {
      currentUser = null;
    }
  }

  function updateUIState() {
    if (currentUser) {
      // Show Logged-in Dashboard
      DOM.authCardForm.style.display = 'none';
      DOM.authLoggedInView.style.display = 'block';

      const initial = (currentUser.name || 'G').charAt(0).toUpperCase();
      DOM.userAvatarLg.textContent = initial;
      DOM.userNameWelcome.textContent = currentUser.name || '极客读者';
      DOM.userEmailWelcome.textContent = currentUser.email || 'user@geek.dev';

      // Update Scenario Demos
      if (DOM.articleGateOverlay) DOM.articleGateOverlay.style.display = 'none';
      if (DOM.commentUserChip) {
        DOM.commentUserChip.innerHTML = `
          <span style="display:inline-flex; width:22px; height:22px; border-radius:50%; background:var(--b-primary); color:#fff; align-items:center; justify-content:center; font-size:11px; font-weight:bold;">${initial}</span>
          <span>已登录: <strong>${currentUser.name}</strong></span>
        `;
      }
    } else {
      // Show Auth Tabs & Form
      DOM.authCardForm.style.display = 'block';
      DOM.authLoggedInView.style.display = 'none';

      if (DOM.articleGateOverlay) DOM.articleGateOverlay.style.display = 'flex';
      if (DOM.commentUserChip) {
        DOM.commentUserChip.innerHTML = `<span>👤 访客评论 (支持一键授权快捷填入)</span>`;
      }
    }
  }

  // --- Scenario Demos Interactions ---
  function bindScenarioDemos() {
    // 1. Unlock article preview
    if (DOM.btnArticleUnlock) {
      DOM.btnArticleUnlock.addEventListener('click', () => {
        if (window.GoogleLogin) {
          window.GoogleLogin.open({
            blogName: 'DevLog 极客博客',
            onSuccess: (data) => {
              handleAuthSuccess({
                name: data.user.name,
                email: data.user.email,
                avatar: data.user.avatar,
                provider: 'google'
              });
            }
          });
        }
      });
    }

    // 2. Comment submission
    if (DOM.btnCommentSubmit) {
      DOM.btnCommentSubmit.addEventListener('click', () => {
        const text = DOM.commentInput.value.trim();
        if (!text) {
          showToast('⚠️ 评论内容不能为空');
          return;
        }
        if (!currentUser) {
          showToast('💡 请先通过 Google 或上方表单登录后再发表精彩评论');
          if (window.GoogleLogin) {
            window.GoogleLogin.open({
              blogName: 'DevLog 评论区',
              onSuccess: (data) => {
                handleAuthSuccess({
                  name: data.user.name,
                  email: data.user.email,
                  avatar: data.user.avatar,
                  provider: 'google'
                });
                DOM.commentInput.value = '';
                showToast('🚀 评论发表成功！');
              }
            });
          }
          return;
        }

        DOM.commentInput.value = '';
        showToast('🚀 评论发表成功！');
      });
    }
  }

  // --- Simple Confetti Particle Animation ---
  function triggerConfetti() {
    const colors = ['#0b57d0', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.style.position = 'fixed';
      p.style.zIndex = '9999';
      p.style.width = Math.random() * 8 + 6 + 'px';
      p.style.height = Math.random() * 8 + 6 + 'px';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.left = '50vw';
      p.style.top = '40vh';
      p.style.pointerEvents = 'none';
      p.style.transition = 'all 1s cubic-bezier(0.25, 1, 0.5, 1)';
      document.body.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 260 + 100;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance + 100;

      requestAnimationFrame(() => {
        p.style.transform = `translate(${destX}px, ${destY}px) rotate(${Math.random() * 360}deg) scale(0)`;
        p.style.opacity = '0';
      });

      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 1100);
    }
  }

  // --- Toast Notification ---
  function showToast(msg) {
    let toast = document.getElementById('b-global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'b-global-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.background = 'rgba(15, 23, 42, 0.9)';
      toast.style.color = '#ffffff';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '30px';
      toast.style.fontSize = '14px';
      toast.style.fontWeight = '500';
      toast.style.zIndex = '10000';
      toast.style.backdropFilter = 'blur(12px)';
      toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2800);
  }

  // Export to global for debug or manual triggers
  window.BlogAuth = {
    init,
    logout: logoutUser,
    showToast
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
