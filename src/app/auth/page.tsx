'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) console.error('Error signing up:', error.message)
    else console.log('Signed up successfully:', data)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) console.error('Error signing in:', error.message)
    else console.log('Signed in successfully:', data)
  }

  // ... rest of the component code ...
}