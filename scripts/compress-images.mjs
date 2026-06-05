/**
 * compress-images.mjs
 * Converts public/ images to optimized WebP (hero images)
 * and compresses the avatar PNG.
 * Run with: node scripts/compress-images.mjs
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')

async function run() {
  // 1. hero-vr.jpg -> hero-vr.webp (resize to max 1200px wide, quality 75)
  const heroSrc = path.join(publicDir, 'hero-vr.jpg')
  const heroDest = path.join(publicDir, 'hero-vr.webp')
  const heroMeta = await sharp(heroSrc).metadata()
  await sharp(heroSrc)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 75, effort: 5 })
    .toFile(heroDest)
  const heroOrigKB = Math.round(fs.statSync(heroSrc).size / 1024)
  const heroNewKB  = Math.round(fs.statSync(heroDest).size / 1024)
  console.log(`✅ hero-vr.jpg   → hero-vr.webp   ${heroOrigKB} KB → ${heroNewKB} KB  (saved ${heroOrigKB - heroNewKB} KB, ${Math.round((1 - heroNewKB/heroOrigKB)*100)}% smaller)`)

  // 2. hero-vr-2.jpg -> hero-vr-2.webp
  const hero2Src  = path.join(publicDir, 'hero-vr-2.jpg')
  const hero2Dest = path.join(publicDir, 'hero-vr-2.webp')
  await sharp(hero2Src)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 75, effort: 5 })
    .toFile(hero2Dest)
  const h2OrigKB = Math.round(fs.statSync(hero2Src).size / 1024)
  const h2NewKB  = Math.round(fs.statSync(hero2Dest).size / 1024)
  console.log(`✅ hero-vr-2.jpg → hero-vr-2.webp ${h2OrigKB} KB → ${h2NewKB} KB  (saved ${h2OrigKB - h2NewKB} KB, ${Math.round((1 - h2NewKB/h2OrigKB)*100)}% smaller)`)

  // 3. Avatar PNG -> compressed WebP (displayed at 64px, so 128px @2x is enough)
  const avatarSrc  = path.join(publicDir, 'circled-user-icon-user-pro-icon-11553397069rpnu1bqqup.png')
  const avatarDest = path.join(publicDir, 'avatar.webp')
  await sharp(avatarSrc)
    .resize({ width: 128, height: 128, fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(avatarDest)
  const avOrigKB = Math.round(fs.statSync(avatarSrc).size / 1024)
  const avNewKB  = Math.round(fs.statSync(avatarDest).size / 1024)
  console.log(`✅ avatar.png    → avatar.webp    ${avOrigKB} KB → ${avNewKB} KB  (saved ${avOrigKB - avNewKB} KB, ${Math.round((1 - avNewKB/avOrigKB)*100)}% smaller)`)

  console.log('\n🎉 Done! Original JPG/PNG files kept as fallbacks.')
}

run().catch(err => { console.error('❌ Error:', err.message); process.exit(1) })
