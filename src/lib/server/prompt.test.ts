import { describe, it, expect } from 'vitest';
import { INFRABOT_SYSTEM_PROMPT, buildSystemPrompt } from './prompt';

describe('INFRABOT_SYSTEM_PROMPT', () => {
  it('exports system prompt containing expected domain knowledge', () => {
    expect(INFRABOT_SYSTEM_PROMPT).toBeDefined();
    expect(typeof INFRABOT_SYSTEM_PROMPT).toBe('string');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('InfraBot');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('Linux Administration');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('Docker & Containerization');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('Proxmox Virtualization');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('MikroTik & Networking');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('Server Administration');
  });

  it('includes communication, recommendations, and safety guidelines', () => {
    expect(INFRABOT_SYSTEM_PROMPT).toContain('Indonesian');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('destructive commands');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('Rekomendasi Tindakan & Mitigasi Preventif');
    expect(INFRABOT_SYSTEM_PROMPT).toContain('FOLLOW_UP_SUGGESTIONS');
  });
});

describe('buildSystemPrompt', () => {
  it('returns base prompt if profile is undefined or empty', () => {
    expect(buildSystemPrompt()).toBe(INFRABOT_SYSTEM_PROMPT);
    expect(buildSystemPrompt({ os: '', techStack: '', specs: '', notes: '' })).toBe(
      INFRABOT_SYSTEM_PROMPT
    );
  });

  it('appends server profile memory details when provided', () => {
    const prompt = buildSystemPrompt({
      os: 'Ubuntu 24.04 LTS',
      techStack: 'Docker, Portainer, Nginx',
      specs: '4 vCPU, 8GB RAM, 100GB NVMe',
      notes: 'No root SSH access'
    });
    expect(prompt).toContain("User's Persistent Server Environment Profile (Memory)");
    expect(prompt).toContain('Server OS / Distro: Ubuntu 24.04 LTS');
    expect(prompt).toContain('Tech Stack & Versions: Docker, Portainer, Nginx');
    expect(prompt).toContain('Hardware & Specs: 4 vCPU, 8GB RAM, 100GB NVMe');
    expect(prompt).toContain('Additional Environment Notes: No root SSH access');
  });
});
