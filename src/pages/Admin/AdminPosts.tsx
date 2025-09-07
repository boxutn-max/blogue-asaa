import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { postsAPI } from '@/lib/api'
import type { Post } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react'

export function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadPosts()
  }, [statusFilter, searchTerm])

  const loadPosts = async () => {
    setLoading(true)
    const { data, error } = await postsAPI.getAll({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: searchTerm || undefined
    })
    
    if (data && !error) {
      setPosts(data)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await postsAPI.delete(id)
      if (!error) {
        setPosts(posts.filter(post => post.id !== id))
      }
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600">
            Manage your blog posts and content
          </p>
        </div>
        <Link to="/admin/posts/new">
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 py-2 text-sm border border-gray-300 bg-white rounded-md"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{post.excerpt}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      {post.author?.full_name || 'Unknown'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-3 w-3" />
                      {post.view_count} views
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {post.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link to={`/admin/posts/edit/${post.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}