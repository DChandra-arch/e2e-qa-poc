/*
This is a TypeScript triple-slash directive — it explicitly tells the TypeScript compiler to
include Node type definitions for this file.
*/
/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'

// Load environment-specific file first, fall back to .env
dotenv.config({ path: `.env.${process.env.TEST_ENV || 'local'}` })
dotenv.config() // fallback to .env for any missing variables

export default defineConfig({
  testDir: './tests', //Where Playwright looks for test files. Without this it searches everywhere.
  fullyParallel: true, //Every individual test runs in parallel — not just files.
  forbidOnly: !!process.env.CI, //test.only() lets you run just one test locally for debugging. But if someone accidentally commits it, CI would only run that one test. This setting makes CI fail if test.only is found. !!process.env.CI means "true when running in CI, false locally."
  retries: process.env.CI ? 2 : 0, //Failed tests retry twice in CI — handles infrastructure flakiness without masking real bugs. Locally — no retries, so flaky tests are immediately visible.
  workers: process.env.CI ? 2 : 4, //Parallel worker count. 4 locally (faster), 2 in CI (CI machines have fewer cores).
  timeout: 30000, //Each test has 30 seconds to complete before Playwright kills it and marks it failed. Prevents hung tests blocking CI forever.

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  // GLOBAL use: — applies to ALL projects
  use: {
    baseURL: process.env.BASE_URL || 'https://demo.playwright.dev',
    trace: 'on-first-retry', //Records a full trace — DOM snapshots, network requests, console logs, screenshots at every step — on the first retry. If a test fails in CI, you get a trace file to debug exactly what happened.
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, //Each individual action — click, fill, press — has 10 seconds to complete before failing. Separate from the overall test timeout of 30 seconds.
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/webUI/**/*.spec.ts'],
    },
    {
      name: 'api',
      use: {
        baseURL: process.env.API_URL || 'https://jsonplaceholder.typicode.com',
      },
      testMatch: ['**/api/**/*.spec.ts'],
    },
  ],
})
