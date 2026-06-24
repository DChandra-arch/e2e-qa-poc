import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface McpPageObjectResult {
  pageObjectName: string
  pageObjectContent: string
  locatorsFound: string[]
}

async function generatePageObjectWithMcp(
  url: string,
  featureName: string
): Promise<McpPageObjectResult> {
  console.log(`\n🌐 Launching browser via MCP...`)
  console.log(`📍 URL: ${url}`)
  console.log(`📋 Feature: ${featureName}\n`)

  const response = await client.beta.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    // Connect to local Playwright MCP server
    mcp_servers: [
      {
        type: 'stdio',
        command: 'npx',
        args: ['@playwright/mcp', '--headless', 'false'],
        name: 'playwright',
      },
    ],
    system: `You are a Playwright TypeScript framework architect.
Your job is to:
1. Navigate to the provided URL using the browser tools
2. Take a snapshot of the page DOM
3. Identify all interactive elements relevant to the feature
4. Generate a production-grade Page Object Model

Rules for the Page Object:
- Class name: ${featureName}Page
- private readonly page: Page as first property
- private readonly locators — use the EXACT selectors you found in the DOM
- Use getByPlaceholder, getByRole, getByLabel where available — CSS class as fallback
- await this.page.goto('/') for navigation
- One async method per user action
- Import Page and Locator from @playwright/test
- Export the class

Output ONLY a JSON object — no markdown, no backticks:
{
  "pageObjectName": "${featureName}Page",
  "pageObjectContent": "full TypeScript class as string",
  "locatorsFound": ["list of selectors you found and used"]
}`,
    messages: [
      {
        role: 'user',
        content: `Navigate to ${url} and generate a complete Page Object Model
for the "${featureName}" feature.
Use the browser tools to inspect the real DOM and find accurate locators.
After navigating, take a snapshot to see the page structure before generating code.`,
      },
    ],
    betas: ['interleaved-thinking-2025-05-14'],
  } as any)

  // Extract the text response
  const textBlock = response.content.find((block: any) => block.type === 'text')
  const text = textBlock ? (textBlock as any).text : ''

  // Clean and parse
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned) as McpPageObjectResult
  } catch (error) {
    throw new Error(`Failed to parse MCP response: ${text}`)
  }
}

function savePageObject(result: McpPageObjectResult): string {
  const dir = 'lib/pages'
  const filename = `mcp_${result.pageObjectName}.ts`
  const filepath = path.join(dir, filename)

  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filepath, result.pageObjectContent)

  return filepath
}

async function main() {
  const url = 'https://demo.playwright.dev/todomvc'
  const featureName = 'AddTodo'

  try {
    const result = await generatePageObjectWithMcp(url, featureName)

    console.log(`✅ Page Object: ${result.pageObjectName}`)
    console.log(`\n📍 Locators found by Claude:`)
    result.locatorsFound.forEach((l) => console.log(`   ${l}`))

    const filepath = savePageObject(result)
    console.log(`\n💾 Saved to: ${filepath}`)

    console.log(`\n🔍 Compare with AI generator output:`)
    console.log(`   MCP:           lib/pages/mcp_${result.pageObjectName}.ts`)
    console.log(`   AI Generator:  lib/pages/ai_AddTodoItemPage.ts`)
    console.log(`\n   MCP uses REAL locators from DOM.`)
    console.log(`   AI Generator uses educated guesses.`)
  } catch (error) {
    console.error('MCP generation failed:', error)
    process.exit(1)
  }
}

main()
