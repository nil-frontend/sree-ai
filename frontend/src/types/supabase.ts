export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          plan_type: string | null
          requests_remaining: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          plan_type?: string | null
          requests_remaining?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          plan_type?: string | null
          requests_remaining?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
  }
}
