import React, { useState } from 'react';
import { User, Workspace } from '../types';
import { 
  Sparkles, 
  Bot, 
  FileText, 
  Terminal, 
  Users, 
  CreditCard, 
  BarChart3, 
  ShieldCheck, 
  Layers, 
  ChevronDown, 
  Zap, 
  Bell, 
  Check, 
  Globe,
  Search,
  Command as CommandIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSelectTab?: (tab: string) => void;
  user: User;
  workspace?: Workspace;
  onSwitchRole?: (role: string, plan: string) => void;
  onToggleRole?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  user,
  workspace = {
    id: 'ws_synapse_core',
    name: 'Synapse Enterprise',
    slug: 'synapse-core',
    ownerId: 'usr_alex',
    members: [],
    apiKey: 'syn_live_9942a1b0cd44_sec',
    apiCallsTotal: 14820,
    settings: {
      allowMemberInvites: true,
      requireTwoFactor: true,
      defaultModel: 'gemini-3.7-flash',
    },
  },
  onSwitchRole,
  onToggleRole,
  onOpenCommandPalette,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTabChange = (tabId: string) => {
    const targetTab = tabId === 'docs' ? 'documents' : tabId;
    if (onSelectTab) onSelectTab(targetTab);
    else if (setActiveTab) setActiveTab(targetTab);
  };

  const usagePercent = Math.min(100, Math.round((user.tokensUsed / user.tokensLimit) * 100));

  const navItems = [
    { id: 'landing', label: 'Home', icon: Globe },
    { id: 'chat', label: 'AI Chat', icon: Bot, badge: 'Stream' },
    { id: 'prompts', label: 'Prompt Studio', icon: Terminal },
    { id: 'documents', label: 'Document RAG', icon: FileText },
    { id: 'team', label: 'Team & Workflows', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, roleRequired: 'admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#050505] border-b border-white/10 text-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & Workspace Brand */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => handleTabChange('landing')}>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-white">
                SYNAPSE<span className="text-indigo-500">.AI</span>
              </span>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-400 uppercase tracking-widest hidden sm:inline-block">
                {user.plan}
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.roleRequired && user.role !== item.roleRequired) return null;
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'text-white bg-white/10 shadow-sm border border-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-white/40'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Command Palette Trigger */}
            <button
              id="command-palette-trigger"
              onClick={onOpenCommandPalette}
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs group"
              title="Open Command Palette (Ctrl+K or ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300" />
              <span className="hidden sm:inline font-medium text-white/50 group-hover:text-white/80">Search or command...</span>
              <kbd className="flex items-center space-x-0.5 text-[10px] font-mono font-bold bg-white/10 border border-white/15 px-1.5 py-0.2 rounded text-white/60 group-hover:text-indigo-300 group-hover:border-indigo-500/30">
                <CommandIcon className="w-2.5 h-2.5 inline sm:mr-0.5" />
                <span>K</span>
              </kbd>
            </button>

            {/* Token Usage Widget */}
            <div 
              onClick={() => handleTabChange('billing')}
              className="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-colors"
              title="Click to manage subscription & token limits"
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-white/50 space-x-2">
                  <span className="flex items-center text-white/70">
                    <Zap className="w-3 h-3 text-indigo-400 mr-1" />
                    {(user.tokensUsed / 1000).toFixed(0)}k / {(user.tokensLimit / 1000).toFixed(0)}k
                  </span>
                  <span className="font-black text-white">{usagePercent}%</span>
                </div>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent > 85
                        ? 'bg-rose-500'
                        : usagePercent > 60
                        ? 'bg-amber-400'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-400 rounded-full ring-2 ring-[#050505] animate-pulse" />
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-[#080808] border border-white/10 rounded-xl shadow-2xl p-4 z-50 text-white"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Live Notifications</span>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">2 unread</span>
                    </div>
                    <div className="space-y-2.5 mt-3">
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                        <p className="font-bold text-indigo-300 flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Gemini 3.7 Flash Live API Online
                        </p>
                        <p className="text-white/50 text-[11px] mt-0.5">
                          High-throughput streaming activated for all workspace users.
                        </p>
                        <span className="text-[10px] text-white/30 mt-1 block uppercase font-bold tracking-wider">5m ago</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                        <p className="font-bold text-emerald-400 flex items-center">
                          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                          Stripe Test Sandbox Verified
                        </p>
                        <p className="text-white/50 text-[11px] mt-0.5">
                          Instant card simulation ready with real-time receipt generation.
                        </p>
                        <span className="text-[10px] text-white/30 mt-1 block uppercase font-bold tracking-wider">1h ago</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                id="role-switcher-btn"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-white/20"
                />
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-bold text-white leading-tight flex items-center">
                    {user.name.split(' ')[0]}
                    <span className="ml-1 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {user.plan}
                    </span>
                  </span>
                  <span className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">{user.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/50" />
              </button>

              <AnimatePresence>
                {showRoleMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-[#080808] border border-white/10 rounded-xl shadow-2xl p-3 z-50 text-white"
                  >
                    <div className="px-2 py-1.5 border-b border-white/10 mb-2">
                      <p className="text-xs font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-white/40">{user.email}</p>
                    </div>

                    <div className="px-2 py-1 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                      Switch Role Simulation
                    </div>
                    <div className="space-y-1">
                      {[
                        { role: 'admin', label: 'Admin (Full Controls)', plan: 'pro' },
                        { role: 'member', label: 'Member (Projects & Chat)', plan: 'pro' },
                        { role: 'viewer', label: 'Viewer (Read Only)', plan: 'free' },
                      ].map((item) => (
                        <button
                          key={item.role}
                          onClick={() => {
                            if (onSwitchRole) onSwitchRole(item.role, item.plan);
                            else if (onToggleRole) onToggleRole();
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            user.role === item.role
                              ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{item.label}</span>
                          {user.role === item.role && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </button>
                      ))}
                    </div>

                    <div className="px-2 pt-3 pb-1 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] border-t border-white/10 mt-2">
                      Switch Subscription Tier
                    </div>
                    <div className="space-y-1">
                      {[
                        { plan: 'free', label: 'Starter Tier (100k tokens)' },
                        { plan: 'pro', label: 'Pro Tier (2M tokens)' },
                        { plan: 'enterprise', label: 'Enterprise (10M tokens)' },
                      ].map((item) => (
                        <button
                          key={item.plan}
                          onClick={() => {
                            if (onSwitchRole) onSwitchRole(user.role, item.plan);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            user.plan === item.plan
                              ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{item.label}</span>
                          {user.plan === item.plan && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1.5 no-scrollbar border-t border-white/10">
          {navItems.map((item) => {
            if (item.roleRequired && user.role !== item.roleRequired) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/10'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
