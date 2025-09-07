import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { postsAPI } from '@/lib/api'
import type { Post } from '@/lib/supabase'
import { Calendar, User, Eye, ArrowRight, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HomePage() {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    const { data, error } = await postsAPI.getPublished({ limit: 4 })
    
    if (data && !error) {
      setFeaturedPost(data[0] || null)
      setRecentPosts(data.slice(1))
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
  return (
    <>
      <Helmet>
        <title>ASA Sports Blog - Official Blog of Astre Sportif D'Agadir</title>
        <meta name="description" content="Stay updated with the latest news, match reports, and insights from ASA - Astre Sportif D'Agadir, Morocco's premier football club." />
        <meta name="keywords" content="ASA, Astre Sportif Agadir, Morocco football, sports blog, match reports" />
      </Helmet>

      {/* Hero Section with Featured Post */}
      {featuredPost && (
        <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-white/20 text-white border-white/30">
                  {featuredPost.category?.name || 'Blog'}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {featuredPost.title}
                </h1>
                <p className="text-xl mb-8 text-red-100 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center space-x-6 mb-8 text-red-100">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{featuredPost.author?.full_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{featuredPost.published_at ? new Date(featuredPost.published_at).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{featuredPost.view_count.toLocaleString()} views</span>
                  </div>
                </div>
                <Link to={`/post/${featuredPost.slug}`}>
                  <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                    Read Full Story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative">
                {featuredPost.featured_image && (
                  <img
                    src={featuredPost.featured_image}
                    alt={featuredPost.title}
                    className="rounded-lg shadow-2xl w-full h-80 object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News & Updates</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay informed with the latest developments from ASA Sports Club
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {post.category?.name || 'Blog'}
                  </Badge>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link to={`/post/${post.slug}`} className="hover:text-red-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{post.author?.full_name || 'Unknown'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}</span>
                      </span>
                    </div>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.view_count}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/categories">
              <Button variant="outline" size="lg">
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To represent Agadir and Morocco with pride, developing world-class football talent 
                while strengthening our community through sport and social responsibility.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Values</h3>
              <p className="text-gray-600">
                Integrity, respect, teamwork, and excellence guide everything we do. We believe in 
                fair play, community engagement, and nurturing talent at every level.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To be recognized as Morocco's premier football club, competing at the highest levels 
                while remaining deeply connected to our roots and community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}