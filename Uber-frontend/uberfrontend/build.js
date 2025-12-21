#!/usr/bin/env node
import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Use vite's loadConfigFromFile to properly load the config
const configPath = resolve(__dirname, 'vite.config.js');

build({
  configFile: configPath
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});

