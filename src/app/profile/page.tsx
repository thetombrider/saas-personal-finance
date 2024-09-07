'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Profile() {
  const [username, setUsername] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single()
        if (data) setUsername(data.username)
      }
    }
    fetchUser()
  }, [])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, username })

    if (error) console.error('Error updating profile:', error.message)
    else console.log('Profile updated successfully')
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