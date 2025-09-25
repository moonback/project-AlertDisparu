import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'family' | 'authority' | 'volunteer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'family' | 'authority' | 'volunteer'
        }
        Update: {
          first_name?: string
          last_name?: string
          role?: 'family' | 'authority' | 'volunteer'
          updated_at?: string
        }
      }
      missing_persons: {
        Row: {
          id: string
          first_name: string
          last_name: string
          age: number
          gender: 'male' | 'female' | 'other'
          photo?: string
          date_disappeared: string
          location_address: string
          location_city: string
          location_state: string
          location_country: string
          location_lat: number
          location_lng: number
          description: string
          reporter_name: string
          reporter_relationship: string
          reporter_phone: string
          reporter_email: string
          consent_given: boolean
          status: 'active' | 'found' | 'closed'
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          first_name: string
          last_name: string
          age: number
          gender: 'male' | 'female' | 'other'
          photo?: string
          date_disappeared: string
          location_address: string
          location_city: string
          location_state: string
          location_country: string
          location_lat: number
          location_lng: number
          description: string
          reporter_name: string
          reporter_relationship: string
          reporter_phone: string
          reporter_email: string
          consent_given: boolean
          status?: 'active' | 'found' | 'closed'
          created_by: string
        }
        Update: {
          first_name?: string
          last_name?: string
          age?: number
          gender?: 'male' | 'female' | 'other'
          photo?: string
          date_disappeared?: string
          location_address?: string
          location_city?: string
          location_state?: string
          location_country?: string
          location_lat?: number
          location_lng?: number
          description?: string
          reporter_name?: string
          reporter_relationship?: string
          reporter_phone?: string
          reporter_email?: string
          consent_given?: boolean
          status?: 'active' | 'found' | 'closed'
          updated_at?: string
        }
      }
    }
  }
}
