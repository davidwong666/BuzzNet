import { useState, useEffect } from 'react';
import './App.css';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAction, setLastAction] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handlePostCreated = () => {
    // Trigger refresh of PostList component
    setRefreshKey(prev => prev + 1);
    setLastAction("Post created successfully!");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setLastAction(null);
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
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
        {username && (
          <div style={{
            position: 'absolute',
            top: 15,
            right: 50,
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 20,
            borderRadius: 6,
            padding: '4px 16px',
            marginBottom: 4,
            zIndex: 1001,
            textAlign: 'right',
          }}>
            {username}
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: 50,
            right: 50,
            background: '#3a7bd5',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            transition: 'background 0.2s',
            zIndex: 1000,
          }}
        >
          Logout
        </button>
      </header>

      <main className="app-main-flex">
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
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} BuzzNet - Group Project for CSCI3100</p>
      </footer>
    </div>
  );
}

export default App;
