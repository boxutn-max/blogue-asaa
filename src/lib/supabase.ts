import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'editor' | 'author'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image: string | null
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  category_id: string | null
  author_id: string
  published_at: string | null
  scheduled_for: string | null
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  author?: Profile
  tags?: Tag[]
  seo_settings?: SEOSettings
}

export interface Comment {
  id: string
  post_id: string
  parent_id: string | null
  author_name: string
  author_email: string
  content: string
  status: 'pending' | 'approved' | 'spam' | 'trash'
  ip_address: string | null
  user_agent: string | null
  created_at: string
  // Relations
  post?: Post
  replies?: Comment[]
}

export interface SEOSettings {
  id: string
  post_id: string
  meta_title: string | null
  meta_description: string | null
  keywords: string | null
  og_title: string | null
  og_description: string | null
  og_image: string | null
  twitter_title: string | null
  twitter_description: string | null
  twitter_image: string | null
  canonical_url: string | null
  robots_meta: string
  created_at: string
  updated_at: string
}

export interface Media {
  id: string
  file_name: string
  original_name: string
  file_url: string
  file_type: string
  file_size: number
  alt_text: string | null
  caption: string | null
  uploaded_by: string | null
  created_at: string
  // Relations
  uploader?: Profile
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Profile>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Category>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Tag>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count'> & {
          id?: string
          created_at?: string
          updated_at?: string
          view_count?: number
          like_count?: number
        }
        Update: Partial<Post>
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: never
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Comment>
      }
      seo_settings: {
        Row: SEOSettings
        Insert: Omit<SEOSettings, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<SEOSettings>
      }
      media: {
        Row: Media
        Insert: Omit<Media, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Media>
      }
    }
  }
}