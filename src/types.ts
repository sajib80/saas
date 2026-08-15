export type UserRole = 'admin' | 'member' | 'viewer';
export type PlanTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  workspaceId: string;
  plan: PlanTier;
  tokensUsed: number;
  tokensLimit: number;
  apiCallsCount: number;
  createdAt: string;
  status?: 'active' | 'suspended';
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number;
  totalTokensProcessed: number;
  systemHealth: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joinedAt: string;
  status: 'active' | 'invited' | 'suspended';
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: WorkspaceMember[];
  apiKey: string;
  apiCallsTotal: number;
  settings: {
    allowMemberInvites: boolean;
    requireTwoFactor: boolean;
    defaultModel: string;
  };
}

export interface GroundingSource {
  title: string;
  uri: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  tokens?: number;
  groundingSources?: GroundingSource[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  systemPrompt?: string;
  temperature: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  tokensTotal?: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: 'copywriting' | 'coding' | 'marketing' | 'analysis' | 'support' | 'product';
  template: string;
  variables: string[];
  likes: number;
  usesCount: number;
  isPublic: boolean;
  author: string;
}

export interface DocumentChunk {
  id: string;
  chunkIndex: number;
  text: string;
  similarityScore?: number;
}

export interface KnowledgeDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  summary: string;
  keyInsights: string[];
  chunksCount: number;
  chunks?: DocumentChunk[];
  embeddingsStatus: 'ready' | 'processing' | 'failed';
  uploadedAt: string;
  authorName: string;
  tokensEstimated: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  type: 'prompt' | 'summarize' | 'translate' | 'extract' | 'webhook';
  config: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'failed';
  output?: string;
}

export interface AIProject {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  category: string;
  steps: WorkflowStep[];
  lastRun?: string;
  collaborators: string[];
  createdAt: string;
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  tokensPerMonth: number;
  maxTeamMembers: number;
  features: string[];
  popular?: boolean;
  modelAccess: string[];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  planName: string;
  pdfUrl?: string;
}

export interface DailyUsage {
  date: string;
  tokensUsed: number;
  apiCalls: number;
  costEstimate: number;
  latencyMs: number;
  geminiFlashUsage: number;
  geminiProUsage: number;
}

export interface PostHogEventLog {
  id: string;
  event: string;
  userId: string;
  userEmail: string;
  timestamp: string;
  properties: Record<string, any>;
}

export interface SystemOverview {
  totalUsers: number;
  activeWorkspaces: number;
  mrr: number;
  totalTokensProcessed: number;
  systemUptime: number;
  averageLatencyMs: number;
  errorRate: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  workspace: Workspace;
}
