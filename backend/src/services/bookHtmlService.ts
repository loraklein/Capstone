import { BookExportPayload, BookFrontMatter, BookExportPage } from './bookExportService';

interface RenderOptions {
  includeImages?: boolean;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderTitlePage = (frontMatter: BookFrontMatter): string => {
  const { titlePage, description } = frontMatter;
  const subtitle = titlePage.subtitle ? `<p class="subtitle">${escapeHtml(titlePage.subtitle)}</p>` : '';
  const author = titlePage.author ? `<p class="author">By ${escapeHtml(titlePage.author)}</p>` : '';
  const descriptionBlock = description
    ? `<div class="description"><p>${escapeHtml(description)}</p></div>`
    : '';

  return `
    <section class="title-page page-break">
      <div class="title-wrapper">
        <h1>${escapeHtml(titlePage.title)}</h1>
        ${subtitle}
        ${author}
      </div>
      ${descriptionBlock}
    </section>
  `;
};

const renderPage = (page: BookExportPage, options: RenderOptions): string => {
  const text = page.finalText
    ? page.finalText
        .split(/\r?\n\r?\n/)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join('\n')
    : '<p class="placeholder">No text available for this page.</p>';

  const showImages = options.includeImages ?? false;

  const image = showImages && page.photoUrl
    ? `<figure class="page-image">
        <img src="${page.photoUrl}" alt="Page ${page.pageNumber} source image" />
        <figcaption>Source scan</figcaption>
      </figure>`
    : '';

  return `
    <section class="content-page page-break">
      <header class="page-header">
        <h2>Page ${page.pageNumber}</h2>
      </header>
      <div class="page-body">
        <div class="page-text${image ? '' : ' full-width'}">
          ${text}
        </div>
        ${image}
      </div>
    </section>
  `;
};

export function renderBookHtml(payload: BookExportPayload, options: RenderOptions = {}): string {
  const pagesHtml = payload.pages.map((page) => renderPage(page, options)).join('\n');
  const includeImages = options.includeImages ?? false;

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(payload.project.title)} – Book Export</title>
        <style>
          :root {
            color-scheme: light;
          }
          @page {
            margin: 1in;
          }
          body {
            font-family: "Georgia", "Times New Roman", serif;
            margin: 0;
            padding: 0;
            background: #fdfcf9;
            color: #1f1a17;
          }
          h1, h2, h3 {
            font-family: "Palatino", "Times New Roman", serif;
            font-weight: 600;
            line-height: 1.2;
            color: #1a1410;
          }
          p {
            line-height: 1.6;
            margin: 0 0 1rem 0;
            font-size: 1rem;
          }
          .page-break {
            page-break-after: always;
            padding: 0 0 2rem 0;
          }
          .title-page {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 4rem 2rem;
          }
          .title-page h1 {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .title-page .subtitle {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            font-style: italic;
          }
          .title-page .author {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            letter-spacing: 0.05em;
          }
          .title-page .meta {
            margin-top: 3rem;
            font-size: 0.95rem;
            color: #5a4c43;
          }
          .title-page .description {
            margin-top: 2rem;
            max-width: 40rem;
          }
          .content-page {
            padding: 2rem 1.5rem;
            min-height: 100vh;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .content-page:nth-child(odd) {
            background: rgba(26, 20, 16, 0.015);
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 1rem;
          }
          .page-header h2 {
            margin: 0;
            font-size: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #2b211a;
          }
          .ai-meta {
            font-size: 0.85rem;
            color: #6b5a4f;
            display: flex;
            gap: 0.75rem;
          }
          .page-body {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
            align-items: start;
          }
          .page-body .full-width {
            grid-column: 1 / -1;
          }
          .page-text {
            font-size: 1rem;
          }
          .page-text p {
            text-align: justify;
            hyphenate-character: "-";
            hyphens: auto;
          }
          .page-image {
            margin: 0;
            text-align: center;
          }
          .page-image img {
            max-width: 100%;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 0.5rem;
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.08);
          }
          .page-image figcaption {
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #7a6a5e;
          }
          .page-footnote {
            margin-top: auto;
            font-size: 0.8rem;
            color: #8a7a6f;
            border-top: 1px solid rgba(0,0,0,0.08);
            padding-top: 0.75rem;
          }
          .placeholder {
            font-style: italic;
            color: #7a6a5e;
          }
          @media print {
            body {
              background: white;
            }
            .content-page:nth-child(odd) {
              background: transparent;
            }
          }
        </style>
      </head>
      <body>
        ${renderTitlePage(payload.frontMatter)}
        <section class="book-summary page-break">
          <h2>Project Summary</h2>
          <ul>
            <li>Total pages: ${payload.summary.pageCount}</li>
            <li>Pages with text: ${payload.summary.textPageCount}</li>
            <li>Total words: ${payload.summary.totalWords}</li>
            ${
              includeImages && payload.summary.hasImages
                ? `<li>Images included: Yes</li>`
                : ''
            }
          </ul>
        </section>
        ${pagesHtml}
      </body>
    </html>
  `;
}

