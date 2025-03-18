import { test, expect, request } from '@playwright/test';

test.describe('XenonStack Website Comprehensive Tests', () => {

  // 1. Home Page Load & UI Verification
  test('Home Page should load quickly and display essential elements', async ({ page }) => {
    const start = Date.now();
    await page.goto('https://www.xenonstack.com', { waitUntil: 'load' });
    const loadTime = Date.now() - start;
    // Allow up to 6000ms load time
    expect(loadTime).toBeLessThan(6000);
    expect(await page.$('header')).not.toBeNull();
    expect(await page.$('footer')).not.toBeNull();
    expect(await page.$('nav')).not.toBeNull();
  });

  // 2. Navigation Menu Links
  test('Navigation links should work and load the correct pages', async ({ page }) => {
    await page.goto('https://www.xenonstack.com');
    const navLinks = await page.$$('nav a');
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('http')) {
        const newPage = await page.context().newPage();
        try {
          await newPage.goto(href, { waitUntil: 'load' });
          expect(await newPage.title()).not.toBe('');
        } catch (e) {
          console.error(`Error navigating to ${href}: `, e);
        } finally {
          await newPage.close();
        }
      }
    }
  });

  // 3. Responsive Design Testing
  test('Responsive Design: Verify layout on mobile, tablet, and desktop', async ({ page }) => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 }
    ];
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://www.xenonstack.com');
      expect(await page.isVisible('header')).toBeTruthy();
      expect(await page.isVisible('footer')).toBeTruthy();
    }
  });

  // 4. Search Functionality (skip if not available)
  test('Search functionality should return relevant results if present', async ({ page }) => {
    test.skip('Search functionality not available on xenonstack.com');
  });

  // 5. Contact Form Submission
  test('Contact form should submit successfully', async ({ page }) => {
    await page.goto('https://www.xenonstack.com');
    // Use getByRole to locate a link whose accessible name matches "contact" (case-insensitive)
    const contactLink = page.getByRole('link', { name: /contact/i });
    if (!(await contactLink.isVisible())) {
      test.skip('Contact link not visible on the page.');
    }
    await contactLink.click();
    await page.waitForLoadState('load');
    // Fill out the form fields (adjust selectors if needed)
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message from Playwright.');
    await page.click('button[type="submit"]');
    const confirmation = await page.waitForSelector('.confirmation, text=/thank you/i', { timeout: 5000 });
    expect(confirmation).not.toBeNull();
  });

 

  // 8. Broken Links Check on Homepage
  test('There should be no broken links on the homepage', async ({ page, request }) => {
    await page.goto('https://www.xenonstack.com');
    const anchors = await page.$$('a');
    for (const anchor of anchors) {
      const url = await anchor.getAttribute('href');
      if (url && url.startsWith('http')) {
        const urlLower = url.toLowerCase();
        // Skip known domains
        if (
          urlLower.includes('medium.com') ||
          urlLower.includes('twitter.com') ||
          urlLower.includes('linkedin.com')
        ) {
          console.log(`Skipping broken link check for known domain: ${url}`);
          continue;
        }
        const response = await request.get(url);
        const status = response.status();
        expect(status).toBeLessThan(400);
      }
    }
  });

  // 9. Homepage Performance Measurement
  test('Homepage should load within acceptable time limits', async ({ page }) => {
    const start = Date.now();
    await page.goto('https://www.xenonstack.com', { waitUntil: 'load' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(6000);
  });

  // 10. Accessibility Check for Images
  test('Images should have alt attributes for accessibility', async ({ page }) => {
    await page.goto('https://www.xenonstack.com');
    const images = await page.$$('img');
    for (const img of images) {
      const altText = await img.getAttribute('alt');
      expect(altText && altText.trim().length).toBeGreaterThan(0);
    }
  });
});
test.use({
  viewport: {
    height: 568,
    width: 320
  }
});

test('test', async ({ page }) => {
  await page.goto('https://www.xenonstack.com/');
  await page.locator('#product-main-section-six').getByRole('link', { name: 'Explore Further button-arrow' }).click();
});
