const Project = require('../models/Project');
const Environment = require('../models/Environment');
const ApiSpec = require('../models/ApiSpec');
const TestCase = require('../models/TestCase');
const TestRun = require('../models/TestRun');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ ownerId: req.user._id }).sort({ updatedAt: -1 });

  // Attach additional overview data like spec count and latest run
  const enrichedProjects = await Promise.all(
    projects.map(async (project) => {
      const spec = await ApiSpec.findOne({ projectId: project._id }).select('version importedAt');
      const latestRun = await TestRun.findOne({ projectId: project._id }).sort({ createdAt: -1 });
      const testCount = await TestCase.countDocuments({ projectId: project._id });

      return {
        ...project.toObject(),
        hasSpec: !!spec,
        specVersion: spec ? spec.version : null,
        testCount,
        latestRun: latestRun ? {
          status: latestRun.status,
          qualityScore: latestRun.summary.qualityScore,
          passed: latestRun.summary.passed,
          failed: latestRun.summary.failed,
          total: latestRun.summary.total,
          completedAt: latestRun.completedAt,
        } : null,
      };
    })
  );

  res.json({
    success: true,
    data: enrichedProjects,
  });
});

// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, baseUrl } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Project name is required' },
    });
  }

  const project = await Project.create({
    ownerId: req.user._id,
    name,
    description: description || '',
  });

  // Create default environment for project
  const env = await Environment.create({
    projectId: project._id,
    name: 'Development',
    baseUrl: baseUrl || 'http://localhost:4000',
  });

  res.status(201).json({
    success: true,
    data: {
      project,
      defaultEnvironment: env,
    },
  });
});

// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, ownerId: req.user._id });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    });
  }

  const environments = await Environment.find({ projectId: project._id });
  const spec = await ApiSpec.findOne({ projectId: project._id });
  const testCount = await TestCase.countDocuments({ projectId: project._id });
  const runs = await TestRun.find({ projectId: project._id }).sort({ createdAt: -1 }).limit(5);

  res.json({
    success: true,
    data: {
      project,
      environments,
      spec: spec ? {
        _id: spec._id,
        version: spec.version,
        format: spec.format,
        importedAt: spec.importedAt,
        endpointsCount: spec.normalizedDocument?.endpoints?.length || 0,
      } : null,
      testCount,
      recentRuns: runs,
    },
  });
});

// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user._id },
    { name, description },
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    });
  }

  res.json({
    success: true,
    data: project,
  });
});

// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });

  if (!project) {
    return res.status(404).json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    });
  }

  // Clean up associated specs, environments, test cases
  await Promise.all([
    Environment.deleteMany({ projectId: project._id }),
    ApiSpec.deleteMany({ projectId: project._id }),
    TestCase.deleteMany({ projectId: project._id }),
    TestRun.deleteMany({ projectId: project._id }),
  ]);

  res.json({
    success: true,
    data: { message: 'Project and all related resources deleted successfully' },
  });
});

// @route   GET /api/projects/:id/environments
// @access  Private
const getEnvironments = asyncHandler(async (req, res) => {
  const environments = await Environment.find({ projectId: req.params.id });
  res.json({
    success: true,
    data: environments,
  });
});

// @route   POST /api/projects/:id/environments
// @access  Private
const createEnvironment = asyncHandler(async (req, res) => {
  const { name, baseUrl, variables, authConfig } = req.body;

  if (!name || !baseUrl) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Environment name and baseUrl are required' },
    });
  }

  const env = await Environment.create({
    projectId: req.params.id,
    name,
    baseUrl,
    variables: variables || {},
    authConfig: authConfig || { type: 'none' },
  });

  res.status(201).json({
    success: true,
    data: env,
  });
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getEnvironments,
  createEnvironment,
};
