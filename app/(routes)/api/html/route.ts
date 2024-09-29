import { convertHtmlToPdf } from '@/app/_actions/html';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const buffer = await convertHtmlToPdf(url);

    return new NextResponse(buffer, {
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
  }
}
