import type { Browser, PaperFormat } from 'puppeteer';
import puppeteer from 'puppeteer';

import { BookExportPayload } from './bookExportService';
import { renderBookHtml } from './bookHtmlService';

interface BookPdfOptions {
  includeImages?: boolean;
  format?: PaperFormat;
}

const DEFAULT_FORMAT: PaperFormat = 'letter';

const launchBrowser = async (): Promise<Browser> => {
  // Set Puppeteer cache directory for Render
  if (process.env.NODE_ENV === 'production' && !process.env.PUPPETEER_CACHE_DIR) {
    process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
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
  }

  return puppeteer.launch(launchOptions);
};

export async function generateBookPdf(
  payload: BookExportPayload,
  options: BookPdfOptions = {}
): Promise<Buffer> {
  const html = renderBookHtml(payload, { includeImages: options.includeImages });

  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    
    // Set a longer timeout for page operations
    page.setDefaultTimeout(30000);
    
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfUint8Array = await page.pdf({
      format: options.format ?? DEFAULT_FORMAT,
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

