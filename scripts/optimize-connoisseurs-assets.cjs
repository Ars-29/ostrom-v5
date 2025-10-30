#!/usr/bin/env node
/*
  Optimize Connoisseurs assets (3 images + 1 video)
  - Input: public/assets/JB_00401.jpg, JB_00391_BL.jpg, JB_00390.jpg, Ostrom teaser v1.mp4
  - Output: public/assets/optimized/
    - Images: {name}-1080.jpg, {name}-1080.webp (quality 72), and 1440 variants
    - Video: Ostrom-teaser-1080.mp4 (h264, CRF 26), plus 720p fallback
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const root = process.cwd();
const inDir = path.join(root, 'public', 'assets');
const outDir = path.join(inDir, 'optimized');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const images = [
  'JB_00401.jpg',
  'JB_00391_BL.jpg',
  'JB_00390.jpg',
];

const video = 'Ostrom teaser v1.mp4';

async function optimizeImage(inputName) {
  const inputPath = path.join(inDir, inputName);
  const base = path.parse(inputName).name.replace(/\s+/g, '-');
  const targets = [1440, 1080];

  for (const width of targets) {
    const jpgOut = path.join(outDir, `${base}-${width}.jpg`);
    const webpOut = path.join(outDir, `${base}-${width}.webp`);

    console.log(`[img] ${inputName} → ${width}px`);
    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(jpgOut);

    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(webpOut);
  }
}

function optimizeVideo(inputName) {
  return new Promise((resolve, reject) => {
    const inputPath = path.join(inDir, inputName);
    const base = inputName.replace(/\s+/g, '-').replace(/\.[^.]+$/, '');

    const out1080 = path.join(outDir, `${base}-1080.mp4`);
    const out720 = path.join(outDir, `${base}-720.mp4`);

    console.log(`[vid] ${inputName} → 1080p CRF26`);
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 26',
        '-vf scale=w=1920:h=-2:flags=lanczos',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
        '-c:a aac',
        '-b:a 128k'
      ])
      .save(out1080)
      .on('end', () => {
        console.log('[vid] 1080p done');
        console.log(`[vid] ${inputName} → 720p CRF28`);
        ffmpeg(inputPath)
          .outputOptions([
            '-c:v libx264',
            '-preset faster',
            '-crf 28',
            '-vf scale=w=1280:h=-2:flags=lanczos',
            '-movflags +faststart',
            '-pix_fmt yuv420p',
            '-c:a aac',
            '-b:a 96k'
          ])
          .save(out720)
          .on('end', () => {
            console.log('[vid] 720p done');
            resolve();
          })
          .on('error', reject);
      })
      .on('error', reject);
  });
}

(async () => {
  try {
    for (const img of images) {
      await optimizeImage(img);
    }
    await optimizeVideo(video);

    console.log('\n✅ Optimization complete. Outputs in public/assets/optimized');
  } catch (err) {
    console.error('❌ Optimization failed:', err);
    process.exit(1);
  }
})();
