import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  STORAGE_KEYS,
  DEFAULT_SERVER_PROFILE,
  getServerProfile,
  saveServerProfile,
  getChatSessions,
  saveChatSessions,
  getActiveSessionId,
  saveActiveSessionId,
  createChatSession,
  updateChatSession,
  deleteChatSession,
  clearAllChatSessions
} from './storage';

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('storage utility', () => {
  const originalWindow = globalThis.window;
  let mockStorage: LocalStorageMock;

  beforeAll(() => {
    mockStorage = new LocalStorageMock();
    (globalThis as any).window = {
      localStorage: mockStorage
    };
    (globalThis as any).localStorage = mockStorage;
  });

  afterAll(() => {
    (globalThis as any).window = originalWindow;
    delete (globalThis as any).localStorage;
  });

  beforeEach(() => {
    mockStorage.clear();
  });

  describe('server profile storage', () => {
    it('returns default empty profile when localStorage is empty', () => {
      const profile = getServerProfile();
      expect(profile).toEqual(DEFAULT_SERVER_PROFILE);
    });

    it('saves and retrieves server profile correctly', () => {
      const customProfile = {
        os: 'Ubuntu 24.04',
        techStack: 'Docker, Portainer',
        specs: '16GB RAM, 8 Core',
        notes: 'Prod environment'
      };
      saveServerProfile(customProfile);
      expect(getServerProfile()).toEqual(customProfile);
    });

    it('handles corrupted localStorage JSON gracefully', () => {
      mockStorage.setItem(STORAGE_KEYS.SERVER_PROFILE, '{ invalid-json');
      expect(getServerProfile()).toEqual(DEFAULT_SERVER_PROFILE);
    });
  });

  describe('chat session storage', () => {
    it('returns empty array when no sessions are saved', () => {
      expect(getChatSessions()).toEqual([]);
    });

    it('creates a new chat session and sets it as active', () => {
      const session = createChatSession('Bagaimana cara reboot docker container?');
      expect(session.id).toBeDefined();
      expect(session.title).toBe('Bagaimana cara reboot docker contain...');
      expect(session.messages).toEqual([]);

      const sessions = getChatSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(session.id);
      expect(getActiveSessionId()).toBe(session.id);
    });

    it('updates session messages and modifies updatedAt', () => {
      const session = createChatSession('Test obrolan');
      const messages = [
        { role: 'user' as const, content: 'Test obrolan' },
        { role: 'assistant' as const, content: 'Solusi: cek status.' }
      ];

      updateChatSession(session.id, messages);
      const updatedSessions = getChatSessions();
      expect(updatedSessions[0].messages).toHaveLength(2);
      expect(updatedSessions[0].messages[1].content).toBe('Solusi: cek status.');
    });

    it('deletes an individual chat session and updates active session if needed', () => {
      const sess1 = createChatSession('Sesi 1');
      const sess2 = createChatSession('Sesi 2');

      expect(getActiveSessionId()).toBe(sess2.id);
      deleteChatSession(sess2.id);

      const remaining = getChatSessions();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(sess1.id);
      expect(getActiveSessionId()).toBe(sess1.id);
    });

    it('clears all chat sessions and active session state', () => {
      createChatSession('Sesi 1');
      createChatSession('Sesi 2');

      expect(getChatSessions()).toHaveLength(2);
      clearAllChatSessions();

      expect(getChatSessions()).toEqual([]);
      expect(getActiveSessionId()).toBeNull();
    });
  });
});
