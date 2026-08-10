const TestCase = require('../models/TestCase');
const ApiSpec = require('../models/ApiSpec');
const Project = require('../models/Project');
const { generateSuiteForProject } = require('../services/generator');
const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/projects/:id/tests/generate
// @access  Private
const generateTests = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;

  const project = await Project.findOne({ _id: projectId, ownerId: req.user._id });
  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    });
  }

  const spec = await ApiSpec.findOne({ projectId });
  if (!spec || !spec.normalizedDocument || !spec.normalizedDocument.endpoints) {
    return res.status(400).json({
      success: false,
      error: { code: 'SPEC_NOT_FOUND', message: 'Import an OpenAPI specification before generating tests' },
    });
  }

  const endpoints = spec.normalizedDocument.endpoints;
  const generatedTests = generateSuiteForProject(endpoints, projectId);

  // Clear existing generated deterministic tests for this project to ensure fresh generation
  await TestCase.deleteMany({ projectId, source: 'DETERMINISTIC' });

  // Save new test cases
  const savedTests = await TestCase.insertMany(generatedTests);

  res.status(201).json({
    success: true,
    data: {
      totalGenerated: savedTests.length,
      byType: {
        happyPath: savedTests.filter((t) => t.type === 'HAPPY_PATH').length,
        requiredField: savedTests.filter((t) => t.type === 'REQUIRED_FIELD').length,
        typeValidation: savedTests.filter((t) => t.type === 'TYPE_VALIDATION').length,
        boundary: savedTests.filter((t) => t.type === 'BOUNDARY').length,
        enum: savedTests.filter((t) => t.type === 'ENUM').length,
        parameter: savedTests.filter((t) => t.type === 'PARAMETER').length,
        authentication: savedTests.filter((t) => t.type === 'AUTHENTICATION').length,
      },
      tests: savedTests,
    },
  });
});

// @route   GET /api/projects/:id/tests
// @access  Private
const getTests = asyncHandler(async (req, res) => {
  const { id: projectId } = req.params;
  const { type, priority, endpointId } = req.query;

  const query = { projectId };
  if (type) query.type = type;
  if (priority) query.priority = priority;
  if (endpointId) query.endpointId = endpointId;

  const tests = await TestCase.find(query).sort({ type: 1, priority: 1 });

  res.json({
    success: true,
    data: {
      count: tests.length,
      tests,
    },
  });
});

// @route   PUT /api/tests/:testId
// @access  Private
const updateTest = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { enabled, priority, description } = req.body;

  const testCase = await TestCase.findByIdAndUpdate(
    testId,
    { enabled, priority, description },
    { new: true }
  );

  if (!testCase) {
    return res.status(404).json({
      success: false,
      error: { code: 'TEST_NOT_FOUND', message: 'Test case not found' },
    });
  }

  res.json({
    success: true,
    data: testCase,
  });
});

module.exports = { generateTests, getTests, updateTest };
