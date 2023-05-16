// routes/api/posts.js
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', ensureAuthenticated, getPostsHandler);
router.get('/:id', ensureAuthenticated, getPostHandler);
router.post('/', ensureAuthenticated, createPostHandler);
router.put('/:id', ensureAuthenticated, updatePostHandler);
router.delete('/:id', ensureAuthenticated, deletePostHandler);

async function getPostsHandler(req, res) {
  const { authors, startTime, endTime } = req.query;
  let query = {};

  // If authors are provided, convert them into an array of numbers
  if (authors) {
    query.authorId = {
      in: authors.split(',').map(id => parseInt(id, 10)),
    };
  }

  // If startTime is provided, add it to the query
  if (startTime) {
    query.timestamp = {
      gte: new Date(startTime),
      ...query.timestamp,  // Spread to preserve potential 'lte' value from endTime
    };
  }

  // If endTime is provided, add it to the query
  if (endTime) {
    query.timestamp = {
      lte: new Date(endTime),
      ...query.timestamp,  // Spread to preserve potential 'gte' value from startTime
    };
  }

  try {
    const posts = await prisma.post.findMany({
      where: query,
      include: {
        author: true
      }
    });
    res.json({ posts });
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({ error: 'An error occurred while retrieving posts.' });
  }
}

async function getPostHandler(req, res) {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({ where: { id: parseInt(id, 10) } });
    if (!post) return res.status(404).json({ error: "Post not found." });
    res.json(post);
  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the post.' });
  }
}

async function createPostHandler(req, res) {
  try {
    const { content } = req.body;
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.user.id,
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  }
}

async function updatePostHandler(req, res) {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id, 10) },
      data: { content },
    });
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'An error occurred while updating the post.' });
  }
}

async function deletePostHandler(req, res) {
  const { id } = req.params;
  try {
    await prisma.post.delete({ where: { id: parseInt(id, 10) } });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'An error occurred while deleting the post.' });
  }
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // If the request is AJAX, send a 401 error directly
  if (req.xhr) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  // For non-AJAX requests, redirect to the Google auth page
  res.redirect('/auth/google');
}

export { router };

