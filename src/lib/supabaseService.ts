import { supabase } from '@/lib/supabaseClient'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Function to get user
export const getUser = async () => {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    console.log('Fetching user session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (session && session.user) {
      console.log('User session found:', session.user.id);
      return session.user;
    } else {
      console.log('No active user session found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Function to fetch accounts
export const fetchAccounts = async () => {
  console.log('Fetching accounts...');
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*');

    if (error) {
      console.error('Error fetching accounts:', error.message, error.details, error.hint);
      throw error;
    }
    console.log('Accounts fetched:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error fetching accounts:', error);
    throw error;
  }
}

// Function to update user profile
export const updateUserProfile = async (userId: string, username: string) => {
  console.log(`Updating profile for user ID: ${userId} with username: ${username}`);
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, username });

  if (error) {
    console.error('Error updating profile:', error.message);
    throw new Error('Error updating profile: ' + error.message);
  }
  console.log('Profile updated successfully');
}

// Function to fetch user profile
export const fetchUserProfile = async (userId: string) => {
  console.log(`Fetching profile for user ID: ${userId}`);
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    throw new Error('Error fetching user profile: ' + error.message);
  }
  console.log('User profile fetched:', data);
  return data;
}

export const fetchPlaidItems = async (userId: string) => {
  console.log('Fetching Plaid items for user:', userId);
  const { data, error } = await supabase
    .from('plaid_items')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching Plaid items:', error.message);
    throw error;
  }

  console.log('Plaid items fetched:', data);
  return data;
};