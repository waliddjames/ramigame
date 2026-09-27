// i18n.js — simple client-side translation switch (English / Arabic)
// Usage: add data-i18n="key" to any element whose full text should be
// replaced, and data-i18n-placeholder="key" for input placeholders.

(function () {
  const DICTIONARIES = {
    en: {
      hello: 'Hello',
      logout: 'Logout',
      login: 'Login',
      register: 'Sign up',
      ads_title: 'RAMIads',
      games_title: '100 Free Games',
      play_btn: 'Play',
      footer_site: 'Site:',
      footer_owner: 'Site owner:',
      back_catalog: 'Back to catalog',
      jouer_category: 'Category:',
      jouer_desc: 'This catalog is a demo: click below to open the game on an external platform.',
      jouer_launch: 'Launch game',
      login_subtitle: 'Sign in before you play',
      login_google: 'Sign in with Google',
      or_separator: '— or —',
      label_email: 'Email',
      label_password: 'Password',
      login_submit: 'Sign in',
      no_account: "Don't have an account?",
      create_account: 'Create an account',
      back_home: 'Back to home',
      register_subtitle: 'Create an account to play',
      label_name: 'Name',
      register_submit: 'Create my account',
      have_account: 'Already have an account?',
      go_login: 'Sign in',
      welcome_msg: 'You are welcome To RamiGame'
    },
    ar: {
      hello: 'مرحبًا',
      logout: 'تسجيل الخروج',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      ads_title: 'إعلانات رامي',
      games_title: '100 لعبة مجانية',
      play_btn: 'العب',
      footer_site: 'الموقع:',
      footer_owner: 'مالك الموقع:',
      back_catalog: 'العودة إلى القائمة',
      jouer_category: 'الفئة:',
      jouer_desc: 'هذا الكتالوج تجريبي: انقر أدناه لفتح اللعبة على منصة خارجية.',
      jouer_launch: 'ابدأ اللعبة',
      login_subtitle: 'سجّل الدخول قبل اللعب',
      login_google: 'تسجيل الدخول عبر Google',
      or_separator: '— أو —',
      label_email: 'البريد الإلكتروني',
      label_password: 'كلمة المرور',
      login_submit: 'تسجيل الدخول',
      no_account: 'ليس لديك حساب؟',
      create_account: 'إنشاء حساب',
      back_home: 'العودة إلى الرئيسية',
      register_subtitle: 'أنشئ حسابًا للعب',
      label_name: 'الاسم',
      register_submit: 'إنشاء حسابي',
      have_account: 'لديك حساب بالفعل؟',
      go_login: 'تسجيل الدخول',
      welcome_msg: 'مرحبًا بك في RamiGame'
    }
  };

  function applyLang(lang) {
    if (!DICTIONARIES[lang]) lang = 'en';
    const dict = DICTIONARIES[lang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });

    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    try { localStorage.setItem('ramigame_lang', lang); } catch (e) { /* ignore */ }
  }

  function initLangSwitch() {
    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang')));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    let saved = 'en';
    try { saved = localStorage.getItem('ramigame_lang') || 'en'; } catch (e) { /* ignore */ }
    initLangSwitch();
    applyLang(saved);
  });
})();
