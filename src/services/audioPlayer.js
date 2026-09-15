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
      this.audioContext.resume()
    }
  }

  playChunk(base64Chunk) {
    try {
      this.ensureContext()

      // Convert Base64 back to 16-bit PCM
      const binaryString = window.atob(base64Chunk)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      const int16Array = new Int16Array(bytes.buffer)
      if (int16Array.length === 0) return

      // Convert Int16 to Float32 [-1.0, 1.0]
      const float32Array = new Float32Array(int16Array.length)
      let sumSquares = 0
      for (let i = 0; i < int16Array.length; i++) {
        const val = int16Array[i] / 32768
        float32Array[i] = val
        sumSquares += val * val
      }

      // Notify volume for soundwave visualizer
      if (this.onVolumeChange) {
        const rms = Math.sqrt(sumSquares / int16Array.length)
        this.onVolumeChange(Math.min(Math.max(rms * 4, 0), 1))
      }

      // Create Web Audio Buffer
      const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, this.sampleRate)
      audioBuffer.copyToChannel(float32Array, 0)

      // Schedule seamless continuous playback
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.audioContext.destination)

      const currentTime = this.audioContext.currentTime
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime
      }

      source.start(this.nextStartTime)
      this.nextStartTime += audioBuffer.duration
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
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
