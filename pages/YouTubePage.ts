import { expect, Page, Locator } from '@playwright/test';

export class YouTubePage {
  constructor(private readonly page: Page) {}

  private searchInput(): Locator {
    // Prefer accessible locator; fallback to id-based.
    return this.page.getByRole('combobox', { name: /search/i })
      .or(this.page.locator('input#search'));
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.acceptConsentIfPresent();
    await expect(this.searchInput()).toBeVisible();
  }

  async acceptConsentIfPresent() {
    // Consent shows for some regions / fresh contexts.
    const acceptButtons = this.page
      .getByRole('button', { name: /accept all|i agree|accept the use|agree/i });

    if (await acceptButtons.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await acceptButtons.first().click();
    }
  }

  async search(term: string) {
    const input = this.searchInput();
    await input.fill(term);
    await input.press('Enter');
  }

  async expectResultsToExist() {
    const videos = this.page.locator('ytd-video-renderer');
    await expect(videos.first()).toBeVisible();
    await expect.poll(async () => videos.count()).toBeGreaterThan(0);
  }
}
