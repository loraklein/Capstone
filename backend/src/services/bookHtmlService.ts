import { BookExportPayload, BookFrontMatter, BookExportPage } from './bookExportService';
import { CustomPdfSettings, BookSettings } from './bookPdfService';

interface RenderOptions {
  includeImages?: boolean;
  customPdfSettings?: CustomPdfSettings;
  bookSettings?: BookSettings;
  isPreview?: boolean;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getFontFamily = (font?: string): string => {
  switch (font) {
    case 'georgia':
      return '"Georgia", "Times New Roman", serif';
    case 'garamond':
      return '"Garamond", "EB Garamond", "Times New Roman", serif';
    case 'palatino':
      return '"Palatino Linotype", "Palatino", "Book Antiqua", serif';
    case 'baskerville':
      return '"Baskerville", "Libre Baskerville", "Times New Roman", serif';
    case 'helvetica':
      return '"Helvetica Neue", "Helvetica", "Arial", sans-serif';
    case 'verdana':
      return '"Verdana", "Geneva", sans-serif';
    case 'courier':
      return '"Courier New", "Courier", monospace';
    default:
      return '"Georgia", "Times New Roman", serif'; // Default
  }
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
    /* Hide page numbers on title page */
    @page title-page {
      @bottom-center {
        content: none;
      }
    }
    /* Hide page numbers on TOC */
    @page toc-page {
      @bottom-center {
        content: none;
      }
    }
    /* Apply named page to title page */
    .title-page {
      page: title-page;
    }
    /* Apply named page to TOC */
    .table-of-contents {
      page: toc-page;
    }
    /* Content pages - reset counter so first content page is 1 */
    @page content-page {
      @bottom-center {
        content: counter(page);
        font-family: ${fontFamily};
        font-size: 10pt;
        color: #5a4c43;
      }
    }
    .book-content {
      page: content-page;
      counter-reset: page 1;
    }
    .book-content > *:first-child {
      counter-reset: page 1;
    }
  ` : '';

  return `
    body {
      font-family: ${fontFamily};
    }
    body * {
      font-family: ${fontFamily};
    }
    p, li, h3, .recipe-title, .date-header, .section-header {
      line-height: ${lineHeight};
      font-size: ${fontSize}pt;
      font-family: ${fontFamily};
    }
    .page-text p {
      font-size: ${fontSize}pt;
      line-height: ${lineHeight};
      font-family: ${fontFamily};
    }
    h1, h2 {
      font-family: ${fontFamily};
    }
    ${pageNumberStyles}
  `;
};

const renderTableOfContents = (chapters: any[]): string => {
  if (chapters.length === 0) return '';

  // Add 4 to match actual printed page numbers (cover + blank + TOC + blank = 4 pages)
  const FRONT_MATTER_OFFSET = 4;

  const tocItems = chapters.map(chapter => `
    <div class="toc-item">
      <span class="toc-title">${escapeHtml(chapter.title)}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${chapter.start_page_number + FRONT_MATTER_OFFSET}</span>
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
  const template = bookSettings?.coverTemplate || 'simple';

  const subtitleHtml = subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : '';
  const authorHtml = author ? `<p class="author">By ${escapeHtml(author)}</p>` : '';
  const descriptionBlock = description
    ? `<div class="description"><p>${escapeHtml(description)}</p></div>`
    : '';

  // Template-specific decorations
  let decorations = '';
  if (template === 'elegant') {
    decorations = `
      <div class="elegant-ornament-top">✦</div>
      <div class="elegant-divider"></div>
      <div class="elegant-ornament-bottom">✦</div>
    `;
  } else if (template === 'modern') {
    decorations = `<div class="modern-accent"></div>`;
  }

  return `
    <section class="title-page page-break cover-${template}">
      <div class="title-wrapper">
        ${template === 'elegant' ? '<div class="elegant-ornament-top">✦</div>' : ''}
        <h1>${escapeHtml(title)}</h1>
        ${template === 'elegant' ? '<div class="elegant-divider"></div>' : ''}
        ${subtitleHtml}
        ${authorHtml}
        ${template === 'elegant' ? '<div class="elegant-ornament-bottom">✦</div>' : ''}
        ${template === 'modern' ? '<div class="modern-accent"></div>' : ''}
      </div>
      ${descriptionBlock}
    </section>
  `;
};

const parseNaturalFormatting = (text: string): string => {
  if (!text) return '';

  const lines = text.split(/\r?\n/);
  const result: string[] = [];
  let i = 0;
  let inBulletList = false;
  let inNumberedList = false;

  // Date pattern: matches dates like "January 15, 2024", "1/15/24", "Dec 5, 1985", "Monday, Jan 15"
  const datePattern = /^(?:(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*)?(?:\d{1,2}\/\d{1,2}\/\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{2,4})$/i;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Close any open lists if this line doesn't continue them
    if (inBulletList && !line.startsWith('- ')) {
      result.push('</ul>');
      inBulletList = false;
    }
    if (inNumberedList && !/^\d+\.\s/.test(line)) {
      result.push('</ol>');
      inNumberedList = false;
    }

    // Empty line - preserve as paragraph break
    if (line === '') {
      if (!inBulletList && !inNumberedList) {
        // Don't add extra breaks, just move on
      }
      i++;
      continue;
    }

    // Date detection (for journals and letters)
    if (datePattern.test(line)) {
      result.push(`<p class="date-header"><strong>${escapeHtml(line)}</strong></p>`);
    }
    // Section headers (lines ending with :)
    else if (line.endsWith(':')) {
      result.push(`<p class="section-header"><strong>${escapeHtml(line)}</strong></p>`);
    }
    // Bullet list items
    else if (line.startsWith('- ')) {
      if (!inBulletList) {
        result.push('<ul class="ingredient-list">');
        inBulletList = true;
      }
      result.push(`<li>${escapeHtml(line.substring(2))}</li>`);
    }
    // Numbered list items
    else if (/^\d+\.\s/.test(line)) {
      if (!inNumberedList) {
        result.push('<ol class="direction-list">');
        inNumberedList = true;
      }
      const text = line.replace(/^\d+\.\s/, '');
      result.push(`<li>${escapeHtml(text)}</li>`);
    }
    // Check if this is a potential title (first non-empty line before a section header or blank line)
    else if (i === 0 || (i > 0 && lines[i - 1].trim() === '')) {
      // Check if next line is a section header, date, or blank
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      if (nextLine === '' || nextLine.endsWith(':') || datePattern.test(nextLine)) {
        result.push(`<h3 class="recipe-title">${escapeHtml(line)}</h3>`);
      } else {
        result.push(`<p>${escapeHtml(line)}</p>`);
      }
    }
    // Regular paragraph
    else {
      result.push(`<p>${escapeHtml(line)}</p>`);
    }

    i++;
  }

  // Close any remaining open lists
  if (inBulletList) result.push('</ul>');
  if (inNumberedList) result.push('</ol>');

  return result.join('\n');
};

const renderPlainText = (text: string): string => {
  if (!text) return '';

  // Simple paragraph wrapping - split on double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);
  return paragraphs
    .map(para => {
      const trimmed = para.trim();
      if (!trimmed) return '';
      // Replace single newlines with spaces within paragraphs
      const cleaned = trimmed.replace(/\n/g, ' ');
      return `<p>${escapeHtml(cleaned)}</p>`;
    })
    .filter(p => p)
    .join('\n');
};

const renderPage = (page: BookExportPage, options: RenderOptions, isLastPage: boolean = false): string => {
  // Use plain text formatting for all PDFs (no smart detection)
  const text = page.finalText
    ? renderPlainText(page.finalText)
    : '<p class="placeholder">No text available for this page.</p>';

  const showImages = options.includeImages ?? false;

  const image = showImages && page.photoUrl
    ? `<figure class="page-image">
        <img src="${page.photoUrl}" alt="Page ${page.pageNumber} source image" />
        <figcaption>Source scan</figcaption>
      </figure>`
    : '';

  // Determine if we should add a page break after this page
  // Only apply page breaks if bookSettings are provided (Create Printable Book)
  // Quick Export should be continuous with no page breaks
  const pageBreakStyle = options.bookSettings?.pageBreakStyle || 'continuous';
  const shouldBreakAfterPage = pageBreakStyle === 'after-each-page' && !isLastPage;
  const pageBreakClass = shouldBreakAfterPage ? ' page-break-after' : '';

  // Add visual page break indicator in preview mode
  const visualPageBreak = options.isPreview && shouldBreakAfterPage
    ? '<div class="visual-page-break"><span>Page Break</span></div>'
    : '';

  // For continuous flow (book settings), just return the text
  // For regular PDFs, keep section structure
  if (options.bookSettings || options.customPdfSettings) {
    // Continuous flow: just paragraphs with optional page break
    return `
      <div class="page-content${pageBreakClass}">
        ${text}
        ${image}
      </div>
      ${visualPageBreak}
    `;
  } else {
    // Regular PDF: keep sections
    return `
      <section class="content-page${pageBreakClass}">
        <div class="page-body">
          <div class="page-text${image ? '' : ' full-width'}">
            ${text}
          </div>
          ${image}
        </div>
      </section>
      ${visualPageBreak}
    `;
  }
};

export function renderBookHtml(payload: BookExportPayload, options: RenderOptions = {}): string {
  const includeImages = options.includeImages ?? false;
  const chapters = payload.chapters || [];
  // Only apply page breaks if bookSettings are provided (Create Printable Book)
  // Quick Export should be continuous with no page breaks
  const pageBreakStyle = options.bookSettings?.pageBreakStyle || 'continuous';

  // Render pages with chapter headings
  const pagesHtml = payload.pages.map((page, index) => {
    const isLastPage = index === payload.pages.length - 1;

    // Check if this page starts a chapter
    const chapter = chapters.find(c => c.start_page_number === page.pageNumber);
    let html = '';

    if (chapter) {
      // Add page break before chapter if pageBreakStyle is 'sections-only'
      const shouldBreakBeforeChapter = pageBreakStyle === 'sections-only';
      const pageBreakClass = shouldBreakBeforeChapter ? ' chapter-break' : '';

      // Add visual page break indicator before chapter in preview mode
      const visualChapterBreak = options.isPreview && shouldBreakBeforeChapter && index > 0
        ? '<div class="visual-page-break"><span>Page Break (New Section)</span></div>'
        : '';

      html += visualChapterBreak;
      html += `
        <div class="chapter-heading${pageBreakClass}">
          <h2>${escapeHtml(chapter.title)}</h2>
          ${chapter.description ? `<p class="chapter-description">${escapeHtml(chapter.description)}</p>` : ''}
        </div>
      `;
    }

    html += renderPage(page, options, isLastPage);
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
          .page-break-after {
            page-break-after: always;
          }
          .page-content {
            margin-bottom: 1rem;
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
            font-size: 2.5rem;
            margin-bottom: 1.5rem;
            letter-spacing: 0;
            text-transform: uppercase;
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
            padding: 0 1rem;
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

          /* Simple Template (Default) - Clean, minimal */
          .cover-simple h1 {
            font-family: "Georgia", "Times New Roman", serif;
            font-weight: 600;
          }

          /* Elegant Template - Decorative flourishes */
          .cover-elegant {
            background: linear-gradient(to bottom, #fafaf8 0%, #ffffff 100%);
          }
          .cover-elegant h1 {
            font-family: "Garamond", "EB Garamond", "Baskerville", serif;
            font-weight: 400;
            font-size: 3rem;
            letter-spacing: 0.08em;
            text-transform: none;
            margin-bottom: 1rem;
          }
          .cover-elegant .subtitle {
            font-family: "Garamond", "EB Garamond", serif;
            font-style: italic;
            font-size: 1.6rem;
            color: #5a4c43;
            margin-bottom: 2rem;
          }
          .cover-elegant .author {
            font-size: 1.2rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-weight: 300;
          }
          .elegant-ornament-top,
          .elegant-ornament-bottom {
            font-size: 1.8rem;
            color: #8b7355;
            margin: 1.5rem 0;
          }
          .elegant-divider {
            width: 8rem;
            height: 2px;
            background: linear-gradient(to right, transparent, #8b7355, transparent);
            margin: 1rem auto;
          }

          /* Modern Template - Bold, asymmetric */
          .cover-modern {
            text-align: left;
            align-items: flex-start;
            justify-content: flex-start;
            padding: 6rem 4rem;
            position: relative;
          }
          .cover-modern .title-wrapper {
            align-items: flex-start;
            text-align: left;
          }
          .cover-modern h1 {
            font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
            font-weight: 700;
            font-size: 3.5rem;
            letter-spacing: -0.02em;
            text-transform: none;
            line-height: 1.1;
            margin-bottom: 1rem;
            padding: 0;
            max-width: 80%;
          }
          .cover-modern .subtitle {
            font-family: "Helvetica Neue", "Helvetica", sans-serif;
            font-size: 1.3rem;
            font-style: normal;
            font-weight: 300;
            margin-bottom: 3rem;
            max-width: 70%;
          }
          .cover-modern .author {
            font-size: 1.1rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            font-weight: 500;
          }
          .modern-accent {
            width: 6rem;
            height: 6px;
            background: #1a1410;
            margin-top: 2rem;
            margin-bottom: 0;
          }
          /* Continuous flow container for book/custom PDF */
          .book-content {
            max-width: 100%;
            padding: 0;
          }
          .book-content p {
            text-align: left;
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
            text-align: left;
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
          /* Natural formatting styles for recipes and structured content */
          .recipe-title {
            font-weight: 700;
            margin: 0 0 1.5rem 0;
            text-align: left;
            color: #1a1410;
          }
          .date-header {
            margin: 2rem 0 1rem 0;
            color: #3a3028;
            font-style: italic;
          }
          .date-header strong {
            font-weight: 600;
          }
          .section-header {
            margin: 1.5rem 0 0.75rem 0;
            color: #2a2318;
          }
          .section-header strong {
            font-weight: 700;
          }
          .ingredient-list, .direction-list {
            margin: 0.5rem 0 1.5rem 0;
            padding-left: 2rem;
          }
          .ingredient-list li {
            margin-bottom: 0.4rem;
            line-height: 1.5;
          }
          .direction-list li {
            margin-bottom: 0.75rem;
            line-height: 1.6;
            padding-left: 0.5rem;
          }
          /* Visual page break indicator for preview mode */
          .visual-page-break {
            margin: 2rem 0;
            padding: 1rem 0;
            text-align: center;
            border-top: 2px dashed #8b7355;
            border-bottom: 2px dashed #8b7355;
            background: linear-gradient(to bottom, rgba(139, 115, 85, 0.05), rgba(139, 115, 85, 0.1), rgba(139, 115, 85, 0.05));
          }
          .visual-page-break span {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: #fdfcf9;
            color: #8b7355;
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            border: 1px solid #8b7355;
            border-radius: 4px;
          }
          @media print {
            body {
              background: white;
            }
            .content-page:nth-child(odd) {
              background: transparent;
            }
            /* Hide visual page breaks in print/PDF */
            .visual-page-break {
              display: none;
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

