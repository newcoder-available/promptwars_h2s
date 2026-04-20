import request from 'supertest';
import app from '../src/server';
import { predictTsunamiRisk } from '../src/services/ai';

// Mock the AI service to avoid hitting real APIs during standard testing runs
jest.mock('../src/services/ai', () => ({
  predictTsunamiRisk: jest.fn(),
}));

describe('Tsunami API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('returns health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('POST /api/predict', () => {
    it('should return 400 when missing parameters', async () => {
      const response = await request(app)
        .post('/api/predict')
        .send({ magnitude: 7.5 }); // Missing depth and location

      expect(response.status).toBe(400);
      expect(response.body.error).toMatch(/Missing required parameters/);
    });

    it('should successfully predict risk with valid data', async () => {
      const mockResult = {
        riskLevel: 'CRITICAL',
        probabilityPercentage: 85,
        estimatedWaveHeightMeters: 2.5,
        analysis: 'High risk detected.'
      };

      (predictTsunamiRisk as jest.Mock).mockResolvedValue(mockResult);

      const requestData = { magnitude: 8.0, depth: 30, location: 'offshore fault' };
      const response = await request(app)
        .post('/api/predict')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(predictTsunamiRisk).toHaveBeenCalledWith(requestData);
    });

    it('should handle internal errors gracefully', async () => {
      (predictTsunamiRisk as jest.Mock).mockRejectedValue(new Error('AI Engine Failure'));

      const response = await request(app)
        .post('/api/predict')
        .send({ magnitude: 5.0, depth: 10, location: 'inland' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to assess risk');
    });
  });
});
