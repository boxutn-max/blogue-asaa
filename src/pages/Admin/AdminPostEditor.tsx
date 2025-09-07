import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postsAPI, categoriesAPI, tagsAPI } from '@/lib/api'
import type { Post, Category, Tag } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Eye, 
  Calendar, 
  Tag,
  Image,
  ArrowLeft
} from 'lucide-react'

export function AdminPostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [post, setPost] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    category_id: '',
    selectedTags: [] as string[],
    scheduled_for: '',
    seo_settings: {
      meta_title: '',
      meta_description: '',
      keywords: ''
    }
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    
    // Load categories and tags
    const [categoriesResult, tagsResult] = await Promise.all([
      categoriesAPI.getAll(),
      tagsAPI.getAll()
    ])
    
    if (categoriesResult.data) setCategories(categoriesResult.data)
    if (tagsResult.data) setTags(tagsResult.data)

    // Load post if editing
    if (id) {
      const { data: postData, error } = await postsAPI.getBySlug(id, true)
      if (postData && !error) {
        setPost({
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          excerpt: postData.excerpt || '',
          featured_image: postData.featured_image || '',
          status: postData.status,
          category_id: postData.category_id || '',
          selectedTags: postData.tags?.map(t => t.id) || [],
          scheduled_for: postData.scheduled_for || '',
          seo_settings: {
            meta_title: postData.seo_settings?.meta_title || '',
            meta_description: postData.seo_settings?.meta_description || '',
            keywords: postData.seo_settings?.keywords || ''
          }
        })
      }
    }
    
    setLoading(false)
  }
  const handleSave = async () => {
    setLoading(true)
    
    try {
      const postData = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        status: post.status as 'draft' | 'published' | 'scheduled',
        category_id: post.category_id || undefined,
        scheduled_for: post.scheduled_for || undefined,
        tags: post.selectedTags,
        seo_settings: post.seo_settings
      }

      if (isEditing && id) {
        await postsAPI.update(id, postData)
      } else {
        await postsAPI.create(postData)
      }
      
      navigate('/admin/posts')
    } catch (error) {
      console.error('Error saving post:', error)
    }
    
    setLoading(false)
  }

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your blog post' : 'Write and publish a new blog post'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Post'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
                <Input
                  placeholder="Enter post title..."
                  value={post.title}
                  onChange={(e) => setPost({...post, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Slug</label>
                <Input
                  placeholder="post-url-slug"
                  value={post.slug}
                  onChange={(e) => setPost({...post, slug: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Excerpt</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the post..."
                  value={post.excerpt}
                  onChange={(e) => setPost({...post, excerpt: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-300 rounded-md">
                <div className="border-b border-gray-300 p-3 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">Bold</Button>
                    <Button variant="ghost" size="sm">Italic</Button>
                    <Button variant="ghost" size="sm">Link</Button>
                    <Button variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <textarea
                  className="w-full p-4 border-0 resize-none focus:ring-0 focus:outline-none"
                  rows={20}
                  placeholder="Write your post content here..."
                  value={post.content}
                  onChange={(e) => setPost({...post, content: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <select 
                  value={post.status}
                  onChange={(e) => setPost({...post, status: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 bg-white rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              
              {post.status === 'scheduled' && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Schedule For</label>
                  <Input
                    type="datetime-local"
                    value={post.scheduled_for}
                    onChange={(e) => setPost({...post, scheduled_for: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <select 
                  value={post.category_id}
                  onChange={(e) => setPost({...post, category_id: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 bg-white rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload featured image</p>
                  <Button variant="outline" size="sm">Choose File</Button>
                </div>
                <Input
                  placeholder="Or enter image URL..."
                  value={post.featured_image}
                  onChange={(e) => setPost({...post, featured_image: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tags.map(tag => (
                  <label key={tag.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={post.selectedTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPost({...post, selectedTags: [...post.selectedTags, tag.id]})
                        } else {
                          setPost({...post, selectedTags: post.selectedTags.filter(id => id !== tag.id)})
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{tag.name}</span>
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {post.selectedTags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId)
                  return tag ? (
                    <Badge key={tagId} variant="outline">
                      {tag.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Meta Title</label>
                <Input
                  placeholder="SEO title..."
                  value={post.seo_settings.meta_title}
                  onChange={(e) => setPost({
                    ...post, 
                    seo_settings: {...post.seo_settings, meta_title: e.target.value}
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Meta Description</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="SEO description..."
                  value={post.seo_settings.meta_description}
                  onChange={(e) => setPost({
                    ...post, 
                    seo_settings: {...post.seo_settings, meta_description: e.target.value}
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Keywords</label>
                <Input
                  placeholder="SEO keywords..."
                  value={post.seo_settings.keywords}
                  onChange={(e) => setPost({
                    ...post, 
                    seo_settings: {...post.seo_settings, keywords: e.target.value}
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}