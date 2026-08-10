const { calculateQualityScore } = require('../../src/services/scoring/qualityScorer');

describe('Quality Scoring Engine Unit Tests', () => {
  const mockTestCases = new Map([
    ['1', { _id: '1', type: 'HAPPY_PATH' }],
    ['2', { _id: '2', type: 'REQUIRED_FIELD' }],
    ['3', { _id: '3', type: 'BOUNDARY' }],
    ['4', { _id: '4', type: 'AUTHENTICATION' }],
  ]);

  test('calculateQualityScore returns 100 for all passing tests', () => {
    const mockResults = [
      { testCaseId: '1', status: 'PASS' },
      { testCaseId: '2', status: 'PASS' },
      { testCaseId: '3', status: 'PASS' },
      { testCaseId: '4', status: 'PASS' },
    ];

    const { qualityScore, categoryScores } = calculateQualityScore(mockTestCases, mockResults);
    expect(qualityScore).toBe(100);
    expect(categoryScores.functional).toBe(100);
    expect(categoryScores.negative).toBe(100);
  });

  test('calculateQualityScore correctly handles failures and lowers weighted score', () => {
    const mockResults = [
      { testCaseId: '1', status: 'FAIL' }, // Happy path failed
      { testCaseId: '2', status: 'PASS' },
      { testCaseId: '3', status: 'PASS' },
      { testCaseId: '4', status: 'PASS' },
    ];

    const { qualityScore, categoryScores } = calculateQualityScore(mockTestCases, mockResults);
    expect(qualityScore).toBeLessThan(100);
    expect(categoryScores.functional).toBe(0);
  });
});
