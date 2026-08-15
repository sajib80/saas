# SynapseAI — Enterprise AI SaaS Platform

SynapseAI is a full-stack, enterprise-grade AI SaaS application built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Express**. Powered by the **Google GenAI SDK** (`@google/genai`), SynapseAI provides a complete suite of AI-native tooling: multi-turn streaming conversational copilots, prompt engineering playgrounds, grounded document retrieval (RAG), collaborative team workspaces, usage observability, and subscription billing.

---

## 🚀 Key Modules & Capabilities

### 1. AI Chat Studio (`/chat`)
- **Multi-Turn Streaming**: Low-latency token streaming powered by Gemini models.
- **Model Switcher**: Seamlessly switch between `gemini-3.7-flash`, `gemini-2.5-pro`, `gemini-2.5-flash`, and specialized reasoning engines.
- **Parameter Controls**: Adjust temperature, top-p, and custom system instructions.
- **Rich Markdown & Code Rendering**: Full code syntax highlighting, copy-to-clipboard, and session management.

### 2. Prompt Engineering Studio (`/prompts`)
- **Curated Prompt Library**: Battle-tested prompt templates across Engineering, Data Science, Product, and System Architecture.
- **Live Parameter Playground**: Test variables, customize inputs, and evaluate outputs side-by-side.
- **AI Prompt Optimizer**: Automatically refine raw instructions into structured, enterprise-grade system prompts with variable markers.

### 3. Document RAG Knowledge Vault (`/documents`)
- **Document Ingestion**: Upload and parse PDFs, Markdown specs, and source code.
- **Vector Segmentation**: Visual chunking inspector detailing token distribution and embedding previews.
- **Grounded Semantic Q&A**: Ask questions grounded strictly in workspace knowledge with source citation highlights and similarity score transparency.

### 4. Team & Workflows Hub (`/team`)
- **Role-Based Access Control (RBAC)**: Manage workspace members with granular permission levels (`Admin`, `Member`, `Viewer`).
- **API Key Management**: Generate, rotate, and securely copy bearer tokens for headless developer integrations.
- **Multi-Step Agent Pipelines**: Orchestrate sequential AI workflows (Extraction → Enrichment → Synthesis) with real-time execution logs.

### 5. Billing & Subscription Management (`/billing`)
- **Tiered Plans**: Free Starter, Pro Developer, and Enterprise Scale tiers.
- **Usage & Quota Meters**: Live token consumption meters with threshold alerts.
- **Simulated Stripe Checkout**: Interactive checkout modal with instant plan upgrading, invoice receipts, and transaction history.

### 6. Observability & Telemetry (`/analytics`)
- **Token Ingestion Analytics**: Interactive token velocity and consumption charts using Recharts.
- **PostHog-Style Event Stream**: Live telemetry logs tracking model invocations, latency percentiles, error rates, and client events.
- **Performance Benchmarks**: Model response time tracking, cache hit ratios, and API throughput.

### 7. Platform Governance & Admin Console (`/admin`)
- **Super Admin Overview**: High-level platform KPIs including MRR, active tenants, total processed tokens, and system health.
- **Tenant Management**: Search, filter, and toggle user account statuses.
- **Runtime Feature Flags**: Dynamically toggle global platform features (e.g., Live Stream API, Autonomous Agents, Sandbox Code Execution) without downtime.

### 8. Global Command Palette (`⌘K` / `Ctrl+K`)
- **Instant Search & Jump**: Navigate across all studios and management tabs in milliseconds.
- **Quick Action Triggers**: Start new chat sessions, trigger prompt optimization, upload knowledge files, or invite teammates from anywhere in the UI.
- **Role Toggler**: Fast-switch between Admin and Member roles to preview permission-gated features.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS v4, Lucide React Icons |
| **Animations** | Motion (`motion/react`), Canvas Confetti |
| **Data Visualization** | Recharts |
| **Backend & Server** | Node.js, Express 4, `tsx` / `esbuild` |
| **AI Integration** | Google GenAI TypeScript SDK (`@google/genai`) |

---

## 📁 Project Structure

```text
├── server.ts                 # Express backend API & Vite middleware entrypoint
├── index.html                # HTML entry point with font loading & safe fetch binding
├── metadata.json             # Applet metadata and permission declarations
├── package.json              # Project scripts and dependencies
├── vite.config.ts            # Vite build configuration
├── src/
│   ├── main.tsx              # React client application root
│   ├── App.tsx               # Primary layout, tab routing, and global state
│   ├── types.ts              # Core TypeScript interfaces (User, Prompt, Doc, Event)
│   ├── index.css             # Tailwind CSS styling entry point
│   ├── lib/
│   │   ├── api.ts            # Typed client API service for backend endpoints
│   │   └── mockData.ts       # Seed data for templates, documents, and users
│   └── components/
│       ├── Navbar.tsx            # Global navigation, token badge, and role switcher
│       ├── CommandPalette.tsx    # Keyboard-driven quick command palette (⌘K)
│       ├── LandingPage.tsx       # Platform overview, architecture, and pricing hero
│       ├── ChatStudio.tsx        # Multi-turn streaming chat copilot
│       ├── PromptStudio.tsx      # Prompt library, playground, and optimizer
│       ├── DocumentRAG.tsx       # Vector knowledge base and grounded Q&A
│       ├── TeamWorkspace.tsx     # RBAC team management and agent pipelines
│       ├── BillingHub.tsx        # Subscription tiers and checkout flow
│       ├── AnalyticsDashboard.tsx# Token consumption and telemetry charts
│       ├── AdminPanel.tsx        # Platform governance and feature flags
│       └── Toast.tsx             # Floating notification system
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- An active **Gemini API Key** (configured automatically in Google AI Studio or set in `.env`)

### 2. Environment Configuration
Create a `.env` file or verify existing credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Available Scripts

```bash
# Start the full-stack development server on port 3000
npm run dev

# Run TypeScript type verification
npm run lint

# Build production bundle (Vite frontend + bundled Express server)
npm run build

# Start production server
npm run start
```

---

## 🔌 API Routes Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, uptime, and version |
| `POST` | `/api/ai/chat` | Standard multi-turn AI completion |
| `POST` | `/api/ai/chat/stream` | Server-Sent Events (SSE) token stream |
| `POST` | `/api/ai/optimize-prompt` | AI-assisted system prompt engineering |
| `POST` | `/api/ai/document/analyze` | Document chunking and embedding simulation |
| `POST` | `/api/ai/document/rag-query` | Grounded semantic search across vault documents |
| `POST` | `/api/ai/workflow/run-step` | Multi-step agent workflow step execution |
| `GET` | `/api/analytics/events` | Telemetry logs and latency benchmarks |
| `POST` | `/api/analytics/event` | Ingest client telemetry and usage events |
| `POST` | `/api/billing/create-checkout-session` | Initialize Stripe checkout session |
| `POST` | `/api/billing/confirm-payment` | Process subscription upgrade |
| `GET` | `/api/admin/overview` | Platform subscriber metrics and tenants |
| `POST` | `/api/admin/users/:id/toggle-status` | Toggle tenant account activation |
