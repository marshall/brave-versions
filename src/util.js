import fs from 'fs';
import path from 'path';
import process from 'process';
import { promisify } from 'util';

import cliProgress from 'cli-progress';

export const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '{title} [{bar}] {percentage}% | {filename} | ETA: {eta}s | {value}/{total}',
});

export const sleep = promisify(setTimeout);

export async function pathExists(path) {
  try {
    await fs.promises.stat(path);
    return true;
  } catch (_) {
    return false;
  }
}

export async function braveVersionsDir(child) {
  const braveVersionsDir = process.env.BRAVE_VERSIONS_DIR || process.env.HOME + '/.brave-versions';

  if (!await pathExists(braveVersionsDir)) {
    try {
      await fs.promises.mkdir(braveVersionsDir);
      console.log(`storing brave version data in ${braveVersionsDir}`);
    } catch (e) {
      console.error(`can't initialize ${braveVersionsDir}:`, e);
      throw e;
    }
  }

  return child ? path.join(braveVersionsDir, child) : braveVersionsDir;
}

export async function readJSON(path) {
  return JSON.parse(await readFile(path));
}

export async function readFile(path) {
  let f;
  try {
    f = await fs.promises.open(path, 'r+');
    return await f.readFile({ encoding: 'utf8' });
  } finally {
    if (f) {
      await f.close();
    }
  }
}

export async function writeJSON(path, object) {
  return await writeFile(path, JSON.stringify(object));
}

export async function writeFile(path, content) {
  let f;
  try {
    f = await fs.promises.open(path, 'w+');
    return await f.write(content);
  } finally {
    if (f) {
      await f.close();
    }
  }
}
