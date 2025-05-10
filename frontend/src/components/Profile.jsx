import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Guest';
  const email = localStorage.getItem('email') || `${username}@test.com`;
  const createdAt = localStorage.getItem('createdAt');

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Profile</h1>
        </div>
        <div className="profile-content">
          <div className="profile-info">
            <div className="info-item">
              <label>Username:</label>
              <span>{username}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{email}</span>
            </div>
            <div className="info-item">
              <label>Join Date:</label>
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            style={{
              marginTop: '2rem',
              padding: '12px 24px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              width: '100%',
              maxWidth: '500px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              ':hover': {
                backgroundColor: 'var(--secondary-color)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 