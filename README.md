# NidhiPath (SIH26092) — AI-Driven Scheme Matching Platform

> **"Right Scheme. Right Channel. Right Guidance."**  
> **Problem Statement ID:** SIH26092 — AI-Driven Scheme Matching for Marginalized Entrepreneurs  
> **Core Architecture Rule:** **RULES DECIDE. AI EXPLAINS.** (Deterministic eligibility engine evaluated strictly by code; LLM used only for explanation & multilingual guidance).

---

## 1. Project Overview

NidhiPath is an AI-assisted decision-support platform designed to connect micro-entrepreneurs—particularly from marginalized groups (women, SC/ST, rural youth, artisans, micro-vendors)—with eligible government financial schemes and compatible local channel partners.

The platform eliminates arbitrary AI hallucinations in loan eligibility by decoupling the deterministic rule evaluation engine from the LLM explanation layer.

---

## 2. Tech Stack

- **Frontend Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS (Navy / Slate fintech design palette)
- **Icons:** Lucide React
- **Backend / API Routes:** Next.js Server API Routes (`/api/explain`)
- **AI Explanation Layer:** Google Gemini API (`gemini-1.5-flash`) with robust offline local template fallback (`mock_fallback`)
- **Distance Calculation:** Haversine Great-Circle Formula for Geographic Routing

---

## 3. How to Run Locally

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Quick Start Commands
```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript type check
npm run typecheck

# 3. Start Next.js Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the continuous demo journey.

---

## 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Google Gemini API Key for live AI explanations
# If not provided, NidhiPath automatically falls back to an offline rule assistant
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 5. Project Structure

```
/Volumes/Disk D/sih
├── app/
│   ├── layout.tsx                # Main App Layout with Header & Status Banner
│   ├── page.tsx                  # Single Continuous Demo Journey Page
│   ├── globals.css               # Tailwind & Global Styles
│   └── api/
│       └── explain/
│           └── route.ts          # AI Explanation API Endpoint
├── components/
│   ├── Header.tsx                # Branding & SIH PS ID Badge
│   ├── StatusBanner.tsx          # Prototype Disclaimer Banner
│   ├── BeneficiaryForm.tsx       # Guided Input Form & 1-Click Demo Personas
│   ├── EligibilityResults.tsx    # Scheme Eligibility Matrix (Passed/Failed Rules)
│   ├── FinancialCalculator.tsx   # Interactive EMI Sliders & Amortization Table
│   ├── PartnerRouter.tsx         # Haversine Nearby Partner Branch Cards
│   └── AIAssistant.tsx           # Multilingual Explanation & Q&A Assistant
├── lib/
│   ├── eligibility/
│   │   └── engine.ts             # Deterministic Eligibility Logic (RULES DECIDE)
│   ├── matching/
│   │   └── ranker.ts             # Weighted Scheme Scoring & Ranking Engine
│   ├── finance/
│   │   └── emi.ts                # Standard EMI Amortization Math (P * r * (1+r)^n / ...)
│   ├── routing/
│   │   └── partnerRouter.ts      # Haversine Geographic Distance Calculator
│   └── ai/
│       └── provider.ts           # Gemini API Integration + Offline Fallback
├── data/
│   ├── schemes.ts                # Structured Demo Schemes (PMEGP, Stand-Up India, MUDRA, etc.)
│   └── partners.ts               # Structured Demo Channel Partners (Banks, DICs, CSCs)
├── types/
│   └── index.ts                  # Domain Model TypeScript Interfaces
├── README.md                     # Technical Documentation & Guide
└── HANDOFF.md                    # Developer Handoff Document for Next Agent (Cline)
```

---

## 6. Current Implemented Features

1. **Beneficiary Profile Form & 1-Click Personas**
   - Captures Applicant Name, Age, Gender, Social Category, Education, Annual Income, PIN, Location Type, Project Category, Project Cost, Equity Contribution, and Greenfield status.
   - Includes 3 pre-configured demo presets (Rural Woman, ST Youth, Urban Street Vendor) for 1-click presentation demoing.

2. **Deterministic Rule-Based Eligibility Engine**
   - Evaluates applicant criteria against scheme rules without LLM intervention.
   - Outputs passed conditions (✓) and failed conditions (✗) with clear explanations.

3. **Weighted Scheme Matching & Scoring**
   - Ranks eligible schemes based on loan coverage, interest rate, subsidy percentage, and tenure flexibility (0 - 100 score).

4. **Financial Loan & EMI Calculator**
   - Interactive sliders for Loan Principal and Tenure.
   - Standard monthly EMI calculation, total interest, total repayment, estimated government subsidy discount, and 12-month amortization schedule.

5. **Geographic Channel Partner Router**
   - Calculates distance in kilometers between applicant PIN and implementation partner branches using Haversine formula.
   - Displays branch contacts, nodal officer names, supported schemes, and map directions.

6. **AI Explanation & Multilingual Assistant**
   - Receives deterministic result as immutable context.
   - System instruction enforces: *"Never override or determine eligibility. Explain only the verified result."*
   - Supports English, Hindi, Tamil, Telugu, and Marathi outputs.
   - Features Q&A box for beneficiary queries.

---

## 7. Demo Flow

1. **Hero & Intro:** View problem statement badge (SIH26092) and core rule notice.
2. **Step 1 — Input:** Click preset persona "Sunita (Rural Woman Micro-Entrepreneur)".
3. **Step 2 — Eligibility Matrix:** Observe PMEGP evaluated as 100/100 Best Fit match with 35% rural subsidy eligibility. Inspect green checkmarks.
4. **Step 3 — Financial EMI:** Adjust loan amount and tenure sliders. View monthly EMI (e.g. ₹18,900/mo) and ₹4.2 Lakh estimated subsidy savings.
5. **Step 4 — Partner Routing:** See nearest Canara Bank RSETI and DIC single window offices within ~8.2 km.
6. **Step 5 — AI Guidance:** Switch language toggle to Hindi (हिंदी) or ask custom questions.

---

## 8. Database / Data Structure

Currently uses strongly typed local TypeScript datasets (`data/schemes.ts`, `data/partners.ts`) designed for seamless migration to PostgreSQL/Supabase later.

---

## 9. Eligibility Logic Explanation

Located in `lib/eligibility/engine.ts`. Evaluates rules sequentially:
- `minAge` / `maxAge` check
- `minProjectCost` / `maxProjectCost` check
- `maxIncome` ceiling check
- `allowedProjectTypes` check
- Demographic targeting (SC/ST/Woman for Stand-Up India)
- Educational qualification check (8th pass for PMEGP projects > ₹5L/10L)

---

## 10. Matching Logic Explanation

Located in `lib/matching/ranker.ts`:
- **Coverage Score (40 pts):** $\min(1.0, \frac{\text{Loan Limit}}{\text{Project Cost}}) \times 40$
- **Interest Favorability (25 pts):** $\frac{12.0 - \text{Interest Rate}}{12.0} \times 25$
- **Subsidy Benefit (20 pts):** $\frac{\text{Subsidy } \%}{35} \times 20$
- **Tenure Flexibility (15 pts):** Tenure length + collateral-free bonus.

---

## 11. EMI Calculation Explanation

Located in `lib/finance/emi.ts`:
$$EMI = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$$
Where $r = \frac{\text{Annual Interest}}{12 \times 100}$ and $n = \text{Tenure Years} \times 12$.

---

## 12. Partner Routing Explanation

Located in `lib/routing/partnerRouter.ts`:
$$d = 2R \arcsin \left( \sqrt{ \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right) } \right)$$
Maps PIN prefixes to latitude/longitude coordinates and computes distances to partner bank branches.

---

## 13. AI Explanation Architecture

Located in `lib/ai/provider.ts` and `app/api/explain/route.ts`.
Prompt restricts LLM from making eligibility decisions. If `GEMINI_API_KEY` is missing, `generateMockExplanation()` generates complete responses in English/Hindi/Tamil/Telugu/Marathi.

---

## 14. What is DEMO DATA

- **Schemes:** 5 realistic sample schemes based on official PMEGP, Stand-Up India, MUDRA, PM SVANidhi, and PM Vishwakarma guidelines.
- **Partners:** 6 realistic sample bank branches, DIC offices, and CSC centres with PIN coordinates.

---

## 15. What is NOT Implemented

- Live government portal scraping / APIs
- Real-time credit score (CIBIL) checks
- User account authentication / DB persistence
- Application document upload (DPR PDF parser)

---

## 16. Future Integrations

1. Official JanSamarth / KVIC API integration
2. Supabase PostgreSQL database persistence
3. DigiLocker API document verification
4. WhatsApp bot / Voice assistant layer

---

## 17. Known Issues

- Node modules installation may require network bypass in isolated sandboxes.
- Map directions currently link to Google Maps search query URLs.

---

## 18. NEXT TASKS FOR THE NEXT AI AGENT (CLINE)

1. Connect PostgreSQL / Supabase schema to replace `data/schemes.ts` and `data/partners.ts`.
2. Add PDF export capability for the beneficiary DPR & EMI summary.
3. Integrate real voice input/output (Web Speech API) for illiterate beneficiaries.
4. Implement admin dashboard to manage scheme eligibility rule definitions.
5. Add WhatsApp share link for channel partner contact details.
