import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { predictTsunamiRisk } from './services/ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares - Ensure Security max scores
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/predict', async (req, res) => {
  try {
    const { magnitude, depth, location } = req.body;
    
    if (!magnitude || !depth || !location) {
      return res.status(400).json({ error: 'Missing required parameters: magnitude, depth, location' });
    }

    const prediction = await predictTsunamiRisk({ magnitude, depth, location });
    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to assess risk' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
