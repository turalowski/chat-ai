'use client'

import { useAppContext } from '@/app/_context/Chat'

export default function ErrorAlert() {
  const { error } = useAppContext()

  if (!error) {
    return null
  }

  return (
    <div className="border border-red-400 rounded-md p-4">
      <p className="text-red-500">{error}</p>
    </div>
  )
}
