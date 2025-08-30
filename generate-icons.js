// Simple icon generator for PWA
// Creates colored square icons as placeholders

const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512]
const iconColor = '#2563eb' // Blue color

// Create simple SVG icon template
function createSimpleSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${iconColor}" rx="${size * 0.1}"/>
  <rect x="${size * 0.15}" y="${size * 0.2}" width="${size * 0.7}" height="${size * 0.6}" rx="${size * 0.05}" fill="white"/>
  <rect x="${size * 0.2}" y="${size * 0.3}" width="${size * 0.4}" height="${size * 0.05}" rx="${size * 0.025}" fill="${iconColor}"/>
  <rect x="${size * 0.2}" y="${size * 0.4}" width="${size * 0.5}" height="${size * 0.03}" rx="${size * 0.015}" fill="#9ca3af"/>
  <rect x="${size * 0.2}" y="${size * 0.5}" width="${size * 0.45}" height="${size * 0.03}" rx="${size * 0.015}" fill="#9ca3af"/>
  <rect x="${size * 0.2}" y="${size * 0.6}" width="${size * 0.4}" height="${size * 0.03}" rx="${size * 0.015}" fill="#9ca3af"/>
  <text x="${size * 0.5}" y="${size * 0.85}" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold" text-anchor="middle" fill="white">M</text>
</svg>`
}

// Generate icons
console.log('Generating PWA icons...')

sizes.forEach(size => {
  const svgContent = createSimpleSVG(size)
  const filename = `icon-${size}x${size}.svg`
  const filepath = path.join('public', 'icons', filename)
  
  fs.writeFileSync(filepath, svgContent)
  console.log(`Generated: ${filename}`)
})

console.log('Icon generation complete!')
console.log('\nNote: For production, consider using proper PNG icons.')
console.log('These SVG icons will work for PWA functionality.')
