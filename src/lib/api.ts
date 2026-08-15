import { ChatMessage, User, KnowledgeDoc, PostHogEventLog, SystemOverview } from '../types';

export const api = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Auth switch role / plan
  async switchRole(role: string, plan: string): Promise<{ success: boolean; user: User; message: string }> {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, plan }),
    });
    return await res.json();
  },

  // Non-streaming chat
  async sendChat(params: {
    messages: { role: string; content: string }[];
    model?: string;
    systemPrompt?: string;
    temperature?: number;
  }): Promise<{ role: string; content: string; tokens: number; model: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate response');
    }
    return await res.json();
  },

  // Streaming chat using SSE
  async streamChat(
    params: {
      messages: { role: string; content: string }[];
      model?: string;
      systemPrompt?: string;
      temperature?: number;
    },
    onChunk: (chunk: string) => void,
    onDone: (tokens: number) => void,
    onError: (err: string) => void
  ) {
    try {
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '').trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                onChunk(data.text);
              }
              if (data.done) {
                onDone(data.tokens || 150);
              }
              if (data.error) {
                onError(data.error);
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
      }
    } catch (err: any) {
      onError(err.message || 'Stream error occurred');
    }
  },

  // Prompt optimizer
  async optimizePrompt(rawPrompt: string, goal?: string) {
    const res = await fetch('/api/ai/optimize-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawPrompt, goal }),
    });
    return await res.json();
  },

  // Document analysis
  async analyzeDocument(name: string, content: string, type: string) {
    const res = await fetch('/api/ai/document/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, type }),
    });
    return await res.json();
  },

  // RAG grounded query
  async ragQuery(query: string, documentContext: string, docName: string) {
    const res = await fetch('/api/ai/document/rag-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, documentContext, docName }),
    });
    return await res.json();
  },

  // Workflow step runner
  async runWorkflowStep(stepTitle: string, stepType: string, inputData: any) {
    const res = await fetch('/api/ai/workflow/run-step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepTitle, stepType, inputData }),
    });
    return await res.json();
  },

  // Log PostHog telemetry event
  async logTelemetry(event: string, properties: Record<string, any> = {}) {
    try {
      const res = await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Get telemetry logs
  async getTelemetryLogs(): Promise<{ logs: PostHogEventLog[] }> {
    const res = await fetch('/api/analytics/events');
    return await res.json();
  },

  // Create Stripe checkout session simulation
  async createCheckoutSession(planId: string, billingCycle: 'monthly' | 'yearly') {
    const res = await fetch('/api/billing/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, billingCycle }),
    });
    return await res.json();
  },

  // Confirm payment in test mode
  async confirmPayment(planId: string, paymentMethodId: string) {
    const res = await fetch('/api/billing/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, paymentMethodId }),
    });
    return await res.json();
  },

  // Get admin overview
  async getAdminOverview(): Promise<SystemOverview & { users: User[] }> {
    const res = await fetch('/api/admin/overview');
    return await res.json();
  },

  // Get admin stats formatted
  async getAdminStats(): Promise<{ stats: any; users: User[] }> {
    const res = await fetch('/api/admin/overview');
    const data = await res.json();
    return {
      stats: {
        totalUsers: data.totalUsers || 1482,
        activeSubscriptions: data.activeWorkspaces || 890,
        mrr: data.mrr || 42850,
        totalTokensProcessed: data.totalTokensProcessed || 84200000,
        systemHealth: 'optimal',
      },
      users: data.users || [],
    };
  },

  // Toggle user status
  async toggleUserStatus(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
      method: 'POST',
    });
    return await res.json();
  },
};
