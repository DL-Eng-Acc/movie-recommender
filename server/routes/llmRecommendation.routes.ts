import { Router } from 'express';
import { getLlmRecommendations } from '../controllers/llmRecommendation.controller';

const router = Router();

router.get("/", getLlmRecommendations);

export default router;