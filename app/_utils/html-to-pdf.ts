import chromium from '@sparticuz/chromium-min'
import puppeteer from 'puppeteer-core'
import { createUrlGuard, UnsafeUrlError } from './url-safety'

async function getExecutablePath() {
  if (process.env.CHROME_EXECUTABLE_PATH) {
    return process.env.CHROME_EXECUTABLE_PATH
  }
  if (!process.env.CHROMIUM_PACK_URL) {
    throw new Error('Set CHROMIUM_PACK_URL or CHROME_EXECUTABLE_PATH')
  }
  return chromium.executablePath(process.env.CHROMIUM_PACK_URL)
}

export const convertHtmlToPdf = async (url: string): Promise<Buffer> => {
  const isUrlAllowed = createUrlGuard()

  if (!(await isUrlAllowed(url))) {
    throw new UnsafeUrlError()
  }

  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH

  const browser = await puppeteer.launch({
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await getExecutablePath(),
    headless: chromium.headless,
  })

  try {
    const page = await browser.newPage()

    /* Re-check every request so redirects and subresources can't reach internal hosts. */
    await page.setBypassServiceWorker(true)
    await page.setRequestInterception(true)
    page.on('request', async (request) => {
      const requestUrl = request.url()
      const isInlineContent =
        requestUrl.startsWith('data:') || requestUrl.startsWith('blob:')

      try {
        if (isInlineContent || (await isUrlAllowed(requestUrl))) {
          await request.continue()
        } else {
          await request.abort('accessdenied')
        }
      } catch {
        // The request was already resolved, e.g. because the page closed.
      }
    })

    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 })
    // Add a delay of 5 seconds to allow for any dynamic content to load
    await new Promise((resolve) => setTimeout(resolve, 5000))
    // Scroll to bottom and back to top to ensure all lazy-loaded content is rendered
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.evaluate(() => window.scrollTo(0, 0))

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      preferCSSPageSize: true,
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
