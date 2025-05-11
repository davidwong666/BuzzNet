import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      setPost(data);
      setLikes(data.likes || 0);
      setDislikes(data.dislikes || 0);
      
      const currentUserId = localStorage.getItem('userId');
      if (currentUserId) {
        setIsLiked(data.likedBy?.includes(currentUserId) || false);
        setIsDisliked(data.dislikedBy?.includes(currentUserId) || false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (isLoadingAction) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
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
      setLikes(updatedPost.likes);
      setDislikes(updatedPost.dislikes);
      setIsLiked(updatedPost.likedBy.includes(localStorage.getItem('userId')));
      setIsDisliked(updatedPost.dislikedBy.includes(localStorage.getItem('userId')));
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    if (isLoadingAction) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    setIsLoadingAction(true);
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/dislike`, {
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
      setLikes(updatedPost.likes);
      setDislikes(updatedPost.dislikes);
      setIsLiked(updatedPost.likedBy.includes(localStorage.getItem('userId')));
      setIsDisliked(updatedPost.dislikedBy.includes(localStorage.getItem('userId')));
    } catch (error) {
      console.error('Error disliking post:', error);
      alert('Failed to dislike post. Please try again.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!post) {
    return <div className="error">Post not found</div>;
  }

  return (
    <div className="post-detail-container" style={{
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: 'auto'
    }}>
      <button 
        className="back-button" 
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: '#3a7bd5',
          cursor: 'pointer',
          fontSize: '16px',
          padding: '10px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '20px',
          position: 'sticky',
          top: '0',
          zIndex: 1,
          backgroundColor: 'var(--background-color)'
        }}
      >
        ← Back
      </button>
      
      <div className="post-detail" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        height: 'auto'
      }}>
        <h1 style={{
          color: '#3a7bd5',
          marginBottom: '1rem',
          fontSize: '2.5rem',
          wordBreak: 'break-word'
        }}>{post.title}</h1>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#666',
          marginBottom: '1.5rem',
          fontSize: '1rem'
        }}>
          <span>By {post.author?.username || 'Unknown User'}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        
        <div style={{
          fontSize: '1.2rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          width: '100%',
          height: 'auto'
        }}>
          {post.content}
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #ddd',
          color: '#666',
          width: '100%'
        }}>
          <button
            onClick={handleLike}
            disabled={isLoadingAction}
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoadingAction ? 'not-allowed' : 'pointer',
              padding: '5px 10px',
              color: isLiked ? '#3a7bd5' : '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              opacity: isLoadingAction ? 0.7 : 1,
            }}
          >
            👍 {likes}
          </button>
          <button
            onClick={handleDislike}
            disabled={isLoadingAction}
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoadingAction ? 'not-allowed' : 'pointer',
              padding: '5px 10px',
              color: isDisliked ? '#3a7bd5' : '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              opacity: isLoadingAction ? 0.7 : 1,
            }}
          >
            👎 {dislikes}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 