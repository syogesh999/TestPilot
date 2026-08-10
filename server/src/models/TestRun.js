const mongoose = require('mongoose');

const TestRunSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    environmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Environment',
      required: true,
    },
    status: {
      type: String,
      enum: ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'QUEUED',
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    summary: {
      total: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      error: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      categoryScores: {
        functional: { type: Number, default: 0 },
        contract: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
        boundary: { type: Number, default: 0 },
        security: { type: Number, default: 0 },
        execution: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestRun', TestRunSchema);
