'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ email, password })
      } else {
        result = await supabase.auth.signUp({ email, password })
      }
      
      const { data, error } = result
      if (error) throw error
      
      if (isLogin) {
        toast.success('Logged in successfully')
        router.push('/')
      } else {
        toast.success('Sign up successful. Please check your email for verification.')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <form onSubmit={handleAuth} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
            {isLogin ? 'Need an account?' : 'Already have an account?'}
          </button>
        </div>
      </form>
    </div>
  )
}