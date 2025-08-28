#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PANTRY_DOCS = path.join(__dirname, '../../pantry-pirate-radio');
const CONTENT_DOCS = path.join(__dirname, '../src/content/docs/en');

// Documentation structure mapping
const docMapping = {
  // Main documentation
  'README.md': {
    target: 'index.mdx',
    frontmatter: {
      title: 'Pantry Pirate Radio',
      description: 'Breaking down barriers to food security through unified resource access'
    }
  },
  'API_DOCUMENTATION.md': {
    target: 'api/documentation.mdx',
    frontmatter: {
      title: 'API Documentation',
      description: 'Complete API reference for Pantry Pirate Radio'
    }
  },
  'CONTRIBUTING.md': {
    target: 'guides/contributing.mdx',
    frontmatter: {
      title: 'Contributing',
      description: 'How to contribute to the project'
    }
  },
  'PRIVACY.md': {
    target: 'guides/privacy.mdx',
    frontmatter: {
      title: 'Privacy Policy',
      description: 'Our commitment to privacy and data protection'
    }
  },
  'SECURITY.md': {
    target: 'guides/security.mdx',
    frontmatter: {
      title: 'Security Policy',
      description: 'Security policies and vulnerability reporting'
    }
  },
  'BOUY.md': {
    target: 'guides/bouy.mdx',
    frontmatter: {
      title: 'Bouy - Docker Fleet Management',
      description: 'Docker fleet management tool for Pantry Pirate Radio'
    }
  },
  
  // Architecture docs
  'docs/architecture.md': {
    target: 'architecture/overview.mdx',
    frontmatter: {
      title: 'System Architecture',
      description: 'Complete system architecture overview'
    }
  },
  'docs/llm.md': {
    target: 'architecture/llm-pipeline.mdx',
    frontmatter: {
      title: 'LLM Pipeline',
      description: 'AI-powered data processing pipeline'
    }
  },
  'docs/reconciler.md': {
    target: 'architecture/reconciler.mdx',
    frontmatter: {
      title: 'Reconciler',
      description: 'Data reconciliation and deduplication system'
    }
  },
  'docs/validator.md': {
    target: 'architecture/validator.mdx',
    frontmatter: {
      title: 'Validator',
      description: 'Data validation and quality assurance'
    }
  },
  'docs/haarrrvest-publisher.md': {
    target: 'architecture/haarrrvest-publisher.mdx',
    frontmatter: {
      title: 'HAARRRvest Publisher',
      description: 'Publishing data to the HAARRRvest repository'
    }
  },
  
  // Getting started docs
  'docs/quickstart.md': {
    target: 'guides/quick-start.mdx',
    frontmatter: {
      title: 'Quick Start',
      description: 'Get up and running quickly'
    }
  },
  'docs/docker-quickstart.md': {
    target: 'guides/docker.mdx',
    frontmatter: {
      title: 'Docker Quick Start',
      description: 'Running with Docker'
    }
  },
  
  // Scraper documentation
  'docs/scrapers.md': {
    target: 'scrapers/overview.mdx',
    frontmatter: {
      title: 'Scrapers Overview',
      description: 'Overview of the scraper system'
    }
  },
  'docs/scraper-patterns.md': {
    target: 'scrapers/patterns.mdx',
    frontmatter: {
      title: 'Scraper Patterns',
      description: 'Common patterns and best practices for scrapers'
    }
  },
  
  // Reference docs
  'docs/api.md': {
    target: 'reference/api.mdx',
    frontmatter: {
      title: 'API Reference',
      description: 'API endpoints and usage'
    }
  },
  'docs/troubleshooting.md': {
    target: 'reference/troubleshooting.mdx',
    frontmatter: {
      title: 'Troubleshooting',
      description: 'Common issues and solutions'
    }
  }
};

// Individual scraper documentation
const scraperDocs = [
  'care_and_share_food_locator_scraper',
  'food_helpline_org_scraper',
  'nyc_efap_programs_scraper',
  'plentiful_scraper',
  'vivery_api_scraper',
  'capital_area_food_bank_dc_scraper',
  'freshtrak_scraper',
  'getfull_app_api_scraper',
  'maryland_food_bank_md_scraper',
  'philabundance_pa_scraper'
];

async function processMarkdown(content, frontmatter) {
  // Add frontmatter
  const frontmatterStr = `---
title: ${frontmatter.title}
description: ${frontmatter.description}
---

`;
  
  // Convert markdown to MDX
  let mdxContent = content;
  
  // Remove any existing frontmatter
  mdxContent = mdxContent.replace(/^---[\s\S]*?---\n*/m, '');
  
  // Fix JSX-like syntax that breaks MDX (e.g., <5 becomes "less than 5")
  mdxContent = mdxContent.replace(/<(\d+)/g, 'less than $1');
  mdxContent = mdxContent.replace(/>(\d+)/g, 'greater than $1');
  
  // Fix image paths
  mdxContent = mdxContent.replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g, '![$1](/images/docs/$2)');
  
  // Fix relative links to other docs
  mdxContent = mdxContent.replace(/\[([^\]]+)\]\((?!http)([^)]+\.md)\)/g, (match, text, link) => {
    const cleanLink = link.replace(/^\.\//, '').replace(/\.md$/, '');
    return `[${text}](/docs/${cleanLink})`;
  });
  
  // Add import for Starlight components if needed
  if (mdxContent.includes('```') || mdxContent.includes(':::')) {
    mdxContent = `import { Code, Tabs, TabItem, Aside, Card, CardGrid } from '@astrojs/starlight/components';\n\n` + mdxContent;
  }
  
  // Convert note/warning blocks to Aside components
  mdxContent = mdxContent.replace(/^> \*\*Note:\*\* (.+)$/gm, '<Aside type="note">$1</Aside>');
  mdxContent = mdxContent.replace(/^> \*\*Warning:\*\* (.+)$/gm, '<Aside type="caution">$1</Aside>');
  mdxContent = mdxContent.replace(/^> ⚠️ (.+)$/gm, '<Aside type="caution">$1</Aside>');
  
  return frontmatterStr + mdxContent;
}

async function importDoc(sourcePath, targetPath, frontmatter) {
  try {
    const sourceFile = path.join(PANTRY_DOCS, sourcePath);
    const targetFile = path.join(CONTENT_DOCS, targetPath);
    
    // Check if source exists
    try {
      await fs.access(sourceFile);
    } catch {
      console.log(`⚠️  Source not found: ${sourcePath}`);
      return false;
    }
    
    // Read source content
    const content = await fs.readFile(sourceFile, 'utf-8');
    
    // Process markdown to MDX
    const mdxContent = await processMarkdown(content, frontmatter);
    
    // Ensure target directory exists
    const targetDir = path.dirname(targetFile);
    await fs.mkdir(targetDir, { recursive: true });
    
    // Write MDX file
    await fs.writeFile(targetFile, mdxContent);
    
    console.log(`✅ Imported: ${sourcePath} → ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error importing ${sourcePath}:`, error.message);
    return false;
  }
}

async function importScraperDocs() {
  // Create scrapers/list directory
  const scrapersDir = path.join(CONTENT_DOCS, 'scrapers/list');
  await fs.mkdir(scrapersDir, { recursive: true });
  
  for (const scraper of scraperDocs) {
    const sourcePath = `docs/scrapers/${scraper}.md`;
    const targetPath = `scrapers/list/${scraper}.mdx`;
    const title = scraper
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Scraper', '');
    
    await importDoc(sourcePath, targetPath, {
      title: title,
      description: `Documentation for the ${title} scraper`
    });
  }
}

async function main() {
  console.log('📚 Importing documentation from pantry-pirate-radio...\n');
  
  let imported = 0;
  let failed = 0;
  
  // Import main documentation
  for (const [source, config] of Object.entries(docMapping)) {
    const success = await importDoc(source, config.target, config.frontmatter);
    if (success) imported++;
    else failed++;
  }
  
  // Import scraper documentation
  console.log('\n📋 Importing scraper documentation...\n');
  await importScraperDocs();
  
  console.log(`\n✨ Import complete!`);
  console.log(`   Imported: ${imported} files`);
  console.log(`   Failed: ${failed} files`);
  console.log(`\n📍 Documentation available at: http://localhost:4321/en/index`);
}

main().catch(console.error);