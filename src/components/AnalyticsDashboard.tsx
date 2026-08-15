import React, { useState, useEffect } from 'react';
import { User, DailyUsage, PostHogEventLog } from '../types';
import { INITIAL_DAILY_USAGE, INITIAL_POSTHOG_LOGS } from '../lib/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Clock, 
  Activity, 
  Layers, 
  Filter, 
  RefreshCw, 
  Database,
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '../lib/api';
import { useToast } from './Toast';

interface AnalyticsDashboardProps {
  user: User;
}

const MODEL_COLORS = ['#6366f1', '#a855f7', '#38bdf8', '#34d399'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user }) => {
  const { showToast } = useToast();
  const [dailyData] = useState<DailyUsage[]>(INITIAL_DAILY_USAGE);
  const [telemetryLogs, setTelemetryLogs] = useState<PostHogEventLog[]>(INITIAL_POSTHOG_LOGS);
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');

  // Refresh live telemetry
  const handleRefreshLogs = async () => {
    try {
      const res = await api.getTelemetryLogs();
      if (res.logs && res.logs.length > 0) {
        setTelemetryLogs(res.logs);
      }
      showToast('success', 'Telemetry Refreshed', 'Synced latest PostHog event logs.');
    } catch {
      showToast('info', 'Telemetry Active', 'Using in-memory event stream.');
    }
  };

  const filteredLogs = telemetryLogs.filter(
    (log) => selectedEventFilter === 'all' || log.event === selectedEventFilter
  );

  const modelPieData = [
    { name: 'Gemini 3.7 Flash', value: 72 },
    { name: 'Gemini 3.1 Pro', value: 18 },
    { name: 'Gemini 3.1 Lite', value: 10 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-[#FAFAFA]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Observability
            </span>
            <span className="text-xs text-white/40 font-mono">PostHog Analytics Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">Usage & Telemetry</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl">
            Real-time insights into token consumption, latency distribution, cost models, and user telemetry.
          </p>
        </div>

        <button
          onClick={handleRefreshLogs}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Token Consumption',
            value: `${(user.tokensUsed / 1000).toFixed(1)}k`,
            subtext: '+24% from last 7 days',
            icon: Zap,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
          },
          {
            label: 'Estimated LLM Spend',
            value: `$${((user.tokensUsed / 1000000) * 0.15).toFixed(2)}`,
            subtext: '$0.15 per 1M tokens',
            icon: TrendingUp,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Average P95 Latency',
            value: '260ms',
            subtext: 'Ultra-fast SSE streaming',
            icon: Clock,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10',
          },
          {
            label: 'API Invocations',
            value: user.apiCallsCount.toLocaleString(),
            subtext: '100% SLA uptime',
            icon: Activity,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-5 rounded-2xl bg-[#080808] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black uppercase text-white font-mono">{kpi.value}</span>
                <p className="text-[11px] text-white/40 mt-0.5">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Area & Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2 Cols: 7-Day Token Ingestion Time Series */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Daily Token Usage & API Calls</h3>
              <p className="text-xs text-white/40 mt-0.5">Tokens processed over time</p>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">7-Day Period</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#666" fontSize={11} fontStyle="bold" />
                <YAxis stroke="#666" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080808',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FAFAFA'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokensUsed"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tokenGradient)"
                  name="Tokens Consumed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 1 Col: Model Breakdown Donut */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Model Share</h3>
              <span className="text-[10px] uppercase font-bold text-white/40">Gemini Family</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modelPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MODEL_COLORS[index % MODEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#080808',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#FAFAFA'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
            {modelPieData.map((m, i) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: MODEL_COLORS[i] }}
                  />
                  <span className="text-white/80 font-medium">{m.name}</span>
                </div>
                <span className="font-mono text-white/40 font-bold">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live PostHog Telemetry Event Stream */}
      <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center">
              <Activity className="w-4 h-4 text-indigo-400 mr-2" />
              Live PostHog Telemetry Event Stream
            </h3>
            <p className="text-xs text-white/40 mt-0.5">Real-time structured event logs</p>
          </div>

          {/* Event Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-white/40" />
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#050505] border border-white/10 text-xs text-white uppercase tracking-wider font-bold text-[10px] focus:outline-none focus:border-indigo-500"
            >
              <option value="all" className="bg-[#080808]">All Events</option>
              <option value="ai_chat_completed" className="bg-[#080808]">ai_chat_completed</option>
              <option value="document_rag_query" className="bg-[#080808]">document_rag_query</option>
              <option value="prompt_template_executed" className="bg-[#080808]">prompt_template_executed</option>
              <option value="stripe_subscription_upgraded" className="bg-[#080808]">stripe_subscription_upgraded</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="divide-y divide-white/5 font-mono text-xs max-h-80 overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-[#050505] text-indigo-400 border border-white/10 text-[10px] font-bold">
                  {log.event}
                </span>
                <span className="text-white/80 font-sans text-xs">{log.userEmail}</span>
              </div>

              <div className="flex items-center space-x-4 text-[11px] text-white/40">
                <span className="truncate max-w-xs text-white/50">
                  {JSON.stringify(log.properties)}
                </span>
                <span className="whitespace-nowrap font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
