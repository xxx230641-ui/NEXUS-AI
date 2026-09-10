// NEXUS Platform Standard API Client with JWT session management and WebSocket/Polling sync

export interface ApiClientConfig {
  baseUrl?: string;
}

export class NexusApiClient {
  private baseUrl: string;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Nexus-Version': '2026.1.0',
    };

    const token = localStorage.getItem('nexus_jwt_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (res.status === 401) {
      console.warn('NEXUS API Client: Unauthorized (401). Redirecting or refreshing token...');
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'HTTP Error ' + res.status }));
      throw new Error(errorData.error || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async loginGoogle(code: string) {
    return this.request<{ user: any; token: string }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Contexts
  async getContexts() {
    return this.request<any[]>('/api/contexts');
  }

  async getCurrentContext() {
    return this.request<any>('/api/contexts/current');
  }

  async activateContext(contextId: string) {
    return this.request<{ success: boolean; activatedContext: any }>(`/api/contexts/${contextId}/activate`, {
      method: 'POST',
    });
  }

  // Notifications
  async getNotifications(params?: { unreadOnly?: boolean; context?: string }) {
    const query = new URLSearchParams();
    if (params?.unreadOnly) query.append('unreadOnly', 'true');
    if (params?.context) query.append('context', params.context);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ notifications: any[]; unreadCount: number; totalCount: number }>(`/api/notifications${queryString}`);
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean; notification: any }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  // Neo4j Graph
  async getGraphData(context?: string) {
    const query = context ? `?context=${encodeURIComponent(context)}` : '';
    return this.request<{ nodes: any[]; edges: any[]; cypherQueryExecuted: string; neo4jConnected: boolean }>(`/api/graph${query}`);
  }

  // Conflicts
  async getConflicts() {
    return this.request<any[]>('/api/conflicts');
  }

  // Integrations
  async getIntegrations() {
    return this.request<any[]>('/api/integrations');
  }

  async connectIntegration(provider: string) {
    return this.request<{ success: boolean; provider: string }>(`/api/integrations/${provider}/connect`, {
      method: 'POST',
    });
  }

  async disconnectIntegration(provider: string) {
    return this.request<{ success: boolean; provider: string }>(`/api/integrations/${provider}/disconnect`, {
      method: 'DELETE',
    });
  }

  async syncAppIntegration(provider: string, payload?: any) {
    return this.request<{
      provider: string;
      status: string;
      source: string;
      itemsProcessed: number;
      items: any[];
      extractedEntities: any[];
      insights: string[];
      contextDistribution: Record<string, string>;
      engine: string;
      timestamp: string;
    }>(`/api/integrations/${provider}/sync`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // AI Engine
  async classifyText(text: string) {
    return this.request<{ context: string; confidence: number; entities: any[] }>('/api/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async summarizeDocs(documents: string[], promptText?: string) {
    return this.request<{ summary: string; topKChunksUsed: number; vectorScoreAvg: number }>('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ documents, promptText }),
    });
  }

  async getPreMeetingBriefing(eventId: string) {
    return this.request<any>(`/api/briefing/${eventId}`);
  }

  // Google Workspace Direct & Neural Integration APIs
  async getGoogleCalendar(token?: string) {
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return this.request<{ source: string; itemsCount: number; events: any[]; timestamp: string }>(`/api/google/calendar${query}`);
  }

  async getGmail(token?: string) {
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return this.request<{ source: string; itemsCount: number; messages: any[]; timestamp: string }>(`/api/google/gmail${query}`);
  }

  async getGoogleTasks(token?: string) {
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    return this.request<{ source: string; itemsCount: number; tasks: any[]; timestamp: string }>(`/api/google/tasks${query}`);
  }

  async analyzeWorkspace(data: { calendarEvents?: any[]; emails?: any[]; tasks?: any[] }) {
    return this.request<{
      status: string;
      totalItemsIngested: number;
      insights: string[];
      conflicts?: any[];
      topActionableItems?: string[];
      contextDistribution: Record<string, string>;
      engine: string;
      timestamp: string;
    }>('/api/google/analyze-workspace', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new NexusApiClient();
