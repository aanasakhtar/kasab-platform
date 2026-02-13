'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, DollarSign, Briefcase, X, AlertCircle } from 'lucide-react'

export default function BrowseJobsTab({ profile }: any) {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showProposalModal, setShowProposalModal] = useState(false)
  
  // Proposal form
  const [pitch, setPitch] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [estimatedDays, setEstimatedDays] = useState('')
  const [portfolioLink, setPortfolioLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('jobs')
      .select(`
        *,
        client_profiles(*, users(full_name)),
        job_skills(*, skills(*))
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (data) setJobs(data)
    setLoading(false)
  }

  const handleSubmitProposal = async () => {
    if (!profile || !selectedJob) return

    if (profile.verification_status !== 'verified') {
      alert('You must be verified to submit proposals')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()

      const price = parseFloat(proposedPrice)
      const platformFee = price * 0.1
      const freelancerEarnings = price - platformFee

      const { error } = await supabase
        .from('proposals')
        .insert({
          job_id: selectedJob.id,
          freelancer_id: profile.id,
          pitch,
          proposed_price: price,
          estimated_days: parseInt(estimatedDays),
          portfolio_link: portfolioLink || null,
        })

      if (error) throw error

      // Update job proposals count
      await supabase
        .from('jobs')
        .update({ proposals_count: selectedJob.proposals_count + 1 })
        .eq('id', selectedJob.id)

      alert('Proposal submitted successfully!')
      setShowProposalModal(false)
      resetProposalForm()
      loadJobs()
    } catch (error: any) {
      alert(error.message || 'Failed to submit proposal')
    } finally {
      setSubmitting(false)
    }
  }

  const resetProposalForm = () => {
    setPitch('')
    setProposedPrice('')
    setEstimatedDays('')
    setPortfolioLink('')
  }

  const openProposalModal = (job: any) => {
    setSelectedJob(job)
    setShowProposalModal(true)
  }

  if (loading) {
    return <div className="text-center py-12">Loading jobs...</div>
  }

  const price = parseFloat(proposedPrice) || 0
  const platformFee = price * 0.1
  const freelancerEarnings = price - platformFee
  const delayPenalty = 1000

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Browse Jobs</h2>
        <p className="text-gray-600">{jobs.length} open positions</p>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary mb-2">{job.title}</h3>
                <p className="text-gray-600 mb-3">{job.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {job.budget && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  PKR {job.budget.toLocaleString()}
                </div>
              )}
              {job.duration && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {job.duration}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="w-4 h-4 mr-1" />
                {job.experience_level} level
              </div>
              <div className="text-sm text-gray-500">
                {job.proposals_count} proposals
              </div>
            </div>

            {job.job_skills && job.job_skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {job.job_skills.map((js: any) => (
                  <span key={js.id} className="badge bg-gray-100 text-gray-700 border-gray-300 text-xs">
                    {js.skills.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Posted by {job.client_profiles?.users?.full_name || 'Client'}
              </div>
              <button
                onClick={() => openProposalModal(job)}
                disabled={profile?.verification_status !== 'verified'}
                className={`${
                  profile?.verification_status === 'verified'
                    ? 'btn-primary'
                    : 'btn-secondary opacity-50 cursor-not-allowed'
                }`}
              >
                Submit Proposal
              </button>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="card p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No open jobs at the moment</p>
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {showProposalModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-primary">Submit Proposal</h3>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedJob.title}</h4>
                <p className="text-sm text-gray-600">{selectedJob.description}</p>
              </div>

              {profile?.verification_status !== 'verified' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Your profile must be verified before you can submit proposals.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Pitch *
                </label>
                <textarea
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  rows={6}
                  className="input-field"
                  placeholder="Explain why you're the best fit for this job..."
                  disabled={profile?.verification_status !== 'verified'}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Price (PKR) *
                  </label>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="input-field"
                    placeholder="e.g., 50000"
                    disabled={profile?.verification_status !== 'verified'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Days *
                  </label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(e.target.value)}
                    className="input-field"
                    placeholder="e.g., 14"
                    disabled={profile?.verification_status !== 'verified'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Link (Optional)
                </label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="input-field"
                  placeholder="https://..."
                  disabled={profile?.verification_status !== 'verified'}
                />
              </div>

              {price > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-primary mb-3">Payment Breakdown</h4>
                  <div className="flex justify-between text-sm">
                    <span>Project Price:</span>
                    <span className="font-semibold">PKR {price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Platform Fee (10%):</span>
                    <span className="font-semibold">- PKR {platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t border-blue-300">
                    <span>You'll Earn:</span>
                    <span>PKR {freelancerEarnings.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-300">
                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        Delay Penalty: PKR {delayPenalty.toLocaleString()} will be deducted for each day late
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProposal}
                  disabled={
                    !pitch ||
                    !proposedPrice ||
                    !estimatedDays ||
                    submitting ||
                    profile?.verification_status !== 'verified'
                  }
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
