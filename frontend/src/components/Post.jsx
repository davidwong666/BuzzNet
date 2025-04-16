import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment } from '@fortawesome/free-solid-svg-icons';
import CommentForm from './CommentForm';

const Post = ({ post }) => {
  const { currentUser } = useAuth();
  const { likePost, unlikePost, addComment } = usePosts();
  const isOnline = useOnlineStatus();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    if (!isOnline) {
      alert('You need to be online to like a post');
      return;
    }
    try {
      await likePost(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleUnlike = async () => {
    if (!isOnline) {
      alert('You need to be online to unlike a post');
      return;
    }
    try {
      await unlikePost(post.id);
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  };

  const handleAddComment = async (commentText) => {
    if (!isOnline) {
      alert('You need to be online to add a comment');
      return;
    }
    try {
      const newComment = await addComment(post.id, commentText);
      setComments([...comments, newComment]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="post-item">
      <div className="post-header">
        <div className="post-author">
          <span className="author-name">{post.author}</span>
          <span className="post-time">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="post-content">
        {post.content}
      </div>
      <div className="post-actions">
        <button 
          className="action-button like-button"
          onClick={handleLike}
          disabled={!isOnline}
        >
          <FontAwesomeIcon icon={faThumbsUp} />
          <span>{post.likes || 0}</span>
        </button>
        <button 
          className="action-button unlike-button"
          onClick={handleUnlike}
          disabled={!isOnline}
        >
          <FontAwesomeIcon icon={faThumbsDown} />
        </button>
        <button 
          className="action-button comment-button"
          onClick={() => setShowComments(!showComments)}
        >
          <FontAwesomeIcon icon={faComment} />
          <span>{comments.length}</span>
        </button>
      </div>
      {showComments && (
        <div className="comments-section">
          <CommentForm onSubmit={handleAddComment} />
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-time">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post; 