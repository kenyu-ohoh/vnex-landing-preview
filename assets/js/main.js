document.documentElement.classList.add('js-motion');

const benefitTabs = Array.from(document.querySelectorAll('.tab-btn[data-role]'));
const benefitDotsWrap = document.querySelector('.benefit-dots');
const benefitHeadActions = Array.from(document.querySelectorAll('.benefit-head-actions'));
const benefitViewport = document.querySelector('.benefit-viewport');
const benefitPagesByRole = {
  employer: Array.from(document.querySelectorAll('.benefit-page[data-role="employer"]')),
  student: Array.from(document.querySelectorAll('.benefit-page[data-role="student"]'))
};

// Keep section flow consistent across browsers: Discover first, then Benefits.
const mainNode = document.querySelector('main');
const discoverSection = document.getElementById('discover');
const benefitsSection = document.getElementById('benefits');
if (mainNode && discoverSection && benefitsSection && mainNode.firstElementChild !== discoverSection) {
  mainNode.insertBefore(discoverSection, benefitsSection);
}

let activeBenefitRole = 'employer';
const benefitPageState = { employer: 0, student: 0 };
let benefitAutoplayId = null;
let benefitTransitionTimer = null;

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

  pages.forEach((page) => {
    page.classList.remove('enter-next', 'enter-prev', 'exit-next', 'exit-prev');
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

  fromPage.classList.add(direction === 'prev' ? 'exit-prev' : 'exit-next');
  toPage.classList.add('active', direction === 'prev' ? 'enter-prev' : 'enter-next');
  toPage.style.visibility = 'visible';

  if (benefitTransitionTimer) clearTimeout(benefitTransitionTimer);
  benefitTransitionTimer = setTimeout(() => {
    fromPage.classList.remove('active', 'exit-prev', 'exit-next');
    fromPage.style.visibility = 'hidden';
    toPage.classList.remove('enter-next', 'enter-prev');
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
const discoverMotion = document.getElementById('discover-motion');
const langOptions = document.querySelectorAll('.lang-option');
const mobileLangOptions = document.querySelectorAll('.mobile-lang-option');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
const navToggle = document.querySelector('.nav-toggle');
const mobileNavMenu = document.querySelector('.mobile-nav-menu');
const mobileLogin = document.querySelector('.mobile-login');
const navWrap = document.querySelector('.nav-wrap');
const navLoginText = document.querySelector('.login span');
const heroTitle = document.querySelector('.hero-copy h1');
const heroSubtitle = document.querySelector('.hero-copy p');
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
    mobileMenuHome: 'Home',
    heroTitle: 'Find your next <span class="hero-accent">opportunity</span>',
    heroSubtitle: 'Explore roles, discover possibilities, and move your career forward.',
    benefitsKicker: 'Who benefits',
    tabEmployer: 'Employer',
    tabStudent: 'Students & Alumni',
    employerLogin: 'Employer Login',
    studentLogin: 'Student Login (coming soon)',
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
    quickTitle: 'VTC Quick Links',
    quickLabels: ['VTC Official Website', 'VTC Admission', 'Internship Arrangement', 'Alumni Website', 'Occupation Dictionary'],
    quickAlts: ['VTC Official Website', 'VTC Admission', 'Internship Arrangement', 'Alumni Website', 'Occupation Dictionary'],
    footerTagline: '&middot; your job partner',
    footerMeta1: 'Accessibility | Privacy Policy | Terms Conditions',
    footerMeta2: '(c) 2026 VTC V-NEX. All rights reserved.'
  },
  TC: {
    htmlLang: 'zh-Hant',
    navLogin: '\u767b\u5165',
    mobileMenuHome: '\u9996\u9801',
    heroTitle: '\u767c\u6398\u4f60\u7684\u4e0b\u4e00\u500b <span class="hero-accent">\u6a5f\u9047</span>',
    heroSubtitle: '\u63a2\u7d22\u8077\u4f4d\u3001\u767c\u6398\u53ef\u80fd\uff0c\u63a8\u9032\u4f60\u7684\u8077\u6daf\u3002',
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
    quickTitle: 'VTC \u5feb\u901f\u9023\u7d50',
    quickLabels: ['VTC \u5b98\u65b9\u7db2\u7ad9', 'VTC \u5165\u5b78\u8cc7\u8a0a', '\u5be6\u7fd2\u5b89\u6392', '\u6821\u53cb\u7db2\u7ad9', '\u8077\u696d\u8fad\u5178'],
    quickAlts: ['VTC \u5b98\u65b9\u7db2\u7ad9', 'VTC \u5165\u5b78\u8cc7\u8a0a', '\u5be6\u7fd2\u5b89\u6392', '\u6821\u53cb\u7db2\u7ad9', '\u8077\u696d\u8fad\u5178'],
    footerTagline: '&middot; \u4f60\u7684\u6c42\u8077\u5925\u4f34',
    footerMeta1: '\u7121\u969c\u7919 | \u79c1\u96b1\u653f\u7b56 | \u4f7f\u7528\u689d\u6b3e',
    footerMeta2: '(c) 2026 VTC V-NEX. \u7248\u6b0a\u6240\u6709\u3002'
  },
  SC: {
    htmlLang: 'zh-Hans',
    navLogin: '\u767b\u5f55',
    mobileMenuHome: '\u9996\u9875',
    heroTitle: '\u53d1\u6398\u4f60\u7684\u4e0b\u4e00\u4e2a <span class="hero-accent">\u673a\u9047</span>',
    heroSubtitle: '\u63a2\u7d22\u804c\u4f4d\u3001\u53d1\u73b0\u53ef\u80fd\uff0c\u63a8\u8fdb\u4f60\u7684\u804c\u4e1a\u53d1\u5c55\u3002',
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
    quickTitle: 'VTC \u5feb\u901f\u94fe\u63a5',
    quickLabels: ['VTC \u5b98\u65b9\u7f51\u7ad9', 'VTC \u5165\u5b66\u8d44\u8baf', '\u5b9e\u4e60\u5b89\u6392', '\u6821\u53cb\u7f51\u7ad9', '\u804c\u4e1a\u8bcd\u5178'],
    quickAlts: ['VTC \u5b98\u65b9\u7f51\u7ad9', 'VTC \u5165\u5b66\u8d44\u8baf', '\u5b9e\u4e60\u5b89\u6392', '\u6821\u53cb\u7f51\u7ad9', '\u804c\u4e1a\u8bcd\u5178'],
    footerTagline: '&middot; \u4f60\u7684\u6c42\u804c\u4f19\u4f34',
    footerMeta1: '\u65e0\u969c\u788d | \u9690\u79c1\u653f\u7b56 | \u4f7f\u7528\u6761\u6b3e',
    footerMeta2: '(c) 2026 VTC V-NEX. \u7248\u6743\u6240\u6709\u3002'
  }
};
let hasUserScrolled = window.scrollY > 8;
let lastNavScrollY = window.scrollY;
let mobileMenuScrollY = 0;

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
  mobileLangOptions.forEach((item) => {
    item.setAttribute('aria-selected', String(item.dataset.lang === lang));
  });

  if (navLoginText) navLoginText.textContent = copy.navLogin;
  if (mobileLogin) mobileLogin.textContent = copy.navLogin;
  mobileMenuLinks.forEach((link) => {
    if (link.dataset.menu === 'home') {
      const label = link.querySelector('span');
      if (label) label.textContent = copy.mobileMenuHome;
    }
  });
  if (heroTitle) heroTitle.innerHTML = copy.heroTitle;
  if (heroSubtitle) heroSubtitle.textContent = copy.heroSubtitle;
  if (benefitsKicker) benefitsKicker.textContent = copy.benefitsKicker;
  if (benefitTabEmployer) benefitTabEmployer.textContent = copy.tabEmployer;
  if (benefitTabStudent) benefitTabStudent.textContent = copy.tabStudent;

  benefitEmployerLogins.forEach((node) => {
    node.textContent = copy.employerLogin;
    node.setAttribute('aria-label', copy.employerLogin);
  });
  benefitStudentLogins.forEach((node) => {
    node.textContent = copy.studentLogin;
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

  if (footerTagline) footerTagline.innerHTML = copy.footerTagline;
  if (footerMetaLine1) footerMetaLine1.textContent = copy.footerMeta1;
  if (footerMetaLine2) footerMetaLine2.textContent = copy.footerMeta2;

  window.dispatchEvent(new Event('scroll'));
}

screen2FillSpans.forEach((line) => {
  const fullText = line.textContent || '';
  line.dataset.full = fullText;
  line.textContent = '';
});

if (heroVideo) {
  const tryPlayHeroVideo = () => {
    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay may be blocked until user interacts.
      });
    }
  };

  heroVideo.addEventListener('loadeddata', tryPlayHeroVideo, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && heroVideo.paused) tryPlayHeroVideo();
  });
  window.addEventListener('pointerdown', () => {
    if (heroVideo.paused) tryPlayHeroVideo();
  }, { once: true, passive: true });
}

if (langOptions.length) {
  langOptions.forEach((option) => {
    option.addEventListener('click', (event) => {
      event.preventDefault();
      const lang = option.dataset.lang || 'ENG';
      applyLanguage(lang);
    });
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
      lockPageScroll();
    }
    navWrap.classList.toggle('mobile-nav-open', opening);
    navToggle.setAttribute('aria-expanded', String(opening));
    mobileNavMenu.setAttribute('aria-hidden', String(!opening));
    document.body.classList.toggle('mobile-nav-open', opening);
    document.documentElement.classList.toggle('mobile-nav-open', opening);
    if (!opening) {
      unlockPageScroll();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navWrap.contains(event.target)) {
      closeMobileMenu();
    }
  });
}

applyLanguage('ENG');

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
    const down = currentY > lastNavScrollY + 6;
    const up = currentY < lastNavScrollY - 6;

    if (navWrap.classList.contains('mobile-nav-open') || currentY <= 12 || up) {
      document.body.classList.remove('nav-hidden');
    } else if (down) {
      document.body.classList.add('nav-hidden');
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

