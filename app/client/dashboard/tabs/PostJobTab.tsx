'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2 } from 'lucide-react'

export default function PostJobTab({ profile }: any) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [duration, setDuration] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('intermediate')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('skills')
      .select('*')
      .order('name')

    if (data) setSkills(data)
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    setSuccess(false)

    try {
      const supabase = createClient()

      // Create job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          client_id: profile.id,
          title,
          description,
          budget: parseFloat(budget) || null,
          duration,
          experience_level: experienceLevel,
          status: 'open',
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Add skills
      if (selectedSkills.length > 0 && jobData) {
        const skillInserts = selectedSkills.map(skillId => ({
          job_id: jobData.id,
          skill_id: skillId,
        }))
        
        const { error: skillsError } = await supabase
          .from('job_skills')
          .insert(skillInserts)

        if (skillsError) throw skillsError
      }

      // Update client stats
      await supabase
        .from('client_profiles')
        .update({ jobs_posted: profile.jobs_posted + 1 })
        .eq('id', profile.id)

      setSuccess(true)
      resetForm()
    } catch (error: any) {
      alert(error.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setBudget('')
    setDuration('')
    setExperienceLevel('intermediate')
    setSelectedSkills([])
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-primary mb-6">Post a New Job</h2>

      {success && (
        <div className="card p-6 mb-6 bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Job posted successfully!</p>
              <p className="text-sm text-green-600">Freelancers can now view and submit proposals.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Full-Stack Developer for E-commerce Platform"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="input-field"
            placeholder="Describe the project requirements, deliverables, and expectations..."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (PKR)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="input-field"
              placeholder="e.g., 100000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input-field"
              placeholder="e.g., 2 weeks, 1 month"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level Required *
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="input-field"
          >
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Required Skills
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

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || !title || !description}
            className="btn-primary w-full"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  )
}
