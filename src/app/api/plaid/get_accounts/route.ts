import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaidService';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    console.log('Entering get_accounts route');
    const supabase = createServerComponentClient({ cookies });
    console.log('Supabase client created');
    const { data, error: sessionError } = await supabase.auth.getSession();
    console.log('Session data:', data);
    console.log('Session error:', sessionError);

    if (!data.session) {
      console.log('No session found');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    console.log('User authenticated, proceeding with request');
    const { userId } = await request.json();
    console.log('Fetching Plaid items for user:', userId);

    const { data: plaidItems, error } = await supabase
      .from('plaid_items')
      .select('access_token')
      .eq('user_id', userId);

    if (error) throw error;

    if (!plaidItems || plaidItems.length === 0) {
      return NextResponse.json({ accounts: [] });
    }

    const allAccounts = [];

    for (const item of plaidItems) {
      console.log('Fetching accounts for access token:', item.access_token);
      const response = await plaidClient.accountsGet({
        access_token: item.access_token,
      });

      allAccounts.push(...response.data.accounts);
    }

    console.log('All accounts fetched:', allAccounts.length);
    return NextResponse.json({ accounts: allAccounts });
  } catch (error) {
    console.error('Error in get_accounts route:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts', details: (error as Error).message }, { status: 500 });
  }
}
