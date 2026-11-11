#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

import { runRenderer } from './lib.mjs';

await runRenderer({
  name: 'Claude',
  managedPaths: ['skills', 'assets', 'LICENSE', 'README.md', '.claude-plugin'],
  copies: [
    { from: 'skills', to: 'skills' },
    { from: 'assets', to: 'assets' },
    { from: 'LICENSE', to: 'LICENSE' },
    { from: 'scripts/marketplace-sync/plugin-README.md', to: 'README.md' },
    { from: 'assets/ariestools-icon.png', to: '.claude-plugin/icon.png' },
  ],
  generate: ({ metadata }) => {
    const pluginEntry = {
      name: metadata.name,
      description: metadata.description,
      version: metadata.version,
      author: { name: metadata.author.name },
      source: './',
      category: metadata.category.slug,
      tags: metadata.keywords,
      keywords: metadata.keywords,
    };

    return {
      '.claude-plugin/marketplace.json': {
        name: metadata.name,
        owner: metadata.owner,
        metadata: {
          description: metadata.description,
          version: metadata.version,
        },
        plugins: [pluginEntry],
      },
      '.claude-plugin/plugin.json': {
        name: metadata.name,
        version: metadata.version,
        description: metadata.description,
        author: metadata.author,
        homepage: metadata.homepage,
        repository: metadata.repository,
        documentationUrl: metadata.documentationUrl,
        supportUrl: metadata.supportUrl,
        privacyPolicyUrl: metadata.privacyPolicyUrl,
        termsOfServiceUrl: metadata.termsOfServiceUrl,
        license: metadata.license,
        keywords: metadata.keywords,
        icon: '.claude-plugin/icon.png',
      },
    };
  },
  finish: async ({ out }) => {
    const assetsDir = path.join(out, 'assets');
    const names = await fs.readdir(assetsDir);
    await Promise.all(names.filter((name) => name.endsWith('.svg')).map((name) => fs.rm(path.join(assetsDir, name))));
  },
});
