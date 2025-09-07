import { supabase } from './supabase'
import type { Post, Category, Tag, Comment, Profile, SEOSettings, Media } from './supabase'

// Utility function to generate slug
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Auth API
export const authAPI = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return { user: null, profile: null, error }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { user, profile, error: profileError }
  },

  async createUser(email: string, password: string, fullName: string, role: 'admin' | 'editor' | 'author' = 'author') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        }
      }
    })

    if (error) return { data: null, error }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role
        })

      if (profileError) return { data: null, error: profileError }
    }

    return { data, error: null }
  }
}

// Posts API
export const postsAPI = {
  async getAll(filters?: {
    status?: string
    category?: string
    author?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        category:categories(*),
        author:profiles(*),
        tags:post_tags(tag:tags(*)),
        seo_settings(*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.category) {
      query = query.eq('category_id', filters.category)
    }
    if (filters?.author) {
      query = query.eq('author_id', filters.author)
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getPublished(filters?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    return this.getAll({ ...filters, status: 'published' })
  },

  async getBySlug(slug: string, includeUnpublished = false) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        category:categories(*),
        author:profiles(*),
        tags:post_tags(tag:tags(*)),
        seo_settings(*),
        comments:comments!comments_post_id_fkey(
          *,
          replies:comments!comments_parent_id_fkey(*)
        )
      `)
      .eq('slug', slug)

    if (!includeUnpublished) {
      query = query.eq('status', 'published')
    }

    const { data, error } = await query.single()

    // Increment view count
    if (data && !error) {
      await supabase
        .from('posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)
    }

    return { data, error }
  },

  async create(post: {
    title: string
    content: string
    excerpt?: string
    featured_image?: string
    status?: 'draft' | 'published' | 'scheduled'
    category_id?: string
    scheduled_for?: string
    tags?: string[]
    seo_settings?: Partial<SEOSettings>
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const slug = generateSlug(post.title)
    
    // Check if slug exists
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', slug)
      .single()

    const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        slug: finalSlug,
        content: post.content,
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        status: post.status || 'draft',
        category_id: post.category_id,
        author_id: user.id,
        scheduled_for: post.scheduled_for,
        published_at: post.status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (error) return { data: null, error }

    // Add tags
    if (post.tags && post.tags.length > 0) {
      const tagInserts = post.tags.map(tagId => ({
        post_id: data.id,
        tag_id: tagId
      }))

      await supabase.from('post_tags').insert(tagInserts)
    }

    // Add SEO settings
    if (post.seo_settings) {
      await supabase.from('seo_settings').insert({
        post_id: data.id,
        ...post.seo_settings
      })
    }

    return { data, error: null }
  },

  async update(id: string, updates: Partial<Post> & {
    tags?: string[]
    seo_settings?: Partial<SEOSettings>
  }) {
    const { tags, seo_settings, ...postUpdates } = updates

    // Update slug if title changed
    if (postUpdates.title) {
      postUpdates.slug = generateSlug(postUpdates.title)
    }

    // Set published_at if status changed to published
    if (postUpdates.status === 'published' && !postUpdates.published_at) {
      postUpdates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('posts')
      .update(postUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error }

    // Update tags
    if (tags) {
      // Remove existing tags
      await supabase.from('post_tags').delete().eq('post_id', id)
      
      // Add new tags
      if (tags.length > 0) {
        const tagInserts = tags.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }))
        await supabase.from('post_tags').insert(tagInserts)
      }
    }

    // Update SEO settings
    if (seo_settings) {
      await supabase
        .from('seo_settings')
        .upsert({
          post_id: id,
          ...seo_settings
        })
    }

    return { data, error: null }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    return { error }
  }
}

// Categories API
export const categoriesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        posts:posts(count)
      `)
      .order('name')

    return { data, error }
  },

  async create(category: { name: string; description?: string; color?: string }) {
    const slug = generateSlug(category.name)
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug,
        description: category.description,
        color: category.color || '#3B82F6'
      })
      .select()
      .single()

    return { data, error }
  },

  async update(id: string, updates: Partial<Category>) {
    if (updates.name) {
      updates.slug = generateSlug(updates.name)
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    return { error }
  }
}

// Tags API
export const tagsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    return { data, error }
  },

  async create(tag: { name: string }) {
    const slug = generateSlug(tag.name)
    
    const { data, error } = await supabase
      .from('tags')
      .insert({
        name: tag.name,
        slug
      })
      .select()
      .single()

    return { data, error }
  },

  async update(id: string, updates: Partial<Tag>) {
    if (updates.name) {
      updates.slug = generateSlug(updates.name)
    }

    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    return { error }
  }
}

// Comments API
export const commentsAPI = {
  async getAll(filters?: {
    post_id?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('comments')
      .select(`
        *,
        post:posts(title, slug)
      `)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (filters?.post_id) {
      query = query.eq('post_id', filters.post_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getByPostId(postId: string, onlyApproved = true) {
    let query = supabase
      .from('comments')
      .select(`
        *,
        replies:comments!comments_parent_id_fkey(*)
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (onlyApproved) {
      query = query.eq('status', 'approved')
    }

    const { data, error } = await query
    return { data, error }
  },

  async create(comment: {
    post_id: string
    parent_id?: string
    author_name: string
    author_email: string
    content: string
    ip_address?: string
    user_agent?: string
  }) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        ...comment,
        status: 'pending'
      })
      .select()
      .single()

    return { data, error }
  },

  async updateStatus(id: string, status: 'pending' | 'approved' | 'spam' | 'trash') {
    const { data, error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)

    return { error }
  }
}

// Users API
export const usersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        posts:posts(count)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase.auth.admin.deleteUser(id)
    return { error }
  }
}

// Media API
export const mediaAPI = {
  async getAll(filters?: {
    uploaded_by?: string
    file_type?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('media')
      .select(`
        *,
        uploader:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (filters?.uploaded_by) {
      query = query.eq('uploaded_by', filters.uploaded_by)
    }
    if (filters?.file_type) {
      query = query.like('file_type', `${filters.file_type}%`)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    const { data, error } = await query
    return { data, error }
  },

  async upload(file: File, altText?: string, caption?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `media/${fileName}`

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) return { data: null, error: uploadError }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    // Save to database
    const { data, error } = await supabase
      .from('media')
      .insert({
        file_name: fileName,
        original_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        alt_text: altText,
        caption: caption,
        uploaded_by: user.id
      })
      .select()
      .single()

    return { data, error }
  },

  async delete(id: string) {
    // Get file info
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('file_name')
      .eq('id', id)
      .single()

    if (fetchError) return { error: fetchError }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([`media/${media.file_name}`])

    if (storageError) return { error: storageError }

    // Delete from database
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id)

    return { error }
  }
}