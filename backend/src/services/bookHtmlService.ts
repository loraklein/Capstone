import { BookExportPayload, BookFrontMatter, BookExportPage } from './bookExportService';
import { CustomPdfSettings, BookSettings } from './bookPdfService';

interface RenderOptions {
  includeImages?: boolean;
  customPdfSettings?: CustomPdfSettings;
  bookSettings?: BookSettings;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getFontFamily = (font?: string): string => {
  if (font === 'sans-serif') return '"Helvetica Neue", "Arial", sans-serif';
  if (font === 'monospace') return '"Courier New", "Courier", monospace';
  return '"Georgia", "Times New Roman", serif'; // Default to serif
};

const generateDynamicStyles = (options: RenderOptions): string => {
  const customPdf = options.customPdfSettings;
  const book = options.bookSettings;

  const fontFamily = getFontFamily(customPdf?.fontFamily || book?.fontFamily);
  const fontSize = customPdf?.fontSize || book?.fontSize || 12;
  const lineHeight = customPdf?.lineSpacing || 1.6;

  // Add page numbers for print books only
  const pageNumberStyles = book ? `
    @page {
      @bottom-center {
        content: counter(page);
        font-family: ${fontFamily};
        font-size: 10pt;
        color: #5a4c43;
      }
    }
    /* Skip page numbers on title page and don't count it */
    @page :first {
      @bottom-center {
        content: none;
      }
    }
    /* Reset page counter so content starts at page 1 */
    .book-content {
      counter-reset: page 1;
    }
  ` : '';

  return `
    body {
      font-family: ${fontFamily};
    }
    p {
      line-height: ${lineHeight};
      font-size: ${fontSize}pt;
    }
    .page-text p {
      font-size: ${fontSize}pt;
      line-height: ${lineHeight};
    }
    ${pageNumberStyles}
  `;
};

const renderTableOfContents = (chapters: any[]): string => {
  if (chapters.length === 0) return '';

  const tocItems = chapters.map(chapter => `
    <div class="toc-item">
      <span class="toc-title">${escapeHtml(chapter.title)}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${chapter.start_page_number}</span>
    </div>
  `).join('\n');

  return `
    <section class="table-of-contents page-break">
      <h2>Table of Contents</h2>
      <div class="toc-list">
        ${tocItems}
      </div>
    </section>
  `;
};

const renderTitlePage = (frontMatter: BookFrontMatter, bookSettings?: BookSettings): string => {
  const { titlePage, description } = frontMatter;

  // Use book settings if provided, otherwise use defaults
  const title = bookSettings?.title || titlePage.title;
  const subtitle = bookSettings?.subtitle || titlePage.subtitle || '';
  const author = bookSettings?.author || titlePage.author || '';

  const subtitleHtml = subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : '';
  const authorHtml = author ? `<p class="author">By ${escapeHtml(author)}</p>` : '';
  const descriptionBlock = description
    ? `<div class="description"><p>${escapeHtml(description)}</p></div>`
    : '';

  return `
    <section class="title-page page-break">
      <div class="title-wrapper">
        <h1>${escapeHtml(title)}</h1>
        ${subtitleHtml}
        ${authorHtml}
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

  // For continuous flow (book settings), just return the text
  // For regular PDFs, keep section structure
  if (options.bookSettings || options.customPdfSettings) {
    // Continuous flow: just paragraphs with optional subtle divider
    return `
      ${text}
      ${image}
    `;
  } else {
    // Regular PDF: keep sections
    return `
      <section class="content-page">
        <div class="page-body">
          <div class="page-text${image ? '' : ' full-width'}">
            ${text}
          </div>
          ${image}
        </div>
      </section>
    `;
  }
};

export function renderBookHtml(payload: BookExportPayload, options: RenderOptions = {}): string {
  const includeImages = options.includeImages ?? false;
  const chapters = payload.chapters || [];
  const addPageBreaks = options.bookSettings?.addPageBreaks ?? false;

  // Render pages with chapter headings
  const pagesHtml = payload.pages.map((page) => {
    // Check if this page starts a chapter
    const chapter = chapters.find(c => c.start_page_number === page.pageNumber);
    let html = '';

    if (chapter) {
      const pageBreakClass = addPageBreaks ? ' chapter-break' : '';
      html += `
        <div class="chapter-heading${pageBreakClass}">
          <h2>${escapeHtml(chapter.title)}</h2>
          ${chapter.description ? `<p class="chapter-description">${escapeHtml(chapter.description)}</p>` : ''}
        </div>
      `;
    }

    html += renderPage(page, options);
    return html;
  }).join('\n');

  // For continuous flow (book/custom PDF), wrap content in a container
  const isContinuousFlow = !!(options.bookSettings || options.customPdfSettings);
  const contentHtml = isContinuousFlow
    ? `<div class="book-content">\n${pagesHtml}\n</div>`
    : pagesHtml;

  // Generate table of contents if enabled and there are chapters
  const includeTOC = options.bookSettings?.includeTableOfContents && chapters.length > 0;
  const tocHtml = includeTOC ? renderTableOfContents(chapters) : '';

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
          /* Continuous flow container for book/custom PDF */
          .book-content {
            max-width: 100%;
            padding: 0;
          }
          .book-content p {
            text-align: justify;
            hyphenate-character: "-";
            hyphens: auto;
          }
          /* Chapter headings */
          .chapter-heading {
            margin-top: 3rem;
            margin-bottom: 2rem;
          }
          .chapter-heading h2 {
            font-size: 2rem;
            margin: 0 0 0.5rem 0;
            font-weight: 700;
            letter-spacing: 0.02em;
          }
          .chapter-description {
            font-style: italic;
            color: #5a4c43;
            margin: 0;
          }
          /* Page break before chapters */
          .chapter-break {
            page-break-before: always;
            margin-top: 0;
          }
          /* Table of Contents */
          .table-of-contents {
            padding: 4rem 2rem;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
          }
          .table-of-contents h2 {
            font-size: 2.5rem;
            margin-bottom: 2rem;
            text-align: center;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
          .toc-list {
            max-width: 40rem;
            margin: 0 auto;
            width: 100%;
          }
          .toc-item {
            display: flex;
            align-items: baseline;
            margin-bottom: 0.75rem;
            font-size: 1rem;
          }
          .toc-title {
            flex-shrink: 0;
          }
          .toc-dots {
            flex-grow: 1;
            border-bottom: 1px dotted #5a4c43;
            margin: 0 0.5rem;
            min-width: 2rem;
          }
          .toc-page {
            flex-shrink: 0;
            font-weight: 600;
          }
          /* Regular PDF sections */
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
          /* Dynamic styles based on user settings */
          ${generateDynamicStyles(options)}
        </style>
      </head>
      <body>
        ${renderTitlePage(payload.frontMatter, options.bookSettings)}
        ${tocHtml}
        ${contentHtml}
      </body>
    </html>
  `;
}

