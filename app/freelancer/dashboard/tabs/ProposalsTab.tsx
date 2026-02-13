'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, DollarSign, CheckCircle2, XCircle } from 'lucide-react'

export default function ProposalsTab({ profile }: any) {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      loadProposals()
    }
  }, [profile])

  const loadProposals = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from('proposals')
      .select(`
        *,
        jobs(*, client_profiles(*, users(full_name)))
      `)
      .eq('freelancer_id', profile.id)
      .order('created_at', { ascending: false })

    if (data) setProposals(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-12">Loading proposals...</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending">Pending Review</span>
      case 'approved':
        return <span className="badge badge-verified">Approved</span>
      case 'rejected':
        return <span className="badge bg-red-50 text-red-700 border-red-200">Rejected</span>
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">My Proposals</h2>
        <p className="text-gray-600">{proposals.length} proposals submitted</p>
      </div>

      <div className="space-y-4">
        {proposals.map(proposal => (
          <div key={proposal.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(proposal.status)}
                  <h3 className="text-xl font-bold text-primary">
                    {proposal.jobs.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Client: {proposal.jobs.client_profiles?.users?.full_name || 'Anonymous'}
                </p>
                {getStatusBadge(proposal.status)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Pitch:</p>
              <p className="text-gray-600 text-sm">{proposal.pitch}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Proposed Price
                </label>
                <div className="flex items-center text-lg font-semibold">
                  <DollarSign className="w-4 h-4 mr-1" />
                  PKR {proposal.proposed_price?.toLocaleString() || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Estimated Duration
                </label>
                <div className="flex items-center text-lg font-semibold">
                  <Clock className="w-4 h-4 mr-1" />
                  {proposal.estimated_days} days
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Your Earnings
                </label>
                <div className="text-lg font-semibold text-green-600">
                  PKR {((proposal.proposed_price || 0) * 0.9).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">After 10% platform fee</p>
              </div>
            </div>

            {proposal.portfolio_link && (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={proposal.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm"
                >
                  View Portfolio Link →
                </a>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 mt-4">
              <p className="text-xs text-gray-500">
                Submitted on {new Date(proposal.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}

        {proposals.length === 0 && (
          <div className="card p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No proposals yet</p>
            <p className="text-gray-400">Submit proposals to jobs to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
