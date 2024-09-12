import { NextResponse } from 'next/server'
import { createLinkToken } from '@/lib/plaidService'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const linkToken = await createLinkToken(userId)
    return NextResponse.json({ link_token: linkToken.link_token })
  } catch (error) {
    console.error('Error creating link token:', error)
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 })
  }
}
