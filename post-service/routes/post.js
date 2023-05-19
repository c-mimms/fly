// routes/api/
import { Router } from 'express';
import { getPost, getPosts } from '../db/posts.js';

const router = Router();

router.get('/:id', getSinglePostHandler2);


async function getSinglePostHandler(req, res) {
  const { id } = req.params;

  try {
    const post = await getPost(id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    // Fetch all posts that link to the current post
    const linkedPosts = await getPosts({ outgoingLinks: id });

    res.render('post', { post, linkedPosts });
  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the post.' });
  }
}


async function getSinglePostHandler2(req, res) {
    const { id } = req.params;

    try {
      const post = await getPost(id);
      if (!post) return res.status(404).json({ error: "Post not found." });

      post.linkedPosts = await getNestedComments(post.id, 3);
      res.render('post', { post });

    } catch (error) {
      console.error('Error retrieving post:', error);
      res.status(500).json({ error: 'An error occurred while retrieving the post.' });
    }
  }

  async function getNestedComments(postId, depth) {
    if (depth === 0) {
      return [];
    }

    // Fetch the post and its replies.
    const replies = await getPosts({ outgoingLinks: postId });

    // Fetch nested replies recursively.
    for (const reply of replies) {
      reply.linkedPosts = await getNestedComments(reply.id, depth - 1);
    }

    return replies;
  }



export { router };
