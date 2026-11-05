# Test Case Template

Copy this file per test case (or paste rows into your test-management tool).

| Field | Value |
|-------|-------|
| **ID** | TC-<AREA>-<NNN> (e.g. TC-LOGIN-001) |
| **Title** | Short, action-oriented summary |
| **Module / Feature** | e.g. Authentication, Employees, Payslips |
| **Priority** | P1 (critical) / P2 / P3 |
| **Type** | Functional / Validation / Regression / Accessibility / API / Visual |
| **Automation status** | Manual only / Candidate / Automated (`tests/<file>.spec.ts`) |
| **Tags** | @smoke / @regression |
| **Requirement / Story link** | Ticket or requirement ID |
| **Author / Date** | |

## Preconditions
- 

## Test data
- 

## Steps and expected results

| # | Step | Expected result |
|---|------|-----------------|
| 1 | | |
| 2 | | |

## Postconditions / cleanup
- 

## Notes
- 

---

## Worked example (demo app)

| Field | Value |
|-------|-------|
| **ID** | TC-EMP-004 |
| **Title** | Reject a salary that is not a number |
| **Module** | Employees |
| **Priority** | P2 |
| **Type** | Validation |
| **Automation status** | Automated (`tests/data-driven.spec.ts` - "validation: salary not a number") |
| **Tags** | @regression |

**Preconditions:** User is signed in with the fake test account.
**Test data:** First name `Kim`, last name `Lee`, email `kim@example.test`, department `HR`, salary `abc`.

| # | Step | Expected result |
|---|------|-----------------|
| 1 | Open *Add employee* | The empty form is shown |
| 2 | Fill the fields with the data above and click *Add employee* | The message "Salary must be a number" appears under *Annual salary* |
| 3 | Check the employee list | No new employee was created |
