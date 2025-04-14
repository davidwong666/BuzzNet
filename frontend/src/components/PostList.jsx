import { useState, useEffect } from 'react';
import PostItem from './PostItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/posts`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setPosts(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (id) => {
    try {
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
  if (error) return <div className="error">{error}</div>;
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