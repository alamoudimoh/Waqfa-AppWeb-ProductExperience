import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

test('reference integrity and official logo geometry', async ({ page }) => {
  const hashes = {
    'Waqfa-brand_identity.html': 'b9dbd7589b20b2cacde3fe1247d111e6826a24e6e616208762046dd802a7b237',
    'Waqfa-color_palette.html': '1cd1e94843552660533fb88c41ad48f9182a277bd1aac762446d4570cb90e603',
  }
  for (const [file, hash] of Object.entries(hashes)) expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(hash)
  const reference = readFileSync('Waqfa-color_palette.html', 'utf8')
  const symbol = reference.match(/<symbol id="waqfa-mark"[^>]*>([\s\S]*?)<\/symbol>/)![1]
  const geometry = [...symbol.matchAll(/ d="([^"]+)"/g)].map(match => match[1])
  const css = readFileSync('src/tokens.css', 'utf8')
  for (const color of css.match(/#[\da-f]{6}\b/gi) || []) expect(reference + readFileSync('Waqfa-brand_identity.html', 'utf8')).toContain(color)
  expect(readFileSync('src/styles.css', 'utf8')).not.toMatch(/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/i)
  await page.goto('/')
  for (const mark of await page.locator('.waqfa-mark').all()) {
    expect(await mark.locator('path').evaluateAll(paths => paths.map(path => path.getAttribute('d')))).toEqual(geometry)
    const style = await mark.evaluate(el => {
      const css = getComputedStyle(el)
      return { theme: el.closest('[data-theme]')?.getAttribute('data-theme'), width: el.getBoundingClientRect().width, filter: css.filter, transform: css.transform, a: css.getPropertyValue('--logo-a').trim(), b: css.getPropertyValue('--logo-b').trim() }
    })
    expect(style.width).toBeGreaterThanOrEqual(24)
    expect(style.filter).toBe('none')
    expect(style.transform).toBe('none')
    expect(style.a.toUpperCase()).toBe(style.theme === 'dark' ? '#F2F2F2' : '#0F3E36')
    expect(style.b.toUpperCase()).toBe(style.theme === 'dark' ? '#6D8C87' : '#0F1140')
  }
})

for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  test('production layout and accessibility at ' + width, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
    expect(await page.locator('body').innerText()).not.toMatch(/[a-zA-Z]/)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    expect(await page.locator('h1').count()).toBe(1)
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByText('هذا التطبيق وقفٌ لله تعالى', { exact: true }).first()).toBeVisible()
    expect(await page.evaluate(() => document.fonts.check('16px Cairo') && document.fonts.check('16px Amiri'))).toBe(true)
    await page.addScriptTag({ path: resolve('node_modules/axe-core/axe.min.js') })
    const violations = await page.evaluate(async () => {
      const result = await (window as unknown as { axe: { run: (node: Document, options: object) => Promise<{ violations: { id: string; nodes: { html: string }[] }[] }> } }).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag2aaa', 'best-practice'] } })
      return result.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.html) }))
    })
    expect(violations).toEqual([])
    expect(errors).toEqual([])
    await page.screenshot({ path: testInfo.outputPath('page-' + width + '.png'), fullPage: true })
  })
}

test('keyboard, RTL tabs, mobile navigation and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'انتقل إلى المحتوى' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
  await page.getByRole('button', { name: 'القائمة' }).click()
  await expect(page.locator('#mobile-nav')).toBeVisible()
  await page.locator('#mobile-nav a').first().focus()
  await page.keyboard.press('Escape')
  await expect(page.locator('#menu-button')).toBeFocused()
  await expect(page.locator('#mobile-nav')).toBeHidden()
  const first = page.getByRole('tab').first()
  await first.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByRole('tab').nth(1)).toBeFocused()
  await expect(page.getByRole('tabpanel')).toContainText('أذكار المساء')
  await page.keyboard.press('End')
  await expect(page.getByRole('tabpanel')).toContainText('أذكار النوم')
  await page.keyboard.press('Home')
  await expect(first).toBeFocused()
  expect(await first.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none')
  await page.getByRole('button', { name: 'الحاسوب', exact: true }).click()
  await expect(page.locator('.resume-state')).toContainText('الموضع نفسه، على الحاسوب')
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).scrollBehavior)).toBe('auto')
  for (const link of await page.locator('a[href^="https:"]').all()) expect(await link.getAttribute('href')).toMatch(/^https:\/\/my\.waqfa\.app\/?$/)
})
