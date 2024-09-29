'use server'

import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';


export const convertHtmlToPdf = async (url: string): Promise<Buffer> => {

const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const browser = await puppeteer.launch({
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath('https://turalowski-chat-ai.s3.eu-west-1.amazonaws.com/chromium-v127.0.0-pack.tar'),
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    // Scroll to bottom and back to top to ensure all lazy-loaded content is rendered
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    throw new Error(`Failed to convert HTML to PDF: ${(error as Error).message}`);
  } finally {
    await browser.close();
  }
}