import { NextResponse } from 'next/server'
import { createLinkToken } from '@/lib/plaidService'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const linkToken = await createLinkToken(user.id);
    return NextResponse.json({ link_token: linkToken.link_token });
  } catch (error) {
    console.error('Error creating link token:', error)
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 })
  }
}
