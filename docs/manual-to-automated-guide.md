# Mapping Manual Test Cases to Automated Tests

This guide shows how to turn a manual test case (see `test-case-template.md`) into an automated Playwright test, and how to keep both in sync.

## 1. Decide whether to automate

Automate when most of these are true:

- Run often (every build, every release) and is stable.
- Deterministic: the expected result is clear and data can be controlled.
- High business risk (sign-in, payroll figures, validation rules).
- Tedious or error-prone by hand (many data variations).

Keep manual (or exploratory) when:

- It runs once, or the feature is still changing daily.
- It needs human judgement (look and feel, wording, usability).
- It depends on external systems you cannot control (email delivery, bank files).

## 2. Mapping table

| Manual test case element | Automated equivalent |
|--------------------------|----------------------|
| Test case ID (TC-LOGIN-001) | Put the ID in the test title or an annotation (see below) |
| Title | `test('...')` title |
| Priority / suite (smoke, regression) | Tag in title: `@smoke`, `@regression` |
| Preconditions | `test.beforeEach`, fixtures (`authedPage`), test-data files |
| Test data | `test-data/*.json` / `*.csv`, read via `utils/data.ts` |
| Steps | Page-object methods in `pages/` (`loginPage.login(...)`) |
| Expected result | `expect(...)` assertions (web-first, auto-retrying) |
| Postconditions / cleanup | Unique test data, `afterEach`, or API cleanup |
| Evidence | Screenshot, video, trace (captured automatically on failure) |
| Defect link | Annotation or comment with the ticket ID |

### Traceability: put the manual ID in the test

```ts
test('rejects salary that is not a number @regression', async ({ authedPage, addEmployeePage }) => {
  test.info().annotations.push({ type: 'testcase', description: 'TC-EMP-004' });
  // ...
});
```

Annotations appear in the HTML report. Keep a traceability table (below) in your test plan.

## 3. Worked example

**Manual case TC-EMP-004** - reject a non-numeric salary (see worked example in the template).

| Manual step | Automated step |
|-------------|----------------|
| Open *Add employee* | `await addEmployeePage.goto()` |
| Fill fields incl. salary `abc`, click *Add employee* | `await addEmployeePage.add({ ..., salary: 'abc' })` |
| Message appears under *Annual salary* | `await addEmployeePage.expectFieldError('salary', 'Salary must be a number')` |
| No employee created | `await expect(addEmployeePage.success).toBeHidden()` |

Variations (negative salary, zero, empty) become **rows in `test-data/validation-cases.csv`** instead of new copy-pasted tests.

## 4. Traceability matrix (example)

| Manual case | Title | Automated in | Tags | Status |
|-------------|-------|--------------|------|--------|
| TC-LOGIN-001 | Valid sign-in | `tests/login.spec.ts` - valid credentials | @smoke @regression | Automated |
| TC-LOGIN-002 | Invalid credentials rejected | `tests/data-driven.spec.ts` - invalid logins | @regression | Automated |
| TC-LOGIN-003 | Empty form messages | `tests/login.spec.ts` - empty form | @regression | Automated |
| TC-EMP-001 | Search by name/department | `tests/employee-search.spec.ts` | @regression | Automated |
| TC-EMP-004 | Add-employee validation | `tests/data-driven.spec.ts` - form validation | @regression | Automated |
| TC-PAY-001 | Payslip net pay is correct | `tests/smoke.spec.ts`, `tests/visual.spec.ts` | @smoke @regression | Automated |
| TC-API-001 | Employees API requires auth | `tests/api.spec.ts` | @regression | Automated |
| TC-A11Y-001 | Pages meet WCAG A/AA (automated part) | `tests/a11y.spec.ts` | @regression | Partially (manual keyboard/screen-reader checks remain) |
| TC-UX-010 | Wording and layout review | - | - | Manual only |

## 5. Conversion checklist

1. Case is stable, repeatable and valuable (section 1).
2. Preconditions mapped to a fixture or test data (no reliance on another test's leftovers).
3. Steps use page objects; selectors are role/label based, not CSS chains.
4. Every expected result is an assertion; no fixed `waitForTimeout` sleeps.
5. Data variations moved to JSON/CSV.
6. Tagged `@smoke` and/or `@regression`; ID added as an annotation.
7. Passes 3 times in a row (`npx playwright test <file> --repeat-each=3`) and in parallel.
8. Traceability table and case "Automation status" updated.
9. Reviewed like production code.

## 6. Keeping them in sync
- When the requirement changes, update the manual case first, then the test.
- A failing automated test should link to a defect or a test fix - never silently disable.
- Review the matrix each release: retire obsolete cases, add new candidates.
