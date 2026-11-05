# Test Plan - <Release / Feature name>

| | |
|---|---|
| **Version** | 0.1 |
| **Author** | |
| **Date** | |
| **Status** | Draft / Approved |

## 1. Purpose and scope
Describe what this plan covers and why (release, feature, regression cycle).

**In scope**
- e.g. Sign-in, employee directory and search, add-employee form, payslip summary

**Out of scope**
- e.g. Third-party integrations, performance and load testing, native mobile apps

## 2. References
- Requirements / user stories: <links>
- Design / acceptance criteria: <links>
- Related plans: <links>

## 3. Test approach

| Level | Approach | Owner | Automation |
|-------|----------|-------|------------|
| Smoke | Verify the build is testable after each deploy | QA | `npm run test:smoke` |
| Functional / Regression | Core flows and validation rules | QA | `npm run test:regression` |
| API | Contract and status codes | QA / Dev | `tests/api.spec.ts` |
| Accessibility | WCAG 2.1 A/AA automated scan + manual spot checks | QA | `tests/a11y.spec.ts` |
| Visual | Key screens against baselines | QA | `tests/visual.spec.ts` |
| Exploratory | Charter-based sessions on new features | QA / Product | Manual |

## 4. Environments and data
| Environment | URL | Purpose | Data |
|-------------|-----|---------|------|
| Local | `http://localhost:4173` | Developer / demo app | Fake, resettable |
| Dev | `<DEV_BASE_URL>` | Integration | Synthetic |
| Staging | `<STAGING_BASE_URL>` | Pre-release validation | Anonymised / synthetic only |

Never use real employee or payroll data in test environments.

## 5. Entry and exit criteria
**Entry:** build deployed, smoke tests green, test data available.
**Exit:** 100% of P1 cases executed and passing; no open Critical/High defects; agreed risk accepted for any open Medium/Low.

## 6. Risks and mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Unstable test environment | Delayed testing | Smoke gate; retries; environment owner on call |
| Calculation rules change late | Rework | Review rules with Product early; keep expected values in test data |

## 7. Schedule and responsibilities
| Activity | Owner | Start | End |
|----------|-------|-------|-----|
| Test design | | | |
| Execution | | | |
| Regression run | | | |
| Sign-off | | | |

## 8. Deliverables
Test cases, automated suite, execution report (`docs/test-execution-report.md`), defect reports, sign-off.
