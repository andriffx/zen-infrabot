import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
  });

  it('renders bold, italic, and inline code formatting', () => {
    const md = 'Halo **tebal** dan *miring* serta `docker ps`.';
    const html = renderMarkdown(md);

    expect(html).toContain('<strong>tebal</strong>');
    expect(html).toContain('<em>miring</em>');
    expect(html).toContain('<code>docker ps</code>');
  });

  it('renders headings correctly', () => {
    const md = '### Penyebab Masalah\n#### Langkah 1';
    const html = renderMarkdown(md);

    expect(html).toContain('<h3>Penyebab Masalah</h3>');
    expect(html).toContain('<h4>Langkah 1</h4>');
  });

  it('renders unordered and ordered lists', () => {
    const md = '- Item A\n- Item B\n\n1. First\n2. Second';
    const html = renderMarkdown(md);

    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item A</li>');
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>First</li>');
  });

  it('renders horizontal rules', () => {
    const md = 'Sebelum\n\n---\n\nSesudah';
    const html = renderMarkdown(md);

    expect(html).toContain('<hr>');
  });

  it('renders links with secure attributes', () => {
    const md = '[Dokumentasi](https://docs.docker.com)';
    const html = renderMarkdown(md);

    expect(html).toContain('href="https://docs.docker.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});

