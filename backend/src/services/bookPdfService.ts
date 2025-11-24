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
  const launchOptions = {
    headless: true as const,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(process.env.CHROME_EXECUTABLE_PATH && {
      executablePath: process.env.CHROME_EXECUTABLE_PATH,
    }),
  };

  return puppeteer.launch(launchOptions);
};

export async function generateBookPdf(
  payload: BookExportPayload,
  options: BookPdfOptions = {}
): Promise<Buffer> {
  const html = renderBookHtml(payload, { includeImages: options.includeImages });

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

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
    });

    await page.close();
    return Buffer.from(pdfUint8Array);
  } finally {
    await browser.close();
  }
}

