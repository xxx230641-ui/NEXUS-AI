import { UserProfile, Language } from '../types';

export interface UserSession {
  user: UserProfile;
  token: string;
  expiresAt: number;
  scopes: string[];
  zeroKnowledgeKey: string;
}

export const OAUTH_SCOPES = [
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/slack.read',
];

const SESSION_STORAGE_KEY = 'nexus_session_v1';

export function getStoredSession(): UserSession | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;
    const session: UserSession = JSON.parse(data);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (err) {
    return null;
  }
}

export function saveSession(session: UserSession): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

export function createMockSession(email: string = 'xxx230641@gmail.com', name: string = 'Alex Mercer'): UserSession {
  return {
    user: {
      id: 'usr-' + Date.now(),
      email,
      name,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      connectedAppsCount: 5,
    },
    token: 'jwt_nexus_sec_' + Math.random().toString(36).substring(2),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1-year persistent session
    scopes: OAUTH_SCOPES,
    zeroKnowledgeKey: 'zk_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
  };
}
