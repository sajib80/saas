import React, { useState } from 'react';
import { Workspace, WorkspaceMember, AIProject, User } from '../types';
import { INITIAL_PROJECTS } from '../lib/mockData';
import { 
  Users, 
  UserPlus, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Play, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Layers,
  Settings,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useToast } from './Toast';

interface TeamWorkspaceProps {
  user: User;
  workspace: Workspace;
  onUpdateWorkspace: (ws: Workspace) => void;
  actionTrigger?: { id: string; timestamp: number } | null;
}

export const TeamWorkspace: React.FC<TeamWorkspaceProps> = ({
  user,
  workspace,
  onUpdateWorkspace,
  actionTrigger,
}) => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<AIProject[]>(INITIAL_PROJECTS);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [runningProjectId, setRunningProjectId] = useState<string | null>(null);

  // Handle external action trigger (e.g. from Command Palette)
  React.useEffect(() => {
    if (actionTrigger?.id === 'invite_member') {
      setShowInviteModal(true);
    } else if (actionTrigger?.id === 'create_api_key') {
      handleRotateKey();
    }
  }, [actionTrigger?.timestamp]);

  // Copy API key
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(workspace.apiKey);
    setCopiedKey(true);
    showToast('success', 'API Key Copied');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Rotate API key
  const handleRotateKey = () => {
    const newKey = `syn_live_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const updated = { ...workspace, apiKey: newKey };
    onUpdateWorkspace(updated);
    showToast('success', 'API Key Rotated', 'Previous key invalidated immediately.');
  };

  // Invite member
  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;

    const newMember: WorkspaceMember = {
      id: `mem_${Date.now()}`,
      userId: `usr_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      joinedAt: new Date().toISOString(),
      status: 'active',
    };

    const updated = {
      ...workspace,
      members: [...workspace.members, newMember],
    };

    onUpdateWorkspace(updated);
    setShowInviteModal(false);
    setInviteEmail('');
    showToast('success', 'Member Added', `Invitation sent to ${inviteEmail}.`);
    api.logTelemetry('team_member_invited', { email: inviteEmail, role: inviteRole });
  };

  // Change member role
  const handleChangeMemberRole = (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    const updatedMembers = workspace.members.map((m) =>
      m.id === memberId ? { ...m, role: newRole } : m
    );
    onUpdateWorkspace({ ...workspace, members: updatedMembers });
    showToast('success', 'Role Updated', `Permission set to ${newRole}.`);
  };

  // Execute project automation workflow with Gemini
  const handleRunWorkflow = async (projectId: string) => {
    setRunningProjectId(projectId);
    showToast('info', 'Executing Pipeline', 'Running multistep AI project automation...');

    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      // Simulate executing all steps sequentially
      for (let i = 0; i < project.steps.length; i++) {
        const step = project.steps[i];
        await api.runWorkflowStep(step.title, step.type, { projectId, index: i });
      }

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                lastRun: new Date().toISOString(),
                steps: p.steps.map((s) => ({ ...s, status: 'completed' })),
              }
            : p
        )
      );

      showToast('success', 'Workflow Executed', 'All AI pipeline steps completed successfully.');
      api.logTelemetry('project_workflow_executed', { projectId });
    } catch (err: any) {
      showToast('error', 'Workflow Failed', err.message);
    } finally {
      setRunningProjectId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-[#FAFAFA]">
      
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Workspace
            </span>
            <span className="text-xs text-white/40 font-mono">ID: {workspace.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">{workspace.name}</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl">
            Manage team access permissions, API access keys, and shared autonomous AI workflows.
          </p>
        </div>

        <button
          id="invite-member-btn"
          onClick={() => setShowInviteModal(true)}
          className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md shadow-indigo-500/20 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Grid: Members & API Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2 Cols: Members List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center">
              <Users className="w-4 h-4 text-indigo-400 mr-2" />
              Team Members ({workspace.members.length})
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Role-Based Access</span>
          </div>

          <div className="divide-y divide-white/5">
            {workspace.members.map((member) => (
              <div key={member.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/10"
                  />
                  <div>
                    <h4 className="font-bold text-white flex items-center">
                      {member.name}
                      {member.userId === user.id && (
                        <span className="ml-1.5 text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          You
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-white/40 font-mono mt-0.5">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={member.role}
                    disabled={user.role !== 'admin'}
                    onChange={(e) =>
                      handleChangeMemberRole(member.id, e.target.value as any)
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#050505] border border-white/10 text-xs text-white capitalize disabled:opacity-60 focus:outline-none focus:border-indigo-500 font-bold uppercase tracking-wider text-[10px]"
                  >
                    <option value="admin" className="bg-[#080808]">Admin</option>
                    <option value="member" className="bg-[#080808]">Member</option>
                    <option value="viewer" className="bg-[#080808]">Viewer</option>
                  </select>

                  <span className="text-[10px] text-emerald-400 font-mono flex items-center hidden sm:flex font-bold">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1 Col: API Keys & Integration Quota */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center">
              <Key className="w-4 h-4 text-amber-400 mr-2" />
              API Key Vault
            </h3>
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Production</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Production Secret Key</label>
            <div className="flex items-center space-x-1.5 p-2.5 rounded-xl bg-[#050505] border border-white/10">
              <span className="font-mono text-xs text-white/90 truncate flex-1 pl-1">
                {workspace.apiKey}
              </span>
              <button
                onClick={handleCopyApiKey}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Copy API key"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleRotateKey}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-amber-400 transition-colors"
                title="Rotate Key"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs">
            <div className="flex justify-between text-white/50">
              <span>Total API Invocations</span>
              <span className="text-white font-mono font-bold">{workspace.apiCallsTotal}</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>Rate Limit (RPM)</span>
              <span className="text-white font-mono font-bold">1,200 req/min</span>
            </div>
            <div className="flex justify-between text-white/50">
              <span>mTLS Encryption</span>
              <span className="text-emerald-400 font-mono font-bold">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shared AI Projects & Automation Workflows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center">
              <Layers className="w-5 h-5 text-indigo-400 mr-2" />
              Collaborative AI Workflows
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Multi-step autonomous pipelines shared across team members
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {project.category}
                  </span>
                  {project.lastRun && (
                    <span className="text-[11px] text-white/40 flex items-center font-mono">
                      <Clock className="w-3 h-3 mr-1" />
                      Ran {new Date(project.lastRun).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black uppercase tracking-tight text-white">{project.name}</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{project.description}</p>

                {/* Workflow Steps Visualizer */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Execution Steps ({project.steps.length})
                  </h4>
                  <div className="space-y-1.5">
                    {project.steps.map((step, idx) => (
                      <div
                        key={step.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#050505] border border-white/5 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-white/5 border border-white/10 text-white/50 font-mono text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-white font-medium">{step.title}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-indigo-400 border border-white/5">
                          {step.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center -space-x-1.5">
                  {project.collaborators.map((name, i) => (
                    <div
                      key={name}
                      className="w-7 h-7 rounded-full bg-[#050505] border border-white/10 text-[10px] font-bold text-white flex items-center justify-center"
                      title={name}
                    >
                      {name[0]}
                    </div>
                  ))}
                  <span className="text-[11px] text-white/40 pl-3">
                    {project.collaborators.length} collaborators
                  </span>
                </div>

                <button
                  onClick={() => handleRunWorkflow(project.id)}
                  disabled={runningProjectId === project.id}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md"
                >
                  {runningProjectId === project.id ? (
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  <span>{runningProjectId === project.id ? 'Running...' : 'Run Pipeline'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#080808] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white">Invite Team Member</h3>
                    <p className="text-xs text-white/40">Grant access to shared models & prompts</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-white/40 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#050505] border border-white/10 text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="admin" className="bg-[#080808]">Admin (Full Billing & Management)</option>
                  <option value="member" className="bg-[#080808]">Member (Can run AI & edit prompts)</option>
                  <option value="viewer" className="bg-[#080808]">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  disabled={!inviteEmail.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider"
                >
                  Send Invitation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
