import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

let basePath = '';

// noinspection JSUnresolvedReference
if (process.env.GITHUB_ACTIONS === 'true') {
  // noinspection JSUnresolvedReference
  const githubRepo = process.env.GITHUB_REPOSITORY; // Format: 'owner/repo-name'

  if (githubRepo) {
    const repoName = githubRepo.split('/')[1]; // Extract 'repo-name'
    if (repoName) {
      basePath = `/${repoName}`; // Set base path like '/repo-name'
      console.log(`GitHub Actions detected: Setting base path to ${basePath}`);
    }
  }
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      fallback: 'index.html',
    }),
    paths: {
      base: basePath,
    },
  },
};

export default config;
