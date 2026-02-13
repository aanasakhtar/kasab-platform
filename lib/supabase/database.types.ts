export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: 'freelancer' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type: 'freelancer' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          user_type?: 'freelancer' | 'client'
          created_at?: string
          updated_at?: string
        }
      }
      freelancer_profiles: {
        Row: {
          id: string
          user_id: string
          cnic: string | null
          bio: string | null
          hourly_rate: number | null
          verification_status: 'pending' | 'verified' | 'rejected'
          certification_level: 1 | 2 | 3
          bank_name: string | null
          iban: string | null
          total_earned: number
          jobs_completed: number
          profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cnic?: string | null
          bio?: string | null
          hourly_rate?: number | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          certification_level?: 1 | 2 | 3
          bank_name?: string | null
          iban?: string | null
          total_earned?: number
          jobs_completed?: number
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cnic?: string | null
          bio?: string | null
          hourly_rate?: number | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          certification_level?: 1 | 2 | 3
          bank_name?: string | null
          iban?: string | null
          total_earned?: number
          jobs_completed?: number
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      client_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string | null
          company_size: string | null
          industry: string | null
          total_spent: number
          jobs_posted: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name?: string | null
          company_size?: string | null
          industry?: string | null
          total_spent?: number
          jobs_posted?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string | null
          company_size?: string | null
          industry?: string | null
          total_spent?: number
          jobs_posted?: number
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
      }
      jobs: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          budget: number | null
          duration: string | null
          experience_level: 'entry' | 'intermediate' | 'expert'
          status: 'open' | 'in_progress' | 'completed' | 'cancelled'
          proposals_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description: string
          budget?: number | null
          duration?: string | null
          experience_level?: 'entry' | 'intermediate' | 'expert'
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          proposals_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string
          budget?: number | null
          duration?: string | null
          experience_level?: 'entry' | 'intermediate' | 'expert'
          status?: 'open' | 'in_progress' | 'completed' | 'cancelled'
          proposals_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          job_id: string
          freelancer_id: string
          pitch: string
          proposed_price: number | null
          estimated_days: number | null
          portfolio_link: string | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          freelancer_id: string
          pitch: string
          proposed_price?: number | null
          estimated_days?: number | null
          portfolio_link?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          freelancer_id?: string
          pitch?: string
          proposed_price?: number | null
          estimated_days?: number | null
          portfolio_link?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          job_id: string
          client_id: string
          freelancer_id: string
          proposal_id: string | null
          agreed_price: number
          platform_fee: number
          freelancer_earnings: number
          estimated_days: number | null
          status: 'active' | 'completed' | 'disputed' | 'cancelled'
          completed_at: string | null
          created_at: string
          updated_at: string
        }
      }
      conversations: {
        Row: {
          id: string
          job_id: string | null
          contract_id: string | null
          participant_1: string
          participant_2: string
          last_message_at: string
          created_at: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          read?: boolean
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          contract_id: string
          freelancer_id: string
          client_id: string
          amount: number
          platform_fee: number
          freelancer_earnings: number
          status: 'pending' | 'released' | 'refunded'
          delay_penalty: number
          released_at: string | null
          created_at: string
        }
      }
    }
  }
}
