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
    <html lang="en" className="h-full bg-white">
      <body className={`h-full flex flex-col ${inter.className}`}>
        <Navbar />
        <div className="flex-grow pt-16">
          <main>
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <footer className="bg-white border-t">
          <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">© 2023 Personal Finance App. All rights reserved.</p>
          </div>
        </footer>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}