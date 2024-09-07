'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Button } from "@/components/ui/button"
import { PlusCircle, CreditCard } from "lucide-react"
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabaseClient'

// Placeholder type for account data
type Account = {
  id: string;
  name: string;
  balance: number;
  type: string;
};

export default function AccountsPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  const generateToken = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/plaid/create_link_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { link_token } = await response.json()
      setLinkToken(link_token)
    } catch (error) {
      console.error('Error generating link token:', error)
      toast.error('Failed to initialize Plaid Link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAccounts = useCallback(async () => {
    // TODO: Implement actual API call to fetch accounts
    setAccounts([
      { id: '1', name: 'Checking Account', balance: 1000, type: 'checking' },
      { id: '2', name: 'Savings Account', balance: 5000, type: 'savings' },
    ])
  }, [])

  useEffect(() => {
    generateToken()
    fetchAccounts()
  }, [generateToken, fetchAccounts])

  const onSuccess = useCallback(async (public_token: string, metadata: any) => {
    try {
      const response = await fetch('/api/plaid/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      toast.success('Account linked successfully')
      fetchAccounts() // Refresh the accounts list after linking
    } catch (error) {
      console.error('Error exchanging public token:', error)
      toast.error('Failed to link account. Please try again.')
    }
  }, [fetchAccounts])

  const onExit = useCallback((err: any) => {
    if (err != null) {
      console.error('Plaid Link error:', err)
      toast.error('An error occurred while linking your account.')
    }
    // Handle user exit
  }, [])

  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  }

  const { open, ready } = usePlaidLink(config)

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Accounts</h1>
        <div className="mt-4">
          <Button 
            onClick={() => open()} 
            disabled={!ready || isLoading}
            variant="outline" 
            className="mr-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {isLoading ? 'Loading...' : 'Link New Account'}
          </Button>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:px-6 py-5">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">{account.name}</h2>
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600">{account.type}</p>
              <p className="text-xl font-bold mt-2 text-gray-900">${account.balance.toFixed(2)}</p>
            </div>
          ))}
        </div>
        {accounts.length === 0 && (
          <div className="text-center py-5 sm:px-6">
            <p className="text-gray-500">
              No accounts linked yet. Click "Link New Account" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}