# Defect Report

| Field | Value |
|-------|-------|
| **ID** | BUG-<NNN> |
| **Title** | Concise: what is wrong, where (e.g. "Net pay ignores pension deduction on payslip") |
| **Reported by / date** | |
| **Environment** | local / dev / staging, build or commit |
| **Browser / OS** | e.g. Chromium 1xx on Linux |
| **Severity** | Critical / High / Medium / Low (impact on the system) |
| **Priority** | P1 / P2 / P3 (urgency to fix) |
| **Status** | New / Confirmed / In progress / Fixed / Verified / Closed / Rejected |
| **Related test case / automated test** | TC-XXX-NNN / `tests/<file>.spec.ts` |
| **Linked story / requirement** | |

## Description
One or two sentences describing the problem and its impact.

## Steps to reproduce
1. 
2. 
3. 

## Expected result
 

## Actual result
 

## Evidence
- Screenshot / video: (from `test-results/` or attach)
- Trace: `npx playwright show-trace <trace.zip>`
- Logs / network response: 
- Frequency: always / intermittent (x of y runs)

## Additional information
Workarounds, suspected cause, regression since which build.

## Fix verification (filled in by QA)
| Build | Result | Verified by | Date |
|-------|--------|-------------|------|
| | | | |

---

### Severity guide
| Level | Meaning | Payroll example |
|-------|---------|-----------------|
| Critical | Data loss/corruption, security, or core process blocked, no workaround | Payslip net pay calculated incorrectly |
| High | Major feature broken, workaround is difficult | Cannot add employees |
| Medium | Feature impaired, workaround exists | Search is case-sensitive |
| Low | Cosmetic or minor | Misaligned label |
