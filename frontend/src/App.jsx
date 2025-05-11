import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import Login from './components/Login';
import Profile from './components/Profile';
import PostDetail from './pages/PostDetail';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAction, setLastAction] = useState(null);
  const username = localStorage.getItem('username') || 'Guest';
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(!!token);
    if (!storedUsername && token) {
      // If there is a token but no username, try to get the username from localStorage
      const username = localStorage.getItem('username');
      if (!username) {
        localStorage.setItem('username', 'Guest');
      }
    }
  }, []);

  const handlePostCreated = () => {
    // Trigger refresh of PostList component
    setRefreshKey((prev) => prev + 1);
    setLastAction('Post created successfully!');

    // Clear success message after 3 seconds
    setTimeout(() => {
      setLastAction(null);
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header" style={{ position: 'relative', zIndex: 10 }}>
        <div className="logo-container">
          <h1>BuzzNet</h1>
        </div>
        <p>Share and Connect with the Community</p>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: 50,
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '10px',
            zIndex: 1001,
          }}
        >
          {username && (
            <Link
              to="/profile"
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 20,
                borderRadius: 6,
                padding: '4px 16px',
                textAlign: 'right',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {username}
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: '#3a7bd5',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              transition: 'background 0.2s',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="app-main-flex">
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route
            path="/"
            element={
              <>
                <div className="left-column">
                  <section className="create-post-section">
                    <PostForm onPostCreated={handlePostCreated} />
                    {lastAction && <div className="success-message">{lastAction}</div>}
                  </section>
                </div>

                <div className="right-column">
                  <section className="posts-section" key={refreshKey}>
                    <PostList />
                  </section>
                </div>
              </>
            }
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} BuzzNet - Group Project for CSCI3100</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
