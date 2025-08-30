import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Calendar, User, Eye, ArrowRight, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const featuredPost = {
  id: '1',
  title: 'ASA Wins Historic Championship Final Against Raja Casablanca',
  excerpt: 'In a thrilling match that will be remembered for generations, ASA secured their first championship title in over a decade with a spectacular 3-2 victory.',
  content: 'Full match report and analysis...',
  slug: 'asa-wins-historic-championship-final',
  featuredImage: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800',
  author: 'Ahmed Benali',
  publishedAt: '2025-01-15',
  category: 'Match Reports',
  views: 2847,
  tags: ['Championship', 'Victory', 'Raja Casablanca']
}

const recentPosts = [
  {
    id: '2',
    title: 'New Stadium Construction Progress Update',
    excerpt: 'Latest developments in the construction of ASA\'s new 45,000-capacity stadium facility.',
    slug: 'new-stadium-construction-progress',
    featuredImage: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: 'Fatima Zahra',
    publishedAt: '2025-01-12',
    category: 'News',
    views: 1234
  },
  {
    id: '3',
    title: 'Youth Academy Success Stories',
    excerpt: 'Highlighting the remarkable achievements of our youth development program.',
    slug: 'youth-academy-success-stories',
    featuredImage: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: 'Omar Idrissi',
    publishedAt: '2025-01-10',
    category: 'Youth Development',
    views: 987
  },
  {
    id: '4',
    title: 'Transfer Window Analysis: Winter 2025',
    excerpt: 'Comprehensive analysis of ASA\'s strategic moves in the winter transfer window.',
    slug: 'transfer-window-analysis-winter-2025',
    featuredImage: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=400',
    author: 'Mohamed Tazi',
    publishedAt: '2025-01-08',
    category: 'Analysis',
    views: 1567
  }
]

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>ASA Sports Blog - Official Blog of Astre Sportif D'Agadir</title>
        <meta name="description" content="Stay updated with the latest news, match reports, and insights from ASA - Astre Sportif D'Agadir, Morocco's premier football club." />
        <meta name="keywords" content="ASA, Astre Sportif Agadir, Morocco football, sports blog, match reports" />
      </Helmet>

      {/* Hero Section with Featured Post */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                {featuredPost.category}
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
                  <span>{featuredPost.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{featuredPost.publishedAt}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{featuredPost.views.toLocaleString()} views</span>
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
              <img
                src={featuredPost.featuredImage}
                alt={featuredPost.title}
                className="rounded-lg shadow-2xl w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

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
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
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
                        <span>{post.author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.publishedAt}</span>
                      </span>
                    </div>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
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