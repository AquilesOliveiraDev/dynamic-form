const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const repoRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);

// Observa as pastas do monorepo (dynamic-form e Mobile/node_modules se presente)
config.watchFolders = [
  projectRoot,
  path.resolve(projectRoot, '..'), // examples/form-schema.json compartilhado
  path.resolve(projectRoot, '../../packages'),
  path.resolve(repoRoot, 'Mobile', 'node_modules'),
];

// Caminhos de resolução de node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(repoRoot, 'Mobile', 'node_modules'),
];

// Resolução extra de módulos externos
config.resolver.extraNodeModules = {
  '@dynamic-form/core': path.resolve(projectRoot, '../../packages/core/dist/src'),
  '@dynamic-form/react': path.resolve(projectRoot, '../../packages/react/dist'),
};

module.exports = config;
