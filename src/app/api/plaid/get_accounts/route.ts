import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaidService';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

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
