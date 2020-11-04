import { spawn } from 'child_process';
import { once } from 'events';
import path from 'path';
import process from 'process';
import readline from 'readline';

import { braveVersionsDir, multibar, pathExists } from './util';

export default async function fetchGit() {
  const bvDir = await braveVersionsDir();
  const repoDir = path.join(bvDir, 'brave-browser');
  let argv, cwd;

  if (!await pathExists(repoDir)) {
    argv = ['clone', 'https://github.com/brave/brave-browser']
    cwd = bvDir;
  } else {
    argv = ['pull']
    cwd = repoDir;
  }

  console.log(`[brave-browser]: git ${argv.join(' ')}`);
  let cmd = spawn('git', argv, { cwd });
  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stderr);

  if (await new Promise((resolve, reject) => {
    cmd.on('exit', resolve);
    cmd.on('error', reject);
  }) !== 0) {
    console.error('Error updating brave-browser');
    return false;
  }

  return true;
}

export async function fetchGitReleases() {
  const releases = {};
  const bvDir = await braveVersionsDir();
  const repoDir = path.join(bvDir, 'brave-browser');

  let cmd = spawn('git', ['tag', '-l', 'v*', '--format', '%(objectname) %(refname:strip=2)'],
                  { cwd: repoDir });

  const rl = readline.createInterface({
    input: cmd.stdout,
    crlfDelay: Infinity
  });

  const tags = [];
  for await (const line of rl) {
    const [commit, tag] = line.trim().split(' ');
    if (tag.startsWith('v0')) {
      // Skip pre-1.0 tags
      continue;
    }

    tags.push([commit, tag]);
  }

  const progress = multibar.create(tags.length, 0, { title: 'package.json' });
  for (const [commit, tag] of tags) {
    releases[tag] = { commit };

    let packageJson = spawn('git', ['show', `${tag}:package.json`], { cwd: repoDir });
    let json = '';
    packageJson.stdout.on('data', (data) => json += data.toString());
    await once(packageJson, 'exit');

    try {
      let pkg = JSON.parse(json);
      releases[tag].chrome_version = pkg.config.projects.chrome.tag
      releases[tag].widevine_version = pkg.config.widevine.version
      progress.increment({ filename: tag });
    } catch (e) {
      continue;
    }
  }

  return releases;
}
