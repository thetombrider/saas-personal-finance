import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaidService';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

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
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts', details: (error as Error).message }, { status: 500 });
  }
}
