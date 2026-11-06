import express from 'express';
import { handleAnalyze, handleExplain, handleAsk } from '../controllers/assistantController.js';

const router = express.Router();

router.post('/analyze', handleAnalyze);
router.post('/explain', handleExplain);
router.post('/ask', handleAsk);

export default router;