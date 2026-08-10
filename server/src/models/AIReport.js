const mongoose = require('mongoose');

const AIReportSchema = new mongoose.Schema(
  {
    runId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestRun',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'ollama',
    },
    model: {
      type: String,
      default: 'llama3.2',
    },
    summary: {
      type: String,
      required: true,
    },
    probableCauses: [
      {
        endpoint: String,
        issue: String,
        recommendation: String,
      },
    ],
    recommendations: [
      {
        type: String,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AIReport', AIReportSchema);
