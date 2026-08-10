const TestRun = require('../models/TestRun');
const TestResult = require('../models/TestResult');
const TestCase = require('../models/TestCase');
const Environment = require('../models/Environment');
const Project = require('../models/Project');
const { runTestSuite } = require('../services/runner/playwrightRunner');
const { calculateQualityScore } = require('../services/scoring/qualityScorer');
const logger = require('../config/logger');
const asyncHandler = require('../utils/asyncHandler');

// Async Background Execution Task
async function executeRunInBackground(runId) {
  const run = await TestRun.findById(runId);
  if (!run) return;

  try {
    run.status = 'RUNNING';
    run.startedAt = new Date();
    await run.save();

    const environment = await Environment.findById(run.environmentId);
    const testCases = await TestCase.find({ projectId: run.projectId, enabled: true });

    if (!environment || testCases.length === 0) {
      run.status = 'FAILED';
      run.completedAt = new Date();
      await run.save();
      return;
    }

    const startTime = Date.now();
    const rawResults = await runTestSuite(testCases, environment);
    const totalDuration = Date.now() - startTime;

    // Save Test Results
    const testResultsDocs = rawResults.map((res) => ({
      runId: run._id,
      testCaseId: res.testCaseId,
      status: res.status,
      statusCode: res.statusCode,
      durationMs: res.durationMs,
      requestMeta: res.requestMeta,
      responseMeta: res.responseMeta,
      failures: res.failures,
      errorDetails: res.errorDetails,
    }));

    await TestResult.insertMany(testResultsDocs);

    // Compute Summary & Quality Score
    const testCasesMap = new Map(testCases.map((tc) => [tc._id.toString(), tc]));
    const scoring = calculateQualityScore(testCasesMap, rawResults);

    const passedCount = rawResults.filter((r) => r.status === 'PASS').length;
    const failedCount = rawResults.filter((r) => r.status === 'FAIL').length;
    const errorCount = rawResults.filter((r) => r.status === 'ERROR').length;
    const skippedCount = rawResults.filter((r) => r.status === 'SKIPPED').length;

    run.status = 'COMPLETED';
    run.completedAt = new Date();
    run.summary = {
      total: rawResults.length,
      passed: passedCount,
      failed: failedCount,
      error: errorCount,
      skipped: skippedCount,
      qualityScore: scoring.qualityScore,
      durationMs: totalDuration,
      categoryScores: scoring.categoryScores,
    };

    await run.save();
    logger.info({ runId: run._id, score: scoring.qualityScore }, 'TestRun completed successfully');
  } catch (err) {
    logger.error({ err, runId }, 'Background TestRun Execution Error');
    run.status = 'FAILED';
    run.completedAt = new Date();
    await run.save();
  }
}

// @route   POST /api/runs
// @access  Private
const createRun = asyncHandler(async (req, res) => {
  const { projectId, environmentId } = req.body;

  if (!projectId || !environmentId) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'projectId and environmentId are required' },
    });
  }

  const project = await Project.findOne({ _id: projectId, ownerId: req.user._id });
  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    });
  }

  const environment = await Environment.findOne({ _id: environmentId, projectId });
  if (!environment) {
    return res.status(404).json({
      success: false,
      error: { code: 'ENVIRONMENT_NOT_FOUND', message: 'Environment not found' },
    });
  }

  const testCount = await TestCase.countDocuments({ projectId, enabled: true });
  if (testCount === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_TESTS_FOUND', message: 'No enabled test cases found. Generate tests first.' },
    });
  }

  const run = await TestRun.create({
    projectId,
    environmentId,
    status: 'QUEUED',
  });

  // Launch async background processing
  setImmediate(() => {
    executeRunInBackground(run._id).catch((err) => logger.error({ err }, 'Error in async run trigger'));
  });

  res.status(202).json({
    success: true,
    data: {
      runId: run._id,
      status: run.status,
      message: 'Test run queued successfully',
    },
  });
});

// @route   GET /api/runs/:id
// @access  Private
const getRunStatus = asyncHandler(async (req, res) => {
  const run = await TestRun.findById(req.params.id);

  if (!run) {
    return res.status(404).json({
      success: false,
      error: { code: 'RUN_NOT_FOUND', message: 'Test run not found' },
    });
  }

  res.json({
    success: true,
    data: run,
  });
});

// @route   GET /api/runs/:id/results
// @access  Private
const getRunResults = asyncHandler(async (req, res) => {
  const { id: runId } = req.params;
  const { status } = req.query;

  const query = { runId };
  if (status) query.status = status;

  const results = await TestResult.find(query).populate('testCaseId');

  res.json({
    success: true,
    data: {
      count: results.length,
      results,
    },
  });
});

module.exports = { createRun, getRunStatus, getRunResults };
