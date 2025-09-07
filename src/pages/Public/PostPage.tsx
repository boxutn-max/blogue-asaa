import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { postsAPI, commentsAPI } from '@/lib/api'
import type { Post, Comment } from '@/lib/supabase'
import { Calendar, User, Eye, Tag, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CommentsSection } from '@/components/Public/CommentsSection'

export function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPost(slug)
    }
  }, [slug])

  const loadPost = async (postSlug: string) => {
    const { data, error } = await postsAPI.getBySlug(postSlug)
    
    if (error || !data) {
      setNotFound(true)
    } else {
      setPost(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.seo_settings?.meta_title || post.title}</title>
        <meta name="description" content={post.seo_settings?.meta_description || post.excerpt || ''} />
        <meta name="keywords" content={post.seo_settings?.keywords || ''} />
        <meta property="og:title" content={post.seo_settings?.og_title || post.title} />
        <meta property="og:description" content={post.seo_settings?.og_description || post.excerpt || ''} />
        <meta property="og:image" content={post.seo_settings?.og_image || post.featured_image || ''} />
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <Badge className="mb-4">{post.category?.name || 'Blog'}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{post.author?.full_name || 'Unknown'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>{post.view_count.toLocaleString()} views</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>{post.like_count} likes</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags?.map((tag) => (
              <Badge key={tag.id} variant="outline">
                <Tag className="h-3 w-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="whitespace-pre-wrap">{post.content}</div>
        </div>

        {/* Social Actions */}
        <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-12">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Like ({post.like_count})
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            {post.view_count.toLocaleString()} views
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection postId={post.id} />
      </article>
    </>
  )
}