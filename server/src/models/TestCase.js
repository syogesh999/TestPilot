const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    endpointId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'HAPPY_PATH',
        'REQUIRED_FIELD',
        'TYPE_VALIDATION',
        'BOUNDARY',
        'ENUM',
        'PARAMETER',
        'AUTHENTICATION',
        'CONTRACT',
        'SECURITY',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ['DETERMINISTIC', 'AI_GENERATED', 'MANUAL'],
      default: 'DETERMINISTIC',
    },
    request: {
      method: { type: String, required: true },
      path: { type: String, required: true },
      headers: { type: Map, of: String, default: {} },
      queryParams: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      pathParams: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
      body: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    expectedResponse: {
      statusCode: { type: Number, required: true },
      schema: { type: Object, default: null },
    },
    assertions: [
      {
        type: {
          type: String,
          enum: [
            'STATUS_CODE',
            'RESPONSE_HEADER',
            'JSON_SCHEMA',
            'REQUIRED_FIELD',
            'RESPONSE_TIME',
          ],
          required: true,
        },
        target: String,
        expected: mongoose.Schema.Types.Mixed,
        message: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestCase', TestCaseSchema);
