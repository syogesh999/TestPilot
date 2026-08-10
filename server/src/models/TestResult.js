const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema(
  {
    runId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestRun',
      required: true,
      index: true,
    },
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestCase',
      required: true,
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL', 'ERROR', 'SKIPPED'],
      required: true,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    requestMeta: {
      url: String,
      method: String,
      headers: Object,
      body: mongoose.Schema.Types.Mixed,
    },
    responseMeta: {
      headers: Object,
      body: mongoose.Schema.Types.Mixed,
    },
    failures: [
      {
        assertionType: String,
        message: String,
        expected: mongoose.Schema.Types.Mixed,
        actual: mongoose.Schema.Types.Mixed,
      },
    ],
    errorDetails: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestResult', TestResultSchema);
