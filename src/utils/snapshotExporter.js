/**
 * snapshotExporter: Captures a clean high-resolution screenshot from the WebGL canvas,
 * stamps an aesthetic EchoForm branding banner, and triggers a download.
 */
export function captureAndDownloadSnapshot(fileName = 'echoform-staging-plan.png') {
  const canvas = document.querySelector('.canvas-container canvas')
  if (!canvas) {
    console.error('Canvas element not found')
    return false
  }

  try {
    // Create an offscreen canvas to compose watermark and metadata
    const offscreen = document.createElement('canvas')
    offscreen.width = canvas.width
    offscreen.height = canvas.height
    const ctx = offscreen.getContext('2d')

    // 1. Draw 3D scene
    ctx.drawImage(canvas, 0, 0)

    // 2. Draw aesthetic bottom gradient banner
    const bannerHeight = Math.max(60, canvas.height * 0.08)
    const gradient = ctx.createLinearGradient(0, canvas.height - bannerHeight, 0, canvas.height)
    gradient.addColorStop(0, 'rgba(9, 11, 16, 0.0)')
    gradient.addColorStop(1, 'rgba(9, 11, 16, 0.85)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight)

    // 3. Draw Watermark Typography
    const fontSize = Math.max(16, Math.floor(canvas.width * 0.015))
    ctx.font = `600 ${fontSize}px sans-serif`
    ctx.fillStyle = '#f8fafc'
    ctx.fillText('EchoForm 3D', 24, canvas.height - 24)

    ctx.font = `400 ${Math.max(12, Math.floor(fontSize * 0.75))}px sans-serif`
    ctx.fillStyle = '#f59e0b'
    ctx.fillText('• Voice-Orchestrated Spatial Staging Studio', 24 + ctx.measureText('EchoForm 3D ').width, canvas.height - 24)

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    ctx.fillStyle = '#94a3b8'
    const dateWidth = ctx.measureText(dateStr).width
    ctx.fillText(dateStr, canvas.width - dateWidth - 24, canvas.height - 24)

    // 4. Download file
    const dataUrl = offscreen.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = fileName
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return true
  } catch (err) {
    console.error('Snapshot capture failed:', err)
    return false
  }
}
