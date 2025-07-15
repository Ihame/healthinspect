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
          phone: string | null
          name: string
          role: 'super_admin' | 'national_admin' | 'regional_supervisor' | 'inspector'
          district: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          name: string
          role?: 'super_admin' | 'national_admin' | 'regional_supervisor' | 'inspector'
          district?: string | null
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          name?: string
          role?: 'super_admin' | 'national_admin' | 'regional_supervisor' | 'inspector'
          district?: string | null
          created_at?: string
          is_active?: boolean
        }
      }
      facilities: {
        Row: {
          id: string
          name: string
          type: 'pharmacy' | 'hospital' | 'clinic'
          district: string
          address: string
          phone: string
          email: string | null
          registration_number: string
          assigned_inspector_id: string | null
          last_inspection_date: string | null
          compliance_score: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'pharmacy' | 'hospital' | 'clinic'
          district: string
          address: string
          phone: string
          email?: string | null
          registration_number: string
          assigned_inspector_id?: string | null
          last_inspection_date?: string | null
          compliance_score?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'pharmacy' | 'hospital' | 'clinic'
          district?: string
          address?: string
          phone?: string
          email?: string | null
          registration_number?: string
          assigned_inspector_id?: string | null
          last_inspection_date?: string | null
          compliance_score?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          facility_id: string
          inspector_id: string
          inspector_name: string
          facility_name: string
          district: string
          start_date: string
          completed_date: string | null
          status: 'draft' | 'submitted' | 'reviewed' | 'approved'
          total_score: number
          max_possible_score: number
          compliance_percentage: number
          signature: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          inspector_id: string
          inspector_name: string
          facility_name: string
          district: string
          start_date?: string
          completed_date?: string | null
          status?: 'draft' | 'submitted' | 'reviewed' | 'approved'
          total_score?: number
          max_possible_score?: number
          compliance_percentage?: number
          signature?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          inspector_id?: string
          inspector_name?: string
          facility_name?: string
          district?: string
          start_date?: string
          completed_date?: string | null
          status?: 'draft' | 'submitted' | 'reviewed' | 'approved'
          total_score?: number
          max_possible_score?: number
          compliance_percentage?: number
          signature?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      inspection_items: {
        Row: {
          id: string
          inspection_id: string
          question: string
          category: string
          max_score: number
          response: 'yes' | 'no' | 'na' | null
          actual_score: number
          comments: string | null
          images: Json
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          question: string
          category: string
          max_score?: number
          response?: 'yes' | 'no' | 'na' | null
          actual_score?: number
          comments?: string | null
          images?: Json
          created_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          question?: string
          category?: string
          max_score?: number
          response?: 'yes' | 'no' | 'na' | null
          actual_score?: number
          comments?: string | null
          images?: Json
          created_at?: string
        }
      }
      corrective_actions: {
        Row: {
          id: string
          inspection_id: string
          facility_id: string
          item: string
          description: string
          deadline: string
          status: 'pending' | 'in_progress' | 'resolved'
          assigned_to: string | null
          resolved_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          facility_id: string
          item: string
          description: string
          deadline: string
          status?: 'pending' | 'in_progress' | 'resolved'
          assigned_to?: string | null
          resolved_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          facility_id?: string
          item?: string
          description?: string
          deadline?: string
          status?: 'pending' | 'in_progress' | 'resolved'
          assigned_to?: string | null
          resolved_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'super_admin' | 'national_admin' | 'regional_supervisor' | 'inspector'
      facility_type: 'pharmacy' | 'hospital' | 'clinic'
      inspection_status: 'draft' | 'submitted' | 'reviewed' | 'approved'
      item_response: 'yes' | 'no' | 'na'
      action_status: 'pending' | 'in_progress' | 'resolved'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}