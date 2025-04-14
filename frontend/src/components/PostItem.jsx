import { useState } from 'react';

const PostItem = ({ post, onLike }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => setIsExpanded(!isExpanded);
  
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
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="post-item">
      <h3>{post.title}</h3>
      <div className="post-meta">
        <span className="post-author">By {post.author}</span>
        <span className="post-date">{formatDate(post.createdAt)}</span>
      </div>
      
      <div className={`post-content ${isExpanded ? 'expanded' : ''}`}>
        {isExpanded 
          ? post.content 
          : post.content.length > 150 
            ? `${post.content.substring(0, 150)}...` 
            : post.content
        }
      </div>
      
      {post.content.length > 150 && (
        <button className="read-more" onClick={toggleExpand}>
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
      
      <div className="post-actions">
        <button 
          className="like-button" 
          onClick={() => onLike(post._id)}
        >
          👍 {post.likes}
        </button>
      </div>
    </div>
  );
};

export default PostItem; 