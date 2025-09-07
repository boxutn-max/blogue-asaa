import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'

// Public Frontend
import { PublicLayout } from '@/components/Public/PublicLayout'
import { HomePage } from '@/pages/Public/HomePage'
import { PostPage } from '@/pages/Public/PostPage'
import { CategoriesPage } from '@/pages/Public/CategoriesPage'
import { CategoryPage } from '@/pages/Public/CategoryPage'
import { AboutPage } from '@/pages/Public/AboutPage'
import { SearchPage } from '@/pages/Public/SearchPage'

// Admin Panel
import { AdminLayout } from '@/components/Admin/AdminLayout'
import { AdminDashboard } from '@/pages/Admin/AdminDashboard'
import { AdminPosts } from '@/pages/Admin/AdminPosts'
import { AdminPostEditor } from '@/pages/Admin/AdminPostEditor'
import { AdminCategories } from '@/pages/Admin/AdminCategories'
import { AdminUsers } from '@/pages/Admin/AdminUsers'
import { AdminComments } from '@/pages/Admin/AdminComments'
import { AdminMedia } from '@/pages/Admin/AdminMedia'
import { AdminSEO } from '@/pages/Admin/AdminSEO'
import { AdminSettings } from '@/pages/Admin/AdminSettings'
import { AdminLogin } from '@/pages/Admin/AdminLogin'

import { useAuth } from '@/hooks/useAuth'

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Public Frontend Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="post/:slug" element={<PostPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="search" element={<SearchPage />} />
            </Route>

            {/* Admin Panel Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

function AdminRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AdminLogin />
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<AdminPostEditor />} />
        <Route path="posts/edit/:id" element={<AdminPostEditor />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="seo" element={<AdminSEO />} />
        <Route path="settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayout>
  )
}

export default App