![Playwright CI](https://github.com/k1m333/sdet-playwright-demo/actions/workflows/playwright.yml/badge.svg)

# Playwright SDET Demo – DemoQA Buttons

This repo is a small but realistic example of how I structure UI test automation as an SDET using **Playwright + TypeScript**.

## What this project demonstrates

- **Page Object Model (POM)**  
  `pages/ButtonsPage.ts` wraps locators and user actions (double-click, right-click, dynamic click) for the DemoQA Buttons page.

- **Readable, stable locators**  
  Uses `getByRole` and IDs instead of brittle CSS selectors.

- **Isolated, focused tests**  
  `tests/buttons.spec.ts` contains three independent tests that each verify a specific user interaction and its message.

- **Fixture pattern**  
  `fixtures/test-fixtures.ts` is ready to be extended with shared setup (auth, test data, etc.) as the suite grows.

- **CI-ready**  
  `.github/workflows/playwright.yml` runs the full Playwright suite on every push/PR.

## Test Strategy
This project follows a layered test strategy to balance speed, signal, and coverage.

### Test Layers
- @smoke - fast page-load and critical-path validation
- @regression - stable core user flows with assertions
- functional / boundary - detailed edge-case and validation coverage

## Getting Started

```bash
npm install
npx playwright install
npm test
```

## Debug Mode
```bash
npx playwright test tests/buttons.spec.ts --debug
```

## Design Decisions
- Uses POM to separate test logic from UI locators
- External site (DemoQA) is referenced via baseURL to simulate real-world testing
- Locators use stable IDs when available; text locators when they are not available

## Debugging & Test Artifacts

This project is configured to automatically capture:
- Screenshots on test failure
- Video recordings on test failure
- Playwright traces on the first retry

Artifacts are saved locally and can be viewed using:
```bash
npx playwright show-trace trace.zip
```

Force a retry to see the screenshots and videos of trace
of failed test with:
```bash
npx playwright test --trace on
```

CI Artifacts: GitHub Actions uploads the Playwright HTML report as an artifact on every run.
Local reports: 
```bash
npx playwright show-report
```

Useful command for debugging.
```bash
npx playwright test tests/buttons.spec.ts --debug
```

## Recent Features

### Checkbox Functional Test
- Added Checkbox functional for expand, select checkbox,
  and show results.

### Test Layers
- Added @regression tag to existing textbox test.

### CheckBox page Smoke Test
- Added CheckBoxPage POM and created a smoke test.
  Will add to fixtures when more functional tests are made.

###  Screenshots on Failures
- Added util testDiagnostics file for attaching a screenshot
  whenever a test fails globally sent thru test-fixtures.

### E2E Smoke Tests
- Added smoke tests for critical user flows that run before
  running deeper validation tests.

### Refactor & Test Step
- Standardized TextBox test and added test.step reporting
  to show what line of code failed in logs in addition to GUI debugging.

### Submit & Assert Helpers
- Added two helpers that click the button and assert
  if the output panel is visible if happy path and
  not visible if negative path.

### Boundary & Accessibility E2E Coverage
- Validates max lengths for text inputs
- Handles edge whitespace inputs
- Uses roles + name selectors for accessibility and stability

### Github Actions CI:
- Fixed the YAML file by using Block YAML only
  instead of mixed inline/JSON YAML so the job runs.
- All tests should pass with Continuous Integration
  whenever a pull request is merged to or code is pushed to main.

### Textbox coverage:
- Happy path (POM & fixtures)
- Negative path (invalid/missing email blocks submission)

## Development Log (Personal)
<details>
<summary>Thursday, January 8, 2026</summary>
- Added functional checkbox test for expand all, checking box
  and asserting the results show.
</details>

<details>
<summary>Wednesday, January 7, 2026</summary>
- Added functional checkbox test for expand all and checking box.
</details>

<details>
<summary>Monday, January 5, 2026</summary>
- Added @regression tag to existing textbox test.
</details>

<details>
<summary>Friday, January 2, 2026</summary>
- Added CheckBoxPage POM and its smoke test. Will add
  it to the fixtures when functional tests are made.
</details>

<details>
<summary>Thursday, January 1, 2026</summary>
- Added util testDiagnostics file exported thru text fixtures
  so that screenshots are attached whenever a test fails.
</details>

<details>
<summary>Wednesday, Dec 31, 2025</summary>
- Added smoke tests for critical user flows with minimal assertions
  that run before running deeper validation tests.
</details>

<details>
<summary>Tuesday, Dec 30, 2025</summary>
- Standardized TextBox tests by refactoring and added test.step
  reporting so that logs can show what code lines failed.
</details>

<details>
<summary>Monday, Dec 29, 2025</summary>
- Added helpers for that submit and assert no errors
  and submit and assert blocked and now using them
  in the email happy path and negative path tests.
</details>

<details>
<summary>Sunday, Dec 28, 2025</summary>
- Added textbox boundaries test file to validate
  max lengths for text inputs and handles edge case
  whitespace inputs. It uses role and name selectors for
  stability and accessiblity.
</details>

<details>
<summary>Saturday, Dec 27, 2025</summary>
- Fixed playwright.yml to use block YAML
  instead of inline/JSON YAML because it's less
  error-prone and more readable.
- GitHub Actions CI runs the test job and succeeds.
</details>

<details>
<summary>Friday, Dec 26, 2025</summary>
- Added email validation tests
- Clarified optional vs invalid email behavior
- Stabilized submit interactions
- All 6 tests passing
</details>

<details>
<summary>Sunday, Dec 21, 2025</summary>
- Added Playwright tracing & debug commands
- Documented CI artifacts
</details>


