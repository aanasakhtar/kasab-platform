'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileTab({ profile, user }: any) {
  const [roles, setRoles] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [portfolios, setPortfolios] = useState<any[]>([])

  useEffect(() => {
    if (profile) {
      loadProfileData()
    }
  }, [profile])

  const loadProfileData = async () => {
    const supabase = createClient()

    // Load roles
    const { data: rolesData } = await supabase
      .from('freelancer_roles')
      .select('*, roles(*)')
      .eq('freelancer_id', profile.id)

    // Load skills
    const { data: skillsData } = await supabase
      .from('freelancer_skills')
      .select('*, skills(*)')
      .eq('freelancer_id', profile.id)

    // Load portfolios
    const { data: portfoliosData } = await supabase
      .from('freelancer_portfolios')
      .select('*')
      .eq('freelancer_id', profile.id)

    if (rolesData) setRoles(rolesData)
    if (skillsData) setSkills(skillsData)
    if (portfoliosData) setPortfolios(portfoliosData)
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Profile Overview</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
            <p className="text-lg font-semibold">{user?.email || 'Not set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-lg">{user?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">CNIC</label>
            <p className="text-lg font-mono">{profile.cnic || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Hourly Rate</label>
            <p className="text-lg font-semibold">
              {profile.hourly_rate ? `PKR ${profile.hourly_rate}` : 'Not set'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Verification Status</label>
            <span className={`badge ${profile.verification_status === 'verified' ? 'badge-verified' : 'badge-pending'}`}>
              {profile.verification_status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Certification Level</label>
            <span className={`badge badge-level-${profile.certification_level}`}>
              Level {profile.certification_level} Certified
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Jobs Completed</label>
            <p className="text-lg font-semibold">{profile.jobs_completed}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Total Earned</label>
            <p className="text-lg font-semibold">PKR {profile.total_earned.toFixed(2)}</p>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">Bio</label>
            <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      <div className="card p-8">
        <h3 className="text-xl font-bold text-primary mb-4">Professional Roles</h3>
        {roles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {roles.map(({ roles: role }) => (
              <span key={role.id} className="badge bg-accent/10 text-accent border-accent/20">
                {role.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No roles added</p>
        )}
      </div>

      <div className="card p-8">
        <h3 className="text-xl font-bold text-primary mb-4">Skills</h3>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map(({ skills: skill }) => (
              <span key={skill.id} className="badge bg-gray-100 text-gray-700 border-gray-300">
                {skill.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No skills added</p>
        )}
      </div>

      <div className="card p-8">
        <h3 className="text-xl font-bold text-primary mb-4">Portfolio</h3>
        {portfolios.length > 0 ? (
          <div className="space-y-3">
            {portfolios.map(portfolio => (
              <div key={portfolio.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{portfolio.title}</span>
                {portfolio.url && (
                  <a
                    href={portfolio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline text-sm"
                  >
                    View →
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No portfolio items</p>
        )}
      </div>

      <div className="card p-8">
        <h3 className="text-xl font-bold text-primary mb-4">Banking Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Bank Name</label>
            <p className="text-lg">{profile.bank_name || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">IBAN</label>
            <p className="text-lg font-mono">{profile.iban || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
