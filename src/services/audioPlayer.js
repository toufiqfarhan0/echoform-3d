/**
 * AudioPlayer: Queues and plays back 24,000 Hz, 16-bit Mono Linear PCM audio chunks
 * streamed from the AssemblyAI Voice Agent API. Handles seamless buffering and barge-in interruptions.
 */
export class AudioPlayer {
  constructor(onVolumeChange) {
    this.onVolumeChange = onVolumeChange
    this.audioContext = null
    this.sampleRate = 24000
    this.nextStartTime = 0
    this.activeNodes = []
    this.isPlaying = false
  }

  ensureContext() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioCtx({ sampleRate: this.sampleRate })
      this.nextStartTime = 0
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {})
    }
    return this.audioContext
  }

  playChunk(base64Chunk) {
    if (!base64Chunk) return

    try {
      this.ensureContext()

      // Convert Base64 PCM to 16-bit integer samples
      const binary = window.atob(base64Chunk)
      const numSamples = Math.floor(binary.length / 2)
      if (numSamples === 0) return

      const samples = new Int16Array(numSamples)
      for (let i = 0; i < numSamples; i++) {
        let val = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8)
        if (val >= 0x8000) val -= 0x10000
        samples[i] = val
      }

      // Convert to Web Audio Float32 [-1.0, 1.0]
      const audioBuffer = this.audioContext.createBuffer(1, samples.length, this.sampleRate)
      const channelData = audioBuffer.getChannelData(0)
      let sumSquares = 0

      for (let i = 0; i < samples.length; i++) {
        const floatVal = samples[i] / 32768
        channelData[i] = floatVal
        sumSquares += floatVal * floatVal
      }

      // RMS calculation for audio visualizer
      if (this.onVolumeChange) {
        const rms = Math.sqrt(sumSquares / samples.length)
        const norm = Math.min(Math.max(rms * 5, 0), 1)
        this.onVolumeChange(norm)
      }

      // Schedule continuous seamless playback
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.audioContext.destination)

      const currentTime = this.audioContext.currentTime
      const startTime = Math.max(currentTime, this.nextStartTime)
      source.start(startTime)
      this.nextStartTime = startTime + audioBuffer.duration
      this.activeNodes.push(source)
      this.isPlaying = true

      source.onended = () => {
        const idx = this.activeNodes.indexOf(source)
        if (idx !== -1) {
          this.activeNodes.splice(idx, 1)
        }
        if (this.activeNodes.length === 0) {
          this.isPlaying = false
          if (this.onVolumeChange) this.onVolumeChange(0)
        }
      }
    } catch (err) {
      console.error('[AudioPlayer] Error playing chunk:', err)
    }
  }

  /**
   * Barge-in Interruption: Instantly stops all playing and queued agent speech
   */
  clearQueue() {
    for (const node of this.activeNodes) {
      try {
        node.stop()
        node.disconnect()
      } catch (e) {}
    }
    this.activeNodes = []
    if (this.audioContext) {
      this.nextStartTime = this.audioContext.currentTime
    }
    this.isPlaying = false
    if (this.onVolumeChange) {
      this.onVolumeChange(0)
    }
  }

  stop() {
    this.clearQueue()
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close()
      } catch (e) {}
      this.audioContext = null
    }
  }
}
