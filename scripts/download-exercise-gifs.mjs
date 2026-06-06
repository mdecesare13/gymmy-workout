/**
 * Downloads exercise demonstration images from the yuhonas/free-exercise-db dataset.
 *
 * For each exercise in src/data/exercises.json it:
 *   1. Finds the best name match in the yuhonas dataset
 *   2. Downloads the two demonstration JPG frames (start / end position)
 *   3. Composites them side-by-side into a single JPEG (640×240)
 *   4. Saves to public/assets/exercises/[exerciseId].jpg
 *
 * After all per-exercise files are written it writes one [visualKey].jpg per
 * unique visualKey (using the first matched exercise for that key), giving the
 * media player its fallback layer.
 *
 * Safe to re-run: existing files are skipped.
 *
 * Usage:
 *   node scripts/download-exercise-gifs.mjs
 *
 * Dependencies (auto-installed if missing):
 *   sharp
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'exercises');
const EXERCISES_JSON = path.join(ROOT, 'src', 'data', 'exercises.json');
const YUHONAS_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const FRAME_BASE =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

const FRAME_W = 320;
const FRAME_H = 240;

// ---------- dependency bootstrap ----------

function ensureDeps() {
  const sharpPkg = path.join(ROOT, 'node_modules', 'sharp', 'package.json');
  if (!existsSync(sharpPkg)) {
    console.log('Installing sharp…');
    execSync('npm install --save-dev sharp', { cwd: ROOT, stdio: 'inherit' });
  }
}

// ---------- network helpers ----------

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`JSON parse failed for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

// ---------- name matching ----------

function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenScore(query, candidate) {
  const qTokens = new Set(normalise(query).split(' '));
  const cTokens = new Set(normalise(candidate).split(' '));
  let shared = 0;
  for (const t of qTokens) if (cTokens.has(t)) shared++;
  const union = new Set([...qTokens, ...cTokens]).size;
  return shared / union;
}

function bestMatch(exerciseName, candidates) {
  const query = exerciseName.replace(/_/g, ' ');
  let best = null;
  let bestScore = 0;
  for (const c of candidates) {
    const score = tokenScore(query, c.name);
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return bestScore >= 0.35 ? { match: best, score: bestScore } : null;
}

// ---------- image compositing ----------

async function framesToSideBySide(jpegBuffers) {
  const sharp = (await import('sharp')).default;

  // Resize both frames to the same height
  const resized = await Promise.all(
    jpegBuffers.map((buf) =>
      sharp(buf)
        .resize(FRAME_W, FRAME_H, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 82 })
        .toBuffer()
    )
  );

  if (resized.length === 1) {
    // Only one frame — return it as-is at target size
    return resized[0];
  }

  // Composite side by side on a canvas twice as wide
  const canvas = sharp({
    create: {
      width: FRAME_W * 2,
      height: FRAME_H,
      channels: 3,
      background: { r: 20, g: 24, b: 32 }, // dark neutral bg matching app theme
    },
  });

  const composite = canvas.composite([
    { input: resized[0], left: 0, top: 0 },
    { input: resized[1], left: FRAME_W, top: 0 },
  ]);

  // Add a subtle 1px divider line between the two frames
  const divider = await sharp({
    create: { width: 2, height: FRAME_H, channels: 3, background: { r: 60, g: 65, b: 80 } },
  })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: FRAME_W * 2,
      height: FRAME_H,
      channels: 3,
      background: { r: 20, g: 24, b: 32 },
    },
  })
    .composite([
      { input: resized[0], left: 0, top: 0 },
      { input: resized[1], left: FRAME_W, top: 0 },
      { input: divider, left: FRAME_W - 1, top: 0 },
    ])
    .jpeg({ quality: 82 })
    .toBuffer();
}

// ---------- main ----------

async function main() {
  ensureDeps();

  mkdirSync(OUT_DIR, { recursive: true });

  console.log('Fetching yuhonas exercise database…');
  const yuhonas = await fetchJson(YUHONAS_URL);
  console.log(`  ${yuhonas.length} exercises available.\n`);

  const ourExercises = JSON.parse(await readFile(EXERCISES_JSON, 'utf8'));
  console.log(`Processing ${ourExercises.length} exercises from exercises.json…\n`);

  const stats = { downloaded: 0, skipped: 0, noMatch: 0, failed: 0 };
  const visualKeySource = {};

  for (const exercise of ourExercises) {
    const outPath = path.join(OUT_DIR, `${exercise.id}.jpg`);

    if (existsSync(outPath)) {
      console.log(`  ⏭  ${exercise.id} — already exists, skipping`);
      stats.skipped++;
      if (!visualKeySource[exercise.visualKey]) {
        visualKeySource[exercise.visualKey] = { id: exercise.id };
      }
      continue;
    }

    const result = bestMatch(exercise.name, yuhonas);
    if (!result) {
      console.log(`  ✗  ${exercise.id} — no match found`);
      stats.noMatch++;
      continue;
    }

    const { match } = result;
    const images = match.images ?? [];
    if (images.length === 0) {
      console.log(`  ✗  ${exercise.id} — matched "${match.name}" but no images`);
      stats.noMatch++;
      continue;
    }

    try {
      process.stdout.write(`  ↓  ${exercise.id} → "${match.name}" … `);

      const frameUrls = images.slice(0, 2).map((img) => `${FRAME_BASE}/${img}`);
      const buffers = await Promise.all(frameUrls.map(fetchBuffer));
      const jpgBuf = await framesToSideBySide(buffers);

      writeFileSync(outPath, jpgBuf);
      console.log(`done (${(jpgBuf.length / 1024).toFixed(0)} KB)`);
      stats.downloaded++;

      if (!visualKeySource[exercise.visualKey]) {
        visualKeySource[exercise.visualKey] = { id: exercise.id };
      }
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      stats.failed++;
    }
  }

  // Write visualKey fallback files
  console.log('\nWriting visualKey fallback files…');
  for (const [vk, source] of Object.entries(visualKeySource)) {
    const fallbackPath = path.join(OUT_DIR, `${vk}.jpg`);
    if (existsSync(fallbackPath)) {
      console.log(`  ⏭  ${vk}.jpg — already exists`);
      continue;
    }
    const srcPath = path.join(OUT_DIR, `${source.id}.jpg`);
    if (!existsSync(srcPath)) {
      console.log(`  ✗  ${vk}.jpg — source file missing (${source.id}.jpg)`);
      continue;
    }
    copyFileSync(srcPath, fallbackPath);
    console.log(`  ✓  ${vk}.jpg  ←  ${source.id}.jpg`);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Downloaded : ${stats.downloaded}
  Skipped    : ${stats.skipped}
  No match   : ${stats.noMatch}
  Failed     : ${stats.failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
