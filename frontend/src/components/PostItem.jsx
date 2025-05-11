import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PostItem = ({ post, onDelete }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [dislikes, setDislikes] = useState(post.dislikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get current logged-in user
  const currentUsername = localStorage.getItem('username');
  const currentUserId = localStorage.getItem('userId');
  // Check if current user is the author of the post
  const isAuthor = post.author?.username === currentUsername;

  // Initialize like/dislike status when post data changes
  useEffect(() => {
    if (currentUserId && post.likedBy) {
      setIsLiked(post.likedBy.includes(currentUserId));
    }
    if (currentUserId && post.dislikedBy) {
      setIsDisliked(post.dislikedBy.includes(currentUserId));
    }
    setLikes(post.likes || 0);
    setDislikes(post.dislikes || 0);
  }, [post, currentUserId]);

  const toggleExpand = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking read more
    setIsExpanded(!isExpanded);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setShowConfirm(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking confirm
    onDelete(post._id);
    setShowConfirm(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking cancel
    setShowConfirm(false);
  };

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking like
    if (isLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      const updatedPost = await response.json();
      
      // Update state with backend response
      setLikes(updatedPost.likes);
      setDislikes(updatedPost.dislikes);
      setIsLiked(updatedPost.likedBy.includes(currentUserId));
      setIsDisliked(updatedPost.dislikedBy.includes(currentUserId));

    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation(); // Prevent navigation when clicking dislike
    if (isLoading) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/dislike`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }

      const updatedPost = await response.json();
      
      // Update state with backend response
      setLikes(updatedPost.likes);
      setDislikes(updatedPost.dislikes);
      setIsLiked(updatedPost.likedBy.includes(currentUserId));
      setIsDisliked(updatedPost.dislikedBy.includes(currentUserId));

    } catch (error) {
      console.error('Error disliking post:', error);
      alert('Failed to dislike post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post._id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="post-item" onClick={handlePostClick}>
      <h3>{post.title}</h3>
      <div className="post-meta">
        <span className="post-author">By {post.author?.username || 'Unknown User'}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>

      <div
        className={`post-content ${isExpanded ? 'expanded' : ''}`}
        style={{
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          maxWidth: '100%',
        }}
      >
        {isExpanded
          ? post.content
          : post.content.length > 150
          ? `${post.content.substring(0, 150)}...`
          : post.content}
      </div>

      {post.content.length > 150 && (
        <button
          className="read-more-button"
          onClick={toggleExpand}
          style={{
            background: 'none',
            border: 'none',
            color: '#3a7bd5',
            cursor: 'pointer',
            padding: '5px 0',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}

      <div className="post-actions">
        <button
          className={`like-button ${isLiked ? 'active' : ''}`}
          onClick={handleLike}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '5px 10px',
            color: isLiked ? '#3a7bd5' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          👍 {likes}
        </button>
        <button
          className={`dislike-button ${isDisliked ? 'active' : ''}`}
          onClick={handleDislike}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            padding: '5px 10px',
            color: isDisliked ? '#3a7bd5' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          👎 {dislikes}
        </button>
        <button className="comment-button" onClick={() => onComment(post._id)}>
          💬 {post.commentCount || 0}
        </button>
        {isAuthor && (
          <button
            className="delete-button"
            onClick={handleDeleteClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px 10px',
              color: '#ff4444',
            }}
          >
            Delete
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="confirm-delete">
          <p>Are you sure you want to delete this post?</p>
          <button onClick={confirmDelete}>Yes</button>
          <button onClick={cancelDelete}>No</button>
        </div>
      )}
    </div>
  );
};

export default PostItem;
