# API Migration Tracker: Secure Data Access

> **Goal:** Move practice data from client-side bundle to API-protected endpoints so unauthenticated users cannot access data.

**Status:** 🟡 Phase 5 Complete - Ready for Testing
**Last Updated:** Dec 6, 2025

---

## Overview

### Current Architecture (Insecure)
```
Browser loads app
    ↓
All data bundled in JS (2.2MB paymentData.ts)
    ↓
Anyone can view data in DevTools
```

### Target Architecture (Secure)
```
Browser loads app (no data)
    ↓
User logs in → Gets auth token
    ↓
App calls /api/metrics with token
    ↓
API validates token → Returns data
    ↓
Unauthenticated users see nothing
```

---

## Migration Phases

### Phase 1: Auth Token Integration
**Status:** ✅ Complete

Create a token system that connects login to API access.

| Task | Status | Notes |
|------|--------|-------|
| 1.1 Add token generation on successful login | ✅ | HMAC-SHA256 token via Web Crypto API |
| 1.2 Store token in sessionStorage | ✅ | Stored as 'cortexa_token' |
| 1.3 Create `lib/apiClient.ts` fetch wrapper | ✅ | fetchMonthMetrics, fetchAllMetrics |
| 1.4 Add AUTH_SECRET to Cloudflare env vars | ✅ | User added to Cloudflare dashboard |

**Files modified:**
- ✅ `context/AuthContext.tsx` - Added generateToken(), async login, token state
- ✅ `components/LoginPage.tsx` - Updated to await async login
- ✅ `lib/apiClient.ts` - Created with fetchWithAuth, error handling
- ✅ `.env.local` - Added VITE_AUTH_SECRET
- ✅ `.env.example` - Documented VITE_AUTH_SECRET

---

### Phase 2: Sync API Data
**Status:** ✅ Complete

Ensure `/api/metrics` returns the same data components currently calculate.

| Task | Status | Notes |
|------|--------|-------|
| 2.1 Compare API METRICS_DATA with metricsCalculator output | ✅ | Data values match - same source |
| 2.2 Update PRACTICE_SETTINGS in functions/api/metrics.ts | ✅ | Synced structure with paymentData.ts |
| 2.3 Add any missing endpoints (clinician details, etc.) | ✅ | Not needed - existing endpoint sufficient |
| 2.4 Update apiClient.ts types | ✅ | PracticeSettings interface updated |

**Changes made:**
- `functions/api/metrics.ts` - Fixed PRACTICE_SETTINGS structure (added currentOpenings, rebookRate in attendance, churnWindowDays)
- `lib/apiClient.ts` - Updated PracticeSettings interface to match

**API Data Analysis:**
- METRICS_DATA contains 34 months of pre-calculated data (2023-02 to 2025-12)
- Monthly metrics: revenue, sessions, activeClients, newClients, churnedClients
- Clinician breakdown: revenue, sessions, clients per clinician
- Derived metrics (revenuePerSession, churnRate) will be calculated client-side in Phase 3 hooks

---

### Phase 3: Create Data Fetching Hooks
**Status:** ✅ Complete

Build React hooks that fetch from API instead of importing local data.

| Task | Status | Notes |
|------|--------|-------|
| 3.1 Create `hooks/useMetrics.ts` | ✅ | Replaces calculateDashboardMetrics |
| 3.2 Create `hooks/useClinicianMetrics.ts` | ✅ | useClinicianMetricsForPeriod & useClinicianMetricsForMonth |
| 3.3 Create `hooks/useDataDateRange.ts` | ✅ | Replaces getDataDateRange |
| 3.4 Add loading states | ✅ | Built into all hooks |
| 3.5 Add error handling | ✅ | AuthenticationError handling, refetch support |
| 3.6 Create `hooks/index.ts` | ✅ | Clean exports for all hooks |

**Files created:**
- `hooks/useMetrics.ts` - Dashboard metrics with DashboardMetrics transformation
- `hooks/useClinicianMetrics.ts` - Period and month-based clinician metrics
- `hooks/useDataDateRange.ts` - Available data date range
- `hooks/index.ts` - Central exports

---

### Phase 4: Update Components
**Status:** ✅ Complete

Replace local data imports with API hooks.

| Component | Status | Current Import | New Approach |
|-----------|--------|----------------|--------------|
| Dashboard.tsx | ✅ | `calculateDashboardMetrics` | `useMetrics(month, year)` |
| ClinicianOverview.tsx | ✅ | `getClinicianMetricsForPeriod` | `useClinicianMetricsForPeriod/ForMonth` |
| MonthlyReviewCard.tsx | ✅ | Multiple calculator functions | `useMetrics` + `useClinicianMetrics` + `useMonthlyData` |
| PracticeAnalysis.tsx | N/A | Uses separate static data | Not in scope |

**Additional hooks created:**
- `hooks/useMonthlyData.ts` - For month-over-month comparisons

**For each component:**
1. Replace import with hook
2. Add loading state UI
3. Handle errors gracefully
4. Test functionality matches previous

---

### Phase 5: Remove Bundled Data
**Status:** ✅ Complete

Remove data from client bundle to complete the security fix.

| Task | Status | Notes |
|------|--------|-------|
| 5.1 Remove `data/paymentData.ts` from imports | ✅ | No component imports remain |
| 5.2 Remove `data/metricsCalculator.ts` imports | ✅ | Only test scripts import (acceptable) |
| 5.3 Convert to dynamic imports for tree-shaking | ✅ | All hooks use `import.meta.env.DEV` + dynamic imports |
| 5.4 Verify bundle size reduced | ⏳ | Run build to confirm |
| 5.5 Test app with fresh browser (no cache) | ⏳ | Part of Phase 6 |

**Note:** Test scripts in `scripts/` folder still import for reference - these don't affect bundle.

**Dev Mode Fallback:**
All hooks include automatic fallback to local data when API is unavailable:
- Production (Cloudflare): Uses secure API with token auth
- Development (Vite): Falls back to local metricsCalculator functions
- Console warns when fallback is used

---

### Phase 6: Testing & Validation
**Status:** ⬜ Not Started

| Task | Status | Notes |
|------|--------|-------|
| 6.1 Test login → API access flow | ⬜ | |
| 6.2 Test unauthenticated access blocked | ⬜ | Open DevTools, check no data |
| 6.3 Test all dashboard metrics display correctly | ⬜ | |
| 6.4 Test clinician overview works | ⬜ | |
| 6.5 Test time period filtering | ⬜ | |
| 6.6 Deploy to Cloudflare Pages | ⬜ | |
| 6.7 Test production environment | ⬜ | |

---

## Technical Details

### Token Generation (Phase 1)

```typescript
// In AuthContext.tsx
async function generateToken(username: string): Promise<string> {
  const timestamp = Date.now().toString();
  const message = `${username}:${timestamp}`;

  // Use Web Crypto API for HMAC
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(import.meta.env.VITE_AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return btoa(`${message}:${signatureHex}`);
}
```

### API Client (Phase 1)

```typescript
// lib/apiClient.ts
const API_BASE = '/api';

export async function fetchMetrics(month?: string): Promise<MetricsResponse> {
  const token = sessionStorage.getItem('cortexa_token');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = month ? `${API_BASE}/metrics?month=${month}` : `${API_BASE}/metrics`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    // Token expired, trigger re-login
    sessionStorage.removeItem('cortexa_auth');
    sessionStorage.removeItem('cortexa_token');
    window.location.reload();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

### useMetrics Hook (Phase 3)

```typescript
// hooks/useMetrics.ts
import { useState, useEffect } from 'react';
import { fetchMetrics } from '../lib/apiClient';

export function useMetrics(month: number, year: number) {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    setLoading(true);
    fetchMetrics(monthStr)
      .then(response => {
        setData(transformToMetrics(response));
        setError(null);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [month, year]);

  return { data, loading, error };
}
```

---

## Environment Variables Needed

### Cloudflare Pages Dashboard
```
AUTH_SECRET=<generate-a-strong-random-string>
ALLOWED_ORIGIN=https://cortexa.pages.dev
```

### Local Development (.env.local)
```
VITE_AUTH_USERNAME=cortex
VITE_AUTH_PASSWORD=cortex1234
VITE_AUTH_SECRET=<same-as-cloudflare-AUTH_SECRET>
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Test each component after migration |
| Data mismatch between API and calculations | Verify API data matches before switching |
| Token expiration UX | Add graceful re-login flow |
| Slow API responses | Add loading states, consider caching |
| Deployment issues | Test on preview branch first |

---

## Rollback Plan

If issues arise after deployment:
1. Keep `data/paymentData.ts` and `metricsCalculator.ts` in repo (just unused)
2. Git revert to previous commit
3. Redeploy

---

## Progress Log

| Date | Phase | Action | Result |
|------|-------|--------|--------|
| Dec 6, 2025 | Planning | Created migration tracker | ✅ |
| Dec 6, 2025 | Phase 1 | Added token generation to AuthContext | ✅ |
| Dec 6, 2025 | Phase 1 | Created lib/apiClient.ts | ✅ |
| Dec 6, 2025 | Phase 1 | Updated LoginPage for async login | ✅ |
| Dec 6, 2025 | Phase 1 | Added VITE_AUTH_SECRET to .env.local | ✅ |
| Dec 6, 2025 | Phase 1 | User added AUTH_SECRET to Cloudflare | ✅ |
| Dec 6, 2025 | Phase 2 | Compared API METRICS_DATA with calculator | ✅ |
| Dec 6, 2025 | Phase 2 | Fixed PRACTICE_SETTINGS structure in API | ✅ |
| Dec 6, 2025 | Phase 2 | Updated apiClient.ts types | ✅ |
| Dec 6, 2025 | Phase 3 | Created hooks/useMetrics.ts | ✅ |
| Dec 6, 2025 | Phase 3 | Created hooks/useClinicianMetrics.ts | ✅ |
| Dec 6, 2025 | Phase 3 | Created hooks/useDataDateRange.ts | ✅ |
| Dec 6, 2025 | Phase 3 | Created hooks/index.ts | ✅ |
| Dec 6, 2025 | Phase 4 | Updated Dashboard.tsx to use hooks | ✅ |
| Dec 6, 2025 | Phase 4 | Updated ClinicianOverview.tsx to use hooks | ✅ |
| Dec 6, 2025 | Phase 4 | Updated MonthlyReviewCard.tsx to use hooks | ✅ |
| Dec 6, 2025 | Phase 4 | Created hooks/useMonthlyData.ts | ✅ |
| Dec 6, 2025 | Phase 5 | Verified no component imports from data/ | ✅ |
| Dec 6, 2025 | Phase 5 | Added dev mode fallbacks to all hooks | ✅ |
| Dec 6, 2025 | Phase 5 | Converted all hooks to dynamic imports for tree-shaking | ✅ |
| | | | |

---

## Files Changed (Track as we go)

```
Modified:
- [x] context/AuthContext.tsx
- [x] functions/api/metrics.ts (Phase 2 - fixed PRACTICE_SETTINGS)
- [x] lib/apiClient.ts (Phase 2 - updated PracticeSettings types)
- [x] components/Dashboard.tsx (Phase 4 - uses useMetrics, useDataDateRange)
- [x] components/ClinicianOverview.tsx (Phase 4 - uses useClinicianMetrics)
- [x] components/MonthlyReviewCard.tsx (Phase 4 - uses useMetrics, useClinicianMetrics, useMonthlyData)
- [x] components/LoginPage.tsx
- [x] .env.local
- [x] .env.example

Created:
- [x] lib/apiClient.ts
- [x] hooks/useMetrics.ts
- [x] hooks/useClinicianMetrics.ts
- [x] hooks/useDataDateRange.ts
- [x] hooks/useMonthlyData.ts
- [x] hooks/index.ts

Removed from bundle:
- [ ] data/paymentData.ts (keep file, remove imports)
- [ ] data/metricsCalculator.ts (keep file, remove imports)
```
