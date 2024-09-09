import { NextResponse } from 'next/server';
import { getUser, fetchUserProfile, updateUserProfile } from '@/lib/supabaseService';

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const profile = await fetchUserProfile(user.id);
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await updateUserProfile(user.id, username);
    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}