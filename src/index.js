#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config()


import { fetchGithub } from './fetch-github';
import fetchGit, { fetchGitReleases } from './fetch-git';
import { braveVersionsDir, multibar, writeJSON } from './util';

async function main() {
  let ghFetcher = await fetchGithub();

  const [gitReleases] = await Promise.all([
    fetchGit().then(fetchGitReleases),
    ghFetcher.maybeInit(),
  ]);

  const ghReleases = await ghFetcher.update(gitReleases);
  const finalReleases = {};

  for (const [tag, ghRelease] of Object.entries(ghReleases)) {
    if (!(tag in gitReleases)) {
      continue;
    }

    if (ghRelease.prerelease || ghRelease.draft) {
      continue;
    }

    let gitRelease = gitReleases[tag];
    let finalRelease = {
      tag,
      name: tag.substring(1),
      channel: ghRelease.name.split(' ')[0].toLowerCase(),
      commit: gitRelease.commit,
      published: ghRelease.published_at,
      dependencies: {
        chrome: gitRelease.chrome_version,
        widevine: gitRelease.widevine_version,
      },
      github: {
        release_id: ghRelease.id,
        assets: ghRelease.assets.map((asset) => ({
          id: asset.id,
          name: asset.name,
          download_url: asset.browser_download_url,
        })),
      },
    };

    finalReleases[tag] = finalRelease;
  }

  let path = await braveVersionsDir('final-releases.json');
  await writeJSON(path, finalReleases);
  multibar.stop();

  console.log(`wrote final data to ${path}`);
}

main();
