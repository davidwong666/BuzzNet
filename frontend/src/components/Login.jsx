import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
      const body = isRegister
        ? { name: form.username, email: form.username + '@test.com', password: form.password }
        : { email: form.username + '@test.com', password: form.password };
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');
      // Save token and username
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.name);
      if (onLogin) onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #b3c6ff 0%, #3a7bd5 100%)',
      }}
    >
      <div
        style={{
          background: '#333',
          borderRadius: '12px',
          padding: '32px 24px 24px 24px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          width: '100%',
          maxWidth: '400px',
          boxSizing: 'border-box',
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ color: '#fff', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
            {isRegister ? 'Register' : 'Login'}
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 4,
                border: 'none',
                fontSize: 16,
              }}
              autoComplete="username"
              required
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#fff', display: 'block', marginBottom: 8 }}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 4,
                border: 'none',
                fontSize: 16,
              }}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
            />
          </div>
          {error && <div style={{ color: '#ffb3b3', marginBottom: 16 }}>{error}</div>}
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#3a7bd5',
              color: '#fff',
              fontSize: 20,
              border: 'none',
              borderRadius: 6,
              padding: '12px 0',
              marginBottom: 12,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              transition: 'background 0.2s',
            }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#fff', fontSize: 14 }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#3a7bd5',
                fontSize: 14,
                marginLeft: 8,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Go to Login' : 'Go to Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
