import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'
import '@workspace/ui/globals.css'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

/**
 * Application root layout component.
 *
 * Renders the top-level HTML structure for the app: an <html lang="en"> element (with hydration warning suppressed)
 * and a <body> that applies the configured sans and mono font CSS variables plus utility classes. Wraps the rendered
 * children with ClerkProvider (authentication context) and the app-wide Providers component so nested pages/components
 * receive authentication and global context.
 *
 * @returns The root JSX element representing the application's HTML and body wrappers.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  )
}
