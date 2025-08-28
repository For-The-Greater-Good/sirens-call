// Translation utilities for use in Astro components

import { defaultLang, type Language } from './config';

// Cache for loaded translations
const translationCache = new Map<string, Record<string, any>>();

// Get a translation value by path (e.g., "home.hero.title")
export function getTranslation(
  translations: Record<string, any>,
  key: string,
  fallback?: string
): string {
  const keys = key.split('.');
  let value: any = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback || key;
    }
  }
  
  return typeof value === 'string' ? value : (fallback || key);
}

// Shorthand translation function
export function createTranslator(translations: Record<string, any>) {
  return (key: string, fallback?: string) => getTranslation(translations, key, fallback);
}

// Format a translation with variables
export function formatTranslation(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(variables[key] || match);
  });
}

// Get all translation keys from an object (for translate.py integration)
export function extractTranslationKeys(
  obj: Record<string, any>,
  prefix = ''
): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...extractTranslationKeys(value, fullKey));
    }
  }
  
  return keys;
}

// Create a translation manifest for translate.py
export function createTranslationManifest(
  translations: Record<string, any>
): Array<{ key: string; value: string }> {
  const manifest: Array<{ key: string; value: string }> = [];
  
  function traverse(obj: Record<string, any>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        manifest.push({ key: fullKey, value });
      } else if (typeof value === 'object' && value !== null) {
        traverse(value, fullKey);
      }
    }
  }
  
  traverse(translations);
  return manifest;
}

// Load translations with caching
export async function loadTranslationsWithCache(lang: Language): Promise<Record<string, any>> {
  if (translationCache.has(lang)) {
    return translationCache.get(lang)!;
  }
  
  try {
    // Dynamic import for client-side compatibility
    const module = await import(`./locales/${lang}.json`);
    const translations = module.default || module;
    translationCache.set(lang, translations);
    return translations;
  } catch (error) {
    console.warn(`Could not load translations for ${lang}:`, error);
    
    // Fallback to default language
    if (lang !== defaultLang) {
      return loadTranslationsWithCache(defaultLang);
    }
    
    return {};
  }
}

// Language switcher data
export function getLanguageSwitcherData(
  currentLang: Language,
  currentPath: string,
  availableLanguages: string[]
): Array<{ code: string; name: string; url: string; current: boolean }> {
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    zh: '中文',
    ar: 'العربية',
    hi: 'हिन्दी',
    pt: 'Português',
    ru: 'Русский',
    ja: '日本語',
    ko: '한국어',
    de: 'Deutsch',
    it: 'Italiano',
    nl: 'Nederlands',
    pl: 'Polski',
    tr: 'Türkçe',
    vi: 'Tiếng Việt',
    th: 'ไทย',
    id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu',
    he: 'עברית'
  };
  
  return availableLanguages.map(lang => {
    // Remove current language prefix from path
    let cleanPath = currentPath;
    if (currentLang !== defaultLang && currentPath.startsWith(`/${currentLang}`)) {
      cleanPath = currentPath.substring(currentLang.length + 1) || '/';
    }
    
    // Add new language prefix
    let url = cleanPath;
    if (lang !== defaultLang) {
      url = `/${lang}${cleanPath === '/' ? '' : cleanPath}`;
    }
    
    return {
      code: lang,
      name: languageNames[lang] || lang.toUpperCase(),
      url,
      current: lang === currentLang
    };
  });
}