// routes/api/
import { Router } from 'express';
import { router as postRouter } from './posts.js';
import { router as gptRouter } from './gptApis.js';

const router = Router();

router.use('/posts', postRouter);
router.use('/expand', gptRouter);

export { router };
