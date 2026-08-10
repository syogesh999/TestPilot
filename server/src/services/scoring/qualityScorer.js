function calculateQualityScore(testCasesMap, results) {
  let functionalTotal = 0, functionalPassed = 0;
  let contractTotal = 0, contractPassed = 0;
  let negativeTotal = 0, negativePassed = 0;
  let boundaryTotal = 0, boundaryPassed = 0;
  let securityTotal = 0, securityPassed = 0;
  let totalExecuted = 0, totalSuccessfulExecutions = 0;

  for (const res of results) {
    if (res.status === 'SKIPPED') continue;

    const testCase = testCasesMap.get(res.testCaseId.toString());
    const isPassed = res.status === 'PASS';
    const isExecSuccess = res.status === 'PASS' || res.status === 'FAIL'; // non-crash execution

    totalExecuted++;
    if (isExecSuccess) totalSuccessfulExecutions++;

    if (!testCase) continue;

    switch (testCase.type) {
      case 'HAPPY_PATH':
        functionalTotal++;
        if (isPassed) functionalPassed++;
        break;

      case 'CONTRACT':
        contractTotal++;
        if (isPassed) contractPassed++;
        break;

      case 'REQUIRED_FIELD':
      case 'TYPE_VALIDATION':
      case 'ENUM':
      case 'PARAMETER':
        negativeTotal++;
        if (isPassed) negativePassed++;
        break;

      case 'BOUNDARY':
        boundaryTotal++;
        if (isPassed) boundaryPassed++;
        break;

      case 'AUTHENTICATION':
      case 'SECURITY':
        securityTotal++;
        if (isPassed) securityPassed++;
        break;

      default:
        break;
    }
  }

  const functionalScore = functionalTotal > 0 ? (functionalPassed / functionalTotal) * 100 : 100;
  const contractScore = contractTotal > 0 ? (contractPassed / contractTotal) * 100 : 100;
  const negativeScore = negativeTotal > 0 ? (negativePassed / negativeTotal) * 100 : 100;
  const boundaryScore = boundaryTotal > 0 ? (boundaryPassed / boundaryTotal) * 100 : 100;
  const securityScore = securityTotal > 0 ? (securityPassed / securityTotal) * 100 : 100;
  const executionScore = totalExecuted > 0 ? (totalSuccessfulExecutions / totalExecuted) * 100 : 100;

  // Weighted Quality Score computation
  const qualityScore = Math.round(
    functionalScore * 0.30 +
    contractScore * 0.25 +
    negativeScore * 0.15 +
    boundaryScore * 0.10 +
    securityScore * 0.10 +
    executionScore * 0.10
  );

  return {
    qualityScore,
    categoryScores: {
      functional: Math.round(functionalScore),
      contract: Math.round(contractScore),
      negative: Math.round(negativeScore),
      boundary: Math.round(boundaryScore),
      security: Math.round(securityScore),
      execution: Math.round(executionScore),
    },
  };
}

module.exports = { calculateQualityScore };
