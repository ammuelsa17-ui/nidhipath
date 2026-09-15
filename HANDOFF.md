# HANDOFF DOCUMENTATION — NidhiPath (SIH26092)

**Target Audience:** Next AI Coding Agent (e.g. Cline, Antigravity, Cursor) or human developer taking over the codebase.  
**Project:** NidhiPath — AI-Driven Scheme Matching for Marginalized Entrepreneurs  
**Core Architectural Rule:** **RULES DECIDE. AI EXPLAINS.**

---

## 1. CURRENT STATUS

The NidhiPath MVP is **100% demo-ready** and operational as a continuous single-page journey in Next.js + TypeScript + Tailwind CSS.

- **Deterministic Rule Engine:** Fully functional (`lib/eligibility/engine.ts`).
- **Scheme Matching & Ranking:** Fully functional (`lib/matching/ranker.ts`).
- **Financial EMI Math:** Fully functional (`lib/finance/emi.ts`).
- **Channel Partner Routing:** Fully functional (`lib/routing/partnerRouter.ts`).
- **AI Explanation & Multilingual Layer:** Fully functional with Gemini API support + 100% offline fallback mode (`lib/ai/provider.ts`).
- **UI/UX:** Responsive, clean navy/blue fintech layout with 3 1-click preset demo personas.

---

## 2. COMPLETED MODULES

| Module Path | Responsibility | Implementation Details |
|---|---|---|
| `types/index.ts` | Domain Data Models | Interfaces for BeneficiaryProfile, Scheme, EligibilityResult, EMIBreakdown, ChannelPartner, AIExplanation |
| `data/schemes.ts` | Demo Scheme Database | 5 detailed schemes (PMEGP, Stand-Up India, MUDRA, PM SVANidhi, PM Vishwakarma) |
| `data/partners.ts` | Demo Partner Database | 6 channel partners (SBI, PNB, DIC, CSC, KVGB, Canara RSETI) |
| `lib/eligibility/engine.ts` | Deterministic Rule Evaluator | Evaluates age, income, project cost, category, gender, education, and greenfield criteria |
| `lib/matching/ranker.ts` | Weighted Scoring Ranker | Scores eligible schemes from 0 to 100 based on coverage, interest, subsidy, and tenure |
| `lib/finance/emi.ts` | EMI & Amortization Math | Standard loan EMI formula ($P \times r \times (1+r)^n / ((1+r)^n - 1)$) + 12-month schedule |
| `lib/routing/partnerRouter.ts` | Haversine Partner Router | Great-circle distance calculations & PIN code geographic lookup |
| `lib/ai/provider.ts` | AI Explanation Engine | Calls Gemini API or falls back to template explanation in EN, HI, TA, TE, MR |
| `app/api/explain/route.ts` | AI Explanation API Route | Server route handling POST requests for AI guidance |
| `components/*` | UI Components | Header, StatusBanner, BeneficiaryForm, EligibilityResults, FinancialCalculator, PartnerRouter, AIAssistant |
| `app/page.tsx` | Continuous Journey Page | Single continuous flow linking all 5 steps |

---

## 3. INCOMPLETE MODULES (FUTURE EXTENSIONS)

1. **PostgreSQL / Supabase Integration:** Currently uses structured local TypeScript datasets. Migration to database tables is pending.
2. **PDF Project Report Generator:** Exporting beneficiary profile, eligibility breakdown, and EMI schedule to downloadable PDF.
3. **Voice Input/Output (Accessibility):** Web Speech API integration for audio navigation for illiterate micro-entrepreneurs.
4. **Admin Rule Dashboard:** Interface for government officials to update scheme rules dynamically without code edits.

---

## 4. IMPORTANT FILES TO INSPECT FIRST

If you are modifying business logic, inspect these files in order:

1. `lib/eligibility/engine.ts`: Core deterministic eligibility evaluation rules.
2. `lib/matching/ranker.ts`: Scheme scoring weights and ranking algorithm.
3. `lib/finance/emi.ts`: EMI math and subsidy calculations.
4. `lib/routing/partnerRouter.ts`: Haversine distance logic and PIN mappings.
5. `lib/ai/provider.ts`: System prompt enforcement and fallback explanation generation.
6. `app/page.tsx`: Central state management and continuous flow wiring.

---

## 5. HOW TO RUN

```bash
# Move to workspace directory
cd "/Volumes/Disk D/sih"

# Install dependencies (if not already cached)
npm install

# Run TypeScript type check
npm run typecheck

# Start development server
npm run dev
```

Server will run on `http://localhost:3000`.

---

## 6. ENVIRONMENT VARIABLES

Create `.env.local` in root:

```env
# Optional: Google Gemini API key for live AI generation
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: If `GEMINI_API_KEY` is omitted, the application runs 100% offline using internal rule-based explanation generators.*

---

## 7. DATA FLOW ARCHITECTURE

```
[Beneficiary Profile Input / Preset Button]
                 │
                 ▼
    [lib/eligibility/engine.ts] ──► (Evaluates Rules Deterministically)
                 │
                 ▼
     [lib/matching/ranker.ts] ────► (Calculates Match Score 0-100 & Ranks)
                 │
                 ▼
       [lib/finance/emi.ts] ──────► (Calculates EMI & Amortization Schedule)
                 │
                 ▼
  [lib/routing/partnerRouter.ts] ──► (Calculates Haversine Distances & Ranks Partners)
                 │
                 ▼
     [lib/ai/provider.ts] ────────► (Context Injected -> LLM/Fallback Explains Result)
                 │
                 ▼
     [app/page.tsx UI Render] ────► (Continuous Journey Dashboard Display)
```

---

## 8. TARGETED CLINE FIXES & FREEZE GUIDELINES

Do **not** modify core architecture, layout, styling, or the 5-step continuous journey.

### **Targeted Fixes:**
1. **Verify Scheme Rules Before Persona Modification**: Change the demo persona from `ST` to `SC` **only after inspecting the existing eligibility rules** in `data/schemes.ts` and confirming that the persona remains valid for the demonstrated scheme (e.g. Stand-Up India).
2. **Deterministic Validation**: Verify the selected scheme's eligibility conditions against the persona's actual values. Do not hard-code or force a 100% score.
3. **Tamil Offline Fallback**: Verify the Tamil offline fallback works seamlessly with no API key or network connection in `lib/ai/provider.ts`.
4. **Truthful Source Labeling**: Avoid dangerous overclaiming like "Official Criteria • Verified 2026". Use safe, truthful labels such as:
   - `Source: Official Portal • Verified: 2026` or `Prototype Dataset • Based on Official Sources`.
5. **Run Typecheck**: Run `npm run typecheck` and test the complete journey after making changes.
6. **Freeze MVP Scope**: Do **NOT** add PDF export, Supabase, voice, admin panel, WhatsApp, or other out-of-scope features.

---

## 9. PRE-FREEZE 7-POINT TEST MATRIX

| Test | What Must Happen |
| :--- | :--- |
| **1. Persona** | Ramesh is shown as **SC**, provided existing statutory rules support it. |
| **2. Eligibility** | Result comes directly from rule engine (`lib/eligibility/engine.ts`), never hard-coded. |
| **3. Explanation** | Each eligibility result shows clear reason breakdowns (criteria met / failed). |
| **4. Finance** | Net loan principal, subsidy, and monthly EMI update correctly. |
| **5. Partner** | Only compatible scheme partners are filtered before distance-based ranking. |
| **6. Tamil** | Multilingual explanation works offline without Gemini API key. |
| **7. Integrity** | Scheme labeling truthfully specifies prototype dataset source. |


