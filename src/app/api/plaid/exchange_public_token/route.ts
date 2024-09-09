import { NextResponse } from 'next/server';
import { exchangePublicToken } from '@/lib/plaidService';
import { getUser } from '@/lib/supabaseService';

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();
    console.log('Received public token:', public_token);

    const user = await getUser();
    console.log('User:', user);
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const result = await exchangePublicToken(public_token, user.id);
    console.log('Exchange result:', result);

    return NextResponse.json({ message: 'Access token obtained and saved successfully' });
  } catch (error) {
    console.error('Error in exchange_public_token route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to exchange token', details: errorMessage }, { status: 500 });
  }
}