import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const PostsContext = createContext();

export const usePosts = () => useContext(PostsContext);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHookData = useAuth(); // Get the entire object returned by useAuth
  const { currentUser } = authHookData; // Assuming currentUser is a top-level property

  // Log the entire data from useAuth() on every render
  // This will help verify if currentUser is present and its structure
  console.log('PostsProvider - Data from useAuth():', authHookData);

  // Log currentUser directly on every render
  // This will show null/undefined if not logged in, or the user object if logged in
  console.log('PostsProvider - currentUser (during render):', currentUser);

  const isOnline = useOnlineStatus();

  console.log('Current User (during render):', currentUser);

  useEffect(() => {
    // It's also good to see if currentUser changes and what it becomes
    console.log('PostsProvider - currentUser in useEffect (runs on change or mount):', currentUser);
  }, [currentUser]); // This effect runs when currentUser changes or on initial mount

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          comments:
            doc.data().comments?.map((comment) => ({
              ...comment,
              createdAt: comment.createdAt?.toDate(),
            })) || [],
          likedBy: doc.data().likedBy || [],
          unlikedBy: doc.data().unlikedBy || [],
          likes: doc.data().likes || 0,
          unlikes: doc.data().unlikes || 0,
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
        unlikedBy: [],
      };
      setPosts((prevPosts) => [tempPost, ...prevPosts]);
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
        unlikedBy: [],
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
        unlikedBy: [],
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    if (!isOnline) {
      console.warn('User is offline. Cannot like post.');
      return; // Exit if offline
    }

    // Ensure there is an authenticated user
    // `currentUser` should be populated by your Firebase Auth setup (via useAuth hook)
    if (!currentUser) {
      console.error('User not authenticated. Cannot like post.');
      // You might want to throw an error or trigger a login flow
      // For example: throw new Error('Authentication required to like a post.');
      return; // Exit if no user is logged in
    }

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find((p) => p.id === postId);

      // Add to likedBy if not already liked
      if (!post.likedBy?.includes(currentUser.email)) {
        await updateDoc(postRef, {
          likedBy: arrayUnion(currentUser.email),
          likes: (post.likes || 0) + 1,
        });

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likedBy: [...(p.likedBy || []), currentUser.email],
                  likes: (p.likes || 0) + 1,
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
      const post = posts.find((p) => p.id === postId);

      // Add to unlikedBy if not already unliked
      if (!post.unlikedBy?.includes(currentUser.email)) {
        await updateDoc(postRef, {
          unlikedBy: arrayUnion(currentUser.email),
          unlikes: (post.unlikes || 0) + 1,
        });

        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  unlikedBy: [...(p.unlikedBy || []), currentUser.email],
                  unlikes: (p.unlikes || 0) + 1,
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
        createdAt: serverTimestamp(),
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
      });

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...(p.comments || []), { ...newComment, createdAt: new Date() }],
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
    addComment,
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};
