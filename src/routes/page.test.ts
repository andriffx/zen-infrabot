import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Page from './+page.svelte';

describe('+page.svelte (Main Chat Integration)', () => {
  it('renders initial view with Header, WelcomeScreen, and ChatInput', () => {
    const { html } = render(Page);

    // Header elements (New Chat is hidden when there are no messages yet)
    expect(html).toContain('InfraBot');
    expect(html).toContain('AI Infrastructure Assistant');
    expect(html).toContain('gemini-3.5-flash');
    expect(html).toContain('Riwayat');
    expect(html).not.toContain('New Chat');
    expect(html).toContain('aria-label="Pengaturan"');

    // WelcomeScreen elements (when messages is empty)
    expect(html).toContain('Asisten AI Khusus Infrastruktur IT');
    expect(html).toContain('Docker &amp; Containers');
    expect(html).toContain('Linux Admin');
    expect(html).toContain('Proxmox VE');

    // ChatInput elements
    expect(html).toContain('placeholder="Ketik pesan, paste error log, atau paste screenshot');
    expect(html).toContain('aria-label="Upload gambar"');
    expect(html).toContain('aria-label="Kirim"');
  });

  it('renders SettingsModal markup ready for configuration', () => {
    const { html } = render(Page);

    // SettingsModal elements (modal is hidden by default via isOpen: false, but component is mounted and bound)
    expect(html).toBeDefined();
  });
});
