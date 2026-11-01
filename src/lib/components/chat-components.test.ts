import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import CodeBlock from './CodeBlock.svelte';
import MessageBubble from './MessageBubble.svelte';
import ChatArea from './ChatArea.svelte';

describe('CodeBlock Component', () => {
  it('renders code content and language tag', () => {
    const { html } = render(CodeBlock, {
      props: {
        code: 'docker ps -a',
        language: 'bash'
      }
    });

    expect(html).toContain('docker ps -a');
    expect(html).toContain('bash');
    expect(html).toContain('Salin');
    expect(html).not.toContain('Peringatan Berisiko');
  });

  it('uses default language fallback if language is not provided or empty', () => {
    const { html } = render(CodeBlock, {
      props: {
        code: 'echo "hello"'
      }
    });

    expect(html).toContain('echo "hello"');
    expect(html).toContain('bash');
  });

  it('renders warning banner when destructive command is detected', () => {
    const { html } = render(CodeBlock, {
      props: {
        code: 'rm -rf /var/log/*',
        language: 'bash'
      }
    });

    expect(html).toContain('Peringatan Berisiko');
    expect(html).toContain('Perintah ini berpotensi mengubah atau menghapus data sistem. Jalankan dengan hati-hati.');
    expect(html).toContain('rm -rf /var/log/*');
  });

  it('renders warning banner for docker system prune -a', () => {
    const { html } = render(CodeBlock, {
      props: {
        code: 'docker system prune -a --volumes',
        language: 'bash'
      }
    });

    expect(html).toContain('Peringatan Berisiko');
  });

  it('does not render warning banner for safe commands', () => {
    const { html } = render(CodeBlock, {
      props: {
        code: 'systemctl status nginx',
        language: 'bash'
      }
    });

    expect(html).not.toContain('Peringatan Berisiko');
  });
});

describe('MessageBubble Component', () => {
  it('renders user message with "Anda" and user avatar container', () => {
    const { html } = render(MessageBubble, {
      props: {
        role: 'user',
        content: 'Bagaimana cara cek status disk di Linux?'
      }
    });

    expect(html).toContain('Anda');
    expect(html).toContain('Bagaimana cara cek status disk di Linux?');
  });

  it('renders attached screenshot image when image prop is provided with zoom trigger', () => {
    const { html } = render(MessageBubble, {
      props: {
        role: 'user',
        content: 'Error kernel panic',
        image: 'data:image/png;base64,mockImageData'
      }
    });

    expect(html).toContain('Screenshot Lampiran');
    expect(html).toContain('src="data:image/png;base64,mockImageData"');
    expect(html).toContain('Perbesar');
    expect(html).not.toContain('target="_blank"');
  });

  it('renders assistant message with "InfraBot" and bot avatar container', () => {
    const { html } = render(MessageBubble, {
      props: {
        role: 'assistant',
        content: 'Anda bisa menggunakan perintah df -h untuk cek ruang disk.'
      }
    });

    expect(html).toContain('InfraBot');
    expect(html).toContain('Anda bisa menggunakan perintah df -h untuk cek ruang disk.');
  });

  it('parses markdown code blocks and renders CodeBlock component', () => {
    const content = `Gunakan perintah berikut:
\`\`\`bash
df -h
\`\`\`
Periksa partisi root.`;

    const { html } = render(MessageBubble, {
      props: {
        role: 'assistant',
        content
      }
    });

    expect(html).toContain('Gunakan perintah berikut:');
    expect(html).toContain('df -h');
    expect(html).toContain('Periksa partisi root.');
    expect(html).toContain('Salin');
  });

  it('handles multiple code blocks and detects destructive commands inside them', () => {
    const content = `Hati-hati:
\`\`\`bash
rm -rf /tmp/cache
\`\`\`
Lalu restart:
\`\`\`bash
systemctl restart my-service
\`\`\``;

    const { html } = render(MessageBubble, {
      props: {
        role: 'assistant',
        content
      }
    });

    expect(html).toContain('Peringatan Berisiko');
    expect(html).toContain('rm -rf /tmp/cache');
    expect(html).toContain('systemctl restart my-service');
  });

  it('handles CRLF line endings and trailing whitespace after language identifier', () => {
    const content = 'Jalankan perintah:\r\n```bash   \r\nuptime\r\n```\r\nSelesai.';

    const { html } = render(MessageBubble, {
      props: {
        role: 'assistant',
        content
      }
    });

    expect(html).toContain('uptime');
    expect(html).toContain('Salin');
  });

  it('renders rich markdown formatting including bold, italic, headings, and inline code', () => {
    const content = `### Analisis Masalah
Container mengalami *restart loop* karena **OOM Killed**.
Gunakan perintah \`docker ps -a\` untuk investigasi:
- Cek status container
- Periksa log error`;

    const { html } = render(MessageBubble, {
      props: {
        role: 'assistant',
        content
      }
    });

    expect(html).toContain('<h3>Analisis Masalah</h3>');
    expect(html).toContain('<em>restart loop</em>');
    expect(html).toContain('<strong>OOM Killed</strong>');
    expect(html).toContain('<code>docker ps -a</code>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Cek status container</li>');
    expect(html).toContain('<li>Periksa log error</li>');
  });

  it('renders interactive recommendation chips for assistant message and hides raw tag', () => {
    const content = `Penyebabnya kemungkinan OOM Killed.

<!-- FOLLOW_UP_SUGGESTIONS: ["Bagaimana cara menambah swap?", "Cek penggunaan memory container"] -->`;

    const { html } = render(MessageBubble, {
      props: {
        role: 'assistant',
        content
      }
    });

    expect(html).toContain('Rekomendasi Pertanyaan:');
    expect(html).toContain('Bagaimana cara menambah swap?');
    expect(html).toContain('Cek penggunaan memory container');
    expect(html).not.toContain('FOLLOW_UP_SUGGESTIONS');
  });

  it('does not render recommendation chips when message has no suggestions', () => {
    const { html } = render(MessageBubble, {
      props: {
        role: 'assistant',
        content: 'Ini adalah respon biasa.'
      }
    });

    expect(html).not.toContain('Rekomendasi Pertanyaan:');
  });
});

describe('ChatArea Component', () => {
  it('renders list of messages', () => {
    const messages = [
      { id: '1', role: 'user', content: 'Halo InfraBot' },
      { id: '2', role: 'assistant', content: 'Halo! Ada yang bisa saya bantu terkait infrastruktur server Anda?' }
    ];

    const { html } = render(ChatArea, {
      props: {
        messages,
        isLoading: false
      }
    });

    expect(html).toContain('Halo InfraBot');
    expect(html).toContain('Halo! Ada yang bisa saya bantu terkait infrastruktur server Anda?');
    expect(html).not.toContain('InfraBot sedang menganalisis &amp; menyusun rekomendasi...');
  });

  it('renders empty container without messages', () => {
    const { html } = render(ChatArea, {
      props: {
        messages: [],
        isLoading: false
      }
    });

    expect(html).not.toContain('Anda');
    expect(html).not.toContain('InfraBot');
  });

  it('renders loading indicator when isLoading is true', () => {
    const { html } = render(ChatArea, {
      props: {
        messages: [{ id: '1', role: 'user', content: 'Cek server down' }],
        isLoading: true
      }
    });

    expect(html).toContain('Cek server down');
    expect(html).toContain('InfraBot sedang menganalisis &amp; menyusun rekomendasi...');
  });
});
