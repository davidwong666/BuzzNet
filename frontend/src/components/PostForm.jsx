import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PostForm = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [authorName, setAuthorName] = useState(''); // To display logged-in user's name
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // Get username from localStorage to display and for offline posts
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setAuthorName(storedUsername);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted:', formData);

    // Validate form - only title and content are from the form now
    if (!formData.title || !formData.content) {
      setError('Title and content are required.');
      return;
    }

    // Retrieve token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must be logged in to create a post. Please log in and try again.');
      setIsSubmitting(false); // Not strictly needed here as it's in finally, but good for clarity if returning early
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Data to be sent to the backend
    // The backend will determine the author from the token
    const postPayload = {
      title: formData.title,
      content: formData.content,
    };

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Add the Authorization header
        },
        body: JSON.stringify(postPayload),
      });

      if (!response.ok) {
        let errorMessage = `Error: ${response.status}`;
        if (response.status === 401) {
          // Specific handling for unauthorized error
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.message ||
              'Unauthorized. Your session may have expired. Please log in again.';
          } catch (jsonError) {
            errorMessage = 'Unauthorized. Your session may have expired. Please log in again.';
          }
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Server error: ${response.status}`;
          } catch (jsonError) {
            // Keep the original status error if JSON parsing fails
          }
        }
        throw new Error(errorMessage);
      }

      const newPost = await response.json();

      // Reset form
      setFormData({
        title: '',
        content: '',
      });

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      if (offlineMode) {
        setOfflineMode(false); // Reset offline mode on successful online submission
      }
    } catch (err) {
      console.error('Error creating post:', err);

      // Check if we're offline or if it's an auth error
      if (err.message.toLowerCase().includes('unauthorized')) {
        setError(err.message);
      } else if (
        !navigator.onLine ||
        (err.message && err.message.toLowerCase().includes('failed to fetch'))
      ) {
        setOfflineMode(true);
        setError('Connection unavailable. Post saved locally and will sync when back online.');

        const tempPost = {
          ...postPayload,
          author: authorName || 'Unknown User (Offline)', // Use the displayed authorName
          _id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          likes: 0,
          isOffline: true, // Mark as an offline post
        };

        const savedPosts = JSON.parse(localStorage.getItem('buzznetOfflinePosts') || '[]');
        localStorage.setItem('buzznetOfflinePosts', JSON.stringify([...savedPosts, tempPost]));

        setFormData({ title: '', content: '' }); // Reset form

        if (onPostCreated) {
          onPostCreated(tempPost); // Notify parent about the locally saved post
        }
      } else {
        setError(err.message || 'Failed to create post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-form-container wide-form">
      <h2>Create New Post</h2>
      {authorName && (
        <p className="greeting-message" style={{ textAlign: 'center', marginBottom: '15px' }}>
          Posting as: <strong>{authorName}</strong>
        </p>
      )}

      {error && (
        <div
          className="error"
          style={{
            color: 'red',
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid red',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Write a title for your post..."
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Author input field has been removed. Author is the logged-in user. */}

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share everything with the BuzzNet community..."
            rows="6"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              resize: 'vertical',
              minHeight: '120px',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
            disabled={isSubmitting}
            required
          ></textarea>
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
