'use client'
import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link'
import { Button } from "@/components/ui/button"
import { PlusCircle, CreditCard } from "lucide-react"
import { toast } from 'react-hot-toast'
import { getUser, fetchAccounts } from '@/lib/supabaseService'
import { createLinkToken, exchangePublicToken } from '@/lib/plaidService'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

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
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const generateToken = useCallback(async () => {
    if (linkToken) return;
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/plaid/create_link_token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId: user?.id }),
      });
      
      const data = await response.json();
      console.log('Response from create_link_token:', data);
      
      if (!response.ok) {
        throw new Error(`Failed to create link token: ${data.error}`);
      }
      
      if (!data.link_token) throw new Error('Link token not received');
      
      console.log('Link token generated successfully:', data.link_token);
      setLinkToken(data.link_token);
    } catch (error) {
      console.error('Error generating link token:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to initialize Plaid Link: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [linkToken, user]);

  const fetchAccountsData = useCallback(async () => {
    if (!user) return;
    try {
      console.log('Fetching accounts for user:', user.id);
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/plaid/get_accounts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      console.log('Response from get_accounts:', data);
      if (response.ok) {
        setAccounts(data.accounts);
      } else {
        throw new Error(data.error || 'Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts data:', error);
      toast.error(`Failed to fetch accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        router.push('/auth');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const initializeLinkToken = async () => {
      if (user && !linkToken) {
        console.log('Initializing link token');
        await generateToken();
      }
    };
    initializeLinkToken();
  }, [user, linkToken, generateToken]);

  useEffect(() => {
    if (user) {
      fetchAccountsData();
    }
  }, [user, fetchAccountsData]);

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
      const { data: { user } } = await supabase.auth.getUser();
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
            onClick={() => {
              console.log('Link button clicked');
              console.log('Ready:', ready);
              console.log('Is loading:', isLoading);
              console.log('Link token:', linkToken);
              console.log('User:', user);
              if (ready && !isLoading && linkToken && user) {
                open();
              } else {
                console.log('Button click conditions not met');
              }
            }} 
            disabled={!ready || isLoading || !linkToken || !user}
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