// routes/api/posts.js
import { Router } from 'express';
import { getPosts, getPost, createPost, updatePost, deletePost, deletePosts } from '../../db/posts.js';

const router = Router();

router.get('/', getPostsHandler);
router.get('/:id', getPostHandler);
router.post('/', createPostHandler);
router.put('/:id', updatePostHandler);
router.delete('/', deletePostsHandler);
router.delete('/:id', deletePostHandler);

//TODO Eventually validate visibility field of posts
async function getPostsHandler(req, res) {
  const { authors, startTime, endTime } = req.query;

  try {
    const posts = await getPosts({ authors, startTime, endTime });
    res.json({ posts });
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({ error: 'An error occurred while retrieving posts.' });
  }
}

async function getPostHandler(req, res) {
  const { id } = req.params;

  try {
    const post = await getPost(id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json(post);
  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the post.' });
  }
}

async function createPostHandler(req, res) {
  try {
    const { content, authorId, timestamp} = req.body;
    const postData = {
      content: content || '',
      authorId: authorId || req.user.id,
      timestamp: timestamp || new Date(),
    };

    const newPost = await createPost(postData);

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
}

//TODO Add permissions
async function updatePostHandler(req, res) {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updatedPost = await updatePost(id, { content });
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'An error occurred while updating the post.' });
  }
}

//TODO Add permissions, only post author can delete to start
async function deletePostHandler(req, res) {
  const { id } = req.params;
  try {
    await deletePost(id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'An error occurred while deleting the post.' });
  }
}

//TODO Add permissions, only post author can delete to start
async function deletePostsHandler(req, res) {
  const { ids } = req.body;
  try {
    await deletePosts(ids);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'An error occurred while deleting the post.' });
  }
}

export { router };
