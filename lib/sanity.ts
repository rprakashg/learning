import { createClient, type SanityClient } from 'next-sanity'
import { createImageUrlBuilder, type ImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

function getConfig() {
  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
    apiVersion: '2024-01-01',
  }
}

// Defers createClient (which validates projectId) to first actual use so the
// module can be imported during next build without env vars present.
function makeLazyClient(extra: Record<string, unknown> = {}): SanityClient {
  let instance: SanityClient | undefined
  return new Proxy({} as SanityClient, {
    get(_target, prop) {
      instance ??= createClient({ ...getConfig(), ...extra })
      const val = Reflect.get(instance, prop, instance)
      return typeof val === 'function' ? val.bind(instance) : val
    },
  })
}

export const sanityClient = makeLazyClient({ useCdn: process.env.NODE_ENV === 'production' })

// Server-side only — requires SANITY_API_TOKEN with Editor permissions
export const sanityWriteClient = makeLazyClient({ useCdn: false, token: process.env.SANITY_API_TOKEN })

let builder: ImageUrlBuilder | undefined

export function urlFor(source: SanityImageSource) {
  builder ??= createImageUrlBuilder(createClient(getConfig()))
  return builder.image(source)
}
