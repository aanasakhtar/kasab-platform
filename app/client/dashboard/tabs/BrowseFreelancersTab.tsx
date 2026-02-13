'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, MapPin, DollarSign, Briefcase } from 'lucide-react'

export default function BrowseFreelancersTab({ profile }: any) {
  const [freelancers, setFreelancers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterFreelancers()
  }, [selectedRole, selectedSkill, selectedLevel, verifiedOnly])

  const loadData = async () => {
    const supabase = createClient()

    // Load all freelancers
    const { data: freelancersData } = await supabase
      .from('freelancer_profiles')
      .select(`
        *,
        users(full_name, email),
        freelancer_roles(*, roles(*)),
        freelancer_skills(*, skills(*))
      `)
      .order('created_at', { ascending: false })

    // Load roles
    const { data: rolesData } = await supabase
      .from('roles')
      .select('*')
      .order('name')

    // Load skills
    const { data: skillsData } = await supabase
      .from('skills')
      .select('*')
      .order('name')

    if (freelancersData) setFreelancers(freelancersData)
    if (rolesData) setRoles(rolesData)
    if (skillsData) setSkills(skillsData)
    setLoading(false)
  }

  const filterFreelancers = () => {
    // This is client-side filtering for demo
    // In production, use Supabase queries with filters
    loadData()
  }

  const getFilteredFreelancers = () => {
    return freelancers.filter(freelancer => {
      if (verifiedOnly && freelancer.verification_status !== 'verified') return false
      if (selectedLevel && freelancer.certification_level.toString() !== selectedLevel) return false
      
      if (selectedRole) {
        const hasRole = freelancer.freelancer_roles?.some(
          (fr: any) => fr.role_id === selectedRole
        )
        if (!hasRole) return false
      }

      if (selectedSkill) {
        const hasSkill = freelancer.freelancer_skills?.some(
          (fs: any) => fs.skill_id === selectedSkill
        )
        if (!hasSkill) return false
      }

      return true
    })
  }

  const filteredFreelancers = getFilteredFreelancers()

  if (loading) {
    return <div className="text-center py-12">Loading freelancers...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Browse Freelancers</h2>
        <p className="text-gray-600">{filteredFreelancers.length} professionals available</p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-primary mb-4">Filters</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input-field"
            >
              <option value="">All Skills</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certification Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="input-field"
            >
              <option value="">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
              />
              <span className="text-sm">Verified Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Freelancer Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map(freelancer => (
          <div key={freelancer.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-primary mb-1">
                  {freelancer.users?.full_name || 'Freelancer'}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`badge text-xs ${
                      freelancer.verification_status === 'verified'
                        ? 'badge-verified'
                        : 'badge-pending'
                    }`}
                  >
                    {freelancer.verification_status === 'verified' ? '✓ Verified' : 'Pending'}
                  </span>
                  <span className={`badge badge-level-${freelancer.certification_level} text-xs`}>
                    Level {freelancer.certification_level}
                  </span>
                </div>
              </div>
            </div>

            {freelancer.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {freelancer.bio}
              </p>
            )}

            {/* Roles */}
            {freelancer.freelancer_roles && freelancer.freelancer_roles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {freelancer.freelancer_roles.slice(0, 2).map((fr: any) => (
                    <span key={fr.id} className="badge bg-accent/10 text-accent border-accent/20 text-xs">
                      {fr.roles.name}
                    </span>
                  ))}
                  {freelancer.freelancer_roles.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{freelancer.freelancer_roles.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {freelancer.freelancer_skills && freelancer.freelancer_skills.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {freelancer.freelancer_skills.slice(0, 3).map((fs: any) => (
                    <span key={fs.id} className="badge bg-gray-100 text-gray-700 border-gray-300 text-xs">
                      {fs.skills.name}
                    </span>
                  ))}
                  {freelancer.freelancer_skills.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{freelancer.freelancer_skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-2">
              {freelancer.hourly_rate && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  PKR {freelancer.hourly_rate}/hr
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="w-4 h-4 mr-1" />
                {freelancer.jobs_completed} jobs completed
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                PKR {freelancer.total_earned.toLocaleString()} earned
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFreelancers.length === 0 && (
        <div className="card p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No freelancers match your filters</p>
        </div>
      )}
    </div>
  )
}
