'use server'

import puppeteer from 'puppeteer';

export const convertHtmlToPdf = async (url: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    
    // Wait for dynamic content to load
    await page.waitForTimeout(5000);

    // Scroll to bottom and back to top to ensure all lazy-loaded content is rendered
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      preferCSSPageSize: true,
    });

    return pdfBuffer;

  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw new Error(`Failed to convert HTML to PDF: ${(error as Error).message}`);
  } finally {
    await browser.close();
  }
}