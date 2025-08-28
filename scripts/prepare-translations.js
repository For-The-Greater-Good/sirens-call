#!/usr/bin/env node

/**
 * Prepare translation files for use with translate.py
 * This script extracts all translatable strings from the English locale
 * and creates a format suitable for the translate.py tool
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesPath = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const outputPath = path.join(__dirname, '..', 'translations-to-process');

// Ensure output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Load English translations
const enPath = path.join(localesPath, 'en.json');
const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

// Extract all strings into a flat structure
function extractStrings(obj, prefix = '') {
  const strings = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      strings.push({
        key: fullKey,
        english: value
      });
    } else if (typeof value === 'object' && value !== null) {
      strings.push(...extractStrings(value, fullKey));
    }
  }
  
  return strings;
}

// Create translation template for a specific language
function createTranslationTemplate(targetLang) {
  const strings = extractStrings(enTranslations);
  
  // Create a file that translate.py can process
  const template = {
    source_language: 'en',
    target_language: targetLang,
    translations: strings.map(item => ({
      key: item.key,
      source: item.english,
      target: '' // To be filled by translate.py
    }))
  };
  
  const outputFile = path.join(outputPath, `${targetLang}-template.json`);
  fs.writeFileSync(outputFile, JSON.stringify(template, null, 2));
  console.log(`Created translation template: ${outputFile}`);
}

// Create a simple text file for manual translation
function createTextFile(targetLang) {
  const strings = extractStrings(enTranslations);
  
  let content = `# Translation file for: ${targetLang}\n`;
  content += `# Each line contains: KEY | ENGLISH TEXT\n`;
  content += `# Replace the English text with the translation\n\n`;
  
  for (const item of strings) {
    content += `${item.key} | ${item.english}\n`;
  }
  
  const outputFile = path.join(outputPath, `${targetLang}-strings.txt`);
  fs.writeFileSync(outputFile, content);
  console.log(`Created text translation file: ${outputFile}`);
}

// Process translated files back into locale JSON
function processTranslation(translatedFile, targetLang) {
  const content = fs.readFileSync(translatedFile, 'utf-8');
  const data = JSON.parse(content);
  
  // Rebuild nested structure
  const result = {};
  
  for (const item of data.translations) {
    const keys = item.key.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = item.target || item.source;
  }
  
  // Save to locales directory
  const outputFile = path.join(localesPath, `${targetLang}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
  console.log(`Processed translation saved to: ${outputFile}`);
}

// Main CLI
const args = process.argv.slice(2);
const command = args[0];
const lang = args[1];

if (!command) {
  console.log(`
Usage:
  node prepare-translations.js prepare <lang>    Create template for translation
  node prepare-translations.js text <lang>       Create text file for manual translation
  node prepare-translations.js process <file>    Process translated file back to locale
  node prepare-translations.js list              List all translatable strings

Examples:
  node prepare-translations.js prepare es        Create Spanish translation template
  node prepare-translations.js text fr          Create French text file
  node prepare-translations.js process ../translations-to-process/es-translated.json

For use with translate.py:
  1. Run: node prepare-translations.js prepare es
  2. Use translate.py on the generated template
  3. Run: node prepare-translations.js process <translated-file>
`);
  process.exit(0);
}

switch (command) {
  case 'prepare':
    if (!lang) {
      console.error('Please specify a target language code (e.g., es, fr, zh)');
      process.exit(1);
    }
    createTranslationTemplate(lang);
    break;
    
  case 'text':
    if (!lang) {
      console.error('Please specify a target language code (e.g., es, fr, zh)');
      process.exit(1);
    }
    createTextFile(lang);
    break;
    
  case 'process':
    if (!lang) {
      console.error('Please specify the translated file path');
      process.exit(1);
    }
    const targetLangMatch = path.basename(lang).match(/^([a-z]{2})/);
    if (!targetLangMatch) {
      console.error('Could not determine target language from filename');
      process.exit(1);
    }
    processTranslation(lang, targetLangMatch[1]);
    break;
    
  case 'list':
    const strings = extractStrings(enTranslations);
    console.log(`\nFound ${strings.length} translatable strings:\n`);
    strings.forEach(item => {
      console.log(`  ${item.key}: "${item.english.substring(0, 50)}${item.english.length > 50 ? '...' : ''}"`);
    });
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}