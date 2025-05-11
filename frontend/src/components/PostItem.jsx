import { useState } from 'react';

const PostItem = ({ post, onLike, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [dislikes, setDislikes] = useState(post.dislikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // Get current logged-in user
  const currentUsername = localStorage.getItem('username');
  // Check if current user is the author of the post
  const isAuthor = post.author?.username === currentUsername;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(post._id);
    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        setLikes((prev) => prev - 1);
        setIsLiked(false);
      } else {
        if (isDisliked) {
          setDislikes((prev) => prev - 1);
          setIsDisliked(false);
        }
        setLikes((prev) => prev + 1);
        setIsLiked(true);
      }
      await onLike(post._id);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert the state if the API call fails
      if (isLiked) {
        setLikes((prev) => prev + 1);
        setIsLiked(true);
      } else {
        if (isDisliked) {
          setDislikes((prev) => prev + 1);
          setIsDisliked(true);
        }
        setLikes((prev) => prev - 1);
        setIsLiked(false);
      }
    }
  };

  const handleDislike = async () => {
    try {
      if (isDisliked) {
        setDislikes((prev) => prev - 1);
        setIsDisliked(false);
      } else {
        if (isLiked) {
          setLikes((prev) => prev - 1);
          setIsLiked(false);
        }
        setDislikes((prev) => prev + 1);
        setIsDisliked(true);
      }
      // You'll need to implement onDislike in the parent component
      // await onDislike(post._id);
    } catch (error) {
      console.error('Error disliking post:', error);
      // Revert the state if the API call fails
      if (isDisliked) {
        setDislikes((prev) => prev + 1);
        setIsDisliked(true);
      } else {
        if (isLiked) {
          setLikes((prev) => prev + 1);
          setIsLiked(true);
        }
        setDislikes((prev) => prev - 1);
        setIsDisliked(false);
      }
    }
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
    <div className="post-item">
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
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px 10px',
            color: isLiked ? '#3a7bd5' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          👍 {likes}
        </button>
        <button
          className={`dislike-button ${isDisliked ? 'active' : ''}`}
          onClick={handleDislike}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px 10px',
            color: isDisliked ? '#3a7bd5' : '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
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
