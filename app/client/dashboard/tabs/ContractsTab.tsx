'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, DollarSign, CheckCircle2, X } from 'lucide-react'

export default function ContractsTab({ profile }: any) {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [proposals, setProposals] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'jobs' | 'contracts'>('jobs')

  useEffect(() => {
    if (profile) {
      loadJobs()
      loadContracts()
    }
  }, [profile])

  const loadJobs = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })

    if (data) setJobs(data)
    setLoading(false)
  }

  const loadContracts = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from('contracts')
      .select(`
        *,
        jobs(title),
        freelancer_profiles(*, users(full_name))
      `)
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false })

    if (data) setContracts(data)
  }

  const loadProposals = async (jobId: string) => {
    const supabase = createClient()

    const { data } = await supabase
      .from('proposals')
      .select(`
        *,
        freelancer_profiles(*, users(full_name), freelancer_roles(*, roles(*)))
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (data) setProposals(data)
  }

  const selectJob = (job: any) => {
    setSelectedJob(job)
    loadProposals(job.id)
  }

  const approveProposal = async (proposal: any) => {
    if (!confirm('Approve this proposal and create a contract?')) return

    const supabase = createClient()

    try {
      // Create contract
      const platformFee = proposal.proposed_price * 0.1
      const freelancerEarnings = proposal.proposed_price - platformFee

      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert({
          job_id: proposal.job_id,
          client_id: profile.id,
          freelancer_id: proposal.freelancer_id,
          proposal_id: proposal.id,
          agreed_price: proposal.proposed_price,
          platform_fee: platformFee,
          freelancer_earnings: freelancerEarnings,
          estimated_days: proposal.estimated_days,
          status: 'active',
        })
        .select()
        .single()

      if (contractError) throw contractError

      // Update proposal status
      await supabase
        .from('proposals')
        .update({ status: 'approved' })
        .eq('id', proposal.id)

      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', proposal.job_id)

      // Create payment record
      await supabase
        .from('payments')
        .insert({
          contract_id: contractData.id,
          freelancer_id: proposal.freelancer_id,
          client_id: profile.id,
          amount: proposal.proposed_price,
          platform_fee: platformFee,
          freelancer_earnings: freelancerEarnings,
          status: 'pending',
        })

      // Create conversation
      const { data: userData } = await supabase
        .from('freelancer_profiles')
        .select('user_id')
        .eq('id', proposal.freelancer_id)
        .single()

      if (userData) {
        await supabase
          .from('conversations')
          .insert({
            job_id: proposal.job_id,
            contract_id: contractData.id,
            participant_1: profile.user_id,
            participant_2: userData.user_id,
          })
      }

      alert('Proposal approved! Contract created.')
      loadJobs()
      loadContracts()
      loadProposals(proposal.job_id)
    } catch (error: any) {
      alert(error.message || 'Failed to approve proposal')
    }
  }

  const rejectProposal = async (proposalId: string) => {
    if (!confirm('Reject this proposal?')) return

    const supabase = createClient()
    await supabase
      .from('proposals')
      .update({ status: 'rejected' })
      .eq('id', proposalId)

    if (selectedJob) {
      loadProposals(selectedJob.id)
    }
  }

  const completeContract = async (contract: any) => {
    if (!confirm('Mark this contract as completed and release payment?')) return

    const supabase = createClient()

    try {
      // Update contract
      await supabase
        .from('contracts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', contract.id)

      // Update payment
      await supabase
        .from('payments')
        .update({
          status: 'released',
          released_at: new Date().toISOString(),
        })
        .eq('contract_id', contract.id)

      // Update freelancer stats
      await supabase
        .from('freelancer_profiles')
        .update({
          jobs_completed: contract.freelancer_profiles.jobs_completed + 1,
          total_earned: contract.freelancer_profiles.total_earned + contract.freelancer_earnings,
        })
        .eq('id', contract.freelancer_id)

      // Update job
      await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', contract.job_id)

      alert('Contract completed! Payment released.')
      loadContracts()
    } catch (error: any) {
      alert(error.message || 'Failed to complete contract')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setView('jobs')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'jobs' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Posted Jobs & Proposals
          </button>
          <button
            onClick={() => setView('contracts')}
            className={`px-4 py-2 rounded-lg font-medium ${
              view === 'contracts' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Active Contracts
          </button>
        </div>
      </div>

      {view === 'jobs' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Jobs List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-primary">Your Jobs</h3>
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => selectJob(job)}
                className={`w-full text-left card p-4 transition-all ${
                  selectedJob?.id === job.id ? 'ring-2 ring-accent' : ''
                }`}
              >
                <h4 className="font-semibold mb-1">{job.title}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className={`badge ${
                    job.status === 'open' ? 'badge-pending' :
                    job.status === 'in_progress' ? 'badge-level-1' :
                    job.status === 'completed' ? 'badge-verified' : 'bg-gray-200'
                  }`}>
                    {job.status}
                  </span>
                  <span>{job.proposals_count} proposals</span>
                </div>
              </button>
            ))}
          </div>

          {/* Proposals */}
          <div>
            {selectedJob ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-primary">
                  Proposals for "{selectedJob.title}"
                </h3>
                {proposals.map(proposal => (
                  <div key={proposal.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold mb-1">
                          {proposal.freelancer_profiles?.users?.full_name}
                        </h4>
                        {proposal.freelancer_profiles?.freelancer_roles?.slice(0, 2).map((fr: any) => (
                          <span key={fr.id} className="badge bg-accent/10 text-accent border-accent/20 text-xs mr-1">
                            {fr.roles.name}
                          </span>
                        ))}
                      </div>
                      <span className={`badge ${
                        proposal.status === 'pending' ? 'badge-pending' :
                        proposal.status === 'approved' ? 'badge-verified' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">{proposal.pitch}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div className="font-semibold">PKR {proposal.proposed_price?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <div className="font-semibold">{proposal.estimated_days} days</div>
                      </div>
                    </div>

                    {proposal.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveProposal(proposal)}
                          className="btn-primary flex-1 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 inline mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectProposal(proposal.id)}
                          className="btn-secondary flex-1 text-sm"
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {proposals.length === 0 && (
                  <div className="card p-8 text-center">
                    <p className="text-gray-500">No proposals yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a job to view proposals</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'contracts' && (
        <div className="space-y-4">
          {contracts.map(contract => (
            <div key={contract.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-1">
                    {contract.jobs?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Freelancer: {contract.freelancer_profiles?.users?.full_name}
                  </p>
                </div>
                <span className={`badge ${
                  contract.status === 'active' ? 'badge-level-1' :
                  contract.status === 'completed' ? 'badge-verified' : 'bg-gray-200'
                }`}>
                  {contract.status}
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Agreed Price</label>
                  <div className="font-semibold">PKR {contract.agreed_price.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Platform Fee</label>
                  <div className="font-semibold text-red-600">PKR {contract.platform_fee.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Freelancer Gets</label>
                  <div className="font-semibold text-green-600">PKR {contract.freelancer_earnings.toLocaleString()}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estimated Days</label>
                  <div className="font-semibold">{contract.estimated_days}</div>
                </div>
              </div>

              {contract.status === 'active' && (
                <button
                  onClick={() => completeContract(contract)}
                  className="btn-primary text-sm"
                >
                  Mark as Complete & Release Payment
                </button>
              )}

              {contract.status === 'completed' && (
                <div className="text-sm text-green-600">
                  ✓ Completed on {new Date(contract.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}

          {contracts.length === 0 && (
            <div className="card p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No contracts yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
