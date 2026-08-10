const { generateHappyPathTest } = require('./happyPath');
const { generateRequiredFieldsTests } = require('./requiredFields');
const { generateTypeValidationTests } = require('./typeValidation');
const { generateBoundaryTests } = require('./boundaryTesting');
const { generateEnumTests } = require('./enumTesting');
const { generateParamTests } = require('./paramTesting');
const { generateAuthTests } = require('./authTesting');

function generateSuiteForProject(endpoints, projectId) {
  const allTests = [];

  for (const endpoint of endpoints) {
    // 1. Happy Path
    const happy = generateHappyPathTest(endpoint);
    if (happy) {
      allTests.push({ ...happy, projectId });
    }

    // 2. Required Fields Negative Tests
    const reqTests = generateRequiredFieldsTests(endpoint);
    reqTests.forEach((t) => allTests.push({ ...t, projectId }));

    // 3. Type Validation Negative Tests
    const typeTests = generateTypeValidationTests(endpoint);
    typeTests.forEach((t) => allTests.push({ ...t, projectId }));

    // 4. Boundary Tests
    const boundTests = generateBoundaryTests(endpoint);
    boundTests.forEach((t) => allTests.push({ ...t, projectId }));

    // 5. Enum Tests
    const enumTests = generateEnumTests(endpoint);
    enumTests.forEach((t) => allTests.push({ ...t, projectId }));

    // 6. Parameter Tests
    const paramTests = generateParamTests(endpoint);
    paramTests.forEach((t) => allTests.push({ ...t, projectId }));

    // 7. Authentication Tests
    const authTests = generateAuthTests(endpoint);
    authTests.forEach((t) => allTests.push({ ...t, projectId }));
  }

  return allTests;
}

module.exports = { generateSuiteForProject };
