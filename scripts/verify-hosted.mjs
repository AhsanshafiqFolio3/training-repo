import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium, request } from 'playwright'
import { expect } from '@playwright/test'

function readInput() {
  process.stderr.write('Ready for hosted verification JSON on stdin (input is hidden).\n')
  if (process.stdin.isTTY) process.stdin.setRawMode(true)
  return new Promise((resolve, reject) => {
    let input = ''
    const onData = (chunk) => {
      input += chunk.toString('utf8')
      if (input.includes('\u0003')) {
        cleanup()
        reject(new Error('Cancelled'))
        return
      }
      if (input.length > 65536) {
        cleanup()
        reject(new Error('Verification input is too large'))
        return
      }
      if (!/[\r\n]/.test(input)) return
      cleanup()
      try {
        resolve(JSON.parse(input.trim()))
      } catch {
        reject(new Error('Invalid verification input'))
      }
    }
    const cleanup = () => {
      process.stdin.off('data', onData)
      if (process.stdin.isTTY) process.stdin.setRawMode(false)
      process.stdin.pause()
    }
    process.stdin.on('data', onData)
    process.stdin.resume()
  })
}

let token = ''
let browser
let transport
const checks = []
async function check(name, run) {
  await run()
  checks.push({ name, result: 'passed' })
  console.log(`PASS: ${name}`)
}

try {
  const input = await readInput()
  const origin = new URL(input.url).origin
  assert.equal(new URL(input.url).protocol, 'https:')
  token = input.token
  assert.ok(typeof token === 'string' && token.length > 0, 'A service credential is required')
  transport = await request.newContext()
  await check('Anonymous requests remain outside the private access boundary', async () => {
    const response = await transport.get(origin, { maxRedirects: 0 })
    assert.ok([301, 302, 303, 307, 308, 401, 403].includes(response.status()))
  })
  browser = await chromium.launch({ channel: 'chromium' })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  await context.route('**/*', async (route) => {
    if (new URL(route.request().url()).origin !== origin) {
      await route.abort()
      return
    }
    const response = await transport.fetch(route.request(), {
      headers: { ...route.request().headers(), 'OAI-Sites-Authorization': `Bearer ${token}` },
      maxRedirects: 0,
    })
    await route.fulfill({ response })
  })
  const page = await context.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await check('Hosted collection loads all 20 products', async () => {
    const response = await page.goto(origin)
    assert.equal(response.status(), 200)
    await expect(page.locator('.product-card')).toHaveCount(20)
  })
  await check('Hosted duplicate Add keeps one row and calculates the discount', async () => {
    const add = page.getByRole('button', { name: 'Add Studio Wireless to bag' })
    await add.click()
    await add.click()
    await expect(page.getByTestId('cart-row')).toHaveCount(1)
    await expect(page.getByLabel('Quantity for Studio Wireless')).toHaveText('2')
    await expect(page.locator('.cart-total')).toContainText('Rs. 6,298.20')
  })
  await check('Direct hosted detail URL returns HTTP 200 and the correct customer', async () => {
    const response = await page.goto(`${origin}/customers/c02`)
    assert.equal(response.status(), 200)
    await expect(page.locator('.profile-card h2')).toHaveText('Omar Farooq')
    assert.equal(new URL(page.url()).pathname, '/customers/c02')
  })
  await check('Hosted detail refresh returns HTTP 200 without a refresh 404', async () => {
    const response = await page.reload()
    assert.equal(response.status(), 200)
    await expect(page.locator('.profile-card h2')).toHaveText('Omar Farooq')
    await mkdir('artifacts', { recursive: true })
    await page.screenshot({ path: 'artifacts/hosted-detail-refresh.png' })
  })
  await check('Hosted rapid selection rejects the older detail response', async () => {
    await page.goto(`${origin}/customers/c01`)
    await page.getByRole('link', { name: 'Next customer' }).click()
    await expect(page.locator('.profile-card h2')).toHaveText('Omar Farooq')
    await page.waitForTimeout(1200)
    await expect(page.locator('.profile-card h2')).toHaveText('Omar Farooq')
  })
  await check('Hosted modal validates and restores keyboard focus after saving', async () => {
    await page.goto(`${origin}/customers`)
    await expect(page.locator('tbody tr')).toHaveCount(8)
    const trigger = page.getByRole('button', { name: 'Add customer', exact: true })
    await trigger.click()
    await expect(page.getByLabel('Full name')).toBeFocused()
    const dialog = page.getByRole('dialog')
    const submit = dialog.getByRole('button', { name: 'Add customer', exact: true })
    await submit.click()
    await expect(dialog.getByRole('alert')).toHaveCount(3)
    await page.getByLabel('Full name').fill('Release Review')
    await page.getByLabel('Email address').fill('release.review@example.com')
    await page.getByLabel('City', { exact: true }).fill('Karachi')
    await submit.focus()
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(submit).toBeFocused()
    await submit.click()
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await expect(page.locator('tbody tr')).toHaveCount(9)
  })
  await check('Hosted CSV preserves the start-time snapshot while filters change', async () => {
    await page.getByRole('button', { name: 'Export customers' }).click()
    await page.getByRole('searchbox', { name: 'Search customers' }).fill('Ayesha')
    await expect(page.locator('tbody tr')).toHaveCount(1)
    await expect(page.getByText('Your export is ready.')).toBeVisible()
    const downloaded = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download CSV' }).click()
    const download = await downloaded
    const stream = await download.createReadStream()
    let content = ''
    for await (const chunk of stream) content += chunk.toString('utf8')
    assert.equal(content.split('\r\n').length, 10)
    assert.ok(content.includes('Omar Farooq'))
    assert.ok(content.includes('Release Review'))
  })
  await check('Hosted error retry restores the collection', async () => {
    await page.goto(`${origin}/?state=error`)
    await expect(page.getByRole('alert')).toBeVisible()
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.locator('.product-card')).toHaveCount(20)
  })
  await check('Hosted unknown customer URL shows the application empty state', async () => {
    const response = await page.goto(`${origin}/customers/missing`)
    assert.equal(response.status(), 200)
    await expect(page.getByText('This connection isn’t here.')).toBeVisible()
  })
  await check('Hosted browser completed without uncaught application errors', async () => {
    assert.deepEqual(pageErrors, [])
  })
  const result = { origin, checkedAt: new Date().toISOString(), status: 'passed', checks }
  await writeFile('artifacts/hosted-verification.json', JSON.stringify(result, null, 2) + '\n')
  console.log(
    JSON.stringify({
      status: result.status,
      passed: checks.length,
      evidence: 'artifacts/hosted-verification.json',
    }),
  )
} catch (error) {
  const message = error instanceof Error ? error.message : 'Hosted verification failed'
  console.error(token ? message.replaceAll(token, '[redacted]') : message)
  process.exitCode = 1
} finally {
  await browser?.close()
  await transport?.dispose()
}
