import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaidService';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const { data: plaidItems, error } = await supabase
      .from('plaid_items')
      .select('access_token')
      .eq('user_id', userId);

    if (error) throw error;

    const allAccounts = [];

    for (const item of plaidItems) {
      const response = await plaidClient.accountsGet({
        access_token: item.access_token,
      });

      allAccounts.push(...response.data.accounts);
    }

    return NextResponse.json({ accounts: allAccounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}
