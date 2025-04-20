import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const CommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const isOnline = useOnlineStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (!isOnline) {
      setError('You need to be online to add a comment');
      return;
    }

    try {
      await onSubmit(comment);
      setComment('');
    } catch (error) {
      setError('Failed to add comment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div className="form-group">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          rows="2"
          disabled={!isOnline}
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button 
        type="submit" 
        className="submit-button"
        disabled={!isOnline || !comment.trim()}
      >
        Add Comment
      </button>
    </form>
  );
};

export default CommentForm; 