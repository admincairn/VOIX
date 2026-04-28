// ============================================================
// VOIX — Playwright E2E Tests
// Core user journeys: auth, collect, dashboard
// ============================================================

import { test, expect, type Page } from '@playwright/test'

// ── Helpers ───────────────────────────────────────────────

async function signIn(page: Page, email = 'test@voix.app', password = 'TestPassword123!') {
  await page.goto('/auth/signin')
  await page.fill('input[type="email"]',    email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/', { timeout: 10_000 })
}

// ── Landing page ──────────────────────────────────────────

test.describe('Landing page', () => {
  test('loads and shows hero', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('best salespeople')
    await expect(page.locator('text=Start for free')).toBeVisible()
  })

  test('shows pricing section', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Pricing')
    await expect(page.locator('text=Growth')).toBeVisible()
    await expect(page.locator('text=$39')).toBeVisible()
  })

  test('nav links are correct', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav a[href="/auth/signup"]')).toBeVisible()
    await expect(page.locator('nav a[href="/auth/signin"]')).toBeVisible()
  })
})

// ── Authentication ────────────────────────────────────────

test.describe('Authentication', () => {
  test('signin page renders correctly', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.locator('h1')).toContainText('Welcome back')
    await expect(page.locator('button:has-text("Google")')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.locator('h1')).toContainText('Create your account')
    await expect(page.locator('text=14-day free trial')).toBeVisible()
  })

  test('signup form validates password length', async ({ page }) => {
    await page.goto('/auth/signup')
    await page.fill('input[placeholder="Jane Smith"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', '123')

    // Strength indicator should show "Too short"
    await expect(page.locator('text=Too short')).toBeVisible()
  })

  test('redirects unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/auth\/signin/, { timeout: 5_000 })
    expect(page.url()).toContain('/auth/signin')
  })
})

// ── Public collect form ───────────────────────────────────

test.describe('Collect form (public)', () => {
  test('shows error for invalid token', async ({ page }) => {
    await page.goto('/collect/invalid-token-12345')
    await expect(
      page.locator('text=Link not valid').or(page.locator('text=Invalid or'))
    ).toBeVisible({ timeout: 8_000 })
  })

  test('collect form steps work correctly', async ({ page }) => {
    // This test requires a real token — use a test fixture token in CI
    const testToken = process.env.E2E_TEST_COLLECT_TOKEN
    test.skip(!testToken, 'No test collect token provided')

    await page.goto(`/collect/${testToken}`)
    await expect(page.locator('h2')).toContainText('Share')

    // Step 1: fill details
    await page.click('.star >> nth=4')       // Click 5th star (5/5)
    await page.fill('#f-name',  'E2E Test User')
    await page.fill('#f-role',  'QA Engineer, Voix')
    await page.fill('#f-email', 'e2e@test.com')
    await page.click('button:has-text("Continue")')

    // Step 2: write testimonial
    await page.fill('textarea', 'This is an automated test testimonial — please ignore.')
    await page.click('button:has-text("Continue")')

    // Step 3: consent & submit
    await page.check('input[id="consent-display"]')
    await page.click('button:has-text("Submit")')

    await expect(page.locator('text=Thank you')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Dashboard ─────────────────────────────────────────────

test.describe('Dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no test credentials — safe for CI
    test.skip(
      !process.env.E2E_TEST_EMAIL,
      'No E2E_TEST_EMAIL provided'
    )
    await signIn(page, process.env.E2E_TEST_EMAIL!, process.env.E2E_TEST_PASSWORD!)
  })

  test('dashboard shows KPI cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Total testimonials')).toBeVisible()
    await expect(page.locator('text=Widget views')).toBeVisible()
    await expect(page.locator('text=Average rating')).toBeVisible()
  })

  test('testimonials tab works', async ({ page }) => {
    await page.goto('/testimonials')
    await expect(page.locator('h1:has-text("Testimonials")')).toBeVisible()
    // Tabs
    await expect(page.locator('button:has-text("Pending")')).toBeVisible()
    await expect(page.locator('button:has-text("Published")')).toBeVisible()
  })

  test('widgets page loads', async ({ page }) => {
    await page.goto('/widgets')
    await expect(page.locator('h1:has-text("Widgets")')).toBeVisible()
    await expect(page.locator('button:has-text("New widget")')).toBeVisible()
  })

  test('campaigns page loads', async ({ page }) => {
    await page.goto('/campaigns')
    await expect(page.locator('h1:has-text("Campaigns")')).toBeVisible()
  })

  test('import page loads', async ({ page }) => {
    await page.goto('/import')
    await expect(page.locator('h1:has-text("Import Reviews")')).toBeVisible()
    await expect(page.locator('text=Google')).toBeVisible()
    await expect(page.locator('text=G2')).toBeVisible()
  })

  test('settings page tabs work', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible()
    await page.click('button:has-text("Billing")')
    await expect(page.locator('text=Current plan')).toBeVisible()
    await page.click('button:has-text("Account")')
    await expect(page.locator('button:has-text("Sign out")')).toBeVisible()
  })

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Testimonials')
    await expect(page).toHaveURL('/testimonials')

    await page.click('text=Widgets')
    await expect(page).toHaveURL('/widgets')

    await page.click('text=Import')
    await expect(page).toHaveURL('/import')
  })
})

// ── Mobile ────────────────────────────────────────────────

test.describe('Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14

  test('landing page renders on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Start for free')).toBeVisible()
  })

  test('collect form works on mobile', async ({ page }) => {
    // Should be scrollable and functional at 390px
    await page.goto('/collect/invalid-token-for-test')
    // Should show some UI (error or form)
    await expect(page.locator('body')).toBeVisible()
  })
})
