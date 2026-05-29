'use client'

import dynamicImport from 'next/dynamic'

const StudioClient = dynamicImport(() => import('./studio-client'), { ssr: false })

export function StudioWrapper() {
  return <StudioClient />
}
