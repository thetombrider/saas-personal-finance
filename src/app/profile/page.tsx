'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

export default function Profile() {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user for profile...');
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
          return;
        }
        setUser(user);
        console.log('User fetched:', user);
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user.id)
            .single();
          if (error) {
            console.error('Error fetching username:', error.message);
          } else {
            setUsername(data.username);
            console.log('Username fetched:', data.username);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser()
  }, [])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    console.log('Updating profile for user:', user.id);
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, username })

    if (error) {
      console.error('Error updating profile:', error.message)
    } else {
      console.log('Profile updated successfully');
    }
  }

  if (!user) return <div>Please sign in</div>

  return (
    <form onSubmit={updateProfile}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button type="submit">Update Profile</button>
    </form>
  )
}