'use client'


/* These styles are required to avoid duplicate page rendering*/
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { useEffect, useState } from 'react'
import { createClient } from '../_utils/supabase/client'
import { useAppContext } from '../_context/Chat'

// Props definition for PreviewPdf component
type PreviewPdfProps = {
  setTotalPages?: Function // Optional function to set the total number of pages
  documentPath: string | undefined
}

const PreviewPdf: React.FC<PreviewPdfProps> = ({ documentPath }) => {
  const { setPage, page } = useAppContext()
  const [file, setFile] = useState<null | string>(null)
  // Function to handle successful loading of the PDF document

  useEffect(() => {
    setPage(1)
    async function fetchFile() {
      if (documentPath) {
        const supabase = createClient()
        const { data: documentAsBlob, error: documentError } =
          await supabase.storage.from('documents').download(documentPath)
        if (documentError) {
          throw new Error('Could not find the document')
        }
        const url = URL.createObjectURL(documentAsBlob as Blob)
        setFile(`${url}`)
      }
    }

    if (documentPath) {
      fetchFile()
    }
  }, [documentPath])

  return (
    <object
      key={`${file}#page=${page}`}
      data={`${file}#page=${page}`}
      type="application/pdf"
      width="100%"
      height="100%"
      className="w-full"
    ></object>
  )
}

export { PreviewPdf }
