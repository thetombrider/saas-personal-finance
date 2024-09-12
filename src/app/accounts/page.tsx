'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link'
import { Button } from "@/components/ui/button"
import { PlusCircle, CreditCard } from "lucide-react"
import { toast } from 'react-hot-toast'
import { getUser, fetchAccounts } from '@/lib/supabaseService'
import { createLinkToken, exchangePublicToken } from '@/lib/plaidService'
import { supabase } from '@/lib/supabaseClient'

// Placeholder type for account data
type Account = {
  account_id: string;
  name: string;
  balances: {
    current: number;
    available: number;
  };
  type: string;
  subtype: string;
  mask: string;
};

export default function AccountsPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  const generateToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getUser();
      if (!user) throw new Error('User not found');
      
      console.log('Fetching link token for user:', user.id);
      const response = await fetch('/api/plaid/create_link_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create link token: ${errorData.error}`);
      }
      
      const data = await response.json();
      if (!data.link_token) throw new Error('Link token not received');
      
      console.log('Link token generated successfully');
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error generating link token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to initialize Plaid Link: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [])

  const fetchAccountsData = useCallback(async () => {
    try {
      const user = await getUser();
      if (!user) throw new Error('User not found');

      console.log('Fetching accounts for user:', user.id);
      const response = await fetch('/api/plaid/get_accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setAccounts(data.accounts);
      } else {
        throw new Error(data.error || 'Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts data:', error);
      toast.error('Failed to fetch accounts. Please try again.');
    }
  }, [])

  useEffect(() => {
    generateToken();
    fetchAccountsData();
  }, [generateToken, fetchAccountsData]);

  const config: PlaidLinkOptions = {
    token: linkToken!,
    onSuccess: async (public_token, metadata) => {
      console.log('Link success, public token:', public_token);
      await onSuccess(public_token);
    },
    onExit: (err, metadata) => {
      console.log('Link exit:', err, metadata);
      if (err != null) {
        console.error('Plaid Link error:', err);
        toast.error('An error occurred while linking your account.');
      }
    },
    onEvent: (eventName, metadata) => {
      console.log('Link event:', eventName, metadata);
    },
  };

  const { open, ready, error } = usePlaidLink(config);

  useEffect(() => {
    if (error) {
      console.error('Plaid Link error:', error);
      toast.error(`Error initializing Plaid Link: ${error.message}`);
    }
  }, [error]);

  const onSuccess = useCallback(async (public_token: string) => {
    try {
      const user = await getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/plaid/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token, userId: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Account linked successfully');
        fetchAccountsData();
      } else {
        throw new Error(data.error || 'Failed to link account');
      }
    } catch (error) {
      console.error('Error exchanging public token:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to link account: ${errorMessage}`);
    }
  }, [fetchAccountsData]);

  const onExit = useCallback((err: any) => {
    if (err != null) {
      console.error('Plaid Link error:', err);
      toast.error('An error occurred while linking your account.');
    }
    // Handle user exit
  }, [])

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Accounts</h1>
        <div className="mt-4">
          <Button 
            onClick={() => open()} 
            disabled={!ready || isLoading || !linkToken}
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
            <div key={account.account_id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">{account.name}</h2>
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600">{account.type} - {account.subtype}</p>
              <p className="text-sm text-gray-500">Account ending in: {account.mask}</p>
              <p className="text-xl font-bold mt-2 text-gray-900">
                ${account.balances.current.toFixed(2)}
              </p>
              {account.balances.available && (
                <p className="text-sm text-gray-500">
                  Available: ${account.balances.available.toFixed(2)}
                </p>
              )}
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