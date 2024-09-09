import { supabase } from '@/lib/supabaseClient'

// Function to get user
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  return user
}

// Function to fetch accounts
export const fetchAccounts = async () => {
  const { data, error } = await supabase
    .from('accounts') // Assuming 'accounts' is the correct table name
    .select('*')

  if (error) throw new Error('Error fetching accounts: ' + error.message)
  return data
}

// Function to update user profile
export const updateUserProfile = async (userId: string, username: string) => {
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, username })

  if (error) throw new Error('Error updating profile: ' + error.message)
}

// Function to fetch user profile
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', userId)
    .single()

  if (error) throw new Error('Error fetching user profile: ' + error.message)
  return data
}