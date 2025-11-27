import type { Browser, PaperFormat } from 'puppeteer';
import puppeteer from 'puppeteer';
import { executablePath } from 'puppeteer';

import { BookExportPayload } from './bookExportService';
import { renderBookHtml } from './bookHtmlService';

export interface CustomPdfSettings {
  fontFamily?: 'serif' | 'sans-serif' | 'monospace';
  fontSize?: number;
  lineSpacing?: number;
  pageSize?: 'letter' | 'a4';
}

export interface BookSettings {
  bookSize?: '6x9' | '8x11' | '5.5x8.5';
  title?: string;
  subtitle?: string;
  author?: string;
  fontFamily?: 'serif' | 'sans-serif';
  fontSize?: number;
  includeBackCover?: boolean;
  coverTemplate?: 'simple' | 'elegant' | 'modern';
  addPageBreaks?: boolean;
  includeTableOfContents?: boolean;
}

interface BookPdfOptions {
  includeImages?: boolean;
  format?: PaperFormat;
  customPdfSettings?: CustomPdfSettings;
  bookSettings?: BookSettings;
}

const DEFAULT_FORMAT: PaperFormat = 'letter';

const launchBrowser = async (): Promise<Browser> => {
  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');
  
  // Set Puppeteer cache directory for Render
  const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/opt/render/.cache/puppeteer';
  if (process.env.NODE_ENV === 'production' && !process.env.PUPPETEER_CACHE_DIR) {
    process.env.PUPPETEER_CACHE_DIR = cacheDir;
    // Ensure cache directory exists
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  const launchOptions: any = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // May help on Render
      '--disable-gpu',
    ],
  };

  // Use Chrome executable path if provided (for Render)
  if (process.env.CHROME_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.CHROME_EXECUTABLE_PATH;
    console.log('Using Chrome from CHROME_EXECUTABLE_PATH:', launchOptions.executablePath);
  } else if (process.env.NODE_ENV === 'production') {
    // Try to find Chrome in the Puppeteer cache directory
    const chromeDir = path.join(cacheDir, 'chrome');
    console.log('Looking for Chrome in:', chromeDir);
    
    try {
      if (fs.existsSync(chromeDir)) {
        // List all Chrome versions
        const versions = fs.readdirSync(chromeDir);
        console.log('Found Chrome versions:', versions);
        
        // Try the specific version first
        const specificVersion = 'linux-131.0.6778.204';
        const specificChromePath = path.join(chromeDir, specificVersion, 'chrome-linux64', 'chrome');
        
        if (fs.existsSync(specificChromePath)) {
          launchOptions.executablePath = specificChromePath;
          console.log('✅ Using Chrome from:', specificChromePath);
        } else if (versions.length > 0) {
          // Try any available version
          for (const version of versions) {
            const potentialChrome = path.join(chromeDir, version, 'chrome-linux64', 'chrome');
            console.log('Checking:', potentialChrome);
            if (fs.existsSync(potentialChrome)) {
              launchOptions.executablePath = potentialChrome;
              console.log('✅ Using Chrome from:', potentialChrome);
              break;
            }
          }
        }
      } else {
        console.error('Chrome directory does not exist:', chromeDir);
      }
      
      if (!launchOptions.executablePath) {
        console.error('❌ Could not find Chrome executable in cache directory');
        console.error('Cache directory:', cacheDir);
        console.error('Chrome directory exists:', fs.existsSync(chromeDir));
        
        // Try to install Chrome at runtime as a last resort
        if (process.env.NODE_ENV === 'production') {
          console.log('Attempting to install Chrome at runtime...');
          try {
            execSync('npx puppeteer browsers install chrome', { 
              stdio: 'inherit',
              env: { ...process.env, PUPPETEER_CACHE_DIR: cacheDir }
            });
            // Try to find it again after installation
            const versions = fs.readdirSync(chromeDir);
            if (versions.length > 0) {
              const versionDir = versions[0];
              const potentialChrome = path.join(chromeDir, versionDir, 'chrome-linux64', 'chrome');
              if (fs.existsSync(potentialChrome)) {
                launchOptions.executablePath = potentialChrome;
                console.log('✅ Using Chrome installed at runtime:', potentialChrome);
              }
            }
          } catch (installError) {
            console.error('Failed to install Chrome at runtime:', installError);
          }
        }
      }
    } catch (error) {
      console.error('Error finding Chrome:', error);
    }
  }

  // If we still don't have an executable path, try Puppeteer's built-in detection
  if (!launchOptions.executablePath) {
    try {
      const detectedPath = executablePath();
      if (detectedPath) {
        launchOptions.executablePath = detectedPath;
        console.log('✅ Using Chrome from Puppeteer detection:', detectedPath);
      }
    } catch (error) {
      console.error('Puppeteer executablePath() failed:', error);
    }
  }

  console.log('Launch options:', {
    executablePath: launchOptions.executablePath || 'not set (will use default)',
    args: launchOptions.args,
  });

  if (!launchOptions.executablePath) {
    console.warn('⚠️  No Chrome executable path set - Puppeteer will try to find it automatically');
  }

  return puppeteer.launch(launchOptions);
};

// Convert book sizes to PDF dimensions
function getBookDimensions(bookSize: string): { width: string; height: string } {
  const dimensions: Record<string, { width: string; height: string }> = {
    '6x9': { width: '6in', height: '9in' },
    '8x11': { width: '8.5in', height: '11in' },
    '5.5x8.5': { width: '5.5in', height: '8.5in' },
  };
  return dimensions[bookSize] || dimensions['6x9'];
}

export async function generateBookPdf(
  payload: BookExportPayload,
  options: BookPdfOptions = {}
): Promise<Buffer> {
  const html = renderBookHtml(payload, {
    includeImages: options.includeImages,
    customPdfSettings: options.customPdfSettings,
    bookSettings: options.bookSettings,
  });

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Set a longer timeout for page operations
    page.setDefaultTimeout(30000);

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    // Determine page format based on settings
    let pdfFormat: PaperFormat | undefined = options.format ?? DEFAULT_FORMAT;
    let pdfWidth: string | undefined;
    let pdfHeight: string | undefined;

    // Book settings take priority (for print books)
    if (options.bookSettings?.bookSize) {
      const dims = getBookDimensions(options.bookSettings.bookSize);
      pdfWidth = dims.width;
      pdfHeight = dims.height;
      pdfFormat = undefined; // Use custom dimensions
    } else if (options.customPdfSettings?.pageSize) {
      // Custom PDF settings (for formatted PDFs)
      pdfFormat = options.customPdfSettings.pageSize === 'a4' ? 'A4' : 'Letter';
    }

    const pdfUint8Array = await page.pdf({
      format: pdfFormat,
      width: pdfWidth,
      height: pdfHeight,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '0.75in',
        bottom: '0.75in',
        left: '0.65in',
        right: '0.65in',
      },
      timeout: 30000,
    });

    await page.close();
    return Buffer.from(pdfUint8Array);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      await browser.close().catch(err => {
        console.error('Error closing browser:', err);
      });
    }
  }
}

