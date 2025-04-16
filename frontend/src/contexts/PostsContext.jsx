import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const addPost = async (content) => {
    if (!isOnline) {
      const tempPost = {
        id: Date.now().toString(),
        content,
        author: currentUser.email,
        createdAt: new Date(),
        likes: 0,
        comments: []
      };
      setPosts(prevPosts => [tempPost, ...prevPosts]);
      return tempPost;
    }

    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        content,
        author: currentUser.email,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: []
      });
      
      const newPost = {
        id: docRef.id,
        content,
        author: currentUser.email,
        createdAt: new Date(),
        likes: 0,
        comments: []
      };
      
      setPosts(prevPosts => [newPost, ...prevPosts]);
      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    if (!isOnline) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      await updateDoc(postRef, {
        likes: (post.likes || 0) + 1
      });
      
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, likes: (p.likes || 0) + 1 }
            : p
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  };

  const unlikePost = async (postId) => {
    if (!isOnline) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      const newLikes = Math.max(0, (post.likes || 0) - 1);
      
      await updateDoc(postRef, {
        likes: newLikes
      });
      
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, likes: newLikes }
            : p
        )
      );
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  };

  const addComment = async (postId, content) => {
    if (!isOnline) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const newComment = {
        id: Date.now().toString(),
        content,
        author: currentUser.email,
        createdAt: new Date()
      };

      const post = posts.find(p => p.id === postId);
      const updatedComments = [...(post.comments || []), newComment];
      
      await updateDoc(postRef, {
        comments: updatedComments
      });
      
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, comments: updatedComments }
            : p
        )
      );

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const value = {
    posts,
    loading,
    addPost,
    likePost,
    unlikePost,
    addComment
  };

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
}; 