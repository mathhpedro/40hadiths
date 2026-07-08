// Generates the PWA/favicon icon set from an inline SVG master.
// Run with:  npm i -D sharp && node scripts/generate-icons.mjs
// (sharp is only needed to regenerate icons; the PNGs are committed.)
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

const R = 150 // star radius (points reach 256 ± 150 → ~20% margin, maskable-safe)
const C = 256 // centre
const s = R / Math.SQRT2
// 8-pointed star = union of an axis-aligned square and a 45°-rotated one.
const star = `M${C - s} ${C - s} H${C + s} V${C + s} H${C - s} Z M${C} ${C - R} L${C + R} ${C} L${C} ${C + R} L${C - R} ${C} Z`

function svg({ maskable }) {
  const radius = maskable ? '' : 'rx="112"'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d6349"/>
      <stop offset="0.55" stop-color="#083a2b"/>
      <stop offset="1" stop-color="#04221a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0.2" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#f6dd94"/>
      <stop offset="0.5" stop-color="#e6c26a"/>
      <stop offset="1" stop-color="#c2953a"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.22" r="0.7">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" ${radius} fill="url(#tile)"/>
  <rect x="0" y="0" width="512" height="512" ${radius} fill="url(#glow)"/>
  <path d="${star}" fill="url(#gold)"/>
  <circle cx="${C}" cy="${C}" r="34" fill="url(#tile)"/>
  <circle cx="${C}" cy="${C}" r="34" fill="none" stroke="#e6c26a" stroke-width="3" stroke-opacity="0.6"/>
</svg>`
}

const normalSvg = svg({ maskable: false })
const maskableSvg = svg({ maskable: true })

const tasks = [
  { name: 'pwa-192.png', size: 192, src: normalSvg },
  { name: 'pwa-512.png', size: 512, src: normalSvg },
  { name: 'pwa-maskable-512.png', size: 512, src: maskableSvg },
  { name: 'apple-touch-icon.png', size: 180, src: maskableSvg },
]

for (const t of tasks) {
  await sharp(Buffer.from(t.src)).resize(t.size, t.size).png().toFile(join(OUT, t.name))
  console.log('wrote', t.name)
}

writeFileSync(join(OUT, 'favicon.svg'), normalSvg)
console.log('wrote favicon.svg')
