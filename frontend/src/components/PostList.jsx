import { useState, useEffect, useCallback } from 'react';
import PostItem from './PostItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock data for when the backend is unavailable
const MOCK_POSTS = [
  {
    _id: '1',
    title: 'Welcome to BuzzNet',
    content: 'This is a placeholder post while we connect to the database. The real posts will appear once the backend is properly deployed.',
    author: 'System',
    likes: 5,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'How to use BuzzNet',
    content: 'Create an account, write posts, and interact with other users. This is a temporary post until the database connection is established.',
    author: 'Admin',
    likes: 3,
    createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
  }
];

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usedMockData, setUsedMockData] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if not using mock data
      if (!usedMockData) {
        setRefreshCount(prev => prev + 1);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [usedMockData]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching from:', `${API_URL}/api/posts`); // Debug log
      const response = await fetch(`${API_URL}/api/posts`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Posts fetched:', data); // Debug log
      setPosts(data);
      setError(null);
      setUsedMockData(false);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Error fetching posts:', err);
      
      // Check for posts in localStorage first
      const localPosts = JSON.parse(localStorage.getItem('buzznetPosts') || '[]');
      
      if (localPosts.length > 0) {
        setPosts(localPosts);
        setError('Using locally saved posts - database connection issue');
        setUsedMockData(true);
      } else {
        // Fall back to mock data if no local posts
        setPosts(MOCK_POSTS);
        setError('Using sample posts - database connection issue');
        setUsedMockData(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch posts on initial load and when refreshCount changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshCount]);

  const handleLike = async (id) => {
    try {
      // Optimistically update UI immediately
      setPosts(posts.map(post => 
        post._id === id ? {...post, likes: post.likes + 1} : post
      ));
      
      // If using mock data, no need to call API
      if (usedMockData) {
        return;
      }
      
      const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Refresh posts to get the latest data
      setRefreshCount(prev => prev + 1);
      
    } catch (err) {
      console.error('Error liking post:', err);
      // If there was an error, refresh to get correct data
      setRefreshCount(prev => prev + 1);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      // Optimistically update UI immediately
      setPosts(posts.filter(post => post._id !== id));
      
      // If using mock data, handle delete differently
      if (usedMockData) {
        // If using local storage, update it
        if (localStorage.getItem('buzznetPosts')) {
          const localPosts = JSON.parse(localStorage.getItem('buzznetPosts'));
          localStorage.setItem('buzznetPosts', JSON.stringify(localPosts.filter(post => post._id !== id)));
        }
        return;
      }
      
      // If connected to backend, send delete request
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Refresh posts to get the latest data
      setRefreshCount(prev => prev + 1);
      
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
      // If there was an error, refresh to get correct data
      setRefreshCount(prev => prev + 1);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  if (loading && posts.length === 0) return <div className="loading">Loading posts...</div>;
  
  return (
    <div className="post-list">
      <div className="post-list-header">
        <h2>Recent Posts</h2>
        <button className="refresh-button" onClick={handleManualRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {posts.length === 0 ? (
        <div className="no-posts">No posts found</div>
      ) : (
        <>
          <div className="last-refresh-info">
            Last updated: {new Date(lastRefresh).toLocaleTimeString()}
          </div>
          {posts.map(post => (
            <PostItem 
              key={post._id} 
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default PostList; 