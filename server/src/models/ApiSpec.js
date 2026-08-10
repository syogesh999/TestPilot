const mongoose = require('mongoose');

const ApiSpecSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    version: {
      type: String,
      default: '3.0.0',
    },
    format: {
      type: String,
      enum: ['json', 'yaml'],
      required: true,
    },
    rawDocument: {
      type: String,
      required: true,
    },
    normalizedDocument: {
      type: Object,
      required: true,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ApiSpec', ApiSpecSchema);
