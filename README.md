LEAKS

Find where your money quietly disappears.

LEAKS is an AI-assisted personal spending analysis application that turns raw transaction data into understandable patterns, potential savings opportunities, and practical next actions.

Instead of presenting users with another crowded finance dashboard, LEAKS focuses on one question:

Where is my money moving, and what could I change?

Overview

Managing personal spending is rarely a problem of missing data. The harder problem is recognizing meaningful patterns inside that data.

LEAKS lets users provide everyday transaction data and transforms it into:

Spending summaries

Category breakdowns

Recurring expenses

Spending patterns

Possible duplicates and anomalies

Potential savings opportunities

Evidence behind important insights

What-if spending scenarios

A concise action plan

The product combines deterministic analysis for calculations with AI-assisted interpretation for natural-language insights.

Why LEAKS?

Most personal finance tools start with dashboards.

LEAKS starts with questions.

Instead of simply showing:

"You spent ৳40,870."

LEAKS aims to answer:

"What stood out?"

"Why was it flagged?"

"What happens if I change it?"

"Where should I start?"

This makes the product less about reporting and more about decision support.

Core Experience

RAW TRANSACTIONS
       │
       ▼
NORMALIZATION
       │
       ▼
DETERMINISTIC ANALYSIS
       │
       ▼
PATTERN DETECTION
       │
       ▼
AI INTERPRETATION
       │
       ▼
EVIDENCE-BACKED INSIGHTS
       │
       ▼
WHAT-IF SIMULATION
       │
       ▼
ACTION PLAN

Key Features

1. Spending Analysis

Analyze user-provided transactions and calculate:

Total spending

Transaction count

Category totals

Spending percentages

Recurring costs

Monthly and yearly values

2. Hidden Leak Detection

LEAKS looks for patterns such as:

Frequent discretionary spending

Recurring subscriptions

Spending spikes

Category concentration

Repeated merchant activity

Possible duplicate transactions

Unusual spending patterns

A "leak" is treated as a potential opportunity, not an automatic judgment about whether a purchase was good or bad.

3. Evidence-Based Insights

Each important insight can be traced back to the underlying data.

For example:

FOOD DELIVERY

14 transactions
5 active weeks
28% of discretionary spending
+34% compared with the observed baseline

Potential opportunity:
৳500 / month

The goal is to make the system explain why something was flagged without exposing hidden model reasoning.

4. Recurring Expense Detection

Identify recurring services and show:

Merchant

Frequency

Monthly amount

Annualized cost

Example:

Netflix       Monthly      ৳650       ৳7,800/year
Spotify       Monthly      ৳330       ৳3,960/year
Google One    Monthly      ৳250       ৳3,000/year

5. Duplicate Detection

Detect transactions that may represent duplicates.

LEAKS uses language such as:

Possible duplicate

rather than claiming a transaction is definitely duplicated without sufficient evidence.

6. What-If Simulator

Users can experiment with hypothetical spending changes.

Example:

Current food delivery:
৳1,200 / month

Scenario:
Reduce by 25%

Potential difference:
৳300 / month
৳3,600 / year

These calculations are performed locally and do not require a new AI request for every slider movement.

7. Scenario Comparison

Compare illustrative scenarios such as:

Current

Moderate

Aggressive

The interface shows potential differences while clearly distinguishing scenarios from forecasts.

8. Action Plan

Turn insights into a small set of practical next steps.

Example:

01  Review recurring subscriptions
02  Reduce food delivery frequency
03  Set a discretionary shopping limit

Product Design

LEAKS intentionally avoids the typical "AI dashboard" look.

The design direction is:

Minimal

Editorial

Financial

Analytical

High-contrast

Responsive

Motion-driven where useful

The visual system emphasizes:

Strong typography

Large financial numbers

Thin dividers

Structured data rows

Restrained accent colors

Progressive disclosure

Purposeful motion

Interaction Philosophy

Animation is used to communicate meaning rather than decoration.

Examples include:

Transaction grouping

Analysis progress

Insight reveals

Number interpolation

Scenario changes

Savings trajectories

Responsive touch interactions

AI Strategy

LEAKS does not rely on the language model for everything.

Deterministic logic handles:

Totals

Percentages

Category aggregation

Recurring calculations

Annual calculations

Duplicate detection

Scenario calculations

Savings arithmetic

Cumulative projections

AI handles:

Pattern interpretation

Natural-language explanations

Concise recommendations

Insight summaries

"Question Nobody Asked"

Human-readable action suggestions

This separation improves:

Reliability

Explainability

Speed

Cost efficiency

Predictability

Example User Flow

1. Open LEAKS
        ↓
2. Paste transactions or upload CSV
        ↓
3. Analyze
        ↓
4. Transaction data is normalized
        ↓
5. Patterns are detected
        ↓
6. AI interprets meaningful signals
        ↓
7. Results are presented
        ↓
8. User opens an insight
        ↓
9. Evidence is displayed
        ↓
10. User experiments with "What If?"
        ↓
11. User receives an action plan

Example Input

LEAKS accepts simple transaction data such as:

2026-09-01,Foodpanda,350
2026-09-02,Uber,420
2026-09-03,Netflix,650
2026-09-05,Foodpanda,380
2026-09-07,Spotify,330
2026-09-10,Daraz,1850

CSV files can also be used when supported by the current build.

Technology

The current project is designed around a lightweight modern web stack.

Frontend

React

TypeScript

Vite

Tailwind CSS

Framer Motion

Recharts

Lucide icons

AI

OpenAI API

Deployment

Vercel

The exact package versions and available scripts are defined by the repository's package.json.

Project Structure

A typical structure for the application is:

leaks/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   └── ...
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.*
└── README.md

The exact structure may vary depending on the current implementation.

Getting Started

Prerequisites

Make sure you have:

Node.js installed

npm, pnpm, or yarn

An OpenAI API key for AI analysis

Installation

Clone the repository:

git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>

Install dependencies:

npm install

Environment Variables

Create a .env.local file:

OPENAI_API_KEY=your_openai_api_key

Important

Do not commit .env.local.

Your .gitignore should contain:

.env
.env.local
.env.*.local

The OpenAI key must remain server-side.

Run Locally

Start the development server using the script defined in package.json.

For a typical Vite setup:

npm run dev

Then open:

http://localhost:5173

Production Build

Before deployment, verify the production build:

npm run build

If your repository defines a preview script:

npm run preview

Deployment

LEAKS can be deployed using Vercel.

High-level flow:

GitHub Repository
       ↓
Vercel Project
       ↓
Production Environment Variable
       ↓
Build
       ↓
Production Deployment

Add the API Key in Vercel

Go to:

Vercel
→ Project
→ Settings
→ Environment Variables

Add:

OPENAI_API_KEY

to the required deployment environment.

After changing environment variables, redeploy the project.

Production Checklist

Before presenting the project:

Production build succeeds

OpenAI environment variable exists

API key is not exposed to the client

Analysis works in production

Sample data works

Error states are handled

Mobile layout works

No horizontal overflow

No browser console errors

What-If simulation works without unnecessary AI requests

Security & Privacy

LEAKS is designed around user-provided transaction data.

The application should:

Avoid unnecessary persistence

Keep API secrets server-side

Never expose the OpenAI API key to the browser

Avoid logging sensitive transaction data unnecessarily

Clearly distinguish observations from financial advice

LEAKS does not require direct bank access for its core experience.

Important: LEAKS provides analytical observations and illustrative scenarios. It is not a replacement for professional financial advice.

Design Principles

01 — Show evidence

Insights should be explainable through observable transaction data.

02 — Calculate with code

Financial arithmetic should remain deterministic.

03 — Use AI for interpretation

The language model should explain patterns rather than become the calculator.

04 — Respect uncertainty

Use phrases such as:

Potential savings

Possible duplicate

Worth reviewing

Illustrative scenario

Avoid presenting uncertain AI observations as facts.

05 — Progressive disclosure

Show the most important information first.

Deeper analysis should appear when the user chooses to explore it.

Hackathon Demo

The strongest live demonstration is:

TRY EXAMPLE
     ↓
ANALYZE
     ↓
PATTERN DETECTION
     ↓
TOP LEAK
     ↓
WHY WAS THIS FLAGGED?
     ↓
SUPPORTING TRANSACTIONS
     ↓
WHAT-IF SIMULATION
     ↓
POTENTIAL SAVINGS
     ↓
ACTION PLAN

The key product story:

LEAKS doesn't just tell you what you spent. It helps you understand what stood out, why it stood out, and what could change.

Example Insight

FOOD DELIVERY

14 transactions
5 active weeks
৳4,000 observed spending

Why we flagged it:
- High transaction frequency
- Significant share of discretionary spending
- Repeated activity throughout the month

Illustrative scenario:
Reduce frequency by 25%

Potential difference:
৳1,000 / month
৳12,000 / year

All calculations should be generated from the underlying transaction data rather than invented by the AI.

Roadmap

Potential future directions include:

Multi-month trend analysis

Budget goals

Personalized spending baselines

Recurring payment reminders

Exportable financial reports

Localized Bengali experience

Secure account-based history

Optional bank/financial data integrations

More advanced anomaly detection

These are intentionally outside the minimal hackathon MVP.

Contributing

Contributions are welcome.

A typical workflow:

git checkout -b feature/your-feature
git add .
git commit -m "Add your change"
git push origin feature/your-feature

Then open a pull request.

License

This project is licensed under the MIT License.

See the LICENSE file for details.

Built For

Built as a focused AI/product engineering hackathon project.

LEAKS
Find where your money quietly disappears.

<p align="center">
  <strong>Observe → Understand → Simulate → Act</strong>
</p>
