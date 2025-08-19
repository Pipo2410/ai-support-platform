'use client'

import * as React from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { useAuth } from '@clerk/nextjs'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

/**
 * Wraps React children with ConvexProviderWithClerk to provide Convex client and Clerk-backed auth to the subtree.
 *
 * Renders `children` inside a ConvexProviderWithClerk configured with the module-level `convex` client and Clerk's `useAuth`.
 *
 * @returns The wrapped children as a React element.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}
