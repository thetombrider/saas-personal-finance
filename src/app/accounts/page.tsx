'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Button } from "@/components/ui/button"
import { PlusCircle, CreditCard } from "lucide-react"
import { toast } from 'react-hot-toast'
import { getUser, fetchAccounts } from '@/lib/supabaseService' // Ensure this is updated
import { createLinkToken, exchangePublicToken } from '@/lib/plaidService' // Ensure this is updated

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
    setIsLoading(true);
    try {
      const user = await getUser(); // Use the new service function
      if (!user) throw new Error('User not found'); // Check if user is valid
      const response = await createLinkToken(user.id); // Use the new service function
      if (!response.data.link_token) throw new Error('Link token not generated'); // Check link token
      setLinkToken(response.data.link_token); // Extract link_token from response
    } catch (error) {
      console.error('Error generating link token:', error);
      toast.error('Failed to initialize Plaid Link. Please try again.'); // Toast notification for error
    } finally {
      setIsLoading(false);
    }
  }, [])

  const fetchAccountsData = useCallback(async () => { // Renamed function to avoid conflict
    try {
      const accountsData = await fetchAccounts(); // Use the new service function
      if (!Array.isArray(accountsData)) throw new Error('Invalid accounts data'); // Validate accounts data
      setAccounts(accountsData); // Updated variable name
    } catch (error) {
      console.error('Error fetching accounts data:', error);
      toast.error('Failed to fetch accounts. Please try again.'); // Toast notification for error
    }
  }, [])

  useEffect(() => {
    generateToken();
    fetchAccountsData();
  }, [generateToken, fetchAccountsData]);

  const onSuccess = useCallback(async (public_token: string) => {
    try {
      await exchangePublicToken(public_token); // Use the new service function
      toast.success('Account linked successfully');
      fetchAccountsData(); // Refresh the accounts list after linking
    } catch (error) {
      console.error('Error exchanging public token:', error);
      toast.error('Failed to link account. Please try again.'); // Toast notification for error
    }
  }, [fetchAccountsData]);

  const onExit = useCallback((err: any) => {
    if (err != null) {
      console.error('Plaid Link error:', err);
      toast.error('An error occurred while linking your account.'); // Toast notification for error
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