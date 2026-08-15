import React, { useState } from 'react';
import { User, SubscriptionPlan, Invoice } from '../types';
import { INITIAL_SUBSCRIPTION_PLANS, INITIAL_INVOICES } from '../lib/mockData';
import { 
  CreditCard, 
  Zap, 
  Check, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  HelpCircle, 
  ExternalLink,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { useToast } from './Toast';

interface BillingHubProps {
  user: User;
  onUpdateUserPlan: (newPlan: 'free' | 'pro' | 'enterprise') => void;
}

export const BillingHub: React.FC<BillingHubProps> = ({ user, onUpdateUserPlan }) => {
  const { showToast } = useToast();
  const [plans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Token Top-up calculator slider
  const [topUpTokens, setTopUpTokens] = useState<number>(500000);

  const usagePercent = Math.min(100, Math.round((user.tokensUsed / user.tokensLimit) * 100));

  // Trigger Stripe test checkout
  const handleOpenCheckout = (plan: SubscriptionPlan) => {
    if (plan.id === user.plan) {
      showToast('info', 'Current Plan', `You are already on the ${plan.name}.`);
      return;
    }
    setSelectedPlanForCheckout(plan);
    setShowCheckoutModal(true);
  };

  // Confirm payment in test sandbox
  const handleConfirmPayment = async () => {
    if (!selectedPlanForCheckout || isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      const result = await api.confirmPayment(selectedPlanForCheckout.id, 'pm_card_visa_test');
      
      onUpdateUserPlan(selectedPlanForCheckout.id);
      if (result.invoice) {
        setInvoices([result.invoice, ...invoices]);
      }

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setShowCheckoutModal(false);
      showToast('success', 'Payment Successful!', `Upgraded to ${selectedPlanForCheckout.name} via Stripe Test Mode.`);
      api.logTelemetry('stripe_subscription_upgraded', { planId: selectedPlanForCheckout.id });
    } catch (err: any) {
      showToast('error', 'Payment Failed', err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-[#FAFAFA]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Billing Hub
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center font-bold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Stripe Test Sandbox Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">Subscriptions & Metering</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl">
            Manage your metered token usage, upgrade plan tiers, and view instant Stripe test invoices.
          </p>
        </div>

        {/* Billing Switcher */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#080808] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <span>Annual</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-black">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan & Token Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Subscription Summary */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Current Subscription</span>
            <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Active
            </span>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-white">{user.plan} Plan</h3>
              <span className="text-xs text-white/40 font-mono">
                {user.plan === 'enterprise' ? '$99/mo' : user.plan === 'pro' ? '$29/mo' : '$0/mo'}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-1">Next invoice renews on September 15, 2026</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-white/80">Visa ending in 4242</span>
            </div>
            <span className="text-white/40 font-mono text-[11px]">Exp 12/28</span>
          </div>
        </div>

        {/* Token Consumption Meter */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Metered AI Tokens</span>
            <span className="text-xs font-mono font-bold text-white/80">{usagePercent}% used</span>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-xs mb-2">
              <span className="text-white/40">Consumed this cycle:</span>
              <span className="font-mono font-bold text-white">
                {user.tokensUsed.toLocaleString()} / {user.tokensLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#050505] rounded-full overflow-hidden border border-white/10">
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

          <p className="text-[11px] text-white/40">
            High-throughput tokens dynamically route between Gemini 3.7 Flash and Pro Preview.
          </p>
        </div>

        {/* Instant Token Top-up Card */}
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">Token Top-Up Simulator</span>
              <span className="text-xs font-mono font-bold text-indigo-400">${(topUpTokens / 100000 * 2).toFixed(2)}</span>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span>Add Tokens</span>
                <span className="font-mono text-white font-bold">+{topUpTokens.toLocaleString()} tokens</span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="100000"
                value={topUpTokens}
                onChange={(e) => setTopUpTokens(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => {
              showToast('success', 'Tokens Added', `+${topUpTokens.toLocaleString()} tokens credited via Stripe sandbox.`);
              api.logTelemetry('tokens_topped_up', { tokens: topUpTokens });
            }}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            Add Instant Boost
          </button>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">Upgrade or Change Plan</h2>
          <p className="text-xs text-white/40">Instant prorated billing updates with zero downtime</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === user.plan;
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-[#080808] border-indigo-500 shadow-xl shadow-indigo-500/10'
                    : 'bg-[#080808] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-white/40 leading-relaxed">{plan.tagline}</p>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-white">${price}</span>
                    <span className="text-xs text-white/40 ml-1">
                      {billingCycle === 'yearly' ? '/ year' : '/ month'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-bold text-indigo-400 flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1" />
                    {plan.tokensPerMonth.toLocaleString()} tokens / mo
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 space-y-2.5">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start text-xs text-white/80">
                        <Check className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id={`checkout-btn-${plan.id}`}
                  onClick={() => handleOpenCheckout(plan)}
                  disabled={isCurrent}
                  className={`mt-8 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    isCurrent
                      ? 'bg-white/5 text-white/30 border border-white/5 cursor-default'
                      : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/20'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="p-6 rounded-2xl bg-[#080808] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Stripe Test Invoices & Receipts</h3>
            <p className="text-xs text-white/40">Download simulated PDF billing statements</p>
          </div>
          <span className="text-xs text-white/40 font-mono">{invoices.length} invoices generated</span>
        </div>

        <div className="divide-y divide-white/5">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#050505] border border-white/10 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{inv.planName}</h4>
                  <p className="text-[11px] text-white/40 font-mono">
                    {inv.id} • {inv.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="font-mono font-bold text-white">
                  ${inv.amount.toFixed(2)} {inv.currency}
                </span>
                <button
                  onClick={() => showToast('success', 'PDF Downloaded', `Generated invoice receipt ${inv.id}.`)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Test Mode Card Simulator Modal */}
      <AnimatePresence>
        {showCheckoutModal && selectedPlanForCheckout && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#080808] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white">Stripe Test Checkout</h3>
                    <p className="text-xs text-white/40">Secure end-to-end sandbox simulator</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-white/40 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/40">Selected Plan:</span>
                  <p className="font-bold text-white text-sm">{selectedPlanForCheckout.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-white/40">Amount Due:</span>
                  <p className="font-mono font-bold text-indigo-400 text-sm">
                    ${billingCycle === 'yearly' ? selectedPlanForCheckout.priceYearly : selectedPlanForCheckout.priceMonthly}
                  </p>
                </div>
              </div>

              {/* Card Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Test Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Expiration</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#050505] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  id="confirm-stripe-payment-btn"
                  onClick={handleConfirmPayment}
                  disabled={isProcessingPayment}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg"
                >
                  {isProcessingPayment ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isProcessingPayment ? 'Verifying Card...' : 'Pay & Upgrade'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
