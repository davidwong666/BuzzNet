import { useState } from 'react';
import './App.css';
import PostList from './components/PostList';
import PostForm from './components/PostForm';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    // Trigger refresh of PostList component
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>BuzzNet</h1>
        <p>Let's chat here!</p>
      </header>

      <main className="app-main">
        <section className="create-post-section">
          <PostForm onPostCreated={handlePostCreated} />
        </section>
        
        <section className="posts-section" key={refreshKey}>
          <PostList />
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} BuzzNet</p>
      </footer>
    </div>
  );
}

export default App;
