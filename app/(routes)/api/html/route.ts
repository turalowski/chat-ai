import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteer, { Browser } from 'puppeteer';

export async function POST(request: NextRequest) {
  // Keep in memory for possible re-use between innovations
  const isLocal = false; // Set this variable as required - @sparticuz/chromium does not work on ARM, so we use a standard Chrome executable locally - see issue https://github.com/Sparticuz/chromium/issues/186

  const chromeArgs = [
    // @sparticuz/chromium has default chromeArgs to improve serverless performance, but you can add others as you deem appropriate
    '--font-render-hinting=none', // Improves font-rendering quality and spacing
  ];

  const browser = await puppeteer.launch({
    channel: 'chrome',
  });

  try {
    let { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=converted.pdf',
      },
    });
  } catch (error) {
    console.error('Error converting HTML to PDF:', error);
    return NextResponse.json(
      { error: 'Failed to convert HTML to PDF' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
