document.documentElement.classList.add('js-motion');

function revealBootScreen(){
  document.documentElement.classList.remove('vnex-boot');
}

window.setTimeout(revealBootScreen, 1800);

const LOGIN_INTRO_FLAG_KEY = 'vnexLoginIntroFromLanding';
const LOGIN_INTRO_TONE_KEY = 'vnexLoginIntroTone';
const LANDING_RETURN_FLAG_KEY = 'vnexLandingReturnFromLogin';
const LANDING_RETURN_ROLE_KEY = 'vnexLandingReturnRole';
const landingReturnRoleColorMap = {
  student: '#9fb7d4',
  staff: '#bce1e3',
  alumni: '#d4c2e4',
  employer: '#f7d6b4'
};

function getLandingIntroTone(){
  const hero = document.querySelector('.hero');
  if (!hero) return 'dark';
  const rect = hero.getBoundingClientRect();
  const probeY = window.innerHeight * 0.36;
  const heroVisibleAtProbe = rect.top <= probeY && rect.bottom >= probeY;
  return heroVisibleAtProbe ? 'dark' : 'light';
}

document.querySelectorAll('a[href^="login.html"]').forEach((link) => {
  link.addEventListener('click', () => {
    try {
      sessionStorage.setItem(LOGIN_INTRO_FLAG_KEY, '1');
      sessionStorage.setItem(LOGIN_INTRO_TONE_KEY, getLandingIntroTone());
      const targetRole = (link.getAttribute('data-login-role') || '').trim();
      if (targetRole) {
        sessionStorage.setItem(LANDING_RETURN_ROLE_KEY, targetRole);
      }
    } catch (_error) {
      // Ignore storage access issues; referrer fallback still supports intro animation.
    }
  });
});

function playLandingReturnIntroIfNeeded(){
  const root = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let shouldPlay = root.classList.contains('from-login-return');
  let role = root.getAttribute('data-landing-return-role') || 'student';
  try {
    const flagged = sessionStorage.getItem(LANDING_RETURN_FLAG_KEY) === '1';
    const storedRole = sessionStorage.getItem(LANDING_RETURN_ROLE_KEY);
    shouldPlay = shouldPlay || flagged;
    if (storedRole) role = storedRole;
    sessionStorage.removeItem(LANDING_RETURN_FLAG_KEY);
    sessionStorage.removeItem(LANDING_RETURN_ROLE_KEY);
  } catch (_error) {
    // Keep prewarmed class/role path if storage is unavailable.
  }

  if (!shouldPlay) return;

  const returnColor = landingReturnRoleColorMap[role] || landingReturnRoleColorMap.student;
  document.body.classList.remove('nav-hidden');
  root.style.setProperty('--landing-return-color', returnColor);
  root.classList.add('from-login-return');

  window.setTimeout(() => {
    root.classList.remove('from-login-return');
    root.style.removeProperty('--landing-return-color');
    root.removeAttribute('data-landing-return-role');
  }, 860);
}

// Run this immediately so return transition starts before heavier page scripts initialize.
playLandingReturnIntroIfNeeded();

const benefitTabs = Array.from(document.querySelectorAll('.tab-btn[data-role]'));
const benefitDotsWrap = document.querySelector('.benefit-dots');
const benefitHeadActions = Array.from(document.querySelectorAll('.benefit-head-actions'));
const benefitViewport = document.querySelector('.benefit-viewport');
const benefitTabsWrap = document.querySelector('.tabs');
const benefitPagesByRole = {
  employer: Array.from(document.querySelectorAll('.benefit-page[data-role="employer"]')),
  student: Array.from(document.querySelectorAll('.benefit-page[data-role="student"]'))
};

// Keep section flow consistent across browsers: Discover first, then Benefits.
const mainNode = document.querySelector('main');
const discoverSection = document.getElementById('discover');
const benefitsSection = document.getElementById('benefits');

function getBenefitVariantFromLocation(){
  const urlParams = new URLSearchParams(window.location.search);
  const directAb = (urlParams.get('ab') || '').toLowerCase();
  if (directAb === 'v1' || directAb === 'v2' || directAb === 'v3') return directAb;

  // htmlpreview wraps the target URL in its own query string, so `ab` may only
  // exist inside the full href (for example: ...index.html?ab=v2#benefits).
  const href = String(window.location.href || '');
  const match = href.match(/[?&]ab=(v1|v2|v3)(?:[&#]|$)/i);
  if (match) return match[1].toLowerCase();

  try {
    const decodedHref = decodeURIComponent(href);
    const decodedMatch = decodedHref.match(/[?&]ab=(v1|v2|v3)(?:[&#]|$)/i);
    if (decodedMatch) return decodedMatch[1].toLowerCase();
  } catch (_error) {
    // Ignore malformed URI sequence and fall back to default.
  }

  return 'v1';
}

const benefitVariant = getBenefitVariantFromLocation();
document.body.classList.remove('ab-v1', 'ab-v2', 'ab-v3');
document.body.classList.add('ab-' + benefitVariant);
document.body.classList.remove('benefits-v2');
if (benefitVariant === 'v3') {
  document.body.classList.add('benefits-v2');
}
if (benefitsSection) {
  benefitsSection.setAttribute('data-ab', benefitVariant === 'v3' ? 'v2' : benefitVariant);
}

if (mainNode && discoverSection && benefitsSection && mainNode.firstElementChild !== discoverSection) {
  mainNode.insertBefore(discoverSection, benefitsSection);
}

let activeBenefitRole = 'employer';
const benefitPageState = { employer: 0, student: 0 };
let benefitAutoplayId = null;
let benefitTransitionTimer = null;
let benefitTabSwitchTimer = null;

function triggerBenefitTabSwitchAnimation(){
  if (!benefitTabsWrap) return;
  benefitTabsWrap.classList.remove('is-switching');
  void benefitTabsWrap.offsetWidth;
  benefitTabsWrap.classList.add('is-switching');

  if (benefitTabSwitchTimer) window.clearTimeout(benefitTabSwitchTimer);
  benefitTabSwitchTimer = window.setTimeout(() => {
    benefitTabsWrap.classList.remove('is-switching');
    benefitTabSwitchTimer = null;
  }, 340);
}

function normalizePageIndex(role, index){
  const pages = benefitPagesByRole[role] || [];
  if (!pages.length) return 0;
  return (index + pages.length) % pages.length;
}

function updateBenefitDots(role, activeIndex){
  if (!benefitDotsWrap) return;
  benefitDotsWrap.innerHTML = '';
  const pages = benefitPagesByRole[role] || [];
  pages.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'benefit-dot' + (index === activeIndex ? ' active' : '');
    dot.setAttribute('data-page', String(index));
    dot.setAttribute('aria-label', 'Go to page ' + String(index + 1));
    dot.addEventListener('click', () => {
      setBenefitPage(role, index, index < benefitPageState[role] ? 'prev' : 'next');
      startBenefitAutoplay();
    });
    benefitDotsWrap.appendChild(dot);
  });
}

function animateBenefitPage(role, fromIndex, toIndex, direction){
  const pages = benefitPagesByRole[role] || [];
  const fromPage = pages[fromIndex];
  const toPage = pages[toIndex];
  if (!toPage) return;

  if (benefitTransitionTimer) {
    clearTimeout(benefitTransitionTimer);
    benefitTransitionTimer = null;
  }

  pages.forEach((page) => {
    page.classList.remove('enter-next', 'enter-prev', 'exit-next', 'exit-prev');

    // If a previous animation was interrupted, force a single clean visible pair.
    if (page !== fromPage && page !== toPage) {
      page.classList.remove('active');
      page.style.visibility = 'hidden';
    }
  });

  if (!fromPage || fromIndex === toIndex) {
    pages.forEach((page, idx) => {
      const active = idx === toIndex;
      page.classList.toggle('active', active);
      if (!active) page.style.visibility = 'hidden';
      else page.style.visibility = 'visible';
    });
    return;
  }

  fromPage.classList.add('active');
  fromPage.style.visibility = 'visible';
  fromPage.classList.add(direction === 'prev' ? 'exit-prev' : 'exit-next');
  toPage.classList.add('active', direction === 'prev' ? 'enter-prev' : 'enter-next');
  toPage.style.visibility = 'visible';

  benefitTransitionTimer = setTimeout(() => {
    fromPage.classList.remove('active', 'exit-prev', 'exit-next');
    fromPage.style.visibility = 'hidden';
    toPage.classList.remove('enter-next', 'enter-prev');
    benefitTransitionTimer = null;
  }, 640);
}

function setBenefitPage(role, index, direction = 'next'){
  const pages = benefitPagesByRole[role] || [];
  if (!pages.length) return;
  const normalized = normalizePageIndex(role, index);
  const previous = benefitPageState[role];
  benefitPageState[role] = normalized;

  Object.entries(benefitPagesByRole).forEach(([groupRole, groupPages]) => {
    if (groupRole !== role) {
      groupPages.forEach((page) => {
        page.classList.remove('active', 'enter-next', 'enter-prev', 'exit-next', 'exit-prev');
        page.style.visibility = 'hidden';
      });
    }
  });

  animateBenefitPage(role, previous, normalized, direction);
  updateBenefitDots(role, normalized);

  benefitTabs.forEach((btn) => {
    const active = btn.dataset.role === role;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  if (benefitHeadActions.length) {
    benefitHeadActions.forEach((node) => {
      node.classList.toggle('student-active', role === 'student');
    });
  }

  activeBenefitRole = role;
}

function startBenefitAutoplay(){
  if (benefitAutoplayId) clearInterval(benefitAutoplayId);
  const pages = benefitPagesByRole[activeBenefitRole] || [];
  if (pages.length <= 1) return;
  benefitAutoplayId = setInterval(() => {
    setBenefitPage(activeBenefitRole, benefitPageState[activeBenefitRole] + 1, 'next');
  }, 10000);
}

benefitTabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    const role = btn.dataset.role || 'employer';
    triggerBenefitTabSwitchAnimation();
    setBenefitPage(role, benefitPageState[role], 'next');
    startBenefitAutoplay();
  });
});

if (benefitViewport) {
  benefitViewport.querySelectorAll('img').forEach((img) => {
    img.setAttribute('draggable', 'false');
  });

  let swipeStartX = 0;
  let swipeStartY = 0;
  let hasSwipeStart = false;
  let swipeTriggered = false;

  const beginSwipe = (x, y) => {
    swipeStartX = x;
    swipeStartY = y;
    hasSwipeStart = true;
    swipeTriggered = false;
  };

  const trySwipe = (x, y) => {
    if (!hasSwipeStart || swipeTriggered) return;

    const deltaX = x - swipeStartX;
    const deltaY = y - swipeStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Require a clear horizontal swipe so vertical page scroll will not trigger page switch.
    if (absX < 56 || absX < absY * 1.2) return;

    swipeTriggered = true;
    hasSwipeStart = false;

    if (deltaX < 0) {
      setBenefitPage(activeBenefitRole, benefitPageState[activeBenefitRole] + 1, 'next');
    } else {
      setBenefitPage(activeBenefitRole, benefitPageState[activeBenefitRole] - 1, 'prev');
    }
    startBenefitAutoplay();
  };

  const endSwipe = (x, y) => {
    if (!hasSwipeStart) return;
    trySwipe(x, y);
    hasSwipeStart = false;
  };

  const cancelSwipe = () => {
    hasSwipeStart = false;
    swipeTriggered = false;
  };

  benefitViewport.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    beginSwipe(touch.clientX, touch.clientY);
  }, { passive: true });

  benefitViewport.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    endSwipe(touch.clientX, touch.clientY);
  }, { passive: true });

  benefitViewport.addEventListener('touchmove', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    trySwipe(touch.clientX, touch.clientY);
  }, { passive: true });

  benefitViewport.addEventListener('touchcancel', cancelSwipe, { passive: true });

  benefitViewport.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    beginSwipe(event.clientX, event.clientY);
  });

  benefitViewport.addEventListener('mousemove', (event) => {
    trySwipe(event.clientX, event.clientY);
  });

  benefitViewport.addEventListener('mouseup', (event) => {
    endSwipe(event.clientX, event.clientY);
  });

  window.addEventListener('mouseup', (event) => {
    endSwipe(event.clientX, event.clientY);
  });
}

setBenefitPage('employer', 0, 'next');
startBenefitAutoplay();

document.querySelectorAll('[data-reveal]').forEach((node) => {
  node.classList.add('in');
});

const heroArt = document.getElementById('hero-art');
const heroVideo = document.querySelector('.hero-video');
const heroVideoWebmSource = document.getElementById('hero-video-source-webm');
const heroVideoMp4Source = document.getElementById('hero-video-source-mp4');
const hero3d = document.getElementById('hero-3d');
const heroJobScene = document.getElementById('hero-job-scene');
const heroJobItems = Array.from(document.querySelectorAll('.hero-job-item'));
const discoverMotion = document.getElementById('discover-motion');
const desktopLang = document.getElementById('desktop-lang');
const desktopLangCurrent = document.getElementById('desktop-lang-current');
const desktopLangTrigger = desktopLang ? desktopLang.querySelector('.lang-dropdown-trigger') : null;
const langOptions = document.querySelectorAll('.lang-option');
const mobileLangOptions = document.querySelectorAll('.mobile-lang-option');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
const navToggle = document.querySelector('.nav-toggle');
const mobileNavMenu = document.querySelector('.mobile-nav-menu');
const mobileLogin = document.querySelector('.mobile-login');
const navWrap = document.querySelector('.nav-wrap');
const navLoginText = document.querySelector('.login span');
const navBrandSubtitle = document.querySelector('.brand small');
const heroTitle = document.querySelector('.hero-copy h1');
const heroSubtitle = document.querySelector('.hero-copy p');
const heroCta = document.querySelector('.hero-cta');
const benefitsKicker = document.querySelector('#benefits .section-kicker');
const benefitTabEmployer = document.querySelector('.tab-btn[data-role="employer"]');
const benefitTabStudent = document.querySelector('.tab-btn[data-role="student"]');
const benefitEmployerLogins = document.querySelectorAll('.benefit-login-employer');
const benefitStudentLogins = document.querySelectorAll('.benefit-login-student');
const benefitTitleNodes = Array.from(document.querySelectorAll('#benefits .benefit-copy h3'));
const benefitDescNodes = Array.from(document.querySelectorAll('#benefits .benefit-copy p'));
const fillLineNodes = Array.from(document.querySelectorAll('#fill-screen-1 .fill-line'));
const screen1Foot = document.querySelector('.screen1-foot');
const screen2LineNodes = Array.from(document.querySelectorAll('#fill-screen-2 .s2-line'));
const quickTitle = document.querySelector('#quick-links h3');
const quickLinkSpans = Array.from(document.querySelectorAll('#quick-links .quick-link span'));
const quickLinkImages = Array.from(document.querySelectorAll('#quick-links .quick-link img'));
const contactTitle = document.querySelector('#contact-us .contact-title');
const contactCopy = document.querySelector('#contact-us .contact-copy');
const contactMailCta = document.querySelector('#contact-us .contact-mail-cta');
const contactMailCtaLabel = document.querySelector('#contact-us .contact-mail-cta-label');
const contactMailBtn = document.querySelector('#contact-us .contact-btn-mail');
const contactPhoneBtn = document.querySelector('#contact-us .contact-btn-phone');
const contactMailLabel = document.querySelector('#contact-us .contact-btn-mail .contact-btn-label');
const contactPhoneLabel = document.querySelector('#contact-us .contact-btn-phone .contact-btn-label');
const contactEmailNode = document.querySelector('#contact-us .contact-email');
const contactPhoneNode = document.querySelector('#contact-us .contact-phone');
const footerTagline = document.querySelector('.footer-brand small');
const footerMetaLine1 = document.querySelector('.footer-meta div:first-child');
const footerMetaLine2 = document.querySelector('.footer-meta div:last-child');
const discoverPanels = [
  document.getElementById('panel-1'),
  document.getElementById('panel-2')
];
const quickLinksSection = document.getElementById('quick-links');
const screen2FillSpans = Array.from(document.querySelectorAll('#fill-screen-2 .s2-fill'));
const i18n = {
  ENG: {
    htmlLang: 'en',
    navLogin: 'Log In',
    navBrandSubtitle: 'your job partner',
    mobileMenuHome: 'Home',
    heroTitle: 'Find your next <span class="hero-accent">opportunity</span>',
    heroSubtitle: 'Explore roles, discover possibilities, and move your career forward.',
    heroCta: 'Apply Job Now',
    benefitsKicker: 'Who benefits',
    tabEmployer: 'Employer',
    tabStudent: 'Student & Alumni',
    employerLogin: 'Employer Login',
    studentLogin: 'Student Login (Coming soon)',
    benefitTitles: [
      'Job <span class="soft">Posting</span>',
      'AI Talent <span class="soft">Search & Sourcing</span>',
      'Direct Applicant <span class="soft">Management</span>',
      'Recruitment Event <span class="soft">Publishing</span>',
      'AI Job <span class="soft">Recommendations</span>',
      'AI CV & Cover Letter <span class="soft">Builder</span>',
      'Industry <span class="soft">Insights</span>',
      'Career Coaching <span class="soft">Resources</span>',
      'Recruitment and Placement <span class="soft">Activities</span>'
    ],
    benefitDescriptions: [
      'Create open positions to reach qualified candidates.',
      'Identify ideal candidates using AI-powered technology.',
      'Centralized platform for job postings and applicant tracking.',
      'Connect with potential talent through career fairs and events.',
      'AI-driven job matches tailored to your profile.',
      'Create your portfolio with AI recommendations.',
      'Explore industry and market trends.',
      'Master interview techniques and workplace skills.',
      'Connect with employers through career fairs and events.'
    ],
    discoverLine1: 'V for VTC',
    discoverLine2: 'NEX for Nexus',
    discoverFoot: 'Next Page \u2022 Next Step',
    screen2Lines: [
      'Derived from Nexus',
      'a central connection\u2014V-NEX',
      'serves as the official gateway',
      'integrating VTC students, alumni,',
      'and industry partners across one',
      'shared network.',
      'Together, we connect potential',
      'with opportunity for the future.'
    ],
    quickTitle: 'Quick Links',
    quickLabels: ['VTC Official Website', 'VTC Admission', 'Internship Arrangement', 'Alumni Portal', 'Occupation Dictionary'],
    quickAlts: ['VTC Official Website', 'VTC Admission', 'Internship Arrangement', 'Alumni Portal', 'Occupation Dictionary'],
    contactTitle: 'Contact Us',
    contactCopy: 'Graduate Placement Services,\nHeadquarters (Academic Services)\n14/F, VTC Tower, 27 Wood Road, Wanchai, H.K.\nTel: (852) 2836 1228 Fax: (852) 2574 3705\nE-mail: jis@vtc.edu.hk',
    contactMailCta: 'Email Us',
    contactMailLabel: 'E-mail',
    contactPhoneLabel: 'Tel',
    contactEmail: 'jis@vtc.edu.hk',
    contactPhone: '(852) 2836 1228',
    footerTagline: '&middot; your job partner',
    footerMeta1: '<a href="contact.html">Contact Us</a> | <a href="disclaimer.html">Disclaimer</a> | <a href="https://www.vtc.edu.hk/home/en/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>',
    footerMeta2: '(c) 2026 VTC V-NEX. All rights reserved.'
  },
  TC: {
    htmlLang: 'zh-Hant',
    navLogin: '\u767b\u5165',
    navBrandSubtitle: '\u4f60\u7684\u6c42\u8077\u5925\u4f34',
    mobileMenuHome: '\u9996\u9801',
    heroTitle: '\u767c\u6398\u4f60\u7684\u4e0b\u4e00\u500b <span class="hero-accent">\u6a5f\u9047</span>',
    heroSubtitle: '\u63a2\u7d22\u8077\u4f4d\u3001\u767c\u6398\u53ef\u80fd\uff0c\u63a8\u9032\u4f60\u7684\u8077\u6daf\u3002',
    heroCta: '\u7acb\u5373\u7533\u8acb\u8077\u4f4d',
    benefitsKicker: '\u53d7\u60e0\u5c0d\u8c61',
    tabEmployer: '\u50f1\u4e3b',
    tabStudent: '\u5b78\u751f\u53ca\u6821\u53cb',
    employerLogin: '\u50f1\u4e3b\u767b\u5165',
    studentLogin: '\u5b78\u751f\u767b\u5165\uff08\u5373\u5c07\u63a8\u51fa\uff09',
    benefitTitles: [
      '\u8077\u4f4d<span class="soft">\u767c\u5e03</span>',
      'AI \u4eba\u624d<span class="soft">\u641c\u5c0b\u8207\u7be9\u9078</span>',
      '\u7533\u8acb\u8005<span class="soft">\u7ba1\u7406</span>',
      '\u62db\u8058\u6d3b\u52d5<span class="soft">\u767c\u4f48</span>',
      'AI \u8077\u4f4d<span class="soft">\u63a8\u85a6</span>',
      'AI \u5c65\u6b77\u53ca\u6c42\u8077\u4fe1<span class="soft">\u5efa\u7acb</span>',
      '\u884c\u696d<span class="soft">\u6d1e\u5bdf</span>',
      '\u8077\u6daf\u8f14\u5c0e<span class="soft">\u8cc7\u6e90</span>',
      '\u62db\u8058\u8207\u5c31\u696d\u914d\u5c0d<span class="soft">\u6d3b\u52d5</span>'
    ],
    benefitDescriptions: [
      '\u5efa\u7acb\u8077\u4f4d\u7a7a\u7f3a\uff0c\u63a5\u89f8\u5408\u9069\u4eba\u624d\u3002',
      '\u4ee5 AI \u6280\u8853\u7cbe\u6e96\u641c\u5c0b\u7406\u60f3\u5019\u9078\u4eba\u3002',
      '\u96c6\u4e2d\u7ba1\u7406\u8077\u4f4d\u767c\u4f48\u8207\u7533\u8acb\u8005\u6d41\u7a0b\u3002',
      '\u900f\u904e\u62db\u8058\u6703\u53ca\u6d3b\u52d5\u63a5\u89f8\u6f5b\u5728\u4eba\u624d\u3002',
      '\u4ee5 AI \u6839\u64da\u4f60\u7684\u80cc\u666f\u63a8\u85a6\u5408\u9069\u8077\u4f4d\u3002',
      '\u900f\u904e AI \u5efa\u7acb\u4f60\u7684\u5c65\u6b77\u8207\u4f5c\u54c1\u96c6\u5167\u5bb9\u3002',
      '\u638c\u63e1\u884c\u696d\u8207\u5e02\u5834\u6700\u65b0\u8da8\u52e2\u3002',
      '\u63d0\u5347\u9762\u8a66\u6280\u5de7\u8207\u8077\u5834\u80fd\u529b\u3002',
      '\u900f\u904e\u62db\u8058\u6d3b\u52d5\u8207\u50f1\u4e3b\u5efa\u7acb\u9023\u7d50\u3002'
    ],
    discoverLine1: 'V \u53d6\u81ea VTC',
    discoverLine2: 'NEX \u6e90\u81ea Nexus',
    discoverFoot: '\u8077\u6daf\u4e0b\u4e00\u9801 \u2022 \u4eba\u751f\u4e0b\u4e00\u6b65',
    screen2Lines: [
      '\u6e90\u65bc Nexus',
      '\u9019\u500b\u6838\u5fc3\u9023\u7d50\u2014V-NEX',
      '\u4f5c\u70ba\u5b98\u65b9\u5e73\u53f0',
      '\u9023\u7e6b VTC \u5b78\u751f\u3001\u6821\u53cb\uff0c',
      '\u4ee5\u53ca\u696d\u754c\u5925\u4f34\uff0c\u5171\u5efa',
      '\u5171\u4eab\u7db2\u7d61\u3002',
      '\u6211\u5011\u628a\u6f5b\u80fd\u9023\u63a5\u6a5f\u9047\uff0c',
      '\u5171\u5275\u672a\u4f86\u3002'
    ],
    quickTitle: '\u5feb\u901f\u9023\u7d50',
    quickLabels: ['VTC \u5b98\u65b9\u7db2\u7ad9', 'VTC \u5165\u5b78\u8cc7\u8a0a', '\u5be6\u7fd2\u5b89\u6392', '\u6821\u53cb\u5e73\u53f0', '\u8077\u696d\u8fad\u5178'],
    quickAlts: ['VTC \u5b98\u65b9\u7db2\u7ad9', 'VTC \u5165\u5b78\u8cc7\u8a0a', '\u5be6\u7fd2\u5b89\u6392', '\u6821\u53cb\u5e73\u53f0', '\u8077\u696d\u8fad\u5178'],
    contactTitle: '\u806f\u7d61\u6211\u5011',
    contactCopy: '\u7e3d\u8fa6\u4e8b\u8655\uff08\u6559\u52d9\uff09 \u7562\u696d\u751f\u5c31\u696d\u670d\u52d9\n\u7063\u4ed4\u6d3b\u9053\u4e8c\u5341\u4e03\u865f\u8077\u696d\u8a13\u7df4\u5c40\u5927\u6a13\u5341\u56db\u6a13\n\u67e5\u8a62\u96fb\u8a71\uff1a(852) 2836 1228 \u50b3\u771f\uff1a(852) 2574 3705\n\u96fb\u90f5\u5730\u5740\uff1ajis@vtc.edu.hk',
    contactMailCta: '\u96fb\u90f5\u806f\u7d61\u6211\u5011',
    contactMailLabel: '\u96fb\u90f5',
    contactPhoneLabel: '\u67e5\u8a62\u96fb\u8a71',
    contactEmail: 'jis@vtc.edu.hk',
    contactPhone: '(852) 2836 1228',
    footerTagline: '&middot; \u4f60\u7684\u6c42\u8077\u5925\u4f34',
    footerMeta1: '<a href="contact.html">\u806f\u7d61\u6211\u5011</a> | <a href="disclaimer.html">\u514d\u8cac\u8072\u660e</a> | <a href="https://www.vtc.edu.hk/home/en/privacy.html" target="_blank" rel="noopener noreferrer">\u79c1\u96b1\u653f\u7b56</a>',
    footerMeta2: '(c) 2026 VTC V-NEX. \u7248\u6b0a\u6240\u6709\u3002'
  },
  SC: {
    htmlLang: 'zh-Hans',
    navLogin: '\u767b\u5f55',
    navBrandSubtitle: '\u4f60\u7684\u6c42\u804c\u4f19\u4f34',
    mobileMenuHome: '\u9996\u9875',
    heroTitle: '\u53d1\u6398\u4f60\u7684\u4e0b\u4e00\u4e2a <span class="hero-accent">\u673a\u9047</span>',
    heroSubtitle: '\u63a2\u7d22\u804c\u4f4d\u3001\u53d1\u73b0\u53ef\u80fd\uff0c\u63a8\u8fdb\u4f60\u7684\u804c\u4e1a\u53d1\u5c55\u3002',
    heroCta: '\u7acb\u5373\u7533\u8bf7\u804c\u4f4d',
    benefitsKicker: '\u53d7\u76ca\u5bf9\u8c61',
    tabEmployer: '\u96c7\u4e3b',
    tabStudent: '\u5b66\u751f\u53ca\u6821\u53cb',
    employerLogin: '\u96c7\u4e3b\u767b\u5f55',
    studentLogin: '\u5b66\u751f\u767b\u5f55\uff08\u5373\u5c06\u63a8\u51fa\uff09',
    benefitTitles: [
      '\u804c\u4f4d<span class="soft">\u53d1\u5e03</span>',
      'AI \u4eba\u624d<span class="soft">\u641c\u7d22\u4e0e\u7b5b\u9009</span>',
      '\u7533\u8bf7\u8005<span class="soft">\u7ba1\u7406</span>',
      '\u62db\u8058\u6d3b\u52a8<span class="soft">\u53d1\u5e03</span>',
      'AI \u804c\u4f4d<span class="soft">\u63a8\u8350</span>',
      'AI \u7b80\u5386\u4e0e\u6c42\u804c\u4fe1<span class="soft">\u751f\u6210</span>',
      '\u884c\u4e1a<span class="soft">\u6d1e\u5bdf</span>',
      '\u804c\u4e1a\u8f85\u5bfc<span class="soft">\u8d44\u6e90</span>',
      '\u62db\u8058\u4e0e\u5c31\u4e1a\u914d\u5bf9<span class="soft">\u6d3b\u52a8</span>'
    ],
    benefitDescriptions: [
      '\u521b\u5efa\u804c\u4f4d\u7a7a\u7f3a\uff0c\u89e6\u8fbe\u5408\u9002\u5019\u9009\u4eba\u3002',
      '\u901a\u8fc7 AI \u6280\u672f\u7cbe\u51c6\u641c\u7d22\u7406\u60f3\u4eba\u624d\u3002',
      '\u96c6\u4e2d\u7ba1\u7406\u804c\u4f4d\u53d1\u5e03\u4e0e\u7533\u8bf7\u8005\u6d41\u7a0b\u3002',
      '\u901a\u8fc7\u62db\u8058\u4f1a\u4e0e\u6d3b\u52a8\u8fde\u63a5\u6f5c\u5728\u4eba\u624d\u3002',
      '\u57fa\u4e8e\u4f60\u7684\u80cc\u666f\u7531 AI \u63a8\u8350\u5339\u914d\u804c\u4f4d\u3002',
      '\u901a\u8fc7 AI \u521b\u5efa\u4f60\u7684\u7b80\u5386\u4e0e\u4f5c\u54c1\u96c6\u5185\u5bb9\u3002',
      '\u638c\u63e1\u884c\u4e1a\u4e0e\u5e02\u573a\u8d8b\u52bf\u3002',
      '\u63d0\u5347\u9762\u8bd5\u6280\u5de7\u4e0e\u804c\u573a\u80fd\u529b\u3002',
      '\u901a\u8fc7\u62db\u8058\u6d3b\u52a8\u4e0e\u96c7\u4e3b\u5efa\u7acb\u8054\u7cfb\u3002'
    ],
    discoverLine1: 'V \u53d6\u81ea VTC',
    discoverLine2: 'NEX \u6e90\u81ea Nexus',
    discoverFoot: '\u804c\u4e1a\u4e0b\u4e00\u9875 \u2022 \u4eba\u751f\u4e0b\u4e00\u6b65',
    screen2Lines: [
      '\u6e90\u4e8e Nexus',
      '\u8fd9\u4e00\u6838\u5fc3\u8fde\u63a5\u2014V-NEX',
      '\u4f5c\u4e3a\u5b98\u65b9\u5e73\u53f0',
      '\u8fde\u63a5 VTC \u5b66\u751f\u3001\u6821\u53cb\uff0c',
      '\u4ee5\u53ca\u4e1a\u754c\u4f19\u4f34\uff0c\u5171\u5efa',
      '\u5171\u4eab\u7f51\u7edc\u3002',
      '\u6211\u4eec\u628a\u6f5c\u80fd\u8fde\u63a5\u673a\u9047\uff0c',
      '\u5171\u521b\u672a\u6765\u3002'
    ],
    quickTitle: '\u5feb\u901f\u94fe\u63a5',
    quickLabels: ['VTC \u5b98\u65b9\u7f51\u7ad9', 'VTC \u5165\u5b66\u8d44\u8baf', '\u5b9e\u4e60\u5b89\u6392', '\u6821\u53cb\u95e8\u6237', '\u804c\u4e1a\u8bcd\u5178'],
    quickAlts: ['VTC \u5b98\u65b9\u7f51\u7ad9', 'VTC \u5165\u5b66\u8d44\u8baf', '\u5b9e\u4e60\u5b89\u6392', '\u6821\u53cb\u95e8\u6237', '\u804c\u4e1a\u8bcd\u5178'],
    contactTitle: '\u8054\u7cfb\u6211\u4eec',
    contactCopy: '\u603b\u529e\u4e8b\u5904\uff08\u6559\u52a1\uff09 \u6bd5\u4e1a\u751f\u5c31\u4e1a\u670d\u52a1\n\u6e7e\u4ed4\u6d3b\u9053\u4e8c\u5341\u4e03\u53f7\u804c\u4e1a\u8bad\u7ec3\u5c40\u5927\u697c\u5341\u56db\u697c\n\u67e5\u8be2\u7535\u8bdd\uff1a(852) 2836 1228 \u4f20\u771f\uff1a(852) 2574 3705\n\u7535\u90ae\u5730\u5740\uff1ajis@vtc.edu.hk',
    contactMailCta: '\u7535\u90ae\u8054\u7cfb\u6211\u4eec',
    contactMailLabel: '\u90ae\u7bb1',
    contactPhoneLabel: '\u67e5\u8be2\u7535\u8bdd',
    contactEmail: 'jis@vtc.edu.hk',
    contactPhone: '(852) 2836 1228',
    footerTagline: '&middot; \u4f60\u7684\u6c42\u804c\u4f19\u4f34',
    footerMeta1: '<a href="contact.html">\u8054\u7cfb\u6211\u4eec</a> | <a href="disclaimer.html">\u514d\u8d23\u58f0\u660e</a> | <a href="https://www.vtc.edu.hk/home/en/privacy.html" target="_blank" rel="noopener noreferrer">\u9690\u79c1\u653f\u7b56</a>',
    footerMeta2: '(c) 2026 VTC V-NEX. \u7248\u6743\u6240\u6709\u3002'
  }
};
let hasUserScrolled = window.scrollY > 8;
let lastNavScrollY = window.scrollY;
let mobileMenuScrollY = 0;
let navIdleHideTimer = null;
const NAV_IDLE_HIDE_MS = 2000;
let lastNavScrollAt = Date.now();
const NAV_SCROLL_DIRECTION_DELTA = 2;
let lastTouchY = null;

function clearNavIdleHideTimer(){
  if (!navIdleHideTimer) return;
  window.clearTimeout(navIdleHideTimer);
  navIdleHideTimer = null;
}

function scheduleNavIdleHideTimer(){
  clearNavIdleHideTimer();
  navIdleHideTimer = window.setTimeout(() => {
    if (!navWrap) return;
    if (navWrap.classList.contains('mobile-nav-open')) return;
    if ((window.scrollY || 0) <= 12) return;
    const elapsed = Date.now() - lastNavScrollAt;
    if (elapsed < NAV_IDLE_HIDE_MS) {
      scheduleNavIdleHideTimer();
      return;
    }
    document.body.classList.add('nav-hidden');
  }, NAV_IDLE_HIDE_MS);
}

function shouldBypassNavAutoToggle(){
  if (!navWrap) return true;
  if (navWrap.classList.contains('mobile-nav-open')) return true;
  if ((window.scrollY || 0) <= 12) return true;
  return false;
}

function showNavWithIdleTimer(){
  document.body.classList.remove('nav-hidden');
  scheduleNavIdleHideTimer();
}

function hideNavImmediate(){
  document.body.classList.add('nav-hidden');
  clearNavIdleHideTimer();
}

function lockPageScroll(){
  mobileMenuScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + String(mobileMenuScrollY) + 'px';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockPageScroll(){
  if (document.body.style.position !== 'fixed') return;
  const currentTop = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  const restoreY = currentTop ? Math.abs(parseInt(currentTop, 10)) : mobileMenuScrollY;
  window.scrollTo(0, Number.isFinite(restoreY) ? restoreY : 0);
}

function closeMobileMenu(){
  const wasOpen = (navWrap && navWrap.classList.contains('mobile-nav-open')) || document.body.classList.contains('mobile-nav-open');
  if (navWrap) navWrap.classList.remove('mobile-nav-open');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  if (mobileNavMenu) mobileNavMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('mobile-nav-open');
  document.documentElement.classList.remove('mobile-nav-open');
  if (wasOpen) unlockPageScroll();
  if ((window.scrollY || 0) > 12) scheduleNavIdleHideTimer();
}

function markUserScrollIntent(){
  hasUserScrolled = true;
}

window.addEventListener('scroll', markUserScrollIntent, { passive: true });
window.addEventListener('wheel', markUserScrollIntent, { passive: true });
window.addEventListener('touchmove', markUserScrollIntent, { passive: true });
window.addEventListener('keydown', (event) => {
  const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '];
  if (keys.includes(event.key)) markUserScrollIntent();
});

function applyLanguage(langCode){
  const lang = i18n[langCode] ? langCode : 'ENG';
  const copy = i18n[lang];

  document.documentElement.lang = copy.htmlLang;
  langOptions.forEach((item) => {
    item.setAttribute('aria-selected', String(item.dataset.lang === lang));
  });
  if (desktopLangCurrent) {
    const selectedDesktopOption = desktopLang.querySelector('.lang-option[data-lang="' + lang + '"]');
    desktopLangCurrent.textContent = (selectedDesktopOption && selectedDesktopOption.dataset.label) ? selectedDesktopOption.dataset.label : lang;
  }
  mobileLangOptions.forEach((item) => {
    item.setAttribute('aria-selected', String(item.dataset.lang === lang));
  });

  if (navLoginText) navLoginText.textContent = copy.navLogin;
  if (navBrandSubtitle) navBrandSubtitle.textContent = copy.navBrandSubtitle;
  if (mobileLogin) mobileLogin.textContent = copy.navLogin;
  mobileMenuLinks.forEach((link) => {
    if (link.dataset.menu === 'home') {
      const label = link.querySelector('span');
      if (label) label.textContent = copy.mobileMenuHome;
    }
  });
  if (heroTitle) heroTitle.innerHTML = copy.heroTitle;
  if (heroSubtitle) heroSubtitle.textContent = copy.heroSubtitle;
  if (heroCta) {
    heroCta.textContent = copy.heroCta;
    heroCta.setAttribute('aria-label', copy.heroCta);
  }
  if (benefitsKicker) benefitsKicker.textContent = copy.benefitsKicker;
  if (benefitTabEmployer) benefitTabEmployer.textContent = copy.tabEmployer;
  if (benefitTabStudent) benefitTabStudent.textContent = copy.tabStudent;

  benefitEmployerLogins.forEach((node) => {
    const hasIcon = !!node.querySelector('.benefit-login-icon');
    let label = node.querySelector('.benefit-login-label');

    if (!hasIcon || !label) {
      node.innerHTML = '<svg class="benefit-login-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6h7a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7"></path><path d="M4 12h10"></path><path d="M10 8l4 4-4 4"></path></svg><span class="benefit-login-label"></span>';
      label = node.querySelector('.benefit-login-label');
    }

    if (label) label.textContent = copy.employerLogin;
    node.setAttribute('aria-label', copy.employerLogin);
  });
  benefitStudentLogins.forEach((node) => {
    const hasIcon = !!node.querySelector('.benefit-login-icon');
    let label = node.querySelector('.benefit-login-label');

    if (!hasIcon || !label) {
      node.innerHTML = '<svg class="benefit-login-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6h7a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7"></path><path d="M4 12h10"></path><path d="M10 8l4 4-4 4"></path></svg><span class="benefit-login-label"></span>';
      label = node.querySelector('.benefit-login-label');
    }

    if (label) label.textContent = copy.studentLogin;
    node.setAttribute('aria-label', copy.studentLogin);
  });

  benefitTitleNodes.forEach((node, index) => {
    if (copy.benefitTitles[index]) node.innerHTML = copy.benefitTitles[index];
  });
  benefitDescNodes.forEach((node, index) => {
    if (copy.benefitDescriptions[index]) node.textContent = copy.benefitDescriptions[index];
  });

  if (fillLineNodes[0]) {
    fillLineNodes[0].textContent = copy.discoverLine1;
    fillLineNodes[0].setAttribute('data-fill', copy.discoverLine1);
  }
  if (fillLineNodes[1]) {
    fillLineNodes[1].textContent = copy.discoverLine2;
    fillLineNodes[1].setAttribute('data-fill', copy.discoverLine2);
  }
  if (screen1Foot) screen1Foot.innerHTML = copy.discoverFoot.replace('\u2022', '&bull;');

  screen2LineNodes.forEach((lineNode, index) => {
    const nextText = copy.screen2Lines[index] || '';
    const ghost = lineNode.querySelector('.s2-ghost');
    const fill = lineNode.querySelector('.s2-fill');
    if (ghost) ghost.textContent = nextText;
    if (fill) {
      fill.dataset.full = nextText;
      fill.textContent = '';
    }
  });

  if (quickTitle) quickTitle.textContent = copy.quickTitle;
  quickLinkSpans.forEach((node, index) => {
    if (copy.quickLabels[index]) node.textContent = copy.quickLabels[index];
  });
  quickLinkImages.forEach((node, index) => {
    if (copy.quickAlts[index]) node.alt = copy.quickAlts[index];
  });

  if (contactTitle) contactTitle.textContent = copy.contactTitle;
  if (contactCopy) contactCopy.textContent = copy.contactCopy;
  if (contactMailCtaLabel) contactMailCtaLabel.textContent = copy.contactMailCta;
  if (contactMailLabel) contactMailLabel.textContent = copy.contactMailLabel;
  if (contactPhoneLabel) contactPhoneLabel.textContent = copy.contactPhoneLabel;
  if (contactEmailNode) contactEmailNode.textContent = copy.contactEmail;
  if (contactPhoneNode) contactPhoneNode.textContent = copy.contactPhone;
  if (contactMailBtn) {
    contactMailBtn.setAttribute('href', 'mailto:' + copy.contactEmail);
    contactMailBtn.setAttribute('aria-label', copy.contactMailLabel + ' ' + copy.contactEmail);
  }
  if (contactMailCta) {
    contactMailCta.setAttribute('href', 'mailto:' + copy.contactEmail);
    contactMailCta.setAttribute('aria-label', copy.contactMailCta + ' ' + copy.contactEmail);
  }
  if (contactPhoneBtn) {
    const tel = copy.contactPhone.replace(/[^+\d]/g, '');
    contactPhoneBtn.setAttribute('href', 'tel:' + tel);
    contactPhoneBtn.setAttribute('aria-label', copy.contactPhoneLabel + ' ' + copy.contactPhone);
  }

  if (footerTagline) footerTagline.innerHTML = copy.footerTagline;
  if (footerMetaLine1) footerMetaLine1.innerHTML = copy.footerMeta1;
  if (footerMetaLine2) footerMetaLine2.textContent = copy.footerMeta2;

  window.dispatchEvent(new Event('scroll'));
}

screen2FillSpans.forEach((line) => {
  const fullText = line.textContent || '';
  line.dataset.full = fullText;
  line.textContent = '';
});

if (heroVideo) {
  const defaultSources = {
    webm: 'assets/hero-loop_o.webm',
    mp4: 'assets/hero-loop_o.mp4'
  };
  const v3Sources = {
    webm: 'assets/hero-loop.webm',
    mp4: 'assets/hero-loop.mp4'
  };

  const applyHeroMediaByVariant = () => {
    const targetSources = benefitVariant === 'v3' ? v3Sources : defaultSources;
    const currentKey = targetSources.webm + '|' + targetSources.mp4;

    if (heroVideo.dataset.clipKey === currentKey) return;

    if (heroVideoWebmSource) {
      if (targetSources.webm) heroVideoWebmSource.setAttribute('src', targetSources.webm);
      else heroVideoWebmSource.removeAttribute('src');
    }
    if (heroVideoMp4Source) {
      heroVideoMp4Source.setAttribute('src', targetSources.mp4);
    }

    heroVideo.dataset.clipKey = currentKey;
    heroVideo.classList.remove('is-ready');
    heroVideo.setAttribute(
      'aria-label',
      benefitVariant === 'v3' ? 'V-NEX hero loop background alternate clip' : 'V-NEX hero loop background'
    );
    heroVideo.load();
  };

  const tryPlayHeroVideo = () => {
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay may be blocked until user interacts.
      });
    }
  };

  applyHeroMediaByVariant();

  heroVideo.addEventListener('loadeddata', () => {
    heroVideo.classList.add('is-ready');
    tryPlayHeroVideo();
  }, { once: true });
  window.addEventListener('pageshow', () => {
    if (heroVideo.paused) tryPlayHeroVideo();
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && heroVideo.paused) tryPlayHeroVideo();
  });
  window.addEventListener('pointerdown', () => {
    if (heroVideo.paused) tryPlayHeroVideo();
  }, { once: true, passive: true });

  // Try immediately on initial script run so return navigation does not sit on a still frame.
  tryPlayHeroVideo();
}

if (hero3d) {
  let hero3dFrameId = null;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const cardStates = heroJobItems.map((node, index) => {
    return {
      node,
      depth: index,
      targetTiltX: 0,
      targetTiltY: 0,
      currentTiltX: 0,
      currentTiltY: 0,
      targetShiftX: 0,
      targetShiftY: 0,
      currentShiftX: 0,
      currentShiftY: 0
    };
  });

  const fakeRoles = [
    'Junior UX Designer',
    'Product Designer',
    'UI Designer',
    'Frontend Intern',
    'Visual Storyteller',
    'Motion Designer',
    'Experience Designer',
    'Design System Intern'
  ];
  const fakeCompanies = [
    'Northstar Atelier',
    'Orbit Foundry',
    'Aster Harbor',
    'Finwell Studio',
    'Pixel Grove Lab',
    'Brightlane Works',
    'Cobalt Kite House',
    'Lumen Trail Co'
  ];

  let editMode = false;

  const editToggleBtn = document.getElementById('hero-edit-toggle');
  const regenerateBtn = document.getElementById('hero-regenerate');

  const toggleEditMode = () => {
    editMode = !editMode;
    if (editToggleBtn) {
      editToggleBtn.classList.toggle('active', editMode);
      editToggleBtn.textContent = editMode ? 'Done' : 'Edit';
    }

    heroJobItems.forEach((card) => {
      const fields = card.querySelectorAll('[data-field="title"], [data-field="company"], [data-field="score"]');
      fields.forEach((field) => {
        field.setAttribute('contenteditable', String(editMode));
        field.setAttribute('spellcheck', 'false');
      });
    });
  };

  const regenerateFakePosts = () => {
    const usedRoles = new Set();
    const usedCompanies = new Set();

    const pickUnique = (pool, usedSet) => {
      const available = pool.filter((item) => !usedSet.has(item));
      const source = available.length ? available : pool;
      const value = source[Math.floor(Math.random() * source.length)];
      usedSet.add(value);
      return value;
    };

    heroJobItems.forEach((card, index) => {
      const titleNode = card.querySelector('[data-field="title"]');
      const companyNode = card.querySelector('[data-field="company"]');
      const scoreNode = card.querySelector('[data-field="score"]');

      if (titleNode) titleNode.textContent = pickUnique(fakeRoles, usedRoles);
      if (companyNode) companyNode.textContent = pickUnique(fakeCompanies, usedCompanies);
      if (scoreNode) {
        const score = Math.max(72, 96 - index * 4 - Math.floor(Math.random() * 3));
        scoreNode.textContent = String(score) + '%';
      }
    });
  };

  if (editToggleBtn) {
    editToggleBtn.addEventListener('click', () => {
      toggleEditMode();
    });
  }

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', () => {
      regenerateFakePosts();
    });
  }

  const setSceneGlossFromPoint = (clientX, clientY) => {
    if (!heroJobScene) return;
    const rect = heroJobScene.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const px = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const py = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    hero3d.style.setProperty('--hero-gloss-x', px.toFixed(1) + '%');
    hero3d.style.setProperty('--hero-gloss-y', py.toFixed(1) + '%');
  };

  const setCardTargetsFromPointer = (clientX, clientY) => {
    cardStates.forEach((state) => {
      const rect = state.node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = clamp((clientX - cx) / (rect.width * 0.62), -1, 1);
      const ny = clamp((clientY - cy) / (rect.height * 0.92), -1, 1);
      const weight = 1 - state.depth * 0.12;

      state.targetTiltY = nx * 7 * weight;
      state.targetTiltX = -ny * 5 * weight;
      state.targetShiftX = nx * 13 * weight;
      state.targetShiftY = ny * 8 * weight;
    });
  };

  const resetCardTargets = () => {
    cardStates.forEach((state) => {
      state.targetTiltX = 0;
      state.targetTiltY = 0;
      state.targetShiftX = 0;
      state.targetShiftY = 0;
    });
  };

  const animateCards = () => {
    const t = performance.now() * 0.001;
    cardStates.forEach((state) => {
      state.currentTiltX += (state.targetTiltX - state.currentTiltX) * 0.16;
      state.currentTiltY += (state.targetTiltY - state.currentTiltY) * 0.16;
      state.currentShiftX += (state.targetShiftX - state.currentShiftX) * 0.16;
      state.currentShiftY += (state.targetShiftY - state.currentShiftY) * 0.16;

      const floatY = Math.sin(t * 0.85 + state.depth * 0.42) * 1.2;
      state.node.style.setProperty('--card-tilt-x', state.currentTiltX.toFixed(2) + 'deg');
      state.node.style.setProperty('--card-tilt-y', state.currentTiltY.toFixed(2) + 'deg');
      state.node.style.setProperty('--card-shift-x', state.currentShiftX.toFixed(2) + 'px');
      state.node.style.setProperty('--card-shift-y', (state.currentShiftY + floatY).toFixed(2) + 'px');
    });

    hero3dFrameId = window.requestAnimationFrame(animateCards);
  };

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && benefitVariant === 'v3') {
    if (heroArt) {
      heroArt.addEventListener('pointermove', (event) => {
        setCardTargetsFromPointer(event.clientX, event.clientY);
        setSceneGlossFromPoint(event.clientX, event.clientY);
      }, { passive: true });

      heroArt.addEventListener('pointerleave', () => {
        resetCardTargets();
        if (heroJobScene) heroJobScene.classList.remove('is-engaged');
      }, { passive: true });
    }

    if (heroJobScene) {
      heroJobScene.addEventListener('pointerenter', () => {
        heroJobScene.classList.add('is-engaged');
      });

      heroJobScene.addEventListener('pointerleave', () => {
        heroJobScene.classList.remove('is-engaged');
      });

      heroJobScene.addEventListener('pointermove', (event) => {
        setCardTargetsFromPointer(event.clientX, event.clientY);
        setSceneGlossFromPoint(event.clientX, event.clientY);
      }, { passive: true });
    }

    hero3dFrameId = window.requestAnimationFrame(animateCards);
  }

  window.addEventListener('beforeunload', () => {
    if (hero3dFrameId) {
      window.cancelAnimationFrame(hero3dFrameId);
      hero3dFrameId = null;
    }
  });
}

if (langOptions.length) {
  langOptions.forEach((option) => {
    option.addEventListener('click', (event) => {
      event.preventDefault();
      const lang = option.dataset.lang || 'ENG';
      applyLanguage(lang);
      if (desktopLang) {
        desktopLang.classList.remove('open');
      }
      if (desktopLangTrigger) {
        desktopLangTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

if (desktopLang && desktopLangTrigger) {
  desktopLangTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const opening = !desktopLang.classList.contains('open');
    desktopLang.classList.toggle('open', opening);
    desktopLangTrigger.setAttribute('aria-expanded', String(opening));
  });

  document.addEventListener('click', (event) => {
    if (!desktopLang.contains(event.target)) {
      desktopLang.classList.remove('open');
      desktopLangTrigger.setAttribute('aria-expanded', 'false');
    }
  });
}

if (mobileLangOptions.length) {
  mobileLangOptions.forEach((option) => {
    option.addEventListener('click', (event) => {
      event.preventDefault();
      const lang = option.dataset.lang || 'ENG';
      applyLanguage(lang);
      closeMobileMenu();
    });
  });
}

if (mobileLogin) {
  mobileLogin.addEventListener('click', () => {
    closeMobileMenu();
  });
}

mobileMenuLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    closeMobileMenu();
  });
});

if (navWrap && navToggle && mobileNavMenu) {
  navToggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const opening = !navWrap.classList.contains('mobile-nav-open');
    if (opening) {
      document.body.classList.remove('nav-hidden');
      clearNavIdleHideTimer();
      lockPageScroll();
    }
    navWrap.classList.toggle('mobile-nav-open', opening);
    navToggle.setAttribute('aria-expanded', String(opening));
    mobileNavMenu.setAttribute('aria-hidden', String(!opening));
    document.body.classList.toggle('mobile-nav-open', opening);
    document.documentElement.classList.toggle('mobile-nav-open', opening);
    if (!opening) {
      unlockPageScroll();
      if ((window.scrollY || 0) > 12) scheduleNavIdleHideTimer();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navWrap.contains(event.target)) {
      closeMobileMenu();
    }
  });
}

applyLanguage('TC');
revealBootScreen();

function triggerBenefitsIntro(){
  if (!benefitsSection || benefitsSection.classList.contains('benefits-in-view')) return;
  let introPlayed = false;

  const playIntro = () => {
    if (!benefitsSection || benefitsSection.classList.contains('benefits-in-view') || introPlayed) return;
    introPlayed = true;

    benefitsSection.classList.add('benefits-intro-pending');
    benefitsSection.classList.add('benefits-animating');
    const activePage = benefitsSection.querySelector('.benefit-page.active');
    if (activePage) activePage.classList.add('intro-target');

    window.requestAnimationFrame(() => {
      benefitsSection.classList.add('benefits-in-view');
      benefitsSection.classList.remove('benefits-intro-pending');
    });

    window.setTimeout(() => {
      if (activePage) activePage.classList.remove('intro-target');
      if (benefitsSection) benefitsSection.classList.remove('benefits-animating');
    }, 1500);
  };

  const startOnEnter = () => {
    const onScrollCheck = () => {
      if (!benefitsSection || benefitsSection.classList.contains('benefits-in-view')) {
        window.removeEventListener('scroll', onScrollCheck);
        window.removeEventListener('resize', onScrollCheck);
        return;
      }

      const rect = benefitsSection.getBoundingClientRect();
      const enteredView = rect.top < window.innerHeight && rect.bottom > 0;
      const hasIntent = hasUserScrolled || window.scrollY > 32;
      if (!hasIntent) return;
      if (!enteredView) return;

      playIntro();
      window.removeEventListener('scroll', onScrollCheck);
      window.removeEventListener('resize', onScrollCheck);
    };

    window.addEventListener('scroll', onScrollCheck, { passive: true });
    window.addEventListener('resize', onScrollCheck);

    // Safety net: if the section is already in view due anchor jump, do not keep it blurred.
    window.setTimeout(() => {
      if (!benefitsSection || benefitsSection.classList.contains('benefits-in-view')) return;
      const rect = benefitsSection.getBoundingClientRect();
      const enteredView = rect.top < window.innerHeight && rect.bottom > 0;
      if (enteredView && (hasUserScrolled || window.scrollY > 32)) {
        playIntro();
      }
    }, 1200);

    onScrollCheck();
  };

  startOnEnter();
}

triggerBenefitsIntro();

function segmentProgress(progress, start, end){
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

const DISCOVER_HOLDS = [
  // Hold after screen 1 fill completes.
  { point: 0.44, durationMs: 500 },
  // Hold after screen 2 fill completes.
  { point: 1.00, durationMs: 500 }
];
const DISCOVER_MAX_PROGRESS_STEP_DOWN = 0.02;
const DISCOVER_HOLD_EPSILON = 0.0005;
const DISCOVER_HOLD_CANCEL_DELTA = 0.06;
const DISCOVER_PANEL_ENTER_POINT = 0.62;
const DISCOVER_PANEL_EXIT_POINT = 0.56;
let discoverFillHoldUntil = 0;
let discoverActiveHoldPoint = null;
let lastDiscoverNaturalProgress = 0;
let lastDiscoverRenderedProgress = 0;
let discoverPanelIndex = 0;

window.addEventListener('scroll', () => {
  if (navWrap) {
    const currentY = window.scrollY;
    const down = currentY > lastNavScrollY + NAV_SCROLL_DIRECTION_DELTA;
    const up = currentY < lastNavScrollY - NAV_SCROLL_DIRECTION_DELTA;
    if (down || up) lastNavScrollAt = Date.now();

    if (navWrap.classList.contains('mobile-nav-open') || currentY <= 12) {
      document.body.classList.remove('nav-hidden');
      clearNavIdleHideTimer();
    } else if (down) {
      hideNavImmediate();
    } else if (up) {
      showNavWithIdleTimer();
    }

    lastNavScrollY = currentY;
  }

  const offset = Math.min(window.scrollY * 0.02, 10);
  heroArt.style.transform = 'scale(' + (1.01 + offset / 400).toFixed(3) + ') translateY(' + (-offset).toFixed(2) + 'px)';

  if (discoverMotion) {
    const rect = discoverMotion.getBoundingClientRect();
    const sectionStart = window.scrollY + rect.top;
    const sectionEnd = sectionStart + rect.height - window.innerHeight;
    const track = Math.max(1, sectionEnd - sectionStart);
    const progressRaw = (window.scrollY - sectionStart) / track;
    const naturalProgress = Math.max(0, Math.min(1, progressRaw));
    let progress = naturalProgress;

    if (window.innerWidth <= 820) {
      const now = performance.now();
      const movingDown = naturalProgress > lastDiscoverNaturalProgress + 0.0005;
      const movingUp = naturalProgress < lastDiscoverNaturalProgress - 0.0005;

      // Cancel hold only when user intentionally scrolls back enough.
      if (
        movingUp &&
        discoverActiveHoldPoint !== null &&
        naturalProgress < discoverActiveHoldPoint - DISCOVER_HOLD_CANCEL_DELTA
      ) {
        discoverFillHoldUntil = 0;
        discoverActiveHoldPoint = null;
      }

      if (movingDown && now >= discoverFillHoldUntil) {
        const nextHold = DISCOVER_HOLDS.find((hold) => {
          return lastDiscoverRenderedProgress < hold.point && naturalProgress >= hold.point;
        });
        if (nextHold) {
          discoverActiveHoldPoint = nextHold.point;
          discoverFillHoldUntil = now + nextHold.durationMs;
        }
      }

      const holdActive = (
        now < discoverFillHoldUntil &&
        discoverActiveHoldPoint !== null
      );

      if (
        holdActive
      ) {
        progress = discoverActiveHoldPoint;
      }

      // Keep downward fill speed readable even on fast swipe momentum.
      // Do not cap while hold is active, otherwise hold points can feel stuck.
      if (!holdActive && movingDown && progress > lastDiscoverRenderedProgress + DISCOVER_MAX_PROGRESS_STEP_DOWN) {
        progress = lastDiscoverRenderedProgress + DISCOVER_MAX_PROGRESS_STEP_DOWN;
      }

      if (now >= discoverFillHoldUntil) {
        discoverActiveHoldPoint = null;
      }
    }

    lastDiscoverNaturalProgress = naturalProgress;
    lastDiscoverRenderedProgress = progress;
    discoverMotion.style.setProperty('--discover-progress', progress.toFixed(3));

    // Two-screen timeline with hold states:
    // screen1 fill: 0.04-0.44, then hold 0.5s
    // screen2 fill: 0.62-1.00, then hold 0.5s
    const p1 = segmentProgress(progress, 0.04, 0.44);
    const p2 = segmentProgress(progress, 0.62, 1.00);

    // Screen 1: fill line by line, top to bottom.
    const s1l1 = segmentProgress(p1, 0.00, 0.50);
    const s1l2 = segmentProgress(p1, 0.50, 1.00);

    discoverMotion.style.setProperty('--p1', p1.toFixed(3));
    discoverMotion.style.setProperty('--p2', p2.toFixed(3));
    discoverMotion.style.setProperty('--s1l1', s1l1.toFixed(3));
    discoverMotion.style.setProperty('--s1l2', s1l2.toFixed(3));

    // Screen 2: 8 lines, top to bottom, letter-by-letter.
    const s2l1 = segmentProgress(p2, 0.00, 0.125);
    const s2l2 = segmentProgress(p2, 0.125, 0.25);
    const s2l3 = segmentProgress(p2, 0.25, 0.375);
    const s2l4 = segmentProgress(p2, 0.375, 0.5);
    const s2l5 = segmentProgress(p2, 0.5, 0.625);
    const s2l6 = segmentProgress(p2, 0.625, 0.75);
    const s2l7 = segmentProgress(p2, 0.75, 0.875);
    const s2l8 = segmentProgress(p2, 0.875, 1.0);

    discoverMotion.style.setProperty('--s2l1', s2l1.toFixed(3));
    discoverMotion.style.setProperty('--s2l2', s2l2.toFixed(3));
    discoverMotion.style.setProperty('--s2l3', s2l3.toFixed(3));
    discoverMotion.style.setProperty('--s2l4', s2l4.toFixed(3));
    discoverMotion.style.setProperty('--s2l5', s2l5.toFixed(3));
    discoverMotion.style.setProperty('--s2l6', s2l6.toFixed(3));
    discoverMotion.style.setProperty('--s2l7', s2l7.toFixed(3));
    discoverMotion.style.setProperty('--s2l8', s2l8.toFixed(3));

    const screen2Progress = [s2l1, s2l2, s2l3, s2l4, s2l5, s2l6, s2l7, s2l8];
    screen2FillSpans.forEach((line, index) => {
      const full = line.dataset.full || '';
      const pct = Math.max(0, Math.min(1, screen2Progress[index] || 0));
      const charCount = Math.floor(full.length * pct);
      line.textContent = full.slice(0, charCount);
    });

    if (discoverPanelIndex === 0 && progress >= DISCOVER_PANEL_ENTER_POINT - DISCOVER_HOLD_EPSILON) {
      discoverPanelIndex = 1;
    } else if (discoverPanelIndex === 1 && progress <= DISCOVER_PANEL_EXIT_POINT) {
      discoverPanelIndex = 0;
    }

    const activeIndex = discoverPanelIndex;
    // Screen 1 third line reveals near the end of screen 1 fill, driven by scroll progress.
    const footReveal = activeIndex === 0 ? segmentProgress(p1, 0.72, 1.00) : 0;
    discoverMotion.style.setProperty('--foot-reveal', footReveal.toFixed(3));

    discoverPanels.forEach((panel, index) => {
      if (panel) panel.classList.toggle('active', index === activeIndex);
    });
  }

  if (benefitsSection && window.innerWidth <= 820) {
    const rect = benefitsSection.getBoundingClientRect();
    const inFocus = rect.top < window.innerHeight * 0.2 && rect.bottom > window.innerHeight * 0.9;
    document.body.classList.toggle('benefits-focus', inFocus);
  } else {
    document.body.classList.remove('benefits-focus');
  }
}, { passive: true });

window.addEventListener('wheel', (event) => {
  if (shouldBypassNavAutoToggle()) return;
  if (event.deltaY > 0) {
    lastNavScrollAt = Date.now();
    hideNavImmediate();
  } else if (event.deltaY < 0) {
    lastNavScrollAt = Date.now();
    showNavWithIdleTimer();
  }
}, { passive: true });

window.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches && event.changedTouches[0];
  if (!touch) return;
  lastTouchY = touch.clientY;
}, { passive: true });

window.addEventListener('touchmove', (event) => {
  if (shouldBypassNavAutoToggle()) return;
  const touch = event.changedTouches && event.changedTouches[0];
  if (!touch || lastTouchY === null) return;
  const deltaY = touch.clientY - lastTouchY;
  if (Math.abs(deltaY) < 4) return;
  lastNavScrollAt = Date.now();
  if (deltaY < 0) {
    hideNavImmediate();
  } else {
    showNavWithIdleTimer();
  }
  lastTouchY = touch.clientY;
}, { passive: true });

const softSnapSections = [
  document.getElementById('top'),
  benefitsSection,
  discoverSection,
  quickLinksSection
].filter(Boolean);

let softSnapTimer = null;
let lastSnapAt = 0;

function runMobileSoftSnap(){
  if (window.innerWidth > 820) return;
  if (!softSnapSections.length) return;
  if (navWrap && navWrap.classList.contains('mobile-nav-open')) return;
  if (document.body.style.position === 'fixed') return;

  // Do not auto-snap while user is inside the Discover scroll story.
  if (discoverMotion) {
    const discoverTop = discoverMotion.getBoundingClientRect().top + window.scrollY;
    const discoverBottom = discoverTop + discoverMotion.offsetHeight;
    const currentY = window.scrollY || 0;
    if (currentY >= discoverTop - 8 && currentY <= discoverBottom - window.innerHeight * 0.4) {
      return;
    }
  }

  const now = Date.now();
  if (now - lastSnapAt < 420) return;

  const currentY = window.scrollY || 0;
  let nearestTop = null;
  let nearestDistance = Infinity;

  softSnapSections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top + currentY;
    const distance = Math.abs(sectionTop - currentY);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestTop = sectionTop;
    }
  });

  // Gentle snap only when user stops close to a section start.
  if (nearestTop !== null && nearestDistance > 8 && nearestDistance < 120) {
    lastSnapAt = now;
    window.scrollTo({ top: nearestTop, behavior: 'smooth' });
  }
}

window.addEventListener('scroll', () => {
  if (window.innerWidth > 820) return;
  if (softSnapTimer) window.clearTimeout(softSnapTimer);
  softSnapTimer = window.setTimeout(runMobileSoftSnap, 140);
}, { passive: true });

window.addEventListener('hashchange', () => {
  window.dispatchEvent(new Event('scroll'));
});

window.requestAnimationFrame(() => {
  window.dispatchEvent(new Event('scroll'));
});

