'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Users, MessageSquare, FileText, Settings, LogOut } from 'lucide-react'
import PostJobTab from './tabs/PostJobTab'
import BrowseFreelancersTab from './tabs/BrowseFreelancersTab'
import ClientMessagesTab from './tabs/ClientMessagesTab'
import ContractsTab from './tabs/ContractsTab'

type TabType = 'post-job' | 'browse' | 'messages' | 'contracts'

export default function ClientDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('browse')
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      .from('client_profiles')
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
    { id: 'post-job', label: 'Post a Job', icon: Plus },
    { id: 'browse', label: 'Browse Freelancers', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'contracts', label: 'Contracts', icon: FileText },
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
              {user && (
                <div className="text-sm text-gray-600">
                  {user.email}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'post-job' && <PostJobTab profile={profile} />}
        {activeTab === 'browse' && <BrowseFreelancersTab profile={profile} />}
        {activeTab === 'messages' && <ClientMessagesTab user={user} />}
        {activeTab === 'contracts' && <ContractsTab profile={profile} />}
      </main>
    </div>
  )
}
