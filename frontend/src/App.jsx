import { useState, useEffect } from 'react';
import './App.css';
import PostList from './components/PostList';
import PostForm from './components/PostForm';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAction, setLastAction] = useState(null);

  const handlePostCreated = () => {
    // Trigger refresh of PostList component
    setRefreshKey(prev => prev + 1);
    setLastAction("Post created successfully!");
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setLastAction(null);
    }, 3000);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <h1>BuzzNet</h1>
        </div>
        <p>Share and Connect with the Community</p>
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
