'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, CheckCircle2, Clock } from 'lucide-react'

export default function PaymentsTab({ profile }: any) {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      loadPayments()
    }
  }, [profile])

  const loadPayments = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        contracts(*, jobs(title))
      `)
      .eq('freelancer_id', profile.id)
      .order('created_at', { ascending: false })

    if (data) setPayments(data)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-12">Loading payments...</div>
  }

  const totalEarnings = payments
    .filter(p => p.status === 'released')
    .reduce((sum, p) => sum + parseFloat(p.freelancer_earnings || 0), 0)

  const pendingEarnings = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.freelancer_earnings || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4">Payments</h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Earned</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              PKR {totalEarnings.toLocaleString()}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pending</span>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              PKR {pendingEarnings.toLocaleString()}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Jobs Completed</span>
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent">
              {profile.jobs_completed}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map(payment => (
          <div key={payment.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-primary mb-1">
                  {payment.contracts?.jobs?.title || 'Project'}
                </h3>
                <div className="flex items-center space-x-2">
                  {payment.status === 'released' ? (
                    <span className="badge badge-verified">Released</span>
                  ) : (
                    <span className="badge badge-pending">Pending</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  PKR {parseFloat(payment.freelancer_earnings).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Your earnings</div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Project Amount
                </label>
                <div className="text-sm font-semibold">
                  PKR {parseFloat(payment.amount).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Platform Fee
                </label>
                <div className="text-sm font-semibold text-red-600">
                  - PKR {parseFloat(payment.platform_fee).toLocaleString()}
                </div>
              </div>

              {payment.delay_penalty > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Delay Penalty
                  </label>
                  <div className="text-sm font-semibold text-red-600">
                    - PKR {parseFloat(payment.delay_penalty).toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {payment.status === 'released' ? 'Released On' : 'Created On'}
                </label>
                <div className="text-sm">
                  {payment.status === 'released' && payment.released_at
                    ? new Date(payment.released_at).toLocaleDateString()
                    : new Date(payment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="card p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No payments yet</p>
            <p className="text-gray-400">Complete projects to start earning</p>
          </div>
        )}
      </div>
    </div>
  )
}
