import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Personal Finance App',
  description: 'Manage your personal finances with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className={`h-full ${inter.className}`}>
        <Navbar />
        <div className="min-h-full">
          <main>
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}