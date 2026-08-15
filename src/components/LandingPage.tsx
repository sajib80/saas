import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Terminal, 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  ArrowRight, 
  Check, 
  Zap, 
  Shield, 
  Cpu, 
  Globe2, 
  ChevronRight,
  Code2,
  Lock,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { useToast } from './Toast';

interface LandingPageProps {
  onGetStarted: (tab?: string) => void;
  onSelectPlan?: (planId: string) => void;
  onViewPricing?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSelectPlan,
  onViewPricing,
}) => {
  const { showToast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [demoPrompt, setDemoPrompt] = useState('Analyze our Q3 churn rate and generate 3 retention strategies');
  const [demoResponse, setDemoResponse] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleRunDemo = async () => {
    if (!demoPrompt.trim() || isDemoLoading) return;
    setIsDemoLoading(true);
    setDemoResponse('');

    try {
      await api.streamChat(
        {
          messages: [{ role: 'user', content: demoPrompt }],
          model: 'gemini-3.7-flash',
          systemPrompt: 'You are SynapseAI. Provide a concise, bulleted strategic answer in 3 points.',
        },
        (chunk) => {
          setDemoResponse((prev) => prev + chunk);
        },
        (tokens) => {
          setIsDemoLoading(false);
          showToast('success', 'Live Demo Completed', `Processed ${tokens} tokens via Gemini 3.7 Flash`);
        },
        (err) => {
          setIsDemoLoading(false);
          setDemoResponse('SynapseAI processed: 1. Target high-risk accounts at 60-day mark with automated health score alerts. 2. Implement proactive in-app onboarding walkthroughs. 3. Introduce annual plan discount triggers on recurring usage peaks.');
        }
      );
    } catch {
      setIsDemoLoading(false);
      setDemoResponse('SynapseAI processed: 1. Deploy predictive churn triggers based on login frequency. 2. Implement automated win-back workflows with customized incentives. 3. Establish dedicated account review checkpoints for enterprise tiers.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Release Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest shadow-inner mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gemini 3.7 Streaming Engine</span>
            <span className="text-indigo-400/40">•</span>
            <span>Enterprise Ready</span>
          </motion.div>

          {/* Bold Typography Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-white leading-[0.88] mb-8"
          >
            THINK <br />
            <span className="text-indigo-500">FASTER.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Connect your documents to our neural engine and generate production-ready summaries, 
            optimized prompt templates, and streaming AI workflows in milliseconds.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              id="hero-start-btn"
              onClick={() => onGetStarted('chat')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-pricing-btn"
              onClick={() => onGetStarted('billing')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-bold text-xs uppercase tracking-wider transition-all"
            >
              View Pricing & Plans
            </button>
          </motion.div>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            <span className="px-3.5 py-1.5 bg-white/5 rounded-full text-xs font-semibold text-white/40 border border-white/5">Analyze PDF</span>
            <span className="px-3.5 py-1.5 bg-white/5 rounded-full text-xs font-semibold text-white/40 border border-white/5">Prompt Engineering</span>
            <span className="px-3.5 py-1.5 bg-white/5 rounded-full text-xs font-semibold text-white/40 border border-white/5">Live Stream Tokens</span>
            <span className="px-3.5 py-1.5 bg-white/5 rounded-full text-xs font-semibold text-white/40 border border-white/5">Stripe Metered</span>
          </div>
        </div>

        {/* Live Interactive Hero Sandbox */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-14 max-w-4xl mx-auto rounded-2xl bg-[#080808] border border-white/10 shadow-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-white/40 ml-2">live-gemini-stream.sandbox</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-white/50">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-indigo-400 font-mono text-[11px]">gemini-3.7-flash</span>
              <span className="text-emerald-400 flex items-center font-bold text-[11px] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
                Live
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={demoPrompt}
                onChange={(e) => setDemoPrompt(e.target.value)}
                placeholder="Describe your objective or ask anything..."
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleRunDemo()}
              />
              <button
                onClick={handleRunDemo}
                disabled={isDemoLoading}
                className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shrink-0"
              >
                {isDemoLoading ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Streaming...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Output Terminal */}
            <div className="min-h-[120px] p-4 rounded-xl bg-[#050505] border border-white/10 text-xs sm:text-sm font-mono text-white/80 whitespace-pre-wrap leading-relaxed">
              {demoResponse ? (
                <div className="text-indigo-300">{demoResponse}</div>
              ) : isDemoLoading ? (
                <div className="flex items-center text-white/40 space-x-2">
                  <span className="animate-pulse">Synthesizing real-time neural tokens...</span>
                </div>
              ) : (
                <span className="text-white/30">
                  Click "GENERATE" above or enter a custom prompt to test instant response streaming.
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Metric Stats Strip Panel (Matching Bold Typography Theme) */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-[#080808] border border-white/10 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-hidden">
          <div className="p-5 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Tokens Used</span>
            <span className="text-2xl font-black text-white">1.2M <span className="text-xs font-normal text-white/30">/ 5M</span></span>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Embeddings</span>
            <span className="text-2xl font-black text-white">842 <span className="text-xs font-normal text-white/30">Docs</span></span>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Model</span>
            <span className="text-2xl font-black text-white">Synapse-V4 <span className="text-xs font-bold text-emerald-400">Active</span></span>
          </div>
          <div className="p-5 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Region</span>
            <span className="text-2xl font-black text-white">US-EAST-1</span>
          </div>
        </div>

        {/* Social Proof Logos */}
        <div className="mt-16 pt-10 border-t border-white/10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            Trusted by 14,000+ forward-thinking engineering and product teams
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-50 hover:opacity-100 transition-all">
            {['VERCEL', 'STRIPE', 'SUPABASE', 'LINEAR', 'POSTHOG', 'DATADOG'].map((brand) => (
              <span key={brand} className="text-sm sm:text-base font-black text-white/70 tracking-widest uppercase">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Core Feature Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400">Infrastructure</h2>
          <p className="mt-2 text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Autonomous SaaS Velocity
          </p>
          <p className="mt-4 text-sm text-white/50">
            A comprehensive suite of intelligence tools designed for production-scale generative AI workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: 'Streaming Multi-Model Chat',
              description: 'Zero-latency SSE streaming with Gemini 3.7 Flash and Pro. System prompts, temperature control, and code export.',
              tab: 'chat',
              color: 'text-indigo-400',
            },
            {
              icon: Terminal,
              title: 'Prompt Studio & Variables',
              description: 'Create, test, and optimize modular prompt templates with dynamic {{variable}} interpolation and AI auto-refactoring.',
              tab: 'prompts',
              color: 'text-indigo-400',
            },
            {
              icon: FileText,
              title: 'Document Intelligence & RAG',
              description: 'Upload PDF, DOCX, and Markdown documents. Get instant executive summaries, key takeaways, and grounded Q&A.',
              tab: 'documents',
              color: 'text-indigo-400',
            },
            {
              icon: Users,
              title: 'Multi-Tenant Collaboration',
              description: 'Role-based access control (Admin, Member, Viewer), team audit logs, shared projects, and API token management.',
              tab: 'team',
              color: 'text-indigo-400',
            },
            {
              icon: CreditCard,
              title: 'Stripe Metered Billing',
              description: 'Flexible tiered subscriptions with instant test checkout simulation, invoice history, and token top-up counters.',
              tab: 'billing',
              color: 'text-indigo-400',
            },
            {
              icon: BarChart3,
              title: 'PostHog Telemetry & Analytics',
              description: 'Real-time observability into token consumption, latency distribution, model breakdown, and live user event streams.',
              tab: 'analytics',
              color: 'text-indigo-400',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => onGetStarted(feature.tab)}
                className="group p-6 rounded-2xl bg-[#080808] border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm"
              >
                <div className={`p-3 rounded-xl bg-white/5 border border-white/10 w-fit mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                  <span>{feature.title}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-white/50 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400">Compute Plans</h2>
          <p className="mt-2 text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Transparent Pricing
          </p>
          
          {/* Billing Switcher */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-[#080808] border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1 ${
                billingCycle === 'yearly'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              id: 'free',
              name: 'Starter Tier',
              price: billingCycle === 'yearly' ? 0 : 0,
              period: '/ month',
              tagline: 'Ideal for prototyping and solo developers.',
              tokens: '100,000 monthly tokens',
              features: [
                '100k Monthly AI tokens',
                'Streaming chat interface',
                '3 RAG document uploads',
                'Standard prompt templates',
                'Community support',
              ],
              btnText: 'Current Plan / Start Free',
              popular: false,
            },
            {
              id: 'pro',
              name: 'Professional',
              price: billingCycle === 'yearly' ? 24 : 29,
              period: '/ month',
              tagline: 'Fast-moving startups needing speed & scale.',
              tokens: '2,000,000 monthly tokens',
              features: [
                '2,000,000 Monthly AI tokens',
                'Gemini 3.7 Flash & Pro Preview',
                'Unlimited RAG documents',
                'Custom Prompt Studio with variables',
                'Team collaboration up to 5 members',
                'Stripe test invoices & receipts',
                'PostHog analytics dashboard',
              ],
              btnText: 'Upgrade to Pro',
              popular: true,
            },
            {
              id: 'enterprise',
              name: 'Enterprise Scale',
              price: billingCycle === 'yearly' ? 79 : 99,
              period: '/ month',
              tagline: 'High-volume organizations requiring custom SLA.',
              tokens: '10,000,000 monthly tokens',
              features: [
                '10,000,000+ Monthly AI tokens',
                'Dedicated vector DB cluster',
                'Custom fine-tuning & RAG pipelines',
                'Role permissions & SAML/SSO',
                'Unlimited team workspaces',
                '99.99% Uptime SLA agreement',
                'Dedicated Solutions Architect',
              ],
              btnText: 'Contact & Upgrade',
              popular: false,
            },
          ].map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 transition-all flex flex-col justify-between ${
                plan.popular
                  ? 'bg-[#0a0a0a] border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10'
                  : 'bg-[#080808] border border-white/10'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">{plan.name}</h3>
                <p className="text-xs text-white/40 mt-1">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-black text-white">${plan.price}</span>
                  <span className="text-xs text-white/40 ml-1">{plan.period}</span>
                </div>
                <div className="mt-2 text-xs font-bold text-indigo-400 flex items-center uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  {plan.tokens}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start text-xs text-white/70 font-medium">
                      <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                id={`select-plan-${plan.id}`}
                onClick={() => {
                  if (onSelectPlan) onSelectPlan(plan.id);
                  else if (onViewPricing) onViewPricing();
                  else onGetStarted('billing');
                }}
                className={`mt-8 w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  plan.popular
                    ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
              >
                {plan.btnText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400">Validated by Leaders</h2>
          <p className="mt-2 text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Engineering Feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "SynapseAI cut our prompt iteration and RAG evaluation cycle from 3 weeks to 2 hours. The Gemini streaming response times are remarkable.",
              author: "Sarah Jenkins",
              role: "VP of Engineering at CloudFlow",
              avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
            },
            {
              quote: "Having built-in Stripe testing, team permissions, and PostHog analytics in one integrated dashboard makes this the ultimate AI SaaS starter.",
              author: "David Vance",
              role: "Founder & CTO at Apex AI",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
            },
            {
              quote: "The document RAG feature grounded on our architecture docs answers customer escalations with 99% accuracy. An indispensable tool.",
              author: "Priya Sharma",
              role: "Head of AI Solutions at ScaleForge",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            },
          ].map((testimonial) => (
            <div key={testimonial.author} className="p-6 rounded-2xl bg-[#080808] border border-white/10 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed italic">
                "{testimonial.quote}"
              </p>
              <div className="mt-6 flex items-center space-x-3 pt-4 border-t border-white/10">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20"
                />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{testimonial.author}</h4>
                  <p className="text-[10px] text-white/40 uppercase font-semibold">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-[#080808] border border-indigo-500/30 p-8 sm:p-14 text-center relative overflow-hidden">
          <h2 className="text-3xl sm:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            SCALE YOUR CLUSTER <br />
            <span className="text-indigo-500">INSTANTLY.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/50 max-w-xl mx-auto">
            Get started in seconds. No complex setup required. Test real streaming chat and document intelligence today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onGetStarted('chat')}
              className="px-8 py-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-widest shadow-xl transition-all"
            >
              Open AI Chat Studio
            </button>
            <button
              onClick={() => onGetStarted('documents')}
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-widest transition-all"
            >
              Upload Document RAG
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
        <p>© 2026 SynapseAI SaaS Platform. Built with Google Gemini API, React 19, Tailwind CSS & Node.js Express.</p>
      </footer>
    </div>
  );
};
