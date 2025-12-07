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
