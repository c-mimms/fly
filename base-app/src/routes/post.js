import { Router } from 'express';
import { getPost, getPosts } from '../db/posts.js';

const router = Router();

router.get('/:id', getSinglePostHandler);

async function getSinglePostHandler(req, res) {
  const { id } = req.params;

  try {
    const post = await getPost(id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    
    res.render('post', { post });

  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the post.' });
  }
}

export { router };
