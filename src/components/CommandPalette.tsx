import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Bot, 
  Terminal, 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  UploadCloud, 
  Plus, 
  Key, 
  UserPlus, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowRight, 
  CornerDownLeft, 
  Sliders, 
  X,
  Zap,
  Command as CommandIcon,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Workspace } from '../types';
import { useToast } from './Toast';

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  category: 'Tabs' | 'Actions' | 'Workspace';
  icon: React.ElementType;
  shortcut?: string;
  tabId?: string;
  actionId?: string;
  badge?: string;
  keywords?: string[];
  roleRequired?: 'admin' | 'member';
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  user: User;
  workspace: Workspace;
  onToggleRole: () => void;
  onExecuteAction: (actionId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  user,
  workspace,
  onToggleRole,
  onExecuteAction,
}) => {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // All available palette items
  const allCommands: CommandItem[] = useMemo(() => [
    // Primary Actions
    {
      id: 'action_new_chat',
      title: 'Start New AI Chat Session',
      description: 'Clear context buffer and start a fresh Gemini streaming dialogue',
      category: 'Actions',
      icon: Plus,
      shortcut: '⌘N',
      tabId: 'chat',
      actionId: 'new_chat',
      badge: 'Action',
      keywords: ['chat', 'new', 'clear', 'conversation', 'talk', 'ask', 'prompt', 'gemini'],
    },
    {
      id: 'action_upload_doc',
      title: 'Upload Knowledge Document',
      description: 'Ingest PDF, Markdown, or code into the vector RAG knowledge vault',
      category: 'Actions',
      icon: UploadCloud,
      shortcut: '⌘U',
      tabId: 'documents',
      actionId: 'upload_doc',
      badge: 'Action',
      keywords: ['upload', 'document', 'pdf', 'rag', 'knowledge', 'vault', 'embedding', 'vector'],
    },
    {
      id: 'action_optimize_prompt',
      title: 'Optimize Raw Prompt with AI',
      description: 'Transform informal instructions into structured, enterprise-grade system prompts',
      category: 'Actions',
      icon: Sparkles,
      shortcut: '⌘O',
      tabId: 'prompts',
      actionId: 'optimize_prompt',
      badge: 'Action',
      keywords: ['prompt', 'optimize', 'tune', 'template', 'engineer', 'system prompt', 'ai'],
    },
    {
      id: 'action_invite_member',
      title: 'Invite Team Member',
      description: 'Add a new collaborator to the workspace with RBAC role permissions',
      category: 'Actions',
      icon: UserPlus,
      shortcut: '⌘I',
      tabId: 'team',
      actionId: 'invite_member',
      badge: 'Action',
      keywords: ['team', 'invite', 'user', 'collaborator', 'member', 'workspace'],
    },
    {
      id: 'action_create_api_key',
      title: 'Generate Workspace API Key',
      description: 'Create a new bearer token for headless REST API integration',
      category: 'Actions',
      icon: Key,
      shortcut: '⌘K',
      tabId: 'team',
      actionId: 'create_api_key',
      badge: 'Action',
      keywords: ['api key', 'token', 'secret', 'developer', 'bearer', 'rest', 'sdk'],
    },
    {
      id: 'action_upgrade_plan',
      title: 'Upgrade Subscription Plan',
      description: 'Switch to Pro or Enterprise for increased token velocity & vector partitions',
      category: 'Actions',
      icon: Zap,
      tabId: 'billing',
      actionId: 'upgrade_plan',
      badge: 'Billing',
      keywords: ['upgrade', 'billing', 'plan', 'pro', 'enterprise', 'tokens', 'stripe'],
    },
    {
      id: 'action_toggle_role',
      title: `Switch Role (Current: ${user.role.toUpperCase()})`,
      description: `Toggle active session permissions between Admin and Member`,
      category: 'Workspace',
      icon: Shield,
      shortcut: '⌘R',
      actionId: 'toggle_role',
      badge: 'Security',
      keywords: ['role', 'admin', 'member', 'permission', 'switch', 'security', 'rbac'],
    },
    {
      id: 'action_copy_key',
      title: 'Copy Workspace Secret Key',
      description: `Copy ${workspace.apiKey} to clipboard`,
      category: 'Workspace',
      icon: Copy,
      actionId: 'copy_api_key',
      badge: 'Clipboard',
      keywords: ['copy', 'api key', 'clipboard', 'secret', 'workspace'],
    },
    {
      id: 'action_refresh_telemetry',
      title: 'Refresh Observability Metrics',
      description: 'Pull latest PostHog telemetry logs and LLM token ingestion stats',
      category: 'Actions',
      icon: RefreshCw,
      tabId: 'analytics',
      actionId: 'refresh_telemetry',
      badge: 'Telemetry',
      keywords: ['refresh', 'telemetry', 'analytics', 'posthog', 'logs', 'metrics', 'tokens'],
    },

    // Navigation Tabs
    {
      id: 'tab_chat',
      title: 'AI Chat Studio',
      description: 'Interactive conversational copilot with multi-turn streaming & model switcher',
      category: 'Tabs',
      icon: Bot,
      shortcut: 'G C',
      tabId: 'chat',
      badge: 'Studio',
      keywords: ['chat', 'copilot', 'gemini', 'conversation', 'assistant', 'stream'],
    },
    {
      id: 'tab_prompts',
      title: 'Prompt Engineering Studio',
      description: 'Curated prompt library, parameter playground, and automated optimizer',
      category: 'Tabs',
      icon: Terminal,
      shortcut: 'G P',
      tabId: 'prompts',
      badge: 'Studio',
      keywords: ['prompt', 'studio', 'templates', 'engineering', 'playground', 'system'],
    },
    {
      id: 'tab_documents',
      title: 'Document RAG Knowledge Vault',
      description: 'Vector embeddings, chunk segmentation, and grounded semantic retrieval',
      category: 'Tabs',
      icon: FileText,
      shortcut: 'G D',
      tabId: 'documents',
      badge: 'Studio',
      keywords: ['document', 'rag', 'knowledge', 'vault', 'embeddings', 'pdf', 'chunks'],
    },
    {
      id: 'tab_team',
      title: 'Team & Workflows',
      description: 'Collaborative workspaces, multi-step agent pipelines, and API key management',
      category: 'Tabs',
      icon: Users,
      shortcut: 'G T',
      tabId: 'team',
      badge: 'Management',
      keywords: ['team', 'workflow', 'api keys', 'members', 'pipeline', 'collaboration'],
    },
    {
      id: 'tab_billing',
      title: 'Billing & Subscriptions',
      description: 'Manage token quotas, view simulated Stripe invoices, and upgrade tiers',
      category: 'Tabs',
      icon: CreditCard,
      shortcut: 'G B',
      tabId: 'billing',
      badge: 'Account',
      keywords: ['billing', 'subscription', 'pricing', 'stripe', 'invoice', 'tokens', 'credits'],
    },
    {
      id: 'tab_analytics',
      title: 'Usage & Telemetry Observability',
      description: 'Real-time token analytics, latency benchmarks, and PostHog event streams',
      category: 'Tabs',
      icon: BarChart3,
      shortcut: 'G A',
      tabId: 'analytics',
      badge: 'Observability',
      keywords: ['analytics', 'telemetry', 'usage', 'metrics', 'posthog', 'charts', 'tokens'],
    },
    {
      id: 'tab_admin',
      title: 'Platform Governance (Super Admin)',
      description: 'Global subscriber overview, runtime feature flags, and tenant controls',
      category: 'Tabs',
      icon: ShieldCheck,
      shortcut: 'G S',
      tabId: 'admin',
      badge: 'Super Admin',
      roleRequired: 'admin',
      keywords: ['admin', 'governance', 'feature flags', 'subscribers', 'system', 'security'],
    },
    {
      id: 'tab_landing',
      title: 'Platform Home & Overview',
      description: 'Explore platform capabilities, architecture benchmarks, and pricing overview',
      category: 'Tabs',
      icon: Globe,
      shortcut: 'G H',
      tabId: 'landing',
      badge: 'Home',
      keywords: ['home', 'landing', 'overview', 'features', 'architecture', 'start'],
    },
  ], [user.role, workspace.apiKey]);

  // Filter commands based on search query and category
  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allCommands.filter((cmd) => {
      // Role requirement check
      if (cmd.roleRequired && user.role !== cmd.roleRequired) {
        return false;
      }

      // Category check
      if (selectedCategory !== 'all' && cmd.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      if (!q) return true;

      const titleMatch = cmd.title.toLowerCase().includes(q);
      const descMatch = cmd.description.toLowerCase().includes(q);
      const catMatch = cmd.category.toLowerCase().includes(q);
      const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(q));

      return titleMatch || descMatch || catMatch || keywordMatch;
    });
  }, [allCommands, query, selectedCategory, user.role]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Ensure selected item is visible when scrolling with arrows
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-command-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Execute selected command
  const handleExecute = (cmd: CommandItem) => {
    onClose();

    if (cmd.actionId === 'toggle_role') {
      onToggleRole();
      return;
    }

    if (cmd.actionId === 'copy_api_key') {
      navigator.clipboard.writeText(workspace.apiKey);
      showToast('success', 'API Key Copied', `Copied ${workspace.apiKey} to clipboard.`);
      return;
    }

    if (cmd.tabId) {
      onNavigateTab(cmd.tabId);
    }

    if (cmd.actionId) {
      onExecuteAction(cmd.actionId);
    }
  };

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecute(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Palette Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[#080808] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col text-[#FAFAFA]"
            onKeyDown={handleKeyDown}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, search studio tabs, or trigger quick actions..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none font-medium"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center space-x-1 shrink-0">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">
                  ESC
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 px-4 py-2 bg-[#050505] border-b border-white/5 overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'actions', label: 'Quick Actions' },
                { id: 'tabs', label: 'Studio Tabs' },
                { id: 'workspace', label: 'Workspace & Security' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/5"
            >
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-white/80">No commands found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-white/40 max-w-sm mx-auto">
                    Try searching for keywords like &ldquo;chat&rdquo;, &ldquo;document&rdquo;, &ldquo;upload&rdquo;, &ldquo;prompt&rdquo;, &ldquo;api key&rdquo;, or &ldquo;billing&rdquo;.
                  </p>
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={cmd.id}
                      data-command-index={idx}
                      onClick={() => handleExecute(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                          : 'hover:bg-white/5 text-white/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div
                          className={`p-2 rounded-xl shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/5 text-indigo-400 group-hover:text-white group-hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs truncate text-white">
                              {cmd.title}
                            </span>
                            {cmd.badge && (
                              <span
                                className={`text-[9px] uppercase font-black tracking-wider px-1.5 py-0.2 rounded border ${
                                  cmd.category === 'Actions'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : cmd.category === 'Workspace'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                }`}
                              >
                                {cmd.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/40 truncate mt-0.5">
                            {cmd.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {cmd.shortcut && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 group-hover:text-white/70">
                            {cmd.shortcut}
                          </span>
                        )}
                        <CornerDownLeft
                          className={`w-3.5 h-3.5 transition-opacity ${
                            isSelected ? 'opacity-100 text-indigo-400' : 'opacity-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Status Bar with Hotkey Legend */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#050505] border-t border-white/10 text-[10px] font-mono text-white/40 gap-2">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="px-1 py-0.2 rounded bg-white/10 text-white/70">↑</span>
                  <span className="px-1 py-0.2 rounded bg-white/10 text-white/70">↓</span>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="px-1 py-0.2 rounded bg-white/10 text-white/70">↵</span>
                  <span>Select</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="px-1 py-0.2 rounded bg-white/10 text-white/70">ESC</span>
                  <span>Dismiss</span>
                </span>
              </div>
              <div className="flex items-center space-x-2 text-indigo-400 font-bold uppercase tracking-wider">
                <CommandIcon className="w-3 h-3" />
                <span>SynapseAI Command Palette</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
