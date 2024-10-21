import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scanner Sim',
  description: 'Your Barcode Scanner Simulator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 min-h-screen flex items-center justify-center`}>
          <main className="container mx-auto px-4 py-8 max-w-3xl flex flex-col items-center justify-center">
            {children}
          </main>
      </body>
    </html>
  )
}
