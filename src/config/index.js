const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const configPath = path.join(__dirname, 'config.yml');
const rawConfig = fs.readFileSync(configPath, 'utf8');
const loadedConfig = YAML.parse(rawConfig);

const defaults = {
  app: {
    name: 'poomsae',
    title: 'Poomsae',
    description: 'A simple web app for training with Kukkiwon/WT style poomsae forms',
  },
  server: {
    host: 'localhost',
    port: 3000,
    static_dir: 'public',
  },
  ui: {
    title: 'Poomsae',
    description: 'Training with Kukkiwon/WT style poomsae forms',
  },
  data: {
    forms_dir: 'data/forms',
  },
  logging: {
    level: 'info',
  },
};

const config = {
  ...defaults,
  ...loadedConfig,
  app: { ...defaults.app, ...(loadedConfig.app || {}) },
  server: { ...defaults.server, ...(loadedConfig.server || {}) },
  ui: { ...defaults.ui, ...(loadedConfig.ui || {}) },
  data: { ...defaults.data, ...(loadedConfig.data || {}) },
  logging: { ...defaults.logging, ...(loadedConfig.logging || {}) },
};

if (!config.server || typeof config.server.port !== 'number' || !config.server.static_dir) {
  throw new Error('Invalid config: server.port and server.static_dir are required');
}

module.exports = config;
