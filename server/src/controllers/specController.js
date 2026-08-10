const ApiSpec = require('../models/ApiSpec');
const Project = require('../models/Project');
const { parseSpecContent } = require('../services/openapi/parser');
const { extractEndpoints } = require('../services/openapi/extractor');
const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/projects/:id/specs
// @access  Private
const importSpec = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { specContent } = req.body;

  if (!specContent || typeof specContent !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'specContent parameter is required and must be a string' },
    });
  }

  const project = await Project.findOne({ _id: projectId, ownerId: req.user._id });
  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    });
  }

  // Pipeline execution
  let parsed;
  try {
    parsed = parseSpecContent(specContent);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'SPEC_PARSE_ERROR',
        message: err.message,
      },
    });
  }

  let extracted;
  try {
    extracted = extractEndpoints(parsed.document);
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'SPEC_EXTRACTION_ERROR',
        message: `Failed to extract endpoints from specification: ${err.message}`,
      },
    });
  }

  const normalizedDocument = {
    info: extracted.info,
    version: parsed.version,
    format: parsed.format,
    endpoints: extracted.endpoints,
    securitySchemes: extracted.securitySchemes,
  };

  // Upsert current spec for project
  let spec = await ApiSpec.findOne({ projectId });
  if (spec) {
    spec.rawDocument = specContent;
    spec.normalizedDocument = normalizedDocument;
    spec.format = parsed.format;
    spec.version = parsed.version;
    spec.importedAt = new Date();
    await spec.save();
  } else {
    spec = await ApiSpec.create({
      projectId,
      version: parsed.version,
      format: parsed.format,
      rawDocument: specContent,
      normalizedDocument,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      specId: spec._id,
      version: parsed.version,
      format: parsed.format,
      endpointCount: extracted.endpoints.length,
      endpoints: extracted.endpoints,
    },
  });
});

// @route   GET /api/projects/:id/specs
// @access  Private
const getSpec = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const spec = await ApiSpec.findOne({ projectId });

  if (!spec) {
    return res.status(404).json({
      success: false,
      error: { code: 'SPEC_NOT_FOUND', message: 'No OpenAPI specification has been imported for this project' },
    });
  }

  res.json({
    success: true,
    data: spec,
  });
});

// @route   GET /api/projects/:id/endpoints
// @access  Private
const getEndpoints = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const spec = await ApiSpec.findOne({ projectId });

  if (!spec) {
    return res.status(404).json({
      success: false,
      error: { code: 'SPEC_NOT_FOUND', message: 'No OpenAPI specification found for this project' },
    });
  }

  res.json({
    success: true,
    data: {
      endpointCount: spec.normalizedDocument.endpoints?.length || 0,
      endpoints: spec.normalizedDocument.endpoints || [],
      securitySchemes: spec.normalizedDocument.securitySchemes || {},
    },
  });
});

module.exports = { importSpec, getSpec, getEndpoints };
