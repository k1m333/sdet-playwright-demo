import { test } from '@playwright/test';
import { YouTubePage } from '../../pages/YouTubePage';

test('@smoke Go to YouTube, accept cookies, search', async ({ page }) => {
  const youTubePage = new YouTubePage(page);

  await youTubePage.goto();
  await youTubePage.acceptConsentIfPresent();
  await youTubePage.search('playwright testing');
  await youTubePage.expectResultsToExist();
});