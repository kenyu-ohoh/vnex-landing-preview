const ROLE_STORAGE_KEY = 'vnexLoginRole';
const LANG_STORAGE_KEY = 'vnexLoginLang';
const LOGIN_INTRO_FLAG_KEY = 'vnexLoginIntroFromLanding';
const LOGIN_INTRO_TONE_KEY = 'vnexLoginIntroTone';
const LANDING_RETURN_FLAG_KEY = 'vnexLandingReturnFromLogin';
const LANDING_RETURN_ROLE_KEY = 'vnexLandingReturnRole';

const roles = {
  student: {
    short: 'student',
    media: {
      mp4: 'assets/login/Login_bg_stud.mp4'
    },
    grad: 'var(--grad-student)',
    fallback: '#9fb7d4'
  },
  staff: {
    short: 'staff',
    media: {
      mp4: 'assets/login/Login_bg_staff.mp4'
    },
    grad: 'var(--grad-staff)',
    fallback: '#bce1e3'
  },
  alumni: {
    short: 'alumni',
    media: {
      mp4: 'assets/login/Login_bg_alumni.mp4'
    },
    grad: 'var(--grad-alumni)',
    fallback: '#d4c2e4'
  },
  employer: {
    short: 'employer',
    media: {
      mp4: 'assets/login/Login_bg_employer.mp4'
    },
    grad: 'var(--grad-employer)',
    fallback: '#f7d6b4'
  }
};

const i18n = {
  ENG: {
    backHome: '← Back to Home',
    who: 'Who are you?',
    subtitle: 'Select a role - only that login method is shown.',
    login: 'Login →',
    roles: {
      student: { title: 'Student', meta: 'Jobs · CV · Events · Alerts' },
      staff: { title: 'Staff / Admin', meta: 'Manage · Insights · Approvals' },
      alumni: { title: 'Alumni', meta: 'Career · Network · Jobs' },
      employer: { title: 'Employer', meta: 'Post jobs · Hire talent' }
    },
    employerRoleLoginMeta: 'S00 — Login · employer role',
    back: '← Back',
    backToLogin: '← Back to Login',
    email: 'Email',
    password: 'Password',
    captcha: 'CAPTCHA',
    hint2fa: '2FA: OTP via email or mobile after password',
    registerLinePre: 'New company?',
    registerLineLink: 'Register with BR',
    registerLinePost: '- Admin approval required.',
    registerTitle: 'Employer Register For VTC Career Center',
    secAccount: 'Account Information',
    secProfile: 'Employer Profile',
    secDoc: 'Document Upload (BR / Equivalent Certificate)',
    secContact: "Contact Person Details (For university's contact purpose)",
    fileHelper: 'Please use file <5MB, with format in jpg, jpeg, png, gif, and pdf. Please do not use any special characters in file name.',
    submitRegister: 'Submit for admin approval',
    errors: {
      emailRequired: 'Email is required.',
      emailFormat: 'Please enter a valid email.',
      passwordRequired: 'Password is required.',
      captchaRequired: 'Please complete CAPTCHA.',
      fileInvalid: 'Please upload a valid file (<5MB, jpg/jpeg/png/gif/pdf, simple filename).',
      requiredField: 'Please complete all required fields.'
    }
  },
  TC: {
    backHome: '← 返回主頁',
    who: '你是誰？',
    subtitle: '請先選擇身份，只會顯示對應登入方式。',
    login: '登入 →',
    roles: {
      student: { title: '學生', meta: '職位 · 履歷 · 活動 · 提醒' },
      staff: { title: '教職員 / 管理員', meta: '管理 · 洞察 · 審批' },
      alumni: { title: '校友', meta: '職涯 · 人脈 · 職位' },
      employer: { title: '僱主', meta: '刊登職位 · 招募人才' }
    },
    employerRoleLoginMeta: 'S00 — Login · employer role',
    back: '^ 返回',
    backToLogin: '← 返回登入',
    email: '電郵',
    password: '密碼',
    captcha: '驗證碼',
    hint2fa: '2FA：輸入密碼後，將以電郵或手機接收 OTP。',
    registerLinePre: '新公司？',
    registerLineLink: '以商業登記註冊',
    registerLinePost: '- 需管理員審批。',
    registerTitle: 'VTC Career Center 僱主註冊',
    secAccount: '帳戶資料',
    secProfile: '公司資料',
    secDoc: '文件上載（商業登記／同等證明）',
    secContact: '聯絡人資料（供院校聯絡）',
    fileHelper: '請上載小於 5MB 的 jpg、jpeg、png、gif 或 pdf，檔名請勿使用特殊字元。',
    submitRegister: '提交至管理員審批',
    errors: {
      emailRequired: '請輸入電郵。',
      emailFormat: '請輸入有效電郵。',
      passwordRequired: '請輸入密碼。',
      captchaRequired: '請完成驗證。',
      fileInvalid: '請上載有效檔案（<5MB，jpg/jpeg/png/gif/pdf，檔名不可含特殊字元）。',
      requiredField: '請填寫所有必填欄位。'
    }
  },
  SC: {
    backHome: '← 返回首页',
    who: '你是谁？',
    subtitle: '请选择身份，只显示对应登录方式。',
    login: '登录 →',
    roles: {
      student: { title: '学生', meta: '职位 · 简历 · 活动 · 提醒' },
      staff: { title: '教职员 / 管理员', meta: '管理 · 洞察 · 审批' },
      alumni: { title: '校友', meta: '职业 · 人脉 · 职位' },
      employer: { title: '雇主', meta: '发布职位 · 招募人才' }
    },
    employerRoleLoginMeta: 'S00 — Login · employer role',
    back: '^ 返回',
    backToLogin: '← 返回登录',
    email: '邮箱',
    password: '密码',
    captcha: '验证码',
    hint2fa: '2FA：输入密码后，将通过邮箱或手机接收 OTP。',
    registerLinePre: '新公司？',
    registerLineLink: '使用商业登记注册',
    registerLinePost: '- 需管理员审批。',
    registerTitle: 'VTC Career Center 雇主注册',
    secAccount: '账户信息',
    secProfile: '企业资料',
    secDoc: '文件上传（商业登记／同等证明）',
    secContact: '联系人信息（供院校联系）',
    fileHelper: '请上传小于 5MB 的 jpg、jpeg、png、gif 或 pdf，文件名请勿使用特殊字符。',
    submitRegister: '提交管理员审批',
    errors: {
      emailRequired: '请输入邮箱。',
      emailFormat: '请输入有效邮箱。',
      passwordRequired: '请输入密码。',
      captchaRequired: '请完成验证。',
      fileInvalid: '请上传有效文件（<5MB，jpg/jpeg/png/gif/pdf，文件名不可含特殊字符）。',
      requiredField: '请填写所有必填项。'
    }
  }
};

const body = document.body;
const roleList = document.getElementById('role-list');
const rolePills = Array.from(document.querySelectorAll('.role-pill'));
const bgCurrent = document.getElementById('bg-current');
const bgNext = document.getElementById('bg-next');
const mediaFallback = document.getElementById('media-fallback');
const videoA = document.getElementById('role-video-a');
const videoB = document.getElementById('role-video-b');
const views = {
  roles: document.getElementById('view-roles'),
  signin: document.getElementById('view-signin'),
  employerSignin: document.getElementById('view-signin'),
  employerRegister: document.getElementById('view-register')
};
const summaryIcon = document.getElementById('summary-icon');
const summaryTitle = document.getElementById('summary-title');
const summaryMeta = document.getElementById('summary-meta');
const summaryBack = document.getElementById('summary-back');
const registerSummaryTitle = document.getElementById('register-summary-title');
const registerSummaryMeta = document.getElementById('register-summary-meta');
const registerBack = document.getElementById('register-back');
const signinTitle = document.getElementById('signin-title');
const signinForm = document.getElementById('signin-form');
const registerForm = document.getElementById('register-form');
const registerLine = document.getElementById('register-line');
const registerLink = document.getElementById('register-link');
const captchaRow = document.getElementById('captcha-row');
const hint2fa = document.getElementById('hint-2fa');
const signinSubmit = document.getElementById('signin-submit');
const homePill = document.getElementById('home-pill');
const langDropdown = document.getElementById('lang-dropdown');
const langTrigger = document.getElementById('lang-trigger');
const langItems = Array.from(document.querySelectorAll('.lang-item'));

const rolesTitle = document.getElementById('roles-title');
const rolesSubtitle = document.getElementById('roles-subtitle');

const labelEmail = document.getElementById('label-email');
const labelPassword = document.getElementById('label-password');
const captchaLabel = document.getElementById('captcha-label');
const registerTitle = document.getElementById('register-title');
const secAccount = document.getElementById('sec-account');
const secProfile = document.getElementById('sec-profile');
const secDoc = document.getElementById('sec-doc');
const secContact = document.getElementById('sec-contact');
const fileHelper = document.getElementById('file-helper');
const registerSubmit = document.getElementById('register-submit');

const signinEmail = document.getElementById('signin-email');
const signinPassword = document.getElementById('signin-password');
const signinCaptcha = document.getElementById('signin-captcha');

const errEmail = document.getElementById('error-email');
const errPassword = document.getElementById('error-password');
const errCaptcha = document.getElementById('error-captcha');
const errBrFile = document.getElementById('error-br-file');
const brFile = document.getElementById('br-file');

let state = {
  role: sessionStorage.getItem(ROLE_STORAGE_KEY) || 'student',
  lang: sessionStorage.getItem(LANG_STORAGE_KEY) || 'ENG',
  view: 'roles',
  activeVideo: 'a',
  employerRoleLoginHint: false
};

function shouldPlayLandingIntro(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('from') === 'landing') return true;

  let viaFlag = false;
  try {
    viaFlag = sessionStorage.getItem(LOGIN_INTRO_FLAG_KEY) === '1';
  } catch (_error) {
    viaFlag = false;
  }

  const fromIndexReferrer = /\/index\.html(?:$|[?#])/i.test(document.referrer || '');
  return viaFlag || fromIndexReferrer;
}

function playLandingIntroIfNeeded(){
  if (!shouldPlayLandingIntro()) return;

  let introTone = 'dark';
  try {
    introTone = sessionStorage.getItem(LOGIN_INTRO_TONE_KEY) || 'dark';
  } catch (_error) {
    introTone = 'dark';
  }

  const introStartColor = introTone === 'light' ? '#f6f8fc' : '#171f35';
  body.style.setProperty('--landing-intro-start', introStartColor);

  try {
    sessionStorage.removeItem(LOGIN_INTRO_FLAG_KEY);
    sessionStorage.removeItem(LOGIN_INTRO_TONE_KEY);
  } catch (_error) {
    // Ignore storage access issues.
  }

  body.classList.add('landing-intro-enter');
  window.setTimeout(() => {
    body.classList.remove('landing-intro-enter');
    body.style.removeProperty('--landing-intro-start');
  }, 1150);
}

function markLandingReturnAnimation(){
  try {
    sessionStorage.setItem(LANDING_RETURN_FLAG_KEY, '1');
    sessionStorage.setItem(LANDING_RETURN_ROLE_KEY, state.role);
  } catch (_error) {
    // Ignore storage access issues.
  }
}

function canUseHistoryBackToLanding(){
  if (window.history.length <= 1) return false;
  const ref = document.referrer || '';
  if (!ref) return false;

  try {
    const refUrl = new URL(ref, window.location.href);
    if (refUrl.origin !== window.location.origin) return false;
    return /\/index\.html(?:$|[?#])/i.test(refUrl.pathname + refUrl.search + refUrl.hash);
  } catch (_error) {
    return false;
  }
}

function getText(){
  return i18n[state.lang] || i18n.ENG;
}

function roleCopy(role){
  const text = getText();
  return text.roles[role] || text.roles.student;
}

function setBodyRole(role){
  body.dataset.role = role;
  mediaFallback.style.background = roles[role].fallback;
}

function setGradient(role, animate = true){
  const nextGrad = roles[role].grad;
  if (!animate) {
    bgCurrent.style.background = nextGrad;
    bgNext.style.opacity = '0';
    return;
  }

  bgNext.style.background = nextGrad;
  bgNext.style.opacity = '1';
  window.setTimeout(() => {
    bgCurrent.style.background = nextGrad;
    bgNext.style.opacity = '0';
  }, 520);
}

function setVideoSource(videoEl, role){
  const media = roles[role].media;
  videoEl.innerHTML = '';

  const sourceMp4 = document.createElement('source');
  sourceMp4.src = media.mp4;
  sourceMp4.type = 'video/mp4';

  videoEl.appendChild(sourceMp4);
  videoEl.load();
  const promise = videoEl.play();
  if (promise && typeof promise.catch === 'function') {
    promise.catch(() => {});
  }
}

function setVideo(role, animate = true){
  const current = state.activeVideo === 'a' ? videoA : videoB;
  const next = state.activeVideo === 'a' ? videoB : videoA;

  if (!animate) {
    setVideoSource(current, role);
    current.classList.add('current');
    next.classList.remove('current');
    return;
  }

  setVideoSource(next, role);
  next.classList.add('current');
  current.classList.remove('current');
  state.activeVideo = state.activeVideo === 'a' ? 'b' : 'a';
}

function applyRoleUI(){
  rolePills.forEach((pill) => {
    const role = pill.dataset.role;
    const selected = role === state.role;
    pill.setAttribute('aria-checked', String(selected));
    pill.tabIndex = selected ? 0 : -1;
  });

  const copy = roleCopy(state.role);
  summaryIcon.className = 'role-icon ' + state.role;
  summaryTitle.textContent = copy.title;
  summaryMeta.textContent = copy.meta;
  registerSummaryTitle.textContent = copy.title;
  registerSummaryMeta.textContent = copy.meta;
}

function setRole(role, animate = true){
  if (!roles[role]) return;
  state.role = role;
  if (role !== 'employer') {
    state.employerRoleLoginHint = false;
    body.dataset.employerHint = '0';
  }
  sessionStorage.setItem(ROLE_STORAGE_KEY, role);
  setBodyRole(role);
  setGradient(role, animate);
  setVideo(role, animate);
  applyRoleUI();
  applyLanguage(state.lang);
}

function showView(view){
  state.view = view;
  const mapped = view === 'employer-signin' ? 'employer-signin' : view;
  body.dataset.view = mapped;

  const isRoles = view === 'roles';
  const isRegister = view === 'employer-register';
  views.roles.hidden = !isRoles;
  views.signin.hidden = isRoles || isRegister;
  views.employerRegister.hidden = !isRegister;

   Object.values(views).forEach((node) => {
    node.classList.remove('active');
  });

  if (isRoles) {
    views.roles.classList.add('active');
    return;
  }

  if (isRegister) {
    views.employerRegister.classList.add('active');
    return;
  }

  views.signin.classList.add('active');
}

function shouldUseRoleToSigninAnimation(role){
  if (role !== 'employer') return false;
  if (state.view !== 'roles') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

function playRoleToSigninAnimation(onDone){
  body.classList.add('role-to-signin-animating');
  window.setTimeout(() => {
    if (typeof onDone === 'function') onDone();
    window.setTimeout(() => {
      body.classList.remove('role-to-signin-animating');
    }, 60);
  }, 640);
}

function shouldUseSigninToRoleAnimation(){
  if (state.view !== 'employer-signin') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

function playSigninToRoleAnimation(){
  showView('roles');
  applyLanguage(state.lang);
  body.classList.add('role-from-signin-animating');
  window.setTimeout(() => {
    body.classList.remove('role-from-signin-animating');
  }, 560);
}

function openSigninForRole(role){
  if (shouldUseRoleToSigninAnimation(role)) {
    body.dataset.employerHint = '0';
    setRole(role);
    playRoleToSigninAnimation(() => {
      showView('employer-signin');
      applyLanguage(state.lang);
      clearSignInErrors();
      signinForm.reset();
    });
    return;
  }

  body.dataset.employerHint = '0';
  setRole(role);
  if (role === 'employer') {
    showView('employer-signin');
  } else {
    showView('signin');
  }
  applyLanguage(state.lang);
  clearSignInErrors();
  signinForm.reset();
}

function clearSignInErrors(){
  errEmail.textContent = '';
  errPassword.textContent = '';
  errCaptcha.textContent = '';
}

function validateEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateSignIn(){
  const text = getText();
  const email = signinEmail.value.trim();
  const password = signinPassword.value.trim();
  const needsCaptcha = state.role === 'employer';
  let valid = true;

  clearSignInErrors();

  if (!email) {
    errEmail.textContent = text.errors.emailRequired;
    valid = false;
  } else if (!validateEmail(email)) {
    errEmail.textContent = text.errors.emailFormat;
    valid = false;
  }

  if (!password) {
    errPassword.textContent = text.errors.passwordRequired;
    valid = false;
  }

  if (needsCaptcha && !signinCaptcha.checked) {
    errCaptcha.textContent = text.errors.captchaRequired;
    valid = false;
  }

  if (!valid) return null;

  return {
    role: state.role,
    email,
    password,
    captchaChecked: signinCaptcha.checked
  };
}

function validateRegister(){
  const text = getText();
  const required = Array.from(registerForm.querySelectorAll('[aria-required="true"]'));
  let valid = true;

  required.forEach((field) => {
    if (!field.value) valid = false;
  });

  const file = brFile.files && brFile.files[0] ? brFile.files[0] : null;
  errBrFile.textContent = '';

  if (!file) {
    valid = false;
  } else {
    const okSize = file.size <= 5 * 1024 * 1024;
    const okName = /^[a-zA-Z0-9._-]+$/.test(file.name);
    const okExt = /\.(jpg|jpeg|png|gif|pdf)$/i.test(file.name);
    if (!okSize || !okName || !okExt) {
      errBrFile.textContent = text.errors.fileInvalid;
      valid = false;
    }
  }

  if (!valid && !errBrFile.textContent) {
    errBrFile.textContent = text.errors.requiredField;
  }

  if (!valid) return null;

  const formData = new FormData(registerForm);
  return Object.fromEntries(formData.entries());
}

function applyLanguage(lang){
  if (!i18n[lang]) lang = 'ENG';
  state.lang = lang;
  sessionStorage.setItem(LANG_STORAGE_KEY, lang);
  body.dataset.lang = lang;

  const text = getText();

  const isEmployerSigninView = state.view === 'employer-signin';
  homePill.textContent = isEmployerSigninView ? text.back : text.backHome;
  homePill.setAttribute('href', isEmployerSigninView ? '#view-roles' : 'index.html#top');
  rolesTitle.textContent = text.who;
  rolesSubtitle.textContent = text.subtitle;

  rolePills.forEach((pill) => {
    const role = pill.dataset.role;
    const copy = text.roles[role];
    const titleNode = pill.querySelector('[data-role-title="' + role + '"]');
    const metaNode = pill.querySelector('[data-role-meta="' + role + '"]');
    const loginNode = pill.querySelector('[data-role-login="' + role + '"]');
    if (copy && titleNode && metaNode) {
      titleNode.textContent = copy.title;
      const useEmployerLoginHint =
        role === 'employer' &&
        state.view === 'roles' &&
        body.dataset.employerHint === '1';
      metaNode.textContent = useEmployerLoginHint ? text.employerRoleLoginMeta : copy.meta;
    }
    if (loginNode) loginNode.textContent = text.login;
  });

  const selected = langItems.find((item) => item.dataset.lang === lang);
  langItems.forEach((item) => {
    item.setAttribute('aria-selected', String(item.dataset.lang === lang));
  });
  langTrigger.setAttribute('aria-expanded', 'false');
  langDropdown.classList.remove('open');
  if (selected) {
    langTrigger.innerHTML = selected.dataset.short + ' <span class="chev" aria-hidden="true"></span>';
  }

  const currentRoleCopy = roleCopy(state.role);
  summaryTitle.textContent = currentRoleCopy.title;
  summaryMeta.textContent = currentRoleCopy.meta;
  registerSummaryTitle.textContent = currentRoleCopy.title;
  registerSummaryMeta.textContent = currentRoleCopy.meta;

  summaryBack.textContent = text.back;
  registerBack.textContent = text.backToLogin;
  labelEmail.textContent = text.email;
  labelPassword.textContent = text.password;
  captchaLabel.textContent = text.captcha;
  hint2fa.textContent = text.hint2fa;

  const roleName = currentRoleCopy.title;
  signinTitle.textContent = roleName + ' sign-in';
  signinSubmit.textContent = 'Sign in as ' + roleName;

  const needsEmployerFields = state.role === 'employer';
  captchaRow.style.display = needsEmployerFields ? 'flex' : 'none';
  hint2fa.style.display = needsEmployerFields ? 'block' : 'none';
  registerLine.style.display = needsEmployerFields ? 'block' : 'none';

  if (needsEmployerFields) {
    signinTitle.textContent = 'Employer sign-in';
    signinSubmit.textContent = 'Sign in as Employer';
  }

  registerLine.innerHTML = text.registerLinePre + ' <button type="button" class="inline-link" id="register-link">' + text.registerLineLink + '</button> ' + text.registerLinePost;
  const nextRegisterLink = document.getElementById('register-link');
  nextRegisterLink.addEventListener('click', () => showView('employer-register'));

  registerTitle.textContent = text.registerTitle;
  secAccount.textContent = text.secAccount;
  secProfile.textContent = text.secProfile;
  secDoc.textContent = text.secDoc;
  secContact.textContent = text.secContact;
  fileHelper.textContent = text.fileHelper;
  registerSubmit.textContent = text.submitRegister;
}

function onRolePillClick(pill){
  const role = pill.dataset.role;
  if (role === 'employer') {
    state.employerRoleLoginHint = false;
    body.dataset.employerHint = '0';
    openSigninForRole(role);
    return;
  }

  const alreadySelected = role === state.role;

  if (!alreadySelected) {
    setRole(role);
    showView('roles');
    return;
  }

}

rolePills.forEach((pill) => {
  pill.addEventListener('click', (event) => {
    const chip = event.target.closest('.role-login-chip');
    const role = pill.dataset.role;
    if (chip) {
      event.preventDefault();
      openSigninForRole(role);
      return;
    }
    onRolePillClick(pill);
  });
});

roleList.addEventListener('keydown', (event) => {
  const currentIndex = rolePills.findIndex((node) => node.dataset.role === state.role);
  if (currentIndex < 0) return;

  let nextIndex = currentIndex;
  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % rolePills.length;
  }
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    nextIndex = (currentIndex - 1 + rolePills.length) % rolePills.length;
  }

  if (nextIndex !== currentIndex) {
    event.preventDefault();
    const role = rolePills[nextIndex].dataset.role;
    setRole(role);
    rolePills[nextIndex].focus();
    return;
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    const role = rolePills[currentIndex].dataset.role;
    if (event.key === 'Enter' && role === 'employer') {
      state.employerRoleLoginHint = false;
      body.dataset.employerHint = '0';
      openSigninForRole(role);
      return;
    }
    setRole(role);
  }
});

summaryBack.addEventListener('click', () => {
  if (state.role === 'employer') {
    state.employerRoleLoginHint = true;
    body.dataset.employerHint = '1';
  }
  if (shouldUseSigninToRoleAnimation()) {
    playSigninToRoleAnimation();
    return;
  }
  showView('roles');
  applyLanguage(state.lang);
});

registerBack.addEventListener('click', () => {
  showView('employer-signin');
  applyLanguage(state.lang);
});

homePill.addEventListener('click', (event) => {
  if (state.view !== 'employer-signin') return;
  event.preventDefault();
  if (shouldUseSigninToRoleAnimation()) {
    playSigninToRoleAnimation();
    return;
  }
  showView('roles');
  applyLanguage(state.lang);
});

homePill.addEventListener('click', () => {
  if (state.view === 'employer-signin') return;
  markLandingReturnAnimation();
});

homePill.addEventListener('click', (event) => {
  if (state.view === 'employer-signin') return;
  if (!canUseHistoryBackToLanding()) return;

  event.preventDefault();
  window.history.back();
});

signinForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const payload = validateSignIn();
  if (!payload) return;
  console.log('[preview-signin]', payload);
});

registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const payload = validateRegister();
  if (!payload) return;
  console.log('[preview-register]', payload);
});

if (brFile) {
  brFile.addEventListener('change', () => {
    errBrFile.textContent = '';
  });
}

langTrigger.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const opening = !langDropdown.classList.contains('open');
  langDropdown.classList.toggle('open', opening);
  langTrigger.setAttribute('aria-expanded', String(opening));
});

langItems.forEach((item) => {
  item.addEventListener('click', () => {
    applyLanguage(item.dataset.lang || 'ENG');
  });
});

document.addEventListener('click', (event) => {
  if (!langDropdown.contains(event.target)) {
    langDropdown.classList.remove('open');
    langTrigger.setAttribute('aria-expanded', 'false');
  }
});

window.addEventListener('pointerdown', () => {
  [videoA, videoB].forEach((video) => {
    if (video.paused) {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    }
  });
}, { once: true, passive: true });

function init(){
  if (!roles[state.role]) state.role = 'student';
  if (!i18n[state.lang]) state.lang = 'ENG';

  playLandingIntroIfNeeded();

  setBodyRole(state.role);
  body.dataset.employerHint = '0';
  setGradient(state.role, false);
  setVideo(state.role, false);
  applyRoleUI();
  showView('roles');
  applyLanguage(state.lang);
}

init();
