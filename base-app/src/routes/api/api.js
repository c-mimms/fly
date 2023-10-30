// routes/api/
import { Router } from 'express';
import { router as postRouter } from './posts.js';

const router = Router();

router.use('/posts', postRouter);

export { router };
