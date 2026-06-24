import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

// Interfaces — shape of what we read in
interface TestStep {
  action: string
  expectedResult: string
}

interface TestCase {
  id: string
  name: string
  type: 'happy_path' | 'negative' | 'edge_case'
  steps: TestStep[]
  expectedResult: string
}

interface TestPlan {
  feature: string
  requirement: string
  testCases: TestCase[]
}

// Shape of what Claude generates
interface ScaffoldOutput {
  pageObjectName: string
  pageObjectContent: string
  specFileContent: string
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Read the test plan JSON from file
function loadTestPlan(filepath: string): TestPlan {
  const raw = fs.readFileSync(filepath, 'utf-8')
  return JSON.parse(raw) as TestPlan
}

// Call Claude to generate scaffold
//This function calls the Claude API which returns a Promise. Must be async to use await inside.
//Takes the typed TestPlan object we loaded from the JSON file. TypeScript enforces the shape.
//Returns a Promise that resolves to a ScaffoldOutput object — the two generated files.
// in addition -  Rules for pageObjectContent, Rules for specFileContent
async function generateScaffold(testPlan: TestPlan): Promise<ScaffoldOutput> {
  console.log(`Generating scaffold for: ${testPlan.feature}\n`)

  //This is the Anthropic SDK call. Everything inside is the request to Claude.
  //system: 3 parts - Persona, Task, Output format
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: `You are a Playwright TypeScript framework architect.
Given a test plan JSON, generate a Page Object and spec file.
Output ONLY raw JSON — absolutely no markdown, no code fences,
no backticks, no \`\`\`json wrapper. Raw JSON only.
{
  "pageObjectName": "string",
  "pageObjectContent": "full TypeScript class as a string",
  "specFileContent": "full Playwright spec file as a string"
}
Rules for pageObjectContent:
-  Class name must be the feature name in PascalCase followed by Page. Example: AddTodoItemPage
- File will be saved as ai_ prefix — name the class to match
- Use export class
- constructor takes page: Page
- Always store page as first property: private readonly page: Page
- All locators must be private readonly Locator properties
- Assign all locators in constructor using page.locator() or page.getByPlaceholder() etc
- Use this.page.goto('/') for navigation — never hardcode URLs, never cast locators to any
- One async method per unique action in the test steps
- Import Page and Locator from @playwright/test

Rules for specFileContent:
- Import test and expect from '@playwright/test'
- Import the Page Object using the pageObjectName value: import { [pageObjectName] } from '../../lib/pages/ai_[pageObjectName]'
- Example: import { AddTodoItemPage } from '../../lib/pages/ai_AddTodoItemPage'
- One test() block per test case using the ID and name as test name
- Use Page Object methods only — no raw locators in tests
- Do not hardcode URLs in spec file — navigation is handled by the Page Object
- const todoPage = new [pageObjectName](page) at start of each test
- Include the test case ID and name as the test name`,
    messages: [
      {
        role: 'user',
        content: JSON.stringify(testPlan, null, 2),
      },
    ],
  })

  const text =
    response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    // Strip markdown code fences if Claude added them
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    return JSON.parse(cleaned) as ScaffoldOutput
  } catch (error) {
    throw new Error(`Claude returned invalid JSON: ${text}`)
  }
}

// Write generated files to disk
function writeScaffold(scaffold: ScaffoldOutput): void {
  // Page Object
  const pageDir = 'lib/pages'
  const pageFile = path.join(pageDir, `ai_${scaffold.pageObjectName}.ts`)
  fs.mkdirSync(pageDir, { recursive: true })
  fs.writeFileSync(pageFile, scaffold.pageObjectContent)
  console.log(`✅ Page Object: ${pageFile}`)

  // Spec file — convert PascalCase to snake_case cleanly
  const specDir = 'tests/webUI'
  const snakeName = scaffold.pageObjectName
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '') // remove leading underscore
  const specFile = path.join(specDir, `ai_${snakeName}.spec.ts`)
  fs.mkdirSync(specDir, { recursive: true })
  fs.writeFileSync(specFile, scaffold.specFileContent)
  console.log(`✅ Spec file:   ${specFile}`)
}

async function main() {
  // Read the test plan we generated in Step 1
  const testPlanPath = 'fixtures/ai-generated/add_todo_item_test_plan.json'

  try {
    const testPlan = loadTestPlan(testPlanPath)
    console.log(`Loaded: ${testPlan.testCases.length} test cases\n`)

    const scaffold = await generateScaffold(testPlan)
    writeScaffold(scaffold)

    console.log('\n🎉 Scaffold generation complete')
    console.log('Review generated files before running tests')
  } catch (error) {
    console.error('Scaffold generation failed:', error)
    process.exit(1)
  }
}

main()
