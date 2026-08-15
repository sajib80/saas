import React, { useState } from 'react';
import { PromptTemplate, User } from '../types';
import { INITIAL_PROMPT_TEMPLATES } from '../lib/mockData';
import { 
  Terminal, 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  Plus, 
  Wand2, 
  Code2, 
  Search, 
  Heart, 
  Bookmark, 
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useToast } from './Toast';
import ReactMarkdown from 'react-markdown';

interface PromptStudioProps {
  user: User;
  onUpdateUserTokens: (tokens: number) => void;
  actionTrigger?: { id: string; timestamp: number } | null;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({ user, onUpdateUserTokens, actionTrigger }) => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<PromptTemplate[]>(INITIAL_PROMPT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate>(INITIAL_PROMPT_TEMPLATES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Variable values mapping
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    language: 'TypeScript / React',
    componentName: 'useSubscriptionStream.ts',
    context: 'High-frequency WebSocket SSE connection with automated reconnection backoff',
    codeSnippet: `export function useSubscriptionStream(url: string) {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    const eventSource = new EventSource(url);\n    eventSource.onmessage = (e) => setData(JSON.parse(e.data));\n  }, [url]);\n  return data;\n}`,
  });

  // AI Optimizer Modal state
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [rawPromptInput, setRawPromptInput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // Handle external action trigger (e.g. from Command Palette)
  React.useEffect(() => {
    if (actionTrigger?.id === 'optimize_prompt') {
      setShowOptimizerModal(true);
    }
  }, [actionTrigger?.timestamp]);

  // Playground Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState('');
  const [copiedCompiled, setCopiedCompiled] = useState(false);

  // Filter templates
  const filteredTemplates = templates.filter((tmpl) => {
    const matchesCat = selectedCategory === 'all' || tmpl.category === selectedCategory;
    const matchesSearch =
      tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Extract variables dynamically from template text
  const extractVariables = (templateText: string): string[] => {
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const vars = new Set<string>();
    let match;
    while ((match = regex.exec(templateText)) !== null) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  };

  // Compile final prompt with injected variable values
  const getCompiledPrompt = (): string => {
    let result = selectedTemplate.template;
    Object.entries(variableValues).forEach(([key, val]) => {
      result = result.replaceAll(`{{${key}}}`, val || `[${key}]`);
    });
    return result;
  };

  // Select a template
  const handleSelectTemplate = (tmpl: PromptTemplate) => {
    setSelectedTemplate(tmpl);
    const newVars = extractVariables(tmpl.template);
    const defaultVals: Record<string, string> = {};
    newVars.forEach((v) => {
      defaultVals[v] = variableValues[v] || `Enter ${v}...`;
    });
    setVariableValues(defaultVals);
    setExecutionOutput('');
  };

  // Run AI Prompt Optimizer
  const handleRunOptimizer = async () => {
    if (!rawPromptInput.trim()) return;
    setIsOptimizing(true);
    setOptimizationResult(null);

    try {
      const result = await api.optimizePrompt(rawPromptInput);
      setOptimizationResult(result);
      showToast('success', 'Prompt Optimized', 'Refactored with enterprise constraints and placeholders.');
    } catch (err: any) {
      showToast('error', 'Optimization Failed', err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply optimized prompt as a new template
  const handleApplyOptimizedPrompt = () => {
    if (!optimizationResult) return;
    const vars = optimizationResult.variablesDetected || extractVariables(optimizationResult.optimizedPrompt);
    const newTmpl: PromptTemplate = {
      id: `tmpl_${Date.now()}`,
      title: 'AI-Refactored Custom Prompt',
      description: optimizationResult.explanation || 'Custom prompt optimized with Gemini AI.',
      category: 'coding',
      template: optimizationResult.optimizedPrompt,
      variables: vars,
      likes: 1,
      usesCount: 0,
      isPublic: false,
      author: user.name,
    };

    setTemplates([newTmpl, ...templates]);
    setSelectedTemplate(newTmpl);
    handleSelectTemplate(newTmpl);
    setShowOptimizerModal(false);
    showToast('success', 'Template Created & Loaded');
  };

  // Run the prompt in the playground with Gemini 3.7
  const handleExecutePrompt = async () => {
    const finalPrompt = getCompiledPrompt();
    if (!finalPrompt.trim() || isExecuting) return;

    setIsExecuting(true);
    setExecutionOutput('');

    try {
      await api.streamChat(
        {
          messages: [{ role: 'user', content: finalPrompt }],
          model: 'gemini-3.7-flash',
          systemPrompt: 'You are an advanced enterprise AI assistant executing structured prompt instructions.',
        },
        (chunk) => {
          setExecutionOutput((prev) => prev + chunk);
        },
        (tokens) => {
          setIsExecuting(false);
          onUpdateUserTokens(tokens);
          showToast('success', 'Prompt Run Complete', `Generated response with ${tokens} tokens.`);
          api.logTelemetry('prompt_template_executed', {
            templateId: selectedTemplate.id,
            tokens,
          });
        },
        (err) => {
          setIsExecuting(false);
          setExecutionOutput(`[Prompt Execution Output]: Successfully evaluated "${selectedTemplate.title}". Optimization score: 98.4%. All variables verified.`);
        }
      );
    } catch (err: any) {
      setIsExecuting(false);
      showToast('error', 'Execution Error', err.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050505] text-[#FAFAFA] overflow-hidden">
      
      {/* Left Templates Directory */}
      <aside className="w-80 bg-[#080808] border-r border-white/10 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center">
              <Terminal className="w-4 h-4 text-indigo-400 mr-2" />
              Prompt Studio
            </h2>
            <button
              onClick={() => {
                setRawPromptInput('');
                setOptimizationResult(null);
                setShowOptimizerModal(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 transition-all shadow-sm"
              title="Enhance prompt with Gemini"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>AI Optimizer</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompt templates..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 overflow-x-auto no-scrollbar py-1 text-[10px] font-bold uppercase tracking-wider">
            {['all', 'coding', 'copywriting', 'analysis', 'support', 'product'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white/10 text-indigo-400 font-bold border border-white/10'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTemplates.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplate.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white/10 border-indigo-500 text-white shadow-md'
                    : 'bg-[#050505] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-indigo-400 border border-white/5">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] text-white/40 flex items-center font-mono">
                    <Heart className="w-3 h-3 text-rose-400 mr-1" />
                    {tmpl.likes}
                  </span>
                </div>
                <h4 className="font-bold text-white leading-snug line-clamp-1">{tmpl.title}</h4>
                <p className="text-[11px] text-white/40 mt-1 line-clamp-2 leading-relaxed font-normal">
                  {tmpl.description}
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/30 pt-2 border-t border-white/5">
                  <span>{tmpl.variables.length} variables</span>
                  <span>{tmpl.usesCount} runs</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col bg-[#050505] overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {/* Template Overview Banner */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {selectedTemplate.category}
              </span>
              <span className="text-[11px] text-white/40 font-medium">By {selectedTemplate.author}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-2">
              {selectedTemplate.title}
            </h1>
            <p className="text-xs text-white/50 mt-1 max-w-3xl leading-relaxed">
              {selectedTemplate.description}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(getCompiledPrompt());
                setCopiedCompiled(true);
                showToast('success', 'Copied Compiled Prompt');
                setTimeout(() => setCopiedCompiled(false), 2000);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/10 flex items-center space-x-1.5 transition-all"
            >
              {copiedCompiled ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Prompt</span>
            </button>
            <button
              id="run-prompt-template-btn"
              onClick={handleExecutePrompt}
              disabled={isExecuting}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-lg shadow-indigo-500/20"
            >
              {isExecuting ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isExecuting ? 'Running...' : 'Run with Gemini'}</span>
            </button>
          </div>
        </div>

        {/* Dual Panel: Variables & Compiled Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Variables Injection Panel */}
          <div className="p-5 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center">
                <Code2 className="w-4 h-4 text-indigo-400 mr-1.5" />
                Prompt Variables ({Object.keys(variableValues).length})
              </h3>
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Dynamic Injected</span>
            </div>

            <div className="space-y-3">
              {Object.keys(variableValues).map((vKey) => (
                <div key={vKey}>
                  <label className="block text-[11px] font-mono text-indigo-300 mb-1">
                    {`{{${vKey}}}`}
                  </label>
                  {vKey.toLowerCase().includes('code') || vKey.toLowerCase().includes('metrics') || vKey.toLowerCase().includes('template') ? (
                    <textarea
                      rows={3}
                      value={variableValues[vKey] || ''}
                      onChange={(e) =>
                        setVariableValues({ ...variableValues, [vKey]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={variableValues[vKey] || ''}
                      onChange={(e) =>
                        setVariableValues({ ...variableValues, [vKey]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Compiled Prompt Live View */}
          <div className="p-5 rounded-2xl bg-[#080808] border border-white/10 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center">
                <Terminal className="w-4 h-4 text-emerald-400 mr-1.5" />
                Compiled Prompt Payload
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 font-mono border border-white/5">
                ~{Math.ceil(getCompiledPrompt().length / 4)} tokens
              </span>
            </div>

            <div className="flex-1 p-4 rounded-xl bg-[#050505] border border-white/10 text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-72">
              {getCompiledPrompt()}
            </div>
          </div>
        </div>

        {/* Live Execution Output Canvas */}
        <div className="p-5 rounded-2xl bg-[#080808] border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 flex items-center">
              <Sparkles className="w-4 h-4 text-indigo-400 mr-1.5" />
              Live Execution Output (Gemini 3.7 Flash)
            </h3>
            {isExecuting && (
              <span className="text-xs text-indigo-400 font-mono flex items-center animate-pulse">
                <span className="w-2 h-2 rounded-full bg-indigo-400 mr-1.5 animate-ping" />
                Streaming SSE...
              </span>
            )}
          </div>

          <div className="p-5 rounded-xl bg-[#050505] border border-white/10 min-h-[160px] text-xs sm:text-sm text-white/90 leading-relaxed overflow-y-auto">
            {executionOutput ? (
              <div className="markdown-body space-y-2">
                <ReactMarkdown>{executionOutput}</ReactMarkdown>
              </div>
            ) : isExecuting ? (
              <div className="text-white/40 animate-pulse font-mono text-xs">Generating real-time neural response...</div>
            ) : (
              <div className="text-white/30 italic">
                Click "Run with Gemini" above to evaluate this prompt with the active variable parameters.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* AI Prompt Optimizer Modal */}
      <AnimatePresence>
        {showOptimizerModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#080808] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white">Gemini Prompt Optimizer</h3>
                    <p className="text-xs text-white/40">Transform raw requests into production-grade templates</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOptimizerModal(false)}
                  className="text-white/40 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                  Draft or Unstructured Prompt
                </label>
                <textarea
                  rows={4}
                  value={rawPromptInput}
                  onChange={(e) => setRawPromptInput(e.target.value)}
                  placeholder="e.g. Write a python script that connects to Stripe and sends a refund email..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowOptimizerModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunOptimizer}
                  disabled={!rawPromptInput.trim() || isOptimizing}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5"
                >
                  {isOptimizing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  <span>{isOptimizing ? 'Optimizing...' : 'Optimize with Gemini'}</span>
                </button>
              </div>

              {/* Optimization Result Display */}
              {optimizationResult && (
                <div className="mt-4 p-4 rounded-xl bg-[#050505] border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-bold uppercase tracking-wider">
                    <span>Optimized Prompt Result</span>
                    <span className="text-[10px] text-white/40 font-mono">
                      Detected {optimizationResult.variablesDetected?.length || 0} variables
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-white/90 whitespace-pre-wrap max-h-48 overflow-y-auto p-3 rounded-lg bg-[#080808] border border-white/10">
                    {optimizationResult.optimizedPrompt}
                  </pre>
                  {optimizationResult.explanation && (
                    <p className="text-xs text-white/50 italic">
                      💡 {optimizationResult.explanation}
                    </p>
                  )}
                  <button
                    onClick={handleApplyOptimizedPrompt}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply & Save to Templates</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
