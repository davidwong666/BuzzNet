import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown, faComment } from '@fortawesome/free-solid-svg-icons';
import CommentForm from './CommentForm';
import {
  FaThumbsUp as FaThumbsUpIcon,
  FaThumbsDown as FaThumbsDownIcon,
  FaComment as FaCommentIcon,
} from 'react-icons/fa';

const Post = ({ post }) => {
  const { currentUser } = useAuth();
  const { likePost, unlikePost, addComment } = usePosts();
  const isOnline = useOnlineStatus();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isUnliking, setIsUnliking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    if (!isOnline) return;
    setIsLiking(true);
    try {
      await likePost(post.id);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleUnlike = async () => {
    if (!isOnline) return;
    setIsUnliking(true);
    try {
      await unlikePost(post.id);
    } catch (error) {
      console.error('Error unliking post:', error);
    } finally {
      setIsUnliking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isOnline || !newComment.trim()) return;
    setIsCommenting(true);
    try {
      await addComment(post.id, newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const isLiked = post.likedBy?.includes(currentUser?.email);
  const isUnliked = post.unlikedBy?.includes(currentUser?.email);

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
      <div className="post-content">{post.content}</div>
      <div className="post-actions">
        <button
          className={`action-button ${isLiked ? 'active' : ''}`}
          onClick={handleLike}
          disabled={!isOnline || isLiking}
          title={isLiked ? 'Liked' : 'Like'}
        >
          <FaThumbsUpIcon />
          <span className="action-count">{post.likes || 0}</span>
        </button>
        <button
          className={`action-button ${isUnliked ? 'active' : ''}`}
          onClick={handleUnlike}
          disabled={!isOnline || isUnliking}
          title={isUnliked ? 'Unliked' : 'Unlike'}
        >
          <FaThumbsDownIcon />
          <span className="action-count">{post.unlikes || 0}</span>
        </button>
        <button
          className="action-button"
          onClick={() => setShowComments(!showComments)}
          title="Comments"
        >
          <FaCommentIcon />
          <span className="action-count">{comments.length}</span>
        </button>
      </div>
      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={!isOnline || isCommenting}
            />
            <button type="submit" disabled={!isOnline || !newComment.trim() || isCommenting}>
              {isCommenting ? 'Posting...' : 'Post'}
            </button>
          </form>
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
