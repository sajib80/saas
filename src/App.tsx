import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Workspace } from './types';
import { INITIAL_USER, INITIAL_WORKSPACE } from './lib/mockData';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { LandingPage } from './components/LandingPage';
import { ChatStudio } from './components/ChatStudio';
import { PromptStudio } from './components/PromptStudio';
import { DocumentRAG } from './components/DocumentRAG';
import { TeamWorkspace } from './components/TeamWorkspace';
import { BillingHub } from './components/BillingHub';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminPanel } from './components/AdminPanel';

function MainAppContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandAction, setCommandAction] = useState<{ id: string; timestamp: number } | null>(null);

  // Global keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette on Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle command palette action execution
  const handleExecuteAction = useCallback((actionId: string) => {
    setCommandAction({ id: actionId, timestamp: Date.now() });
  }, []);

  // Update user tokens after AI invocation
  const handleUpdateUserTokens = (tokens: number) => {
    setCurrentUser((prev) => ({
      ...prev,
      tokensUsed: Math.min(prev.tokensLimit, prev.tokensUsed + tokens),
      apiCallsCount: prev.apiCallsCount + 1,
    }));
  };

  // Update subscription plan tier
  const handleUpdateUserPlan = (newPlan: 'free' | 'pro' | 'enterprise') => {
    const limits = {
      free: 100000,
      pro: 500000,
      enterprise: 2000000,
    };

    setCurrentUser((prev) => ({
      ...prev,
      plan: newPlan,
      tokensLimit: limits[newPlan],
    }));
  };

  // Switch role between Admin and Member
  const handleRoleToggle = () => {
    const nextRole = currentUser.role === 'admin' ? 'member' : 'admin';
    setCurrentUser((prev) => ({
      ...prev,
      role: nextRole,
    }));
    showToast('info', 'Role Switched', `Active session role is now ${nextRole.toUpperCase()}.`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Navigation Bar with Command Palette trigger */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleRole={handleRoleToggle}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={setActiveTab}
        user={currentUser}
        workspace={currentWorkspace}
        onToggleRole={handleRoleToggle}
        onExecuteAction={handleExecuteAction}
      />

      {/* Main View Transition Container */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex-1"
            >
              <LandingPage
                onGetStarted={() => setActiveTab('chat')}
                onViewPricing={() => setActiveTab('billing')}
              />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <ChatStudio
                user={currentUser}
                onUpdateUserTokens={handleUpdateUserTokens}
                actionTrigger={commandAction}
              />
            </motion.div>
          )}

          {activeTab === 'prompts' && (
            <motion.div
              key="prompts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <PromptStudio
                user={currentUser}
                onUpdateUserTokens={handleUpdateUserTokens}
                actionTrigger={commandAction}
              />
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <DocumentRAG
                user={currentUser}
                onUpdateUserTokens={handleUpdateUserTokens}
                actionTrigger={commandAction}
              />
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <TeamWorkspace
                user={currentUser}
                workspace={currentWorkspace}
                onUpdateWorkspace={setCurrentWorkspace}
                actionTrigger={commandAction}
              />
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <BillingHub
                user={currentUser}
                onUpdateUserPlan={handleUpdateUserPlan}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <AnalyticsDashboard user={currentUser} />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex-1"
            >
              <AdminPanel currentUser={currentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
