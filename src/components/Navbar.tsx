'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Package2Icon, BellIcon } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Package2Icon className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Finance App</span>
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/accounts" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Accounts
                </Link>
                <Link href="/transactions" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Transactions
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <>
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
                <Button onClick={handleLogout} variant="outline" className="ml-4">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push('/auth')} variant="outline">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}