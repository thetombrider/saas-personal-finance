import { NextResponse } from 'next/server';
import { exchangePublicToken } from '@/lib/plaidService';
import { getUser } from '@/lib/supabaseService';

export async function POST(req: Request) {
  try {
    const { public_token } = await req.json();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    await exchangePublicToken(public_token, user.id);

    return NextResponse.json({ message: 'Access token obtained and saved successfully' });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return NextResponse.json({ error: 'Failed to exchange token' }, { status: 500 });
  }
}