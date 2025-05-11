import { useState, useEffect, useCallback } from 'react';
import PostItem from './PostItem';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock data for when the backend is unavailable
const MOCK_POSTS = [
  {
    _id: '1',
    title: 'Welcome to BuzzNet',
    content:
      'This is a placeholder post while we connect to the database. The real posts will appear once the backend is properly deployed.',
    author: 'System',
    likes: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'How to use BuzzNet',
    content:
      'Create an account, write posts, and interact with other users. This is a temporary post until the database connection is established.',
    author: 'Admin',
    likes: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
];

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usedMockData, setUsedMockData] = useState(false);
  // Removed refreshCount and lastRefresh for simplicity with optimistic updates
  // const [refreshCount, setRefreshCount] = useState(0);
  // const [lastRefresh, setLastRefresh] = useState(Date.now());

  // useEffect for auto-refresh can be removed if optimistic updates + server response are sufficient
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!usedMockData) {
  //       setRefreshCount((prev) => prev + 1);
  //     }
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, [usedMockData]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching from:', `${API_URL}/api/posts`);
      const response = await fetch(`${API_URL}/api/posts`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Posts fetched:', data);
      setPosts(data);
      setError(null);
      setUsedMockData(false);
      // setLastRefresh(Date.now());
    } catch (err) {
      console.error('Error fetching posts:', err);
      const localPosts = JSON.parse(localStorage.getItem('buzznetPosts') || '[]');
      if (localPosts.length > 0) {
        setPosts(localPosts);
        setError('Using locally saved posts - database connection issue');
        setUsedMockData(true);
      } else {
        setPosts(MOCK_POSTS); // MOCK_POSTS should be defined as in your original file
        setError('Using sample posts - database connection issue');
        setUsedMockData(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // Removed refreshCount from dependencies

  const handleLike = async (id) => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    if (!token && !usedMockData) {
      // If no token and not using mock data, user is not authenticated
      console.error('Authentication token not found. Please log in.');
      setError('You must be logged in to like a post.'); // Optionally inform the user
      return; // Exit if not authenticated
    }

    // Store the original state of the post for potential revert
    const originalPosts = [...posts];
    let originalPost = posts.find((p) => p._id === id);

    // Optimistically update UI
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post._id === id) {
          // Determine if the post was already liked by the current user
          // This logic depends on how likedBy is structured and if currentUser info is available here
          // For simplicity, let's assume we just toggle the like count and liked state
          // A more complete solution would involve checking post.likedBy array
          const alreadyLiked =
            post.likedBy && post.likedBy.includes(localStorage.getItem('userId')); // Assuming userId is stored

          if (alreadyLiked) {
            // Optimistically unlike
            return {
              ...post,
              likes: (post.likes || 0) - 1,
              likedBy: post.likedBy.filter((uid) => uid !== localStorage.getItem('userId')),
            };
          } else {
            // Optimistically like
            return {
              ...post,
              likes: (post.likes || 0) + 1,
              likedBy: [...(post.likedBy || []), localStorage.getItem('userId')],
            };
          }
        }
        return post;
      })
    );

    if (usedMockData) {
      // If using mock data, simulate success and don't call API
      console.log('Mock like for post:', id);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
        method: 'PATCH',
        headers: {
          // Add the Content-Type header if you ever send a body, good practice
          'Content-Type': 'application/json',
          // Add the Authorization header with the Bearer token
          Authorization: `Bearer ${token}`,
        },
        // body: JSON.stringify({}), // Send an empty body or specific payload if your backend expects one
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Like operation failed' }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const updatedPostFromServer = await response.json();

      // Update the specific post with the authoritative response from the server
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post._id === id ? updatedPostFromServer : post))
      );
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error liking post:', err.message);
      setError(err.message || 'Failed to like post. Please try again.');
      // Revert to the original state of posts if the API call fails
      setPosts(originalPosts);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token && !usedMockData) {
      console.error('Authentication token not found. Please log in.');
      setError('You must be logged in to delete a post.');
      return;
    }

    const originalPosts = [...posts];
    // Optimistically update UI
    setPosts((currentPosts) => currentPosts.filter((post) => post._id !== id));

    if (usedMockData) {
      // Handle mock data deletion (e.g., update local storage if that's where mock data comes from)
      console.log('Mock delete for post:', id);
      // Example: if MOCK_POSTS was stateful or from localStorage, update it here
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Delete operation failed' }));
        throw new Error(errorData.message || `Error: ${response.status}`);
      }
      // Successfully deleted on server, UI is already updated optimistically
      setError(null);
    } catch (err) {
      console.error('Error deleting post:', err.message);
      setError(err.message || 'Failed to delete post. Please try again.');
      // Revert to original posts if delete failed
      setPosts(originalPosts);
    }
  };

  if (loading) return <p>Loading posts...</p>;
  // Error display can be more prominent
  // if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div className="post-list">
      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}
      {posts.length === 0 && !loading && <p>No posts yet. Be the first to create one!</p>}
      {posts.map((post) => (
        <PostItem
          key={post._id}
          post={post}
          // Pass the corrected handleLike and handleDelete to PostItem
          onLike={() => handleLike(post._id)}
          onDelete={() => handleDelete(post._id)}
        />
      ))}
    </div>
  );
};

export default PostList;
