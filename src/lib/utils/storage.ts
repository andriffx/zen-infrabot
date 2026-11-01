import type { ServerProfile, ChatSession, Message } from '#lib/schemas/chat';
import { serverProfileSchema, chatSessionSchema } from '#lib/schemas/chat';

export const STORAGE_KEYS = {
  SERVER_PROFILE: 'infrabot_server_profile',
  CHAT_SESSIONS: 'infrabot_chat_sessions',
  ACTIVE_SESSION_ID: 'infrabot_active_session_id'
} as const;

export const DEFAULT_SERVER_PROFILE: ServerProfile = {
  os: '',
  techStack: '',
  specs: '',
  notes: ''
};

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function formatSessionTitle(text: string): string {
  const clean = text
    .replace(/^#+\s*/, '')
    .replace(/[*_`~]/g, '')
    .trim();
  if (!clean) return 'Obrolan Baru';
  return clean.length > 36 ? clean.slice(0, 36) + '...' : clean;
}

/**
 * Retrieves the stored server profile memory from localStorage.
 */
export function getServerProfile(): ServerProfile {
  if (!isClient()) return { ...DEFAULT_SERVER_PROFILE };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVER_PROFILE);
    if (!raw) return { ...DEFAULT_SERVER_PROFILE };
    const parsed = JSON.parse(raw);
    return serverProfileSchema.parse(parsed);
  } catch {
    return { ...DEFAULT_SERVER_PROFILE };
  }
}

/**
 * Persists the server profile memory to localStorage.
 */
export function saveServerProfile(profile: ServerProfile): void {
  if (!isClient()) return;
  try {
    const valid = serverProfileSchema.parse(profile);
    localStorage.setItem(STORAGE_KEYS.SERVER_PROFILE, JSON.stringify(valid));
  } catch (err) {
    console.error('Failed to save server profile to localStorage:', err);
  }
}

/**
 * Retrieves all chat sessions from localStorage, sorted by updatedAt descending.
 */
export function getChatSessions(): ChatSession[] {
  if (!isClient()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const sessions: ChatSession[] = [];
    for (const item of parsed) {
      const result = chatSessionSchema.safeParse(item);
      if (result.success) {
        sessions.push(result.data);
      }
    }

    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

/**
 * Persists all chat sessions to localStorage.
 */
export function saveChatSessions(sessions: ChatSession[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save chat sessions to localStorage:', err);
  }
}

/**
 * Retrieves the active session ID from localStorage.
 */
export function getActiveSessionId(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
}

/**
 * Persists the active session ID to localStorage.
 */
export function saveActiveSessionId(id: string | null): void {
  if (!isClient()) return;
  if (id === null) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id);
  }
}

/**
 * Creates a new chat session and saves it to localStorage.
 */
export function createChatSession(firstUserMessage = '', messages: Message[] = []): ChatSession {
  const now = Date.now();
  const session: ChatSession = {
    id: generateId(),
    title: formatSessionTitle(firstUserMessage),
    messages,
    createdAt: now,
    updatedAt: now
  };

  const sessions = getChatSessions();
  sessions.unshift(session);
  saveChatSessions(sessions);
  saveActiveSessionId(session.id);

  return session;
}

/**
 * Updates an existing chat session with new messages and updates its timestamp.
 */
export function updateChatSession(id: string, messages: Message[]): void {
  const sessions = getChatSessions();
  const index = sessions.findIndex((s) => s.id === id);

  if (index === -1) {
    // Session not found, create one
    const firstUserMsg = messages.find((m) => m.role === 'user')?.content || '';
    const now = Date.now();
    const newSession: ChatSession = {
      id,
      title: formatSessionTitle(firstUserMsg),
      messages,
      createdAt: now,
      updatedAt: now
    };
    sessions.unshift(newSession);
    saveChatSessions(sessions);
    return;
  }

  const existing = sessions[index];
  const firstUserMsg = messages.find((m) => m.role === 'user')?.content || '';
  const title =
    existing.title === 'Obrolan Baru' && firstUserMsg
      ? formatSessionTitle(firstUserMsg)
      : existing.title;

  sessions[index] = {
    ...existing,
    title,
    messages,
    updatedAt: Date.now()
  };

  saveChatSessions(sessions);
}

/**
 * Deletes a single chat session from localStorage.
 */
export function deleteChatSession(id: string): void {
  const sessions = getChatSessions().filter((s) => s.id !== id);
  saveChatSessions(sessions);

  const activeId = getActiveSessionId();
  if (activeId === id) {
    const nextSession = sessions[0];
    saveActiveSessionId(nextSession ? nextSession.id : null);
  }
}

/**
 * Clears all chat sessions and active session state from localStorage.
 */
export function clearAllChatSessions(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEYS.CHAT_SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
}

