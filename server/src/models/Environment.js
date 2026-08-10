const mongoose = require('mongoose');

const EnvironmentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Environment name is required'],
      trim: true,
    },
    baseUrl: {
      type: String,
      required: [true, 'Base URL is required'],
      trim: true,
    },
    variables: {
      type: Map,
      of: String,
      default: {},
    },
    authConfig: {
      authType: {
        type: String,
        enum: ['none', 'bearer', 'apiKey', 'basic'],
        default: 'none',
      },
      token: { type: String, default: '' },
      apiKeyKey: { type: String, default: '' },
      apiKeyValue: { type: String, default: '' },
      apiKeyHeaderOrQuery: { type: String, enum: ['header', 'query'], default: 'header' },
      username: { type: String, default: '' },
      password: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Environment', EnvironmentSchema);
