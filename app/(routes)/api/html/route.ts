import { convertHtmlToPdf } from '@/app/_utils/html-to-pdf'
import { createClient } from '@/app/_utils/supabase/server'
import { UnsafeUrlError } from '@/app/_utils/url-safety'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

//  Please do pay attention to how long your API requests
// run as it may run up your bill or may make you eventually
// actually have a bill. Free version of Vercel has 60 seconds max duration.
export const maxDuration = 60

const bodySchema = z.object({ url: z.string().trim().min(1).max(2048) })

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in.' },
        { status: 401 }
      )
    }

    const body = bodySchema.safeParse(await request.json().catch(() => null))

    if (!body.success) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const { url } = body.data
    const buffer = await convertHtmlToPdf(
      /^https?:\/\//i.test(url) ? url : `https://${url}`
    )

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=converted.pdf',
      },
    })
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Error converting HTML to PDF:', error)
    return NextResponse.json(
      { error: 'Failed to convert HTML to PDF' },
      { status: 500 }
    )
  }
}
