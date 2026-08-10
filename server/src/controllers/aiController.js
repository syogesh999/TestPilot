const TestRun = require('../models/TestRun');
const TestResult = require('../models/TestResult');
const AIReport = require('../models/AIReport');
const aiService = require('../services/ai/AIService');
const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/runs/:id/ai-analysis
// @access  Private
const generateAIReport = asyncHandler(async (req, res) => {
  const { id: runId } = req.params;

  const run = await TestRun.findById(runId);
  if (!run) {
    return res.status(404).json({
      success: false,
      error: { code: 'RUN_NOT_FOUND', message: 'Test run not found' },
    });
  }

  const results = await TestResult.find({ runId });

  // Check if AI report already generated for this run
  let report = await AIReport.findOne({ runId });

  const aiAnalysis = await aiService.analyzeRunFailures(run, results);

  if (report) {
    report.summary = aiAnalysis.summary;
    report.probableCauses = aiAnalysis.probableCauses;
    report.recommendations = aiAnalysis.recommendations;
    report.generatedAt = new Date();
    await report.save();
  } else {
    report = await AIReport.create({
      runId: run._id,
      provider: 'ollama_or_fallback',
      model: 'llama3.2',
      summary: aiAnalysis.summary,
      probableCauses: aiAnalysis.probableCauses,
      recommendations: aiAnalysis.recommendations,
    });
  }

  res.json({
    success: true,
    data: report,
  });
});

// @route   GET /api/runs/:id/report
// @access  Private
const getReport = asyncHandler(async (req, res) => {
  const { id: runId } = req.params;

  const run = await TestRun.findById(runId);
  if (!run) {
    return res.status(404).json({
      success: false,
      error: { code: 'RUN_NOT_FOUND', message: 'Test run not found' },
    });
  }

  const report = await AIReport.findOne({ runId });
  const results = await TestResult.find({ runId }).populate('testCaseId');

  res.json({
    success: true,
    data: {
      run,
      aiReport: report,
      totalResults: results.length,
    },
  });
});

module.exports = { generateAIReport, getReport };
