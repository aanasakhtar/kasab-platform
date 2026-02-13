'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { UserCircle, Briefcase } from 'lucide-react'

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  
  const [userType, setUserType] = useState<'freelancer' | 'client' | null>(
    typeParam === 'freelancer' ? 'freelancer' : typeParam === 'client' ? 'client' : null
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) {
      setError('Please select account type')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            full_name: fullName,
            user_type: userType,
          })

        if (userError) throw userError

        // Create profile based on user type
        if (userType === 'freelancer') {
          const { error: profileError } = await supabase
            .from('freelancer_profiles')
            .insert({
              user_id: authData.user.id,
              verification_status: 'pending',
              certification_level: 1,
            })
          
          if (profileError) throw profileError
          router.push('/freelancer/onboarding')
        } else {
          const { error: profileError } = await supabase
            .from('client_profiles')
            .insert({
              user_id: authData.user.id,
            })
          
          if (profileError) throw profileError
          router.push('/client/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-2xl font-bold text-primary">Kasab</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join Pakistan's premier freelancing platform</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* User Type Selection */}
            {!userType && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I want to:
                </label>
                <button
                  type="button"
                  onClick={() => setUserType('freelancer')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left flex items-center space-x-3"
                >
                  <UserCircle className="w-6 h-6 text-accent" />
                  <div>
                    <div className="font-semibold">Find Work as a Freelancer</div>
                    <div className="text-sm text-gray-600">Browse jobs and submit proposals</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('client')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left flex items-center space-x-3"
                >
                  <Briefcase className="w-6 h-6 text-accent" />
                  <div>
                    <div className="font-semibold">Hire Freelancers</div>
                    <div className="text-sm text-gray-600">Post jobs and find talent</div>
                  </div>
                </button>
              </div>
            )}

            {userType && (
              <>
                <div>
                  <button
                    type="button"
                    onClick={() => setUserType(null)}
                    className="text-sm text-accent hover:underline mb-4"
                  >
                    ← Change account type
                  </button>
                  <div className="badge badge-level-1 mb-4">
                    {userType === 'freelancer' ? 'Freelancer Account' : 'Client Account'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignupContent />
    </Suspense>
  )
}
