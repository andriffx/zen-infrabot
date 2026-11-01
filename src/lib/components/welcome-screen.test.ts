import { describe, it, expect, vi } from 'vitest';
import { render } from 'svelte/server';
import WelcomeScreen from './WelcomeScreen.svelte';

describe('WelcomeScreen Component', () => {
  it('renders heading and descriptive text', () => {
    const { html } = render(WelcomeScreen);

    expect(html).toContain('Asisten AI Khusus Infrastruktur IT');
    expect(html).toContain(
      'Tanyakan troubleshooting server, tempelkan error log, atau diskusikan konfigurasi Linux, Docker, Proxmox, dan MikroTik.'
    );
  });

  it('renders all domain badges', () => {
    const { html } = render(WelcomeScreen);

    expect(html).toContain('Linux Admin');
    expect(html).toContain('Docker &amp; Containers');
    expect(html).toContain('Proxmox VE');
    expect(html).toContain('MikroTik &amp; Network');
    expect(html).toContain('Server Admin');
  });

  it('renders all suggested prompts and domain tags', () => {
    const { html } = render(WelcomeScreen);

    expect(html).toContain('Docker');
    expect(html).toContain('Mengapa Docker container saya mengalami restart terus-menerus? Bagaimana cara menganalisis error log-nya?');
    expect(html).toContain('Linux');
    expect(html).toContain('Bagaimana cara memperbaiki error permission denied pada service systemd di Linux Ubuntu?');
    expect(html).toContain('Proxmox');
    expect(html).toContain('VM Proxmox saya terkunci (locked) saat proses backup storage. Bagaimana cara membukanya dengan aman?');
    expect(html).toContain('MikroTik');
    expect(html).toContain('Mengapa CPU router MikroTik mencapai 95% saat jam kerja dan bagaimana cara profiling traffic-nya?');
  });

  it('accepts onSelectPrompt callback prop without errors', () => {
    const onSelectPrompt = vi.fn();
    const { html } = render(WelcomeScreen, {
      props: {
        onSelectPrompt
      }
    });

    expect(html).toContain('Asisten AI Khusus Infrastruktur IT');
  });
});
