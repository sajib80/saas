import React, { useState, useEffect } from 'react';
import { User, AdminStats } from '../types';
import { 
  ShieldAlert, 
  Users, 
  DollarSign, 
  Zap, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  RefreshCw, 
  Lock, 
  Key, 
  Sparkles,
  Server,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserX
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from './Toast';

interface AdminPanelProps {
  currentUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // System Feature Flags state
  const [featureFlags, setFeatureFlags] = useState({
    gemini37Streaming: true,
    publicRegistrations: true,
    stripeLiveSync: true,
    deepRagVectorization: true,
    highThroughputRateLimit: false,
  });

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data.stats);
      setUsersList(data.users || []);
    } catch {
      // Mock fallback if offline
      setStats({
        totalUsers: 1482,
        activeSubscriptions: 890,
        mrr: 42850,
        totalTokensProcessed: 84200000,
        systemHealth: 'optimal',
      });
      setUsersList([
        currentUser,
        {
          id: 'usr_sarah',
          name: 'Sarah Chen',
          email: 'sarah.chen@innovate.tech',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'member',
          plan: 'enterprise',
          workspaceId: 'ws_synapse_core',
          tokensUsed: 620000,
          tokensLimit: 2000000,
          apiCallsCount: 1420,
          createdAt: '2026-02-10',
          status: 'active',
        },
        {
          id: 'usr_marcus',
          name: 'Marcus Vance',
          email: 'marcus@vertexflow.io',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          role: 'member',
          plan: 'pro',
          workspaceId: 'ws_synapse_core',
          tokensUsed: 180000,
          tokensLimit: 500000,
          apiCallsCount: 480,
          createdAt: '2026-03-01',
          status: 'active',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Update user status
  const handleToggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          showToast('info', 'User Status Changed', `${u.name} is now ${nextStatus}.`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Reset user token quota
  const handleResetUserTokens = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          showToast('success', 'Tokens Reset', `Reset usage quota for ${u.name}.`);
          return { ...u, tokensUsed: 0 };
        }
        return u;
      })
    );
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || u.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-[#FAFAFA]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              Super Admin Console
            </span>
            <span className="text-xs text-white/40 font-mono">Restricted Access (Role: Admin)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">Platform Governance</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl">
            Global subscriber management, infrastructure health status, and live feature toggle controls.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Global Admin KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Platform Users',
            value: stats?.totalUsers.toLocaleString() || '1,482',
            sub: '+18% this month',
            icon: Users,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
          },
          {
            label: 'Monthly Recurring Rev (MRR)',
            value: `$${(stats?.mrr || 42850).toLocaleString()}`,
            sub: 'Stripe Test Ingest',
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Total Tokens Processed',
            value: `${((stats?.totalTokensProcessed || 84200000) / 1000000).toFixed(1)}M`,
            sub: 'Gemini 3.7 + Pro',
            icon: Zap,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
          },
          {
            label: 'System Infrastructure',
            value: 'All Systems 100%',
            sub: 'Zero degraded clusters',
            icon: Server,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
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
                <p className="text-[11px] text-white/40 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Flags & System Switches */}
      <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center">
              <Sliders className="w-4 h-4 text-indigo-400 mr-2" />
              Runtime Feature Flags & Engine Toggles
            </h3>
            <p className="text-xs text-white/40 mt-0.5">Control global routing and rate limits without redeploying</p>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-[#050505] text-emerald-400 border border-white/10 font-mono font-bold uppercase tracking-wider">
            Config Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            {
              key: 'gemini37Streaming',
              title: 'Gemini 3.7 Flash Streaming',
              desc: 'Route default chat to SSE streaming engine',
            },
            {
              key: 'deepRagVectorization',
              title: 'RAG Semantic Vectorizer',
              desc: 'Auto-embed documents via 1536-d vectors',
            },
            {
              key: 'publicRegistrations',
              title: 'Public Self-Registration',
              desc: 'Allow new guest accounts to sign up',
            },
            {
              key: 'stripeLiveSync',
              title: 'Stripe Sandbox Webhook Sync',
              desc: 'Process instantaneous mock subscriptions',
            },
            {
              key: 'highThroughputRateLimit',
              title: 'Strict RPM Rate Limiting',
              desc: 'Throttle users over 1,200 req/min',
            },
          ].map((flag) => {
            const isEnabled = (featureFlags as any)[flag.key];
            return (
              <div
                key={flag.key}
                onClick={() => {
                  setFeatureFlags({ ...featureFlags, [flag.key]: !isEnabled });
                  showToast('info', 'Feature Flag Updated', `${flag.title} is now ${!isEnabled ? 'Enabled' : 'Disabled'}.`);
                }}
                className="p-4 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all"
              >
                <div>
                  <h4 className="font-bold text-white">{flag.title}</h4>
                  <p className="text-[11px] text-white/40 mt-0.5">{flag.desc}</p>
                </div>
                <div className={`p-1 rounded text-xl ${isEnabled ? 'text-indigo-400' : 'text-white/20'}`}>
                  {isEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Management Table */}
      <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center">
              <Users className="w-4 h-4 text-indigo-400 mr-2" />
              Registered Accounts & Quotas ({filteredUsers.length})
            </h3>
            <p className="text-xs text-white/40 mt-0.5">Inspect user usage, reset quotas, and manage subscription statuses</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or email..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-[#050505] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#050505] border border-white/10 text-xs text-white uppercase tracking-wider font-bold text-[10px] focus:outline-none focus:border-indigo-500"
            >
              <option value="all" className="bg-[#080808]">All Plans</option>
              <option value="enterprise" className="bg-[#080808]">Enterprise</option>
              <option value="pro" className="bg-[#080808]">Pro</option>
              <option value="free" className="bg-[#080808]">Free</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="border-b border-white/10 text-white/40 uppercase text-[9px] font-black tracking-widest">
              <tr>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Token Consumption</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10" />
                      <div>
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[11px] text-white/40 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded uppercase font-black tracking-wider text-[9px] bg-[#050505] border border-white/10 text-indigo-400">
                      {u.plan}
                    </span>
                  </td>
                  <td className="py-3 px-3 uppercase text-[10px] text-white/50 font-bold tracking-wider">
                    {u.role}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white/90">
                    {u.tokensUsed.toLocaleString()} / {u.tokensLimit.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {u.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => handleResetUserTokens(u.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-wider transition-colors"
                        title="Reset token quota"
                      >
                        Reset Tokens
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          u.status === 'active'
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
