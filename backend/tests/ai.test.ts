import { predictTsunamiRisk } from '../src/services/ai';

describe('AI Service', () => {
  const mockEvent = { magnitude: 8.0, depth: 30, location: 'offshore' };

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('falls back to mock prediction when GEMINI_API_KEY is not set', async () => {
    const result = await predictTsunamiRisk(mockEvent);
    expect(result.riskLevel).toBeDefined();
    expect(result.estimatedWaveHeightMeters).toBeGreaterThan(0);
    expect(result.probabilityPercentage).toBeGreaterThan(0);
    expect(result.analysis).toMatch(/Mock Analysis/);
  });

  it('classifies critical risk correctly based on heuristics', async () => {
    const result = await predictTsunamiRisk({
        magnitude: 7.8,
        depth: 20,
        location: 'Offshore fault'
    });
    expect(result.riskLevel).toBe('CRITICAL');
  });

  it('classifies high risk correctly', async () => {
    const result = await predictTsunamiRisk({
        magnitude: 6.8,
        depth: 80,
        location: 'Inland'
    });
    expect(result.riskLevel).toBe('HIGH');
  });

  it('classifies moderate risk correctly', async () => {
    const result = await predictTsunamiRisk({
        magnitude: 5.6,
        depth: 40,
        location: 'Inland'
    });
    expect(result.riskLevel).toBe('MODERATE');
  });

  it('classifies low risk correctly', async () => {
    const result = await predictTsunamiRisk({
        magnitude: 4.0,
        depth: 40,
        location: 'Inland'
    });
    expect(result.riskLevel).toBe('LOW');
  });
});
