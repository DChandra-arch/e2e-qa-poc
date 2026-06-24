/*
1. Import Anthropic SDK
2. Define TypeScript interfaces for output shape
3. The generator function — calls Claude API
4. Main execution — runs the generator with a sample requirement
*/

import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

// Define the shape of what Claude will return - BLOCK 2
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

// Initialize Claude client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// The generator function — async because Claude API returns a Promise
async function generateTestCases(requirement:string): Promise<TestPlan> {

  console.log('Generating test cases for requirement...')
  console.log(`Requirement: ${requirement}\n`)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: `You are a senior QA engineer. Given a feature requirement,
  generate comprehensive test cases covering happy path, negative, and edge cases.
  Output ONLY valid JSON matching this exact schema — no prose, no markdown, no backticks:
  {
    "feature": "string",
    "requirement": "string",
    "testCases": [
      {
        "id": "TC-001",
        "name": "string",
        "type": "happy_path" | "negative" | "edge_case",
        "steps": [
          { "action": "string", "expectedResult": "string" }
        ],
        "expectedResult": "string"
      }
    ]
  }
  Generate at least 2 happy path, 2 negative, and 2 edge case test cases.`,
      messages: [
        {
          role: 'user',
          content: requirement
        }
      ]
  })

  // Extract text from response — Block 3 callback: async/await
  const text = response.content[0].type === 'text'
    ? response.content[0].text
    : ''

  // Parse JSON — error handling
  let testPlan: TestPlan
  try {
    testPlan = JSON.parse(text) as TestPlan
  } catch (error) {
    throw new Error(`Claude returned invalid JSON: ${text}`)
  }

  return testPlan
}

// Save output to fixtures
function saveTestPlan(testPlan: TestPlan, outputDir: string): string {
  const filename = `${testPlan.feature.replace(/\s+/g, '_').toLowerCase()}_test_plan.json`
  const filepath = path.join(outputDir, filename)

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(filepath, JSON.stringify(testPlan, null, 2))

  return filepath
}

// Main execution — immediately invoked async function
// Block 3 callback: the pattern we practiced
//This is an Immediately Invoked Function Expression (IIFE) — a function that defines itself and calls itself in the same moment.
// ;(async () => {
//   const requirement = `As a user, I can add a todo item to my list,
//   mark it as complete, and delete it so I can manage my tasks effectively`

//   try {
//     const testPlan = await generateTestCases(requirement)

//     console.log(`✅ Generated ${testPlan.testCases.length} test cases\n`)

//     // Print summary
//     testPlan.testCases.forEach(tc => {
//       console.log(`${tc.id} [${tc.type}] — ${tc.name}`)
//     })

//     // Save to fixtures
//     const outputPath = saveTestPlan(testPlan, 'fixtures/ai-generated')
//     console.log(`\n📄 Saved to: ${outputPath}`)

//   } catch (error) {
//     console.error('Generation failed:', error)
//     process.exit(1)
//   }
// })()

async function main() {
  const requirement = `As a user, I can add a todo item...`

  try {
    const testPlan = await generateTestCases(requirement)
    console.log(`✅ Generated ${testPlan.testCases.length} test cases\n`)
    testPlan.testCases.forEach(tc => {
      console.log(`${tc.id} [${tc.type}] — ${tc.name}`)
    })
    const outputPath = saveTestPlan(testPlan, 'fixtures/ai-generated')
    console.log(`\n📄 Saved to: ${outputPath}`)
  } catch (error) {
    console.error('Generation failed:', error)
    process.exit(1)
  }
}

main()  // call it explicitly