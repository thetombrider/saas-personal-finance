'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Attempting to log in with email:', email)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      const user = data?.user; // Extract user from data
      if (error) {
        console.error('Login error:', error.message)
        toast.error('Login failed. Please check your credentials.')
        return
      }
      console.log('User logged in:', user)
      router.push('/')
    } catch (error) {
      console.error('Unexpected error during login:', error)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Log In</button>
    </form>
  )
}