import React, { useState, useEffect } from 'react'
import { commentsAPI } from '@/lib/api'
import type { Comment } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Calendar, Heart, Reply } from 'lucide-react'

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    const { data, error } = await commentsAPI.getByPostId(postId, true)
    if (data && !error) {
      setComments(data)
    }
    setLoading(false)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) return

    const { data, error } = await commentsAPI.create({
      post_id: postId,
      author_name: authorName,
      author_email: authorEmail,
      content: newComment,
      ip_address: undefined,
      user_agent: navigator.userAgent
    })

    if (data && !error) {
      setNewComment('')
      setAuthorName('')
      setAuthorEmail('')
      // Show success message
      alert('Comment submitted for moderation!')
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">{comment.author_name}</span>
            <span className="text-sm text-gray-500 flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
              <Heart className="h-3 w-3" />
              <span>0</span>
            </button>
            {!isReply && (
              <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {comment.replies && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
      </div>
    )
  }
  return (
    <section className="bg-gray-50 rounded-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">Leave a Comment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Your email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            required
          />
        </div>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          rows={4}
          placeholder="Write your comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <Button type="submit" className="mt-4">
          Post Comment
        </Button>
        <p className="text-sm text-gray-600 mt-2">
          Your comment will be reviewed before being published.
        </p>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
        {comments.length === 0 && (
          <p className="text-gray-600 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </section>
  )
}