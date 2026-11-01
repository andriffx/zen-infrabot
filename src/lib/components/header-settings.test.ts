import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Header from './Header.svelte';
import SettingsModal from './SettingsModal.svelte';

describe('Header Component', () => {
  it('renders Header with default props (hides New Chat when not chatting yet)', () => {
    const { html } = render(Header, {
      props: {
        activeModel: 'gemini-2.5-flash'
      }
    });

    expect(html).toContain('InfraBot');
    expect(html).toContain('gemini-2.5-flash');
    expect(html).toContain('AI Infrastructure Assistant');
    expect(html).not.toContain('New Chat');
  });

  it('renders New Chat button when showNewChat is true', () => {
    const { html } = render(Header, {
      props: {
        activeModel: 'gemini-2.5-flash',
        showNewChat: true
      }
    });

    expect(html).toContain('New Chat');
  });

  it('renders Header with custom activeModel', () => {
    const { html } = render(Header, {
      props: {
        activeModel: 'gemini-2.5-flash-lite'
      }
    });

    expect(html).toContain('gemini-2.5-flash-lite');
  });
});

describe('SettingsModal Component', () => {
  it('does not render modal content when isOpen is false', () => {
    const { html } = render(SettingsModal, {
      props: {
        isOpen: false
      }
    });

    expect(html).not.toContain('Pengaturan AI (Settings)');
  });

  it('renders modal content when isOpen is true', () => {
    const { html } = render(SettingsModal, {
      props: {
        isOpen: true,
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        topP: 0.85,
        maxTokens: 2048
      }
    });

    expect(html).toContain('Pengaturan AI (Settings)');
    expect(html).toContain('Model AI');
    expect(html).toContain('Profil Server (Memory)');
    expect(html).toContain('Temperature');
    expect(html).toContain('0.30');
    expect(html).toContain('Top P');
    expect(html).toContain('0.85');
    expect(html).toContain('Max Output Tokens');
    expect(html).toContain('2048');
    expect(html).toContain('Reset Default');
    expect(html).toContain('Batal');
    expect(html).toContain('Simpan &amp; Tutup');
  });

  it('renders modal with custom serverProfile when memory tab is active', () => {
    const { html } = render(SettingsModal, {
      props: {
        isOpen: true,
        defaultTab: 'memory',
        serverProfile: {
          os: 'Ubuntu 24.04',
          techStack: 'Docker',
          specs: '8GB RAM',
          notes: 'Test'
        }
      }
    });

    expect(html).toContain('Profil Server (Memory)');
    expect(html).toContain('Ubuntu 24.04');
    expect(html).toContain('Docker');
    expect(html).toContain('8GB RAM');
  });
});

