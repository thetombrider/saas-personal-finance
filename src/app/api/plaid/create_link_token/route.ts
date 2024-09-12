import { NextResponse } from 'next/server'
import { createLinkToken } from '@/lib/plaidService'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { userId } = await req.json();
    console.log('Creating link token for authenticated user:', userId);

    const linkToken = await createLinkToken(userId);
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
