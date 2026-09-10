import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Review production, including the real composited gradient behind each line
// of text. axe may mark gradient contrast as needing manual review.
const output = resolve('.sites-runtime/v2-review')
await mkdir(output, { recursive: true })
const browser = await chromium.launch()
const results = []
try {
  for (const width of [390, 768, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, deviceScaleFactor: 1 })
    await page.goto('http://127.0.0.1:4173')
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: resolve(output, 'full-page-' + width + '.png'), fullPage: true })
    await page.screenshot({ path: resolve(output, 'hero-' + width + '.png') })
    const samples = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const lines = []
      let node
      while ((node = walker.nextNode())) {
        const el = node.parentElement
        if (!el || !node.textContent.trim() || ['SCRIPT', 'STYLE'].includes(el.tagName)) continue
        const css = getComputedStyle(el)
        if (css.visibility === 'hidden') continue
        const range = document.createRange()
        range.selectNodeContents(node)
        for (const rect of range.getClientRects()) {
          if (rect.width < 1 || rect.height < 1 || rect.top < 0) continue
          lines.push({ text: node.textContent.trim(), color: css.color, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 })
        }
      }
      return lines
    })
    const style = await page.addStyleTag({ content: '* { transition: none !important; color: transparent !important; text-shadow: none !important; }' })
    const background = await page.screenshot({ fullPage: true })
    await style.evaluate(el => el.remove())
    const report = await page.evaluate(async ({ samples, png }) => {
      const img = new Image()
      img.src = png
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(img, 0, 0)
      const luminance = channels => {
        const c = channels.slice(0, 3).map(n => { const v = n / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 })
        return c[0] * .2126 + c[1] * .7152 + c[2] * .0722
      }
      const readings = samples.map(sample => {
        const foreground = sample.color.match(/[\d.]+/g).map(Number)
        const background = [...context.getImageData(Math.floor(sample.x), Math.floor(sample.y), 1, 1).data]
        const a = luminance(foreground), b = luminance(background)
        return { text: sample.text, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }
      })
      return { sampledLines: readings.length, minimum: Math.min(...readings.map(line => line.ratio)), belowAAA: readings.filter(line => line.ratio < 7) }
    }, { samples, png: 'data:image/png;base64,' + background.toString('base64') })
    results.push({ width, ...report })
    await page.close()
  }
} finally {
  await browser.close()
}
await writeFile(resolve(output, 'contrast-review.json'), JSON.stringify(results, null, 2) + '\n')
console.log(JSON.stringify(results, null, 2))
if (results.some(result => result.belowAAA.length)) process.exitCode = 1
