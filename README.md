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
<summary>Dec 21, 2025</summary>

- Added Playwright tracing & debug commands
- Documented CI artifacts
</details>


