// i18n Configuration
// This file sets up the internationalization framework for the site
// It automatically discovers all 2-letter JSON files in the locales folder

import fs from 'fs';
import path from 'path';

// Language display names (can be extended as needed)
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

// Dynamically discover available languages from locales folder
export function getAvailableLanguages(): string[] {
  const localesPath = path.join(process.cwd(), 'src', 'i18n', 'locales');
  
  // Create locales directory if it doesn't exist
  if (!fs.existsSync(localesPath)) {
    fs.mkdirSync(localesPath, { recursive: true });
    // Create default English locale
    fs.writeFileSync(
      path.join(localesPath, 'en.json'),
      JSON.stringify({}, null, 2)
    );
  }
  
  try {
    const files = fs.readdirSync(localesPath);
    return files
      .filter(file => {
        // Match 2-letter JSON files (e.g., en.json, es.json)
        return /^[a-z]{2}\.json$/.test(file);
      })
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.warn('Could not read locales directory:', error);
    return ['en']; // Fallback to English only
  }
}

// Get all available languages as an object with display names
export function getLanguages(): Record<string, string> {
  const availableLangs = getAvailableLanguages();
  const languages: Record<string, string> = {};
  
  for (const lang of availableLangs) {
    languages[lang] = languageNames[lang] || lang.toUpperCase();
  }
  
  return languages;
}

export type Language = string;

export const defaultLang: Language = 'en';

// Get the user's preferred language from browser
export function getBrowserLang(): Language {
  const languages = getAvailableLanguages();
  
  if (typeof navigator !== 'undefined') {
    // Check exact match first
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (languages.includes(browserLang)) {
      return browserLang;
    }
    
    // Check all user languages
    for (const lang of navigator.languages || []) {
      const shortLang = lang.split('-')[0].toLowerCase();
      if (languages.includes(shortLang)) {
        return shortLang;
      }
    }
  }
  return defaultLang;
}

// Get language from URL path
export function getLangFromUrl(url: URL): Language {
  const languages = getAvailableLanguages();
  const [, lang] = url.pathname.split('/');
  
  if (languages.includes(lang)) {
    return lang;
  }
  return defaultLang;
}

// Use for static paths generation
export function getStaticPaths() {
  const languages = getAvailableLanguages();
  return languages.map((lang) => ({ 
    params: { lang } 
  }));
}

// Helper to construct translated URLs
export function getLocalizedPath(path: string, lang: Language): string {
  if (lang === defaultLang) {
    return path;
  }
  return `/${lang}${path}`;
}

// Load translations for a specific language
export async function loadTranslations(lang: Language): Promise<Record<string, any>> {
  try {
    const filePath = path.join(process.cwd(), 'src', 'i18n', 'locales', `${lang}.json`);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Could not load translations for ${lang}:`, error);
  }
  
  // Fallback to empty object or English
  if (lang !== defaultLang) {
    return loadTranslations(defaultLang);
  }
  
  return {};
}