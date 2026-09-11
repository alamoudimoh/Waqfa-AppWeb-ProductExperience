import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const identityFiles = ['Waqfa-brand_identity.html', 'Waqfa-color_palette.html']

function filesWithin(directory: string): string[] {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name)
    return statSync(path).isDirectory() ? filesWithin(path) : [path]
  })
}

async function setLocalHour(page: Page, hour: number) {
  await page.addInitScript(value => {
    Object.defineProperty(Date.prototype, 'getHours', { configurable: true, value: () => value })
    Object.defineProperty(Date.prototype, 'getMinutes', { configurable: true, value: () => 0 })
  }, hour)
}

async function centerSection(page: Page, selector: string) {
  await page.locator(selector).evaluate(element => {
    const bounds = element.getBoundingClientRect()
    scrollTo({ top: scrollY + bounds.top + bounds.height / 2 - innerHeight / 2, behavior: 'instant' })
  })
}

test('reference integrity, production colours and official logo geometry', async ({ page }) => {
  const hashes = {
    'Waqfa-brand_identity.html': 'b9dbd7589b20b2cacde3fe1247d111e6826a24e6e616208762046dd802a7b237',
    'Waqfa-color_palette.html': '1cd1e94843552660533fb88c41ad48f9182a277bd1aac762446d4570cb90e603',
  }
  for (const [file, hash] of Object.entries(hashes)) {
    expect(createHash('sha256').update(readFileSync(file)).digest('hex')).toBe(hash)
  }

  const identity = identityFiles.map(file => readFileSync(file, 'utf8')).join('\n').toUpperCase()
  const productionFiles = [...filesWithin('src'), 'index.html', 'public/favicon.svg']
  for (const file of productionFiles) {
    const source = readFileSync(file, 'utf8')
    for (const color of source.match(/#[\da-f]{3,8}\b/gi) || []) {
      expect(identity, `${file} uses an unofficial colour ${color}`).toContain(color.toUpperCase())
    }
    expect(source, `${file} contains a literal RGB/HSL colour`).not.toMatch(/\b(?:rgba?|hsla?|oklch)\(/i)
  }

  const reference = readFileSync('Waqfa-color_palette.html', 'utf8')
  const symbol = reference.match(/<symbol id="waqfa-mark"[^>]*>([\s\S]*?)<\/symbol>/)![1]
  const geometry = [...symbol.matchAll(/ d="([^"]+)"/g)].map(match => match[1])
  await page.goto('/')
  for (const mark of await page.locator('.waqfa-mark').all()) {
    expect(await mark.locator('path').evaluateAll(paths => paths.map(path => path.getAttribute('d')))).toEqual(geometry)
    const style = await mark.evaluate(element => {
      const css = getComputedStyle(element)
      return {
        theme: element.closest('[data-theme]')?.getAttribute('data-theme'),
        width: element.getBoundingClientRect().width,
        filter: css.filter,
        transform: css.transform,
        a: css.getPropertyValue('--logo-a').trim(),
        b: css.getPropertyValue('--logo-b').trim(),
      }
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
    await expect(page.getByText('وإن دللت عليها غيرك، امتد أثرها.', { exact: true })).toBeVisible()
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
  expect(await first.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.getByRole('button', { name: 'الحاسوب', exact: true }).click()
  await expect(page.locator('.resume-state')).toContainText('الموضع نفسه، على الحاسوب')
  expect(await page.locator('html').evaluate(element => getComputedStyle(element).scrollBehavior)).toBe('auto')
})

const localContexts = [
  { hour: 5, phase: 'dawn', journey: 'الفجر', hero: 'من هذا الفجر، إلى آخر اليوم', chapter: 'مع أول يومك', color: '#0F1140' },
  { hour: 9, phase: 'morning', journey: 'الصباح', hero: 'من هذا الصباح، إلى آخر اليوم', chapter: 'مع صباحك', color: '#F7F3EC' },
  { hour: 13, phase: 'noon', journey: 'النهار', hero: 'في قلب النهار، لك وقفة', chapter: 'في يومك الآن', color: '#FFFFFF' },
  { hour: 19, phase: 'sunset', journey: 'المساء', hero: 'مع هذا المساء، لك وقفة', chapter: 'مع مساءك', color: '#0F3E36' },
  { hour: 22, phase: 'night', journey: 'الليل', hero: 'في هدوء الليل، لك وقفة', chapter: 'حين يهدأ يومك', color: '#08211D' },
] as const

for (const context of localContexts) {
  test(`local phase ${context.phase} adapts contextual copy and browser theme`, async ({ page }) => {
    await setLocalHour(page, context.hour)
    await page.goto('/')
    expect(await page.evaluate(() => scrollY)).toBe(0)
    await expect(page.locator('.day-environment')).toHaveAttribute('data-local-phase', context.phase)
    await expect(page.locator('[data-local-context="hero"]')).toHaveText(context.hero)
    await expect(page.locator('[data-local-context="journey"]')).toContainText(context.chapter)
    await expect(page.locator('.day-rail-label')).toContainText(context.journey)
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', context.color)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('يمضي اليوم.وتبقى لك وقفة.')
  })
}

test('night opening does not use morning-only contextual wording', async ({ page }) => {
  await setLocalHour(page, 22)
  await page.goto('/')
  const contextualCopy = await page.locator('[data-local-context]').allInnerTexts()
  expect(contextualCopy.join(' ')).not.toMatch(/هذا الصباح|مع صباحك|بداية يومك/)
  expect(contextualCopy.join(' ')).toContain('في هدوء الليل')
})

test('persistent mark appears after the header and preserves official geometry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const mark = page.locator('.floating-mark')
  await expect(page.locator('.masthead .brand')).toBeVisible()
  await expect(mark).toBeHidden()
  await page.evaluate(() => scrollTo(0, 320))
  await expect(mark).toBeVisible()
  expect(await mark.evaluate(element => getComputedStyle(element).position)).toBe('fixed')

  const reference = readFileSync('Waqfa-color_palette.html', 'utf8')
  const symbol = reference.match(/<symbol id="waqfa-mark"[^>]*>([\s\S]*?)<\/symbol>/)![1]
  const geometry = [...symbol.matchAll(/ d="([^"]+)"/g)].map(match => match[1])
  expect(await mark.locator('path').evaluateAll(paths => paths.map(path => path.getAttribute('d')))).toEqual(geometry)
  expect(await mark.locator('svg').evaluate(element => ({ filter: getComputedStyle(element).filter, transform: getComputedStyle(element).transform }))).toEqual({ filter: 'none', transform: 'none' })
})

test('day journey exposes only its current phase and changes through scroll', async ({ page }) => {
  await setLocalHour(page, 5)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const indicator = page.locator('.day-rail')
  const label = indicator.locator('.day-rail-label')
  await expect(indicator).toHaveAttribute('aria-hidden', 'true')
  expect(await indicator.getAttribute('role')).toBeNull()
  expect(await indicator.getAttribute('aria-live')).toBeNull()
  await expect(label).toHaveText('الفجر')
  await centerSection(page, '.continuation')
  await expect(label).toHaveText('النهار')
  await expect(page.locator('.floating-mark')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#FFFFFF')
  await centerSection(page, '.promise')
  await expect(label).toHaveText('المساء')
  await expect(page.locator('.floating-mark')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0F3E36')
  await centerSection(page, '.night')
  await expect(label).toHaveText('الليل')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#08211D')
  expect(await label.count()).toBe(1)
})

test('share fallback uses safe links, copies the URL, closes with Escape and returns focus', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => { (window as Window & { __copiedUrl?: string }).__copiedUrl = value } },
    })
  })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'شارك وقفة' })
  const panel = page.getByRole('group', { name: 'خيارات مشاركة وقفة' })
  await expect(panel).toBeHidden()
  await trigger.click()
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('link', { name: 'واتساب' })).toBeFocused()

  const hrefs = await panel.getByRole('link').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href))
  expect(hrefs).toHaveLength(4)
  for (const href of hrefs) expect(href).toMatch(/^https:\/\//)
  expect(hrefs.some(href => href.startsWith('https://wa.me/'))).toBe(true)
  expect(hrefs.some(href => href.startsWith('https://t.me/share/'))).toBe(true)
  expect(hrefs.some(href => href.startsWith('https://www.facebook.com/sharer/'))).toBe(true)
  expect(hrefs.some(href => href.startsWith('https://twitter.com/intent/'))).toBe(true)

  await panel.getByRole('button', { name: 'نسخ الرابط' }).click()
  await expect(page.getByText('تم نسخ رابط وقفة')).toBeVisible()
  expect(await page.evaluate(() => (window as Window & { __copiedUrl?: string }).__copiedUrl)).toBe('https://waqfa.app/')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('desktop fallback remains available when Web Share exists', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => { (window as Window & { __nativeShareCalled?: boolean }).__nativeShareCalled = true },
    })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'شارك وقفة' }).click()
  expect(await page.evaluate(() => (window as Window & { __nativeShareCalled?: boolean }).__nativeShareCalled)).toBeUndefined()
  await expect(page.getByRole('group', { name: 'خيارات مشاركة وقفة' })).toBeVisible()
})

test('appropriate native share path can succeed or degrade to the fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const nativeMatchMedia = window.matchMedia.bind(window)
    window.matchMedia = query => query === '(pointer: coarse)'
      ? { matches: true, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => true }
      : nativeMatchMedia(query)
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => { (window as Window & { __nativeShareCalled?: boolean }).__nativeShareCalled = true },
    })
  })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'شارك وقفة' })
  const panel = page.getByRole('group', { name: 'خيارات مشاركة وقفة' })
  await trigger.click()
  expect(await page.evaluate(() => (window as Window & { __nativeShareCalled?: boolean }).__nativeShareCalled)).toBe(true)
  await expect(panel).toBeHidden()

  await page.evaluate(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new TypeError('share unavailable') } })
  })
  await trigger.click()
  await expect(panel).toBeVisible()
})

test('rendered interface contains no personal credit', async ({ page }) => {
  await page.goto('/')
  const rendered = await page.locator('body').innerText()
  expect(rendered).not.toContain('محمد العمودي')
  expect(rendered).not.toMatch(/مؤسس|المؤسس|Founder|Author|©/i)
})

test('public metadata and structured data contain no personal attribution', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('meta[name="author"], meta[property*="author" i], meta[name*="creator" i]')).toHaveCount(0)
  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(structuredData.join(' ')).not.toMatch(/author|founder|creator|محمد العمودي|alamoudi/i)
  expect(await page.locator('head').innerHTML()).not.toMatch(/محمد العمودي|alamoudi/i)
})
