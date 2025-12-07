import { test as base, expect } from '@playwright/test';

// Extend later with custom fixtures (e.g. auth, test data)
type Fixtures = {
  // user: { id: string; name: string };
};

const test = base.extend<Fixtures>({});

export { test, expect };
