import { describe, it, expect, vi } from 'vitest';
import { render } from 'svelte/server';
import ChatInput from './ChatInput.svelte';

describe('ChatInput Component', () => {
  it('renders textarea with placeholder and hint', () => {
    const { html } = render(ChatInput, {
      props: {
        input: '',
        isLoading: false
      }
    });

    expect(html).toContain('placeholder="Ketik pesan, paste error log, atau paste screenshot (Cmd+V / Ctrl+V)...');
    expect(html).toContain('aria-label="Pesan atau pertanyaan infrastruktur"');
    expect(html).toContain('Cmd+V');
    expect(html).toContain('Maks 2MB');
    expect(html).toContain('aria-label="Upload gambar"');
    expect(html).toContain('title="Upload screenshot gambar (Maks 2MB)"');
    expect(html).toContain('Enter ↵');
  });

  it('renders send button when isLoading is false and disables it when input is empty', () => {
    const { html } = render(ChatInput, {
      props: {
        input: '',
        isLoading: false
      }
    });

    expect(html).toContain('aria-label="Kirim"');
    expect(html).toContain('title="Kirim pesan"');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('aria-label="Stop"');
  });

  it('enables send button when input is not empty', () => {
    const { html } = render(ChatInput, {
      props: {
        input: 'Bagaimana cara restart Docker daemon?',
        isLoading: false
      }
    });

    expect(html).toContain('aria-label="Kirim"');
    expect(html).not.toContain('disabled=""');
  });

  it('renders stop button when isLoading is true', () => {
    const { html } = render(ChatInput, {
      props: {
        input: 'Menganalisis log...',
        isLoading: true
      }
    });

    expect(html).toContain('aria-label="Stop"');
    expect(html).toContain('title="Hentikan pembuatan"');
    expect(html).not.toContain('aria-label="Kirim"');
  });

  it('accepts onSubmit and onStop callbacks without crashing', () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();

    const { html } = render(ChatInput, {
      props: {
        input: 'Test',
        isLoading: false,
        onSubmit,
        onStop
      }
    });

    expect(html).toBeDefined();
  });
});
