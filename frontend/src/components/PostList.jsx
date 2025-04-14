import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchPosts = async () => {
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
    };

    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try {
      // If using mock data, handle likes differently
      if (usedMockData) {
        setPosts(posts.map(post => 
          post._id === id ? {...post, likes: post.likes + 1} : post
        ));
        return;
      }
      
      const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedPost = await response.json();
      setPosts(posts.map(post => 
        post._id === id ? updatedPost : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error && !usedMockData) return <div className="error">{error}</div>;
  if (error && usedMockData) {
    return (
      <div className="post-list">
        <div className="error">{error}</div>
        <h2>Sample Posts</h2>
        {posts.map(post => (
          <PostItem 
            key={post._id} 
            post={post}
            onLike={handleLike}
          />
        ))}
      </div>
    );
  }
  if (posts.length === 0) return <div className="no-posts">No posts found</div>;

  return (
    <div className="post-list">
      <h2>Recent Posts</h2>
      {posts.map(post => (
        <PostItem 
          key={post._id} 
          post={post}
          onLike={handleLike}
        />
      ))}
    </div>
  );
};

export default PostList; 