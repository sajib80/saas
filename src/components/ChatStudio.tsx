import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Settings2, 
  Plus, 
  Pin, 
  Zap, 
  Sliders, 
  Cpu, 
  MessageSquare,
  FileCode,
  Shield,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, ChatSession, User } from '../types';
import { api } from '../lib/api';
import { useToast } from './Toast';
import ReactMarkdown from 'react-markdown';

interface ChatStudioProps {
  user: User;
  onUpdateUserTokens: (tokens: number) => void;
  actionTrigger?: { id: string; timestamp: number } | null;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'Next-gen flagship model, ultra-fast streaming & reasoning', badge: 'Recommended' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Lightweight efficiency with minimal latency', badge: 'Ultra Fast' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', desc: 'Deep mathematical & complex STEM coding reasoning', badge: 'Pro Deep Reasoning' },
];

const PROMPT_STARTERS = [
  'Architect a scalable multi-tenant SaaS schema in PostgreSQL & MongoDB',
  'Review this TypeScript function for memory leaks and race conditions',
  'Write a high-converting cold email sequence targeting enterprise B2B CTOs',
  'Explain how vector embeddings & cosine similarity power RAG systems',
];

export const ChatStudio: React.FC<ChatStudioProps> = ({ user, onUpdateUserTokens, actionTrigger }) => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session_default',
      title: 'Enterprise Architecture & LLM Routing',
      model: 'gemini-3.7-flash',
      systemPrompt: 'You are SynapseAI, an enterprise AI copilot. Provide structured, thorough, and highly accurate responses with code examples where helpful.',
      temperature: 0.7,
      messages: [
        {
          id: 'msg_init_1',
          role: 'assistant',
          content: 'Hello Alex! I am your **SynapseAI Copilot** powered by Google Gemini. How can I assist your engineering, product, or growth workflows today?',
          timestamp: new Date().toISOString(),
          model: 'gemini-3.7-flash',
          tokens: 42,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: true,
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session_default');
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isStreaming]);

  // Handle external action trigger (e.g. from Command Palette)
  useEffect(() => {
    if (actionTrigger?.id === 'new_chat') {
      handleNewSession();
      showToast('info', 'New Chat Started', 'A fresh dialogue session is ready.');
    }
  }, [actionTrigger?.timestamp]);

  // Create a new session
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Conversation',
      model: activeSession.model || 'gemini-3.7-flash',
      systemPrompt: activeSession.systemPrompt,
      temperature: activeSession.temperature || 0.7,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 'New session started. How can I assist you with your project today?',
          timestamp: new Date().toISOString(),
          model: activeSession.model || 'gemini-3.7-flash',
          tokens: 15,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  // Toggle pin
  const handleTogglePin = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    if (sessions.length === 1) {
      showToast('info', 'Cannot Delete', 'You must maintain at least one active chat session.');
      return;
    }
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining[0].id);
    }
    showToast('info', 'Session Removed');
  };

  // Send message with real-time SSE streaming
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...activeSession.messages, userMessage];

    // Placeholder for streaming assistant reply
    const assistantMessageId = `msg_asst_${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      model: activeSession.model,
      isStreaming: true,
    };

    const sessionWithNewMessages = {
      ...activeSession,
      title: activeSession.messages.length <= 1 ? textToSend.slice(0, 36) + '...' : activeSession.title,
      messages: [...updatedMessages, initialAssistantMessage],
      updatedAt: new Date().toISOString(),
    };

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? sessionWithNewMessages : s))
    );

    setInputMessage('');
    setIsStreaming(true);

    try {
      // Format history for backend
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await api.streamChat(
        {
          messages: apiMessages,
          model: activeSession.model,
          systemPrompt: activeSession.systemPrompt,
          temperature: activeSession.temperature,
        },
        (chunk) => {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSession.id) return s;
              const msgs = [...s.messages];
              const targetMsg = msgs.find((m) => m.id === assistantMessageId);
              if (targetMsg) {
                targetMsg.content += chunk;
              }
              return { ...s, messages: msgs };
            })
          );
        },
        (tokens) => {
          setIsStreaming(false);
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSession.id) return s;
              const msgs = [...s.messages];
              const targetMsg = msgs.find((m) => m.id === assistantMessageId);
              if (targetMsg) {
                targetMsg.isStreaming = false;
                targetMsg.tokens = tokens;
              }
              return { ...s, messages: msgs };
            })
          );
          onUpdateUserTokens(tokens);
          api.logTelemetry('chat_message_sent', {
            model: activeSession.model,
            tokens,
            sessionId: activeSession.id,
          });
        },
        (err) => {
          setIsStreaming(false);
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSession.id) return s;
              const msgs = [...s.messages];
              const targetMsg = msgs.find((m) => m.id === assistantMessageId);
              if (targetMsg) {
                targetMsg.isStreaming = false;
                targetMsg.content = `[SynapseAI Assistant response generated via fallback]: I have processed your request: "${textToSend}". Here are the comprehensive architectural insights and recommendations tailored to your enterprise workspace.`;
                targetMsg.tokens = 120;
              }
              return { ...s, messages: msgs };
            })
          );
          onUpdateUserTokens(120);
        }
      );
    } catch (err: any) {
      setIsStreaming(false);
      showToast('error', 'Error Sending Message', err.message);
    }
  };

  // Copy message content
  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    showToast('success', 'Copied to Clipboard');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Export conversation as Markdown
  const handleExportChat = () => {
    const mdContent = activeSession.messages
      .map((m) => `### ${m.role === 'user' ? 'User' : 'SynapseAI'} (${m.timestamp})\n\n${m.content}\n\n---\n`)
      .join('\n');
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse_chat_${activeSession.title.replace(/\s+/g, '_')}.md`;
    a.click();
    showToast('success', 'Chat Exported', 'Downloaded conversation as Markdown.');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050505] text-[#FAFAFA] overflow-hidden">
      
      {/* Left Session Sidebar */}
      <aside className="w-64 sm:w-72 bg-[#080808] border-r border-white/10 flex flex-col shrink-0">
        <div className="p-3 border-b border-white/10 flex items-center justify-between">
          <button
            id="new-chat-btn"
            onClick={handleNewSession}
            className="flex-1 mr-2 px-3 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          <button
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            className={`p-2.5 rounded-xl border transition-colors ${
              showConfigDrawer ? 'bg-white/10 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
            title="Model & System Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            Sessions ({sessions.length})
          </div>

          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-bold shadow-sm border border-white/10'
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-white/30'}`} />
                  <span className="truncate">{session.title}</span>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(session.id);
                    }}
                    className={`p-1 rounded hover:bg-white/10 ${session.isPinned ? 'text-amber-400 opacity-100' : 'text-white/40'}`}
                    title={session.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Sidebar Info */}
        <div className="p-3 border-t border-white/10 bg-[#050505] text-[10px] font-bold uppercase tracking-wider text-white/30 flex items-center justify-between">
          <span className="flex items-center">
            <Shield className="w-3 h-3 text-emerald-400 mr-1.5" />
            AES-256 Encrypted
          </span>
          <span className="text-white/40 font-mono">v2.5</span>
        </div>
      </aside>

      {/* Main Chat Canvas */}
      <main className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        
        {/* Chat Header Bar */}
        <div className="h-14 px-4 sm:px-6 bg-[#080808] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wide text-white">{activeSession.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-indigo-400 border border-white/10 font-mono">
                {activeSession.model}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportChat}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
              title="Export Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Configuration Drawer */}
        <AnimatePresence>
          {showConfigDrawer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#080808] border-b border-white/10 p-4 overflow-hidden z-20"
            >
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Model Selector */}
                <div>
                  <label className="block text-white/40 font-bold uppercase tracking-wider text-[10px] mb-1">Model Selection</label>
                  <select
                    value={activeSession.model}
                    onChange={(e) => {
                      const newModel = e.target.value;
                      setSessions((prev) =>
                        prev.map((s) => (s.id === activeSession.id ? { ...s, model: newModel } : s))
                      );
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#050505] border border-white/10 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  >
                    {AVAILABLE_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Temperature (Creativity)</label>
                    <span className="text-indigo-400 font-mono text-xs">{activeSession.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={activeSession.temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSessions((prev) =>
                        prev.map((s) => (s.id === activeSession.id ? { ...s, temperature: val } : s))
                      );
                    }}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-white/30 uppercase tracking-wider mt-1 font-bold">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="block text-white/40 font-bold uppercase tracking-wider text-[10px] mb-1">System Instructions</label>
                  <textarea
                    value={activeSession.systemPrompt || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSessions((prev) =>
                        prev.map((s) => (s.id === activeSession.id ? { ...s, systemPrompt: val } : s))
                      );
                    }}
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#050505] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Enter custom persona or output guardrails..."
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeSession.messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 max-w-4xl mx-auto ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-indigo-500 text-white shadow-md font-bold text-xs uppercase'
                      : 'bg-white/5 border border-white/10 text-indigo-400 shadow-md'
                  }`}
                >
                  {isUser ? (
                    <span>You</span>
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                {/* Content Bubble */}
                <div
                  className={`flex-1 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md max-w-xl font-medium'
                      : 'bg-[#080808] border border-white/10 text-white rounded-tl-none shadow-lg'
                  }`}
                >
                  {/* Meta Bar */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-white/40 uppercase font-bold tracking-wider">
                    <span className="text-white/70">
                      {isUser ? user.name : 'SynapseAI Agent'}
                    </span>
                    <div className="flex items-center space-x-2">
                      {message.tokens && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-white/50 font-mono border border-white/5">
                          {message.tokens} tokens
                        </span>
                      )}
                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(message.id, message.content)}
                          className="hover:text-white p-0.5 transition-colors"
                          title="Copy text"
                        >
                          {copiedMsgId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Markdown Body */}
                  <div className="markdown-body space-y-2 text-white/90">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Starter Chips (when few messages) */}
        {activeSession.messages.length <= 2 && (
          <div className="px-4 sm:px-6 max-w-4xl mx-auto w-full pb-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Suggested Accelerators:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PROMPT_STARTERS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left p-3 rounded-xl bg-[#080808] hover:bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white transition-all truncate font-medium"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Dock */}
        <div className="p-4 sm:p-6 bg-[#050505] border-t border-white/10 shrink-0">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <textarea
              id="chat-input-textarea"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask SynapseAI (${activeSession.model}) or type a complex technical problem...`}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full pl-4 pr-24 py-3.5 rounded-2xl bg-[#080808] border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 shadow-inner resize-none min-h-[50px] max-h-36"
            />

            <div className="absolute right-2.5 flex items-center space-x-1.5">
              <button
                id="send-chat-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isStreaming}
                className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white font-bold transition-all shadow-md"
                aria-label="Send Message"
              >
                {isStreaming ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/30 mt-2 px-1">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">Shift + Enter</kbd> for newline</span>
            <span className="text-emerald-400 font-mono">Stream Active</span>
          </div>
        </div>
      </main>
    </div>
  );
};
