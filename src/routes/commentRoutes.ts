import express from 'express';
import { addComment, getComments, longPollingComments } from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/add', protect, addComment);
router.get('/:pokemonId', getComments);
router.get('/longpoll/:pokemonId', longPollingComments);

export default router;