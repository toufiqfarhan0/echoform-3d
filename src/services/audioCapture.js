/**
 * AudioCapture: Records microphone input at 24,000 Hz, 16-bit Mono Linear PCM,
 * converts to Base64, and streams chunks to the AssemblyAI Voice Agent API.
 */
export class AudioCapture {
  constructor(onChunk, onVolumeChange) {
    this.onChunk = onChunk
    this.onVolumeChange = onVolumeChange
    this.audioContext = null
    this.mediaStream = null
    this.processor = null
    this.source = null
    this.isRecording = false
    this.targetSampleRate = 24000
  }

  async start() {
    if (this.isRecording) return

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    const AudioCtx = window.AudioContext || window.webkitAudioContext
    this.audioContext = new AudioCtx({ sampleRate: this.targetSampleRate })

    // Fallback if browser forces a different hardware sample rate
    const actualSampleRate = this.audioContext.sampleRate

    this.source = this.audioContext.createMediaStreamSource(this.mediaStream)

    // ScriptProcessor for continuous raw PCM extraction
    const bufferSize = 4096
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1)

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording) return

      const inputData = e.inputBuffer.getChannelData(0)

      // Calculate RMS for real-time visualizer
      if (this.onVolumeChange) {
        let sumSquares = 0
        for (let i = 0; i < inputData.length; i++) {
          sumSquares += inputData[i] * inputData[i]
        }
        const rms = Math.sqrt(sumSquares / inputData.length)
        const normalized = Math.min(Math.max(rms * 5, 0), 1)
        this.onVolumeChange(normalized)
      }

      // Resample to 24000 Hz if needed
      let resampled = inputData
      if (actualSampleRate !== this.targetSampleRate) {
        resampled = this.resample(inputData, actualSampleRate, this.targetSampleRate)
      }

      // Convert Float32 to Int16 PCM
      const pcm16 = new Int16Array(resampled.length)
      for (let i = 0; i < resampled.length; i++) {
        const s = Math.max(-1, Math.min(1, resampled[i]))
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }

      // Base64 encode the binary PCM bytes
      const base64Chunk = this.arrayBufferToBase64(pcm16.buffer)
      if (this.onChunk) {
        this.onChunk(base64Chunk)
      }
    }

    this.source.connect(this.processor)
    this.processor.connect(this.audioContext.destination)
    this.isRecording = true
  }

  stop() {
    this.isRecording = false

    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }

    if (this.source) {
      this.source.disconnect()
      this.source = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }

    if (this.onVolumeChange) {
      this.onVolumeChange(0)
    }
  }

  resample(buffer, fromRate, toRate) {
    const ratio = fromRate / toRate
    const newLength = Math.round(buffer.length / ratio)
    const result = new Float32Array(newLength)
    for (let i = 0; i < newLength; i++) {
      const srcIdx = i * ratio
      const intIdx = Math.floor(srcIdx)
      const frac = srcIdx - intIdx
      const next = intIdx + 1 < buffer.length ? buffer[intIdx + 1] : buffer[intIdx]
      result[i] = buffer[intIdx] * (1 - frac) + next * frac
    }
    return result
  }

  arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}
