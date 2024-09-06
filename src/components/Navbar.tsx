import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Package2Icon, BellIcon } from 'lucide-react'
import Image from 'next/image'

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Package2Icon className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Finance App</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/accounts" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Accounts
              </Link>
              <Link href="/transactions" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Transactions
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <BellIcon className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <div className="ml-3 relative">
              <div>
                <Button variant="ghost" size="icon" className="rounded-full border w-8 h-8">
                  <Image src="/placeholder.svg" width="32" height="32" className="rounded-full" alt="User avatar" />
                  <span className="sr-only">Open user menu</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}