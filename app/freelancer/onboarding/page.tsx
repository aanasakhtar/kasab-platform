'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export default function FreelancerOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [freelancerId, setFreelancerId] = useState('')

  // Step 1 - Identity
  const [fullName, setFullName] = useState('')
  const [cnic, setCnic] = useState('')

  // Step 2 - Professional Profile
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [portfolioLinks, setPortfolioLinks] = useState([''])
  const [hourlyRate, setHourlyRate] = useState('')

  // Step 3 - Banking
  const [bankName, setBankName] = useState('')
  const [iban, setIban] = useState('')

  const [roles, setRoles] = useState<any[]>([])
  const [skills, setSkills] = useState<any[]>([])

  useEffect(() => {
    loadUserData()
    loadRolesAndSkills()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUserId(user.id)
      
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
      if (userData) {
        setFullName(userData.full_name || '')
      }

      const { data: profile } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profile) {
        setFreelancerId(profile.id)
      }
    }
  }

  const loadRolesAndSkills = async () => {
    const supabase = createClient()
    
    const { data: rolesData } = await supabase
      .from('roles')
      .select('*')
      .order('name')
    
    const { data: skillsData } = await supabase
      .from('skills')
      .select('*')
      .order('name')
    
    if (rolesData) setRoles(rolesData)
    if (skillsData) setSkills(skillsData)
  }

  const handleStep1 = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', userId)

    await supabase
      .from('freelancer_profiles')
      .update({ cnic })
      .eq('user_id', userId)

    setLoading(false)
    setCurrentStep(2)
  }

  const handleStep2 = async () => {
    setLoading(true)
    const supabase = createClient()

    // Update profile
    await supabase
      .from('freelancer_profiles')
      .update({
        bio,
        hourly_rate: parseFloat(hourlyRate) || null,
      })
      .eq('user_id', userId)

    // Insert roles
    if (selectedRoles.length > 0) {
      const roleInserts = selectedRoles.map(roleId => ({
        freelancer_id: freelancerId,
        role_id: roleId,
      }))
      await supabase.from('freelancer_roles').insert(roleInserts)
    }

    // Insert skills
    if (selectedSkills.length > 0) {
      const skillInserts = selectedSkills.map(skillId => ({
        freelancer_id: freelancerId,
        skill_id: skillId,
      }))
      await supabase.from('freelancer_skills').insert(skillInserts)
    }

    // Insert portfolio links
    const validLinks = portfolioLinks.filter(link => link.trim())
    if (validLinks.length > 0) {
      const portfolioInserts = validLinks.map(url => ({
        freelancer_id: freelancerId,
        title: 'Portfolio',
        url,
      }))
      await supabase.from('freelancer_portfolios').insert(portfolioInserts)
    }

    setLoading(false)
    setCurrentStep(3)
  }

  const handleStep3 = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('freelancer_profiles')
      .update({
        bank_name: bankName,
        iban,
        profile_completed: true,
      })
      .eq('user_id', userId)

    setLoading(false)
    router.push('/freelancer/dashboard')
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const addPortfolioLink = () => {
    setPortfolioLinks([...portfolioLinks, ''])
  }

  const updatePortfolioLink = (index: number, value: string) => {
    const updated = [...portfolioLinks]
    updated[index] = value
    setPortfolioLinks(updated)
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === currentStep
                      ? 'bg-accent text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={currentStep === 1 ? 'font-semibold text-accent' : 'text-gray-500'}>
              Identity
            </span>
            <span className={currentStep === 2 ? 'font-semibold text-accent' : 'text-gray-500'}>
              Professional Profile
            </span>
            <span className={currentStep === 3 ? 'font-semibold text-accent' : 'text-gray-500'}>
              Banking & KYC
            </span>
          </div>
        </div>

        {/* Step 1 - Identity */}
        {currentStep === 1 && (
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Identity Information</h2>
            <div className="space-y-6">
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
                  CNIC Number
                </label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="12345-1234567-1"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for verification and payments
                </p>
              </div>
              <button
                onClick={handleStep1}
                disabled={!fullName || !cnic || loading}
                className="btn-primary w-full"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Professional Profile */}
        {currentStep === 2 && (
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Professional Profile</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Roles (Choose all that apply)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map(role => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                        selectedRoles.includes(role.id)
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Skills
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {skills.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        selectedSkills.includes(skill.id)
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="input-field"
                  placeholder="Tell clients about your experience and expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate (PKR)
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className="input-field"
                  placeholder="e.g., 2500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Links
                </label>
                {portfolioLinks.map((link, index) => (
                  <input
                    key={index}
                    type="url"
                    value={link}
                    onChange={(e) => updatePortfolioLink(index, e.target.value)}
                    placeholder="https://..."
                    className="input-field mb-2"
                  />
                ))}
                <button
                  type="button"
                  onClick={addPortfolioLink}
                  className="text-sm text-accent hover:underline"
                >
                  + Add Another Link
                </button>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleStep2}
                  disabled={selectedRoles.length === 0 || loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Banking */}
        {currentStep === 3 && (
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Banking Information</h2>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Your payment details are secured and will only be used for transferring your earnings.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select your bank</option>
                  <option value="HBL">HBL - Habib Bank Limited</option>
                  <option value="UBL">UBL - United Bank Limited</option>
                  <option value="MCB">MCB - Muslim Commercial Bank</option>
                  <option value="Allied Bank">Allied Bank</option>
                  <option value="Meezan Bank">Meezan Bank</option>
                  <option value="Bank Alfalah">Bank Alfalah</option>
                  <option value="Standard Chartered">Standard Chartered</option>
                  <option value="Faysal Bank">Faysal Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN Number
                </label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="PK36HABB0000000000000000"
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  24-character IBAN starting with PK
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handleStep3}
                  disabled={!bankName || !iban || loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Completing...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
