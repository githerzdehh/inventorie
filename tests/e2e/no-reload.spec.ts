import { expect, test, type Page } from '@playwright/test'

declare global {
  interface Window {
    __inventorieReloadAudit?: {
      reloads: number
      beforeUnload: number
    }
  }
}

const sourceImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="560" height="980" viewBox="0 0 560 980">
  <rect width="560" height="980" fill="#fffaf0"/>
  <rect x="54" y="42" width="452" height="890" rx="24" fill="#ffffff" stroke="#f9aa11" stroke-width="4"/>
  <text x="280" y="110" text-anchor="middle" font-family="monospace" font-size="28" fill="#111111">INVENTORIE TEST IMAGE</text>
  <line x1="94" y1="150" x2="466" y2="150" stroke="#111111" stroke-width="3"/>
  <text x="94" y="220" font-family="monospace" font-size="24" fill="#111111">EGGS LARGE 12PCS</text>
  <text x="420" y="220" text-anchor="end" font-family="monospace" font-size="24" fill="#111111">112.00</text>
  <text x="94" y="270" font-family="monospace" font-size="24" fill="#111111">CHICKEN BREAST 1KG</text>
  <text x="420" y="270" text-anchor="end" font-family="monospace" font-size="24" fill="#111111">245.50</text>
  <text x="94" y="320" font-family="monospace" font-size="24" fill="#111111">GARLIC</text>
  <text x="420" y="320" text-anchor="end" font-family="monospace" font-size="24" fill="#111111">35.00</text>
  <text x="94" y="370" font-family="monospace" font-size="24" fill="#111111">WHITE RICE 5KG</text>
  <text x="420" y="370" text-anchor="end" font-family="monospace" font-size="24" fill="#111111">330.00</text>
  <line x1="94" y1="420" x2="466" y2="420" stroke="#f9aa11" stroke-width="3"/>
  <text x="94" y="480" font-family="monospace" font-size="24" font-weight="700" fill="#111111">TOTAL</text>
  <text x="420" y="480" text-anchor="end" font-family="monospace" font-size="24" font-weight="700" fill="#111111">773.08</text>
</svg>
`

async function installReloadAudit(page: Page) {
  await page.addInitScript(() => {
    const reloadKey = 'inventorie:e2e-reload-count'
    const unloadKey = 'inventorie:e2e-beforeunload-count'
    const reloads = Number(window.sessionStorage.getItem(reloadKey) ?? '0') + 1

    window.sessionStorage.setItem(reloadKey, String(reloads))
    window.__inventorieReloadAudit = {
      reloads,
      beforeUnload: Number(window.sessionStorage.getItem(unloadKey) ?? '0'),
    }
    window.addEventListener('beforeunload', () => {
      const beforeUnload = Number(window.sessionStorage.getItem(unloadKey) ?? '0') + 1

      window.sessionStorage.setItem(unloadKey, String(beforeUnload))
    })
  })
}

async function expectNoUnexpectedReload(page: Page) {
  const audit = await page.evaluate(() => ({
    reloads: Number(window.sessionStorage.getItem('inventorie:e2e-reload-count') ?? '0'),
    beforeUnload: Number(window.sessionStorage.getItem('inventorie:e2e-beforeunload-count') ?? '0'),
  }))

  expect(audit).toEqual({
    reloads: 1,
    beforeUnload: 0,
  })
}

async function resetReloadAudit(page: Page) {
  await page.evaluate(() => {
    window.sessionStorage.setItem('inventorie:e2e-reload-count', '1')
    window.sessionStorage.setItem('inventorie:e2e-beforeunload-count', '0')
    window.__inventorieReloadAudit = {
      reloads: 1,
      beforeUnload: 0,
    }
  })
}

test('scan, preview, history, and lightbox clicks do not reload the page', async ({ page }) => {
  await installReloadAudit(page)
  await page.goto('/login')

  await page.getByLabel('Username or email').fill('superadmin')
  await page.getByLabel('Password').fill('super123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app\/scan$/)
  await page.waitForLoadState('networkidle')
  await resetReloadAudit(page)
  await expectNoUnexpectedReload(page)

  await page.getByRole('button', { name: 'Use Sample Scan' }).click()
  await expect(page).toHaveURL(/\/app\/review-items$/)
  await expect(page.getByText('Scan processed. Review the detected items below before saving.')).toBeVisible()
  await expectNoUnexpectedReload(page)

  await page.getByRole('link', { name: 'Scan another image' }).click()
  await expect(page).toHaveURL(/\/app\/scan$/)
  await expectNoUnexpectedReload(page)

  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'inventorie-source-20260619-test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(sourceImageSvg),
  })
  await expect(page.getByRole('button', { name: 'Open source image preview' })).toBeVisible()
  await page.getByRole('button', { name: 'Review image' }).click()
  await expect(page.getByRole('dialog').getByText('Source preview')).toBeVisible()
  await page.getByLabel('Zoom in').click()
  await page.getByLabel('Rotate right').click()
  await page.getByLabel('Zoom out').click()
  await page.getByLabel('Reset image view').click()
  await page.getByLabel('Close image preview').click()
  await expectNoUnexpectedReload(page)

  await page.getByRole('link', { name: 'Scan history' }).click()
  await expect(page).toHaveURL(/\/app\/scans$/)
  await expect(page.getByText(/CVSCAN-/).first()).toBeVisible()
  await page.getByRole('button', { name: 'View details' }).first().click()
  await expect(page.getByRole('dialog').getByText(/CVSCAN-/).first()).toBeVisible()
  await page.getByLabel('Close scan details').click()
  await expectNoUnexpectedReload(page)
})
