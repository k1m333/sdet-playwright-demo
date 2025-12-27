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

## Sa12/21/25
CI Artifacts: GitHub Actions uploads the Playwright HTML report as an artifact on every run.
Local reports: 
```bash
npx playwright show-report
```

npx playwright test tests/buttons.spec.ts --debug

## F12/26/25
Textbox coverage:
- Happy path (POM & fixtures)
- Negative path (invalid/missing email blocks submission)

