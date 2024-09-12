import { NextResponse } from 'next/server';
import { exchangePublicToken } from '@/lib/plaidService';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { public_token, userId } = await req.json();
    console.log('Received public token:', public_token);
    console.log('Received user ID:', userId);

    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const result = await exchangePublicToken(public_token, user.id);
    console.log('Exchange result:', result);

    return NextResponse.json({ message: 'Access token obtained and saved successfully' });
  } catch (error) {
    console.error('Error in exchange_public_token route:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to exchange token', details: errorMessage }, { status: 500 });
  }
}