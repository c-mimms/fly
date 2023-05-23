import { Router } from 'express';
import { getPost, createPost } from '../../db/posts.js';
import { getCompletion } from '../../gpt/gpt.js';

const router = Router();

router.get('/:id', getExpandHandler);

async function getExpandHandler(req, res) {
  const { id } = req.params;

  try {
    const post = await getPost(id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const expansions = await generateExpansions(req, post);
    res.json(expansions);
  } catch (error) {
    console.error('Error retrieving post:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the post.' });
  }
}

async function generateExpansions(req, post) {
  console.time('generateExpansions');
  try {
    const postText = post.content;
    const prompt = `Expand upon the content found in this post: ${postText}`;

    console.time('getCompletion');
    const expansion = await getCompletion(prompt);
    console.timeEnd('getCompletion');

    const postData = {
      content: expansion,
      authorId: req.user.id,
      timestamp: new Date(),
      visibility: '',
      outgoingLinks: {
        connect: { id: post.id },
      },
    };

    console.time('createPost');
    const newPost = await createPost(postData);
    console.timeEnd('createPost');
    return newPost;
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'An error occurred while creating the post.' });
  } finally {
    console.timeEnd('generateExpansions');
  }
}

export { router };
