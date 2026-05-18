(function () {
  const storageKey = 'sakura-language';
  const fallbackConfig = {
    defaultLanguage: 'en',
    translations: { en: {}, vi: {} }
  };

  const state = {
    config: fallbackConfig,
    language: localStorage.getItem(storageKey) || 'en',
    ready: false
  };

  function getTranslations(lang) {
    return (state.config.translations && state.config.translations[lang]) || {};
  }

  function translate(key, fallback) {
    return getTranslations(state.language)[key]
      || getTranslations(state.config.defaultLanguage || 'en')[key]
      || fallback
      || key;
  }

  function applyTranslations() {
    const lang = state.language;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = translate(node.dataset.i18n, node.textContent);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((node) => {
      node.setAttribute('title', translate(node.dataset.i18nTitle, node.getAttribute('title') || ''));
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      node.setAttribute('aria-label', translate(node.dataset.i18nAriaLabel, node.getAttribute('aria-label') || ''));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      node.setAttribute('placeholder', translate(node.dataset.i18nPlaceholder, node.getAttribute('placeholder') || ''));
    });

    document.querySelectorAll('[data-lang-toggle]').forEach((node) => {
      node.textContent = translate('common.langToggle', lang === 'en' ? 'VI' : 'EN');
      node.setAttribute('aria-label', translate('common.switchLabel', 'Switch language'));
    });

    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
  }

  function setLanguage(lang) {
    if (!getTranslations(lang)) {
      return;
    }
    state.language = lang;
    localStorage.setItem(storageKey, lang);
    applyTranslations();
  }

  function toggleLanguage() {
    setLanguage(state.language === 'en' ? 'vi' : 'en');
  }

  function bindToggles() {
    document.querySelectorAll('[data-lang-toggle]').forEach((node) => {
      node.addEventListener('click', toggleLanguage);
    });
  }

  window.SakuraI18n = {
    t: translate,
    setLanguage,
    toggleLanguage,
    getLanguage: () => state.language,
    isReady: () => state.ready
  };

  async function init() {
    try {
      const response = await fetch('./i18n.json', { cache: 'no-store' });
      if (response.ok) {
        state.config = await response.json();
      }
    } catch {
      state.config = fallbackConfig;
    }

    if (!getTranslations(state.language)) {
      state.language = state.config.defaultLanguage || 'en';
    }

    state.ready = true;
    bindToggles();
    applyTranslations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
