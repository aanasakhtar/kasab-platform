'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, FileText, MessageSquare, Wallet, Settings, LogOut, AlertCircle } from 'lucide-react'
import FreelancerProfileTab from './tabs/ProfileTab'
import BrowseJobsTab from './tabs/BrowseJobsTab'
import ProposalsTab from './tabs/ProposalsTab'
import MessagesTab from './tabs/MessagesTab'
import PaymentsTab from './tabs/PaymentsTab'

type TabType = 'profile' | 'jobs' | 'proposals' | 'messages' | 'payments'

export default function FreelancerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('jobs')
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAdminToggle, setShowAdminToggle] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      router.push('/login')
      return
    }

    setUser(authUser)

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    const { data: profileData } = await supabase
      .from('freelancer_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    setProfile(profileData)
    setLoading(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleVerification = async () => {
    if (!profile) return
    const supabase = createClient()
    
    const newStatus = profile.verification_status === 'pending' ? 'verified' : 'pending'
    
    await supabase
      .from('freelancer_profiles')
      .update({ verification_status: newStatus })
      .eq('id', profile.id)
    
    setProfile({ ...profile, verification_status: newStatus })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'proposals', label: 'My Proposals', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: Settings },
  ]

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <span className="text-2xl font-bold text-primary">Kasab</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {tabs.map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        activeTab === tab.id
                          ? 'bg-accent text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 inline mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {profile && (
                <div className="flex items-center space-x-3">
                  <span
                    className={`badge ${
                      profile.verification_status === 'verified'
                        ? 'badge-verified'
                        : 'badge-pending'
                    }`}
                  >
                    {profile.verification_status === 'verified' ? '✓ Verified' : 'Pending'}
                  </span>
                  <span className={`badge badge-level-${profile.certification_level}`}>
                    Level {profile.certification_level}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Verification Banner */}
      {profile && profile.verification_status === 'pending' && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800">
                  Your profile is under review. Approval typically takes 24-48 hours. You can browse jobs but cannot submit proposals yet.
                </p>
              </div>
              <button
                onClick={() => setShowAdminToggle(!showAdminToggle)}
                className="text-xs text-yellow-600 hover:underline"
              >
                Admin Controls
              </button>
            </div>
            {showAdminToggle && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <button
                  onClick={toggleVerification}
                  className="btn-secondary text-xs"
                >
                  Toggle Verification Status (Demo)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'profile' && <FreelancerProfileTab profile={profile} user={user} />}
        {activeTab === 'jobs' && <BrowseJobsTab profile={profile} />}
        {activeTab === 'proposals' && <ProposalsTab profile={profile} />}
        {activeTab === 'messages' && <MessagesTab user={user} />}
        {activeTab === 'payments' && <PaymentsTab profile={profile} />}
      </main>
    </div>
  )
}
