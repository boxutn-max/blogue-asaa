/*
  # Complete Blog Database Schema

  1. New Tables
    - `profiles` - User profiles with roles
    - `categories` - Blog post categories
    - `tags` - Blog post tags
    - `posts` - Blog posts with all metadata
    - `post_tags` - Many-to-many relationship between posts and tags
    - `comments` - User comments on posts
    - `seo_settings` - SEO metadata for posts
    - `media` - Uploaded media files

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for public and authenticated access
    - Secure admin-only operations

  3. Functions
    - Auto-generate slugs
    - Update timestamps
    - Search functionality
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  published_at timestamptz,
  scheduled_for timestamptz,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Post tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'trash')),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- SEO settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
  meta_title text,
  meta_description text,
  keywords text,
  og_title text,
  og_description text,
  og_image text,
  twitter_title text,
  twitter_description text,
  twitter_image text,
  canonical_url text,
  robots_meta text DEFAULT 'index,follow',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  original_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  alt_text text,
  caption text,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only editors and admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Tags policies
CREATE POLICY "Tags are viewable by everyone" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tags" ON tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone" ON posts
  FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Authors can create posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Editors and admins can manage all posts" ON posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Post tags policies
CREATE POLICY "Post tags are viewable by everyone" ON post_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage post tags" ON post_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments policies
CREATE POLICY "Approved comments are viewable by everyone" ON comments
  FOR SELECT USING (status = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only authenticated users can manage comments" ON comments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete comments" ON comments
  FOR DELETE USING (auth.role() = 'authenticated');

-- SEO settings policies
CREATE POLICY "SEO settings are viewable by everyone" ON seo_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage SEO settings" ON seo_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Media policies
CREATE POLICY "Media is viewable by everyone" ON media
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload media" ON media
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their own media" ON media
  FOR ALL USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all media" ON media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Functions and triggers
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);

-- Full text search
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON posts USING gin(title gin_trgm_ops);

-- Insert default data
INSERT INTO categories (name, slug, description, color) VALUES
  ('Match Reports', 'match-reports', 'Detailed reports from ASA matches', '#EF4444'),
  ('News', 'news', 'Latest news and updates from ASA', '#3B82F6'),
  ('Player Profiles', 'players', 'In-depth player profiles and interviews', '#10B981'),
  ('Analysis', 'analysis', 'Tactical analysis and match breakdowns', '#8B5CF6'),
  ('Training', 'training', 'Training updates and insights', '#F59E0B'),
  ('Youth Development', 'youth', 'Youth academy and development programs', '#06B6D4')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tags (name, slug) VALUES
  ('Championship', 'championship'),
  ('Victory', 'victory'),
  ('Training', 'training'),
  ('Youth', 'youth'),
  ('Analysis', 'analysis'),
  ('Transfer', 'transfer'),
  ('Match Report', 'match-report'),
  ('Interview', 'interview')
ON CONFLICT (slug) DO NOTHING;