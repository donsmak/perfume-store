import { Router } from 'express';
import { cacheService } from '../services/cache.service';

const router = Router();

router.get('/test-cache', async (req, res) => {
  try {
    const data = await cacheService.getOrSet('test-key', async () => {
      return { message: 'This will be cached', timestamp: Date.now() };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Cache test failed' });
  }
});

export default router;
