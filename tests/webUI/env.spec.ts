import { test, expect } from '@playwright/test'

test('should load the correct environment', async ({ page }) => {
  await page.goto('/')
  const url = page.url()
  console.log(`Running against: ${url}`)
  expect(url).toContain(process.env.BASE_URL?.replace('https://', '') || '')
})
