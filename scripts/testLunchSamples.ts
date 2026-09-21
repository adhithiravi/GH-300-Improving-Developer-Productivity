import {
  boundaryLunchIdeas,
  invalidLunchBodies,
  validLunchIdeas,
} from '../client/src/data/lunchIdeaDevSamples'

type ApiResponse = {
  error?: string
  details?: Record<string, string>
  data?: unknown
}

type TestResult = {
  name: string
  ok: boolean
  message: string
}

const baseUrl = process.env.LUNCH_API_URL ?? 'http://localhost:5050/api/lunches'

async function postLunch(body: unknown): Promise<{ status: number; json: ApiResponse }> {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = (await response.json()) as ApiResponse

  return {
    status: response.status,
    json,
  }
}

async function runValidCases(): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (const [index, lunch] of validLunchIdeas.entries()) {
    const testName = `validLunchIdeas[${index}] ${lunch.name}`
    const result = await postLunch(lunch)

    if (result.status === 201) {
      results.push({ name: testName, ok: true, message: 'created with status 201' })
      continue
    }

    results.push({
      name: testName,
      ok: false,
      message: `expected 201, got ${result.status}: ${JSON.stringify(result.json)}`,
    })
  }

  return results
}

async function runBoundaryCases(): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (const [index, lunch] of boundaryLunchIdeas.entries()) {
    const testName = `boundaryLunchIdeas[${index}] ${lunch.name}`
    const result = await postLunch(lunch)

    if (result.status === 201) {
      results.push({ name: testName, ok: true, message: 'accepted boundary payload' })
      continue
    }

    results.push({
      name: testName,
      ok: false,
      message: `expected 201, got ${result.status}: ${JSON.stringify(result.json)}`,
    })
  }

  return results
}

async function runInvalidCases(): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (const [index, invalid] of invalidLunchBodies.entries()) {
    const testName = `invalidLunchBodies[${index}] ${String(invalid.expectedErrorField)}`
    const result = await postLunch(invalid.body)

    if (result.status !== 400) {
      results.push({
        name: testName,
        ok: false,
        message: `expected 400, got ${result.status}: ${JSON.stringify(result.json)}`,
      })
      continue
    }

    const detail = result.json.details?.[String(invalid.expectedErrorField)]
    if (!detail) {
      results.push({
        name: testName,
        ok: false,
        message: `missing details.${String(invalid.expectedErrorField)} in response`,
      })
      continue
    }

    if (detail !== invalid.failedRule) {
      results.push({
        name: testName,
        ok: false,
        message: `expected details.${String(invalid.expectedErrorField)} to equal "${invalid.failedRule}", got "${detail}"`,
      })
      continue
    }

    results.push({
      name: testName,
      ok: true,
      message: `rejected as expected: ${invalid.whyItFails}`,
    })
  }

  return results
}

function printResults(section: string, results: TestResult[]): void {
  console.log('')
  console.log(section)

  for (const result of results) {
    const prefix = result.ok ? '[PASS]' : '[FAIL]'
    console.log(`${prefix} ${result.name} -> ${result.message}`)
  }
}

async function main(): Promise<void> {
  console.log(`Testing lunches endpoint: ${baseUrl}`)
  console.log('Make sure the backend is running before executing this script.')

  const validResults = await runValidCases()
  const boundaryResults = await runBoundaryCases()
  const invalidResults = await runInvalidCases()

  printResults('Valid Cases', validResults)
  printResults('Boundary Cases', boundaryResults)
  printResults('Invalid Cases', invalidResults)

  const allResults = [...validResults, ...boundaryResults, ...invalidResults]
  const failedCount = allResults.filter((result) => !result.ok).length

  console.log('')
  console.log(`Total: ${allResults.length}  Failed: ${failedCount}  Passed: ${allResults.length - failedCount}`)

  if (failedCount > 0) {
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error('Unexpected test runner error:', error)
  process.exitCode = 1
})
