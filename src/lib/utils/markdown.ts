import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    link({ href, title, text }) {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-500">${text}</a>`;
    }
  }
});

/**
 * Render a markdown string to sanitized HTML.
 */
export function renderMarkdown(content: string): string {
  if (!content) return '';
  try {
    const rawHtml = marked.parse(content, { async: false }) as string;
    if (typeof window !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'rel']
      });
    }
    return rawHtml;
  } catch (err) {
    console.error('Error rendering markdown:', err);
    return content;
  }
}

