import express from 'express';
import client from 'prom-client';

const router = express.Router();

client.collectDefaultMetrics();

router.get('/metrics', async (req, res) => {
  // Protect with token if provided
  const token = process.env.METRICS_TOKEN;
  if (token) {
    const provided = req.headers.authorization?.split(' ')[1] || req.query.token;
    if (provided !== token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

export default router;

