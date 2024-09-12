import { NextResponse } from 'next/server'
import { createLinkToken } from '@/lib/plaidService'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    console.log('Received request to create link token for user:', userId);

    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      console.log('User authentication failed');
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    console.log('Creating link token for authenticated user:', user.id);
    const linkToken = await createLinkToken(user.id);
    console.log('Link token created successfully:', linkToken.link_token);

    return NextResponse.json({ link_token: linkToken.link_token });
  } catch (error) {
    console.error('Error in create_link_token route:', error);
    let errorMessage = 'Failed to create link token';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
