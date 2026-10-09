#!/usr/bin/env node
import { runRenderer } from './lib.mjs';

const PLUGIN_DIR = 'plugins/ariestools-skills'

await runRenderer({
  name: 'Codex',
  managedPaths: ['plugins', '.agents', 'LICENSE'],
  copies: [
    { from: 'skills', to: `${PLUGIN_DIR}/skills` },
    { from: 'assets', to: `${PLUGIN_DIR}/assets` },
    { from: 'LICENSE', to: 'LICENSE' },
  ],
  generate: ({ metadata }) => ({
    '.agents/plugins/marketplace.json': {
      name: metadata.name,
      interface: {
        displayName: metadata.displayName,
      },
      plugins: [
        {
          name: metadata.name,
          source: { source: 'local', path: `./${PLUGIN_DIR}` },
          policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
          category: metadata.category.display,
        },
      ],
    },
    [`${PLUGIN_DIR}/.codex-plugin/plugin.json`]: {
      name: metadata.name,
      version: metadata.version,
      description: metadata.description,
      author: metadata.author,
      homepage: metadata.homepage,
      repository: metadata.repository,
      license: metadata.license,
      keywords: metadata.keywords,
      skills: './skills/',
      interface: {
        displayName: metadata.displayName,
        shortDescription: metadata.shortDescription,
        longDescription: metadata.longDescription,
        developerName: metadata.author.name,
        category: metadata.category.display,
        capabilities: metadata.capabilities,
        websiteURL: metadata.homepage,
        // Codex reads at most 3 default prompts (MAX_DEFAULT_PROMPT_COUNT in codex-rs core-plugins manifest.rs)
        defaultPrompt: metadata.defaultPrompts.slice(0, 3),
        brandColor: metadata.brandColor,
        composerIcon: metadata.icon,
        logo: metadata.logo,
      },
    },
  }),
});
