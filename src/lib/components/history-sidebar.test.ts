import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import HistorySidebar from './HistorySidebar.svelte';
import Header from './Header.svelte';

describe('HistorySidebar Component', () => {
  it('does not render sidebar drawer when isOpen is false', () => {
    const { html } = render(HistorySidebar, {
      props: {
        isOpen: false
      }
    });

    expect(html).not.toContain('Riwayat Chat');
    expect(html).not.toContain('Clear Chat');
  });

  it('renders sidebar drawer with empty state when sessions are empty', () => {
    const { html } = render(HistorySidebar, {
      props: {
        isOpen: true,
        sessions: []
      }
    });

    expect(html).toContain('Riwayat Chat');
    expect(html).toContain('Belum ada riwayat chat');
    expect(html).toContain('Obrolan Baru');
    expect(html).not.toContain('Clear Chat');
  });

  it('renders list of sessions and Clear Chat button when sessions exist', () => {
    const now = Date.now();
    const sessions = [
      {
        id: 'sess-1',
        title: 'Troubleshoot Docker Container',
        messages: [{ role: 'user' as const, content: 'Docker issue' }],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'sess-2',
        title: 'Proxmox ZFS Pool degraded',
        messages: [
          { role: 'user' as const, content: 'ZFS degraded' },
          { role: 'assistant' as const, content: 'Check zpool status' }
        ],
        createdAt: now - 3600000,
        updatedAt: now - 3600000
      }
    ];

    const { html } = render(HistorySidebar, {
      props: {
        isOpen: true,
        sessions,
        activeSessionId: 'sess-1'
      }
    });

    expect(html).toContain('Riwayat Chat');
    expect(html).toContain('Troubleshoot Docker Container');
    expect(html).toContain('Proxmox ZFS Pool degraded');
    expect(html).toContain('Clear Chat');
    expect(html).toContain('1 pesan');
    expect(html).toContain('2 pesan');
  });
});

describe('Header with History integration', () => {
  it('renders Riwayat button and session badge in Header', () => {
    const { html } = render(Header, {
      props: {
        sessionCount: 5
      }
    });

    expect(html).toContain('Riwayat');
    expect(html).toContain('5');
  });
});

