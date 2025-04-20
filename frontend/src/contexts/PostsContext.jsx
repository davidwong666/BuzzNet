import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, orderBy, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
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
          createdAt: doc.data().createdAt?.toDate(),
          comments: doc.data().comments?.map(comment => ({
            ...comment,
            createdAt: comment.createdAt?.toDate()
          })) || [],
          likedBy: doc.data().likedBy || [],
          unlikedBy: doc.data().unlikedBy || [],
          likes: doc.data().likes || 0,
          unlikes: doc.data().unlikes || 0
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
        unlikes: 0,
        comments: [],
        likedBy: [],
        unlikedBy: []
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
        unlikes: 0,
        comments: [],
        likedBy: [],
        unlikedBy: []
      });
      
      const newPost = {
        id: docRef.id,
        content,
        author: currentUser.email,
        createdAt: new Date(),
        likes: 0,
        unlikes: 0,
        comments: [],
        likedBy: [],
        unlikedBy: []
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
      
      // Add to likedBy if not already liked
      if (!post.likedBy?.includes(currentUser.email)) {
        await updateDoc(postRef, {
          likedBy: arrayUnion(currentUser.email),
          likes: (post.likes || 0) + 1
        });
        
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { 
                  ...p, 
                  likedBy: [...(p.likedBy || []), currentUser.email],
                  likes: (p.likes || 0) + 1 
                }
              : p
          )
        );
      }
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
      
      // Add to unlikedBy if not already unliked
      if (!post.unlikedBy?.includes(currentUser.email)) {
        await updateDoc(postRef, {
          unlikedBy: arrayUnion(currentUser.email),
          unlikes: (post.unlikes || 0) + 1
        });
        
        setPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === postId 
              ? { 
                  ...p, 
                  unlikedBy: [...(p.unlikedBy || []), currentUser.email],
                  unlikes: (p.unlikes || 0) + 1
                }
              : p
          )
        );
      }
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
        createdAt: serverTimestamp()
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                comments: [
                  ...(p.comments || []), 
                  { ...newComment, createdAt: new Date() }
                ] 
              }
            : p
        )
      );

      return { ...newComment, createdAt: new Date() };
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