# Test Automation Starter (Playwright + TypeScript)

A ready-to-run web test-automation starter for QA and product teams, built around a typical HR / payroll-style web app (sign-in, employee list, add-employee form, payslip summary).

Everything runs **locally and in CI with no external website**: a tiny demo app is included in `demo-app/` and is started automatically. All data and credentials are **fake**.

**What you get:** Page Object Model, fixtures, JSON/CSV data-driven tests, API tests, visual snapshot, accessibility checks (axe-core), `@smoke` / `@regression` tags, retries, screenshots/videos/traces on failure, HTML + JUnit reports, a GitHub Actions workflow, and QA document templates.

---

## 1. Setup

**Prerequisites:** [Node.js](https://nodejs.org) 18 or newer (22 recommended) and Git.

```bash
npm install
npx playwright install chromium     # downloads the test browser (once)
cp .env.example .env                # optional: defaults already work for the demo app
```

Check it works:

```bash
npm run test:smoke
```

## 2. Running tests

| Goal | Command |
|------|---------|
| All tests | `npm test` |
| Smoke only (fast sanity check) | `npm run test:smoke` |
| Regression only | `npm run test:regression` |
| One file | `npx playwright test tests/login.spec.ts` |
| One test by name | `npx playwright test -g "valid credentials"` |
| Watch the browser | `npm run test:headed` |
| Interactive UI mode (great for learning) | `npm run test:ui` |
| Step-through debugger | `npm run test:debug` |
| Against dev / staging | `npm run test:dev` / `npm run test:staging` |
| Type-check the code | `npm run typecheck` |

The demo app is started for you when `TEST_ENV=local` (the default). To explore it by hand: `npm run demo`, then open <http://localhost:4173>.

**Demo credentials (fake):** `qa.user@example.test` / `Passw0rd!demo`

## 3. Project structure

```
demo-app/        Demo web app (static pages + mock API). Delete when testing a real app.
pages/           Page Objects: locators + actions for each page (no assertions about business rules)
fixtures/        Shared setup: page objects, logged-in session, API client
test-data/       JSON and CSV inputs for data-driven tests
utils/           Small helpers (CSV parser, data readers, unique IDs)
config/          Environment selection (local / dev / staging)
tests/           The test specs (what you will write most)
docs/            QA templates and the manual-to-automated guide
.github/workflows/playwright.yml    CI pipeline
playwright.config.ts                Retries, reporters, tracing, projects
```

| Spec | Covers |
|------|--------|
| `smoke.spec.ts` | App is up; main pages open |
| `login.spec.ts` | Valid login, empty form, logout, protected pages |
| `employee-form.spec.ts` | Required fields, successful add |
| `employee-search.spec.ts` | Search results (data-driven from JSON), clearing search |
| `data-driven.spec.ts` | Invalid logins (JSON), validation rules (CSV), add employees (CSV) |
| `api.spec.ts` | API tests with Playwright `request` |
| `visual.spec.ts` | Screenshot comparison of the payslip table |
| `a11y.spec.ts` | WCAG A/AA scans with `@axe-core/playwright` |

## 4. Environments

Pick the environment with `TEST_ENV` (`local`, `dev`, `staging`) in `.env` or on the command line. Base URLs and test credentials come from `.env` (see `.env.example`, which contains placeholders only).

```bash
TEST_ENV=staging npx playwright test --grep @smoke
```

**Never commit `.env` or real credentials** (`.env` is git-ignored). In CI, use repository *secrets* and *variables*.

## 5. Writing a new test

Example: test that the employee list shows a department.

**1. Add a locator/action to a page object** (`pages/EmployeesPage.ts`) if needed:

```ts
async departments(): Promise<string[]> {
  return this.rows.locator('td:nth-child(3)').allInnerTexts();
}
```

**2. Create a spec** `tests/employee-departments.spec.ts`:

```ts
import { test, expect } from '../fixtures';

test.describe('Employee departments', () => {
  test('list shows department names @regression', async ({ authedPage, employeesPage }) => {
    await employeesPage.goto();
    expect(await employeesPage.departments()).toContain('Finance');
  });
});
```

**3. Run it:** `npx playwright test tests/employee-departments.spec.ts --headed`

Rules of thumb:

- **Fixtures** give you ready objects: `loginPage`, `employeesPage`, `addEmployeePage`, `payslipPage`, `authedPage` (already logged in - fast), `apiClient` (authenticated API calls).
- **Tags** go in the title: `@smoke` (a few critical, fast checks) and `@regression` (broader coverage).
- **Locators:** prefer `getByRole`, `getByLabel`, `getByText`; use test IDs when needed. Avoid long CSS/XPath chains.
- **No fixed sleeps.** Use assertions such as `await expect(locator).toHaveText(...)`; they retry automatically.
- **Keep tests independent** - each creates its own data (see `uniqueId()` in `utils/data.ts`) and can run in any order and in parallel.
- **Data-driven:** add a row to `test-data/*.csv` or `*.json` - the loop in `tests/data-driven.spec.ts` creates a test per row.
- **Visual baselines:** the first run on a new machine/OS needs baselines. Update deliberately with `npm run snapshots:update` and review the image diff in the PR. Baselines in this repo were created on Linux (matches CI).

More on turning manual cases into automation: [`docs/manual-to-automated-guide.md`](docs/manual-to-automated-guide.md).

## 6. Reading reports

After every run:

- **HTML report:** `npm run report` (opens `playwright-report/`). Shows each test, steps, errors, and attached screenshot / video / trace for failures.
- **Trace viewer:** `npx playwright show-trace test-results/<test-folder>/trace.zip` - a time-travel view of every action, DOM snapshot and network call. The first thing to open for a failure.
- **JUnit XML:** `reports/junit.xml` - import into CI dashboards or test-management tools.
- **In CI:** open the workflow run, then download the `playwright-report` and `junit-and-traces` artifacts and unzip.

Failure evidence (screenshot, video, trace) is kept automatically **only for failed tests**. Tests that pass on a retry are marked *flaky* in the report - investigate them, don't ignore them.

Retries: 1 locally, 2 in CI (`CI=true`). Change in `playwright.config.ts`.

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Executable doesn't exist ... run npx playwright install` | Run `npx playwright install chromium` (on Linux CI: `--with-deps`). If you already have Chrome/Chromium, set `CHROMIUM_EXECUTABLE_PATH` in `.env`. |
| `EADDRINUSE` / port 4173 busy | Stop the other process, or set `LOCAL_BASE_URL=http://localhost:4200` and run the demo with `PORT=4200`. |
| Visual test fails on a new machine | The demo app bundles its font (`demo-app/public/fonts/`), so most font differences are gone. If your own app uses system fonts, expect OS/browser differences: regenerate with `npm run snapshots:update` on the OS used by CI, or run visual tests only in CI. |
| Test passes alone but fails in the full run | Shared state or order dependence. Create unique data per test; avoid relying on counts that other tests change. |
| `Timeout ... waiting for locator` | Open the trace (section 6). Check the locator and whether the page really reached that state. Don't just raise timeouts. |
| Unknown `TEST_ENV` error | Use `local`, `dev` or `staging` (see `config/environments.ts`). |
| Login fails against dev/staging | Check `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` in `.env` or CI secrets. |
| Browser/library version errors after updating | Keep `@playwright/test` pinned and re-run `npx playwright install`. |

Useful flags: `--headed`, `--debug`, `--workers=1`, `--repeat-each=5` (to hunt flakiness), `--last-failed`.

## 8. Adapting this to a real application

1. **Point at your app.** Put your URLs in `.env` (`DEV_BASE_URL`, `STAGING_BASE_URL`) and run with `TEST_ENV=staging`. The demo server is only started for `local`.
2. **Use a dedicated test account** in a non-production environment with synthetic data. Never use real employee or payroll data. Store credentials in `.env` locally and CI *secrets* in GitHub.
3. **Update the page objects** in `pages/` to match your screens: change `path`, locators and actions. Start with login, then your most important journey.
4. **Update authentication in `fixtures/index.ts`.** The demo logs in via `POST /api/login` and stores a token in `localStorage`. For your app, either log in through the UI once and reuse the session with Playwright's [`storageState`](https://playwright.dev/docs/auth), or call your own login API. If you use SSO/MFA, ask for a test-only bypass or a service account.
5. **Replace the data** in `test-data/` and adjust expectations (e.g. validation messages).
6. **Rewrite the API tests** (`tests/api.spec.ts`) for your real endpoints and auth scheme.
7. **Regenerate visual baselines** against your app, and mask dynamic regions (dates, IDs) with `mask:` in `toHaveScreenshot`.
8. **Remove what you don't need:** delete `demo-app/` and the `webServer` block in `playwright.config.ts`, plus demo-specific specs.
9. **Wire up CI.** In `.github/workflows/playwright.yml` set `TEST_ENV` and pass secrets via `env:`; consider a nightly `schedule:` trigger for regression and `@smoke` on every pull request.
10. **Adopt the templates in [`docs/`](docs/):** test case, test plan, execution report, defect report.

## 9. CI (GitHub Actions)

`.github/workflows/playwright.yml` runs on push to `main`, pull requests and manual dispatch (with an optional `--grep` filter such as `@smoke`). It installs dependencies, type-checks, installs Chromium, runs the suite, and uploads the HTML report, JUnit XML and failure artifacts (always, even on failure).

## 10. Docs

| File | Purpose |
|------|---------|
| [`docs/test-case-template.md`](docs/test-case-template.md) | Manual test case template with a worked example |
| [`docs/test-plan.md`](docs/test-plan.md) | Test plan skeleton |
| [`docs/test-execution-report.md`](docs/test-execution-report.md) | Run summary / sign-off report |
| [`docs/defect-report.md`](docs/defect-report.md) | Defect report + severity guide |
| [`docs/manual-to-automated-guide.md`](docs/manual-to-automated-guide.md) | Mapping manual cases to automated tests |

## License
Use freely as a starting point for your own projects.
