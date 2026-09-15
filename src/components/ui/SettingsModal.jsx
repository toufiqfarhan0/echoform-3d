import React, { useState, useEffect } from 'react'
import { X, Key, ExternalLink, Check, ShieldAlert, Sparkles } from 'lucide-react'

export default function SettingsModal({ isOpen, onClose, onSaved }) {
  const [aaiKey, setAaiKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const storedAai =
        localStorage.getItem('echoform_aai_key') ||
        import.meta.env.VITE_ASSEMBLYAI_API_KEY ||
        ''
      const storedGroq =
        localStorage.getItem('echoform_groq_key') ||
        import.meta.env.VITE_GROQ_API_KEY ||
        ''
      setAaiKey(storedAai)
      setGroqKey(storedGroq)
      setIsSaved(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = (e) => {
    e.preventDefault()
    if (aaiKey.trim()) localStorage.setItem('echoform_aai_key', aaiKey.trim())
    if (groqKey.trim()) localStorage.setItem('echoform_groq_key', groqKey.trim())
    setIsSaved(true)
    setTimeout(() => {
      if (onSaved) onSaved()
      onClose()
    }, 600)
  }

  return (
    <div className="modal-backdrop">
      <div className="settings-card">
        {/* Modal Header */}
        <div className="settings-header">
          <div className="settings-title-group">
            <div className="settings-icon">
              <Key size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="settings-title">API Configuration</h3>
              <p className="settings-subtitle">Connect AssemblyAI Voice Agent + Groq BYO-LLM</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="settings-form">
          {/* AssemblyAI Key Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="aai-key" className="form-label">
                AssemblyAI API Key
              </label>
              <a
                href="https://www.assemblyai.com/dashboard/signup?utm_source=event&utm_medium=credit-grant&utm_campaign=lablab_virtual_hackathon"
                target="_blank"
                rel="noreferrer"
                className="form-link"
              >
                <span>Claim Free Credits</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <input
              id="aai-key"
              type="password"
              className="form-input"
              placeholder="Enter your AssemblyAI API key..."
              value={aaiKey}
              onChange={(e) => setAaiKey(e.target.value)}
              autoComplete="off"
            />
            <p className="form-hint">Powers Universal-3 Pro STT, turn detection, and natural TTS voice.</p>
          </div>

          {/* Groq Key Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="groq-key" className="form-label">
                Groq API Key (Free Tier)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="form-link"
              >
                <span>Get Free Key (30 RPM)</span>
                <ExternalLink size={12} />
              </a>
            </div>
            <input
              id="groq-key"
              type="password"
              className="form-input"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              autoComplete="off"
            />
            <p className="form-hint">
              Bypasses the 2 req/min Gateway limit with ultra-low latency (~150ms) Llama-3.3-70B reasoning.
            </p>
          </div>

          {/* Security Notice */}
          <div className="security-notice">
            <ShieldAlert size={15} className="text-emerald-400 flex-shrink-0" />
            <span>
              Keys are stored securely in browser local storage and used only to communicate with AssemblyAI and Groq.
            </span>
          </div>

          {/* Actions */}
          <div className="settings-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {isSaved ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save & Connect</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
