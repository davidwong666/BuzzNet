const Post = require('../models/Post');

const getPosts = async (req, res) => {
  console.log('--- ENTERING getPosts controller ---'); // <--- ADD Log 1
  try {
    console.log('Attempting Post.find()...'); // <--- ADD Log 2
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log(`Post.find() successful, found ${posts.length} posts.`); // <--- ADD Log 3
    res.json(posts);
  } catch (error) {
    console.error('!!! ERROR CAUGHT IN getPosts controller !!!'); // <--- ADD Log 4
    console.error('Error Name:', error.name); // <--- ADD Log 5
    console.error('Error Message:', error.message); // <--- ADD Log 6
    console.error('Error Stack:', error.stack); // <--- ADD Log 7 (Most detailed)
    res
      .status(500)
      .json({ message: 'Error fetching posts. Check server logs.', error: error.message }); // Keep sending response
  }
};

// Get a single post
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a post
const createPost = async (req, res) => {
  const { title, content, author } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const newPost = new Post({
      title,
      content,
      author,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
};
