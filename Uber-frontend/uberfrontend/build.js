#!/usr/bin/env node
import { build } from 'vite';
import viteConfig from './vite.config.js';

build(viteConfig).catch((error) => {
  console.error(error);
  process.exit(1);
});

