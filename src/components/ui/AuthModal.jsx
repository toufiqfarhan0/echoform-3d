import React, { useState } from 'react'
import { Sparkles, UserCheck, LogIn, ArrowRight, Shield, CheckCircle2, X } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'
import { signInWithGoogle, isSupabaseConfigured } from '../../services/supabaseClient'

export default function AuthModal({ isOpen, onClose }) {
  const loginAsDemo = useRoomStore((state) => state.loginAsDemo)
  const setUser = useRoomStore((state) => state.setUser)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [authError, setAuthError] = useState(null)

  if (!isOpen) return null

  const handleDemoLogin = () => {
    loginAsDemo()
    if (onClose) onClose()
  }

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true)
      setAuthError(null)
      if (!isSupabaseConfigured) {
        // Graceful notice: Supabase not configured in .env, switch to demo account
        loginAsDemo()
        if (onClose) onClose()
        return
      }
      await signInWithGoogle()
    } catch (err) {
      setAuthError(err.message)
    } finally {
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        {/* Close button if user already has an active session */}
        {onClose && (
          <button className="auth-modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        )}

        {/* Header Branding */}
        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <Sparkles size={20} className="text-amber-400" />
          </div>
          <h2 className="auth-modal-title">Welcome to EchoForm 3D</h2>
          <p className="auth-modal-subtitle">
            Autonomous Voice-Orchestrated 3D Spatial Staging Studio
          </p>
        </div>

        {/* Key Features Pill List */}
        <div className="auth-features-list">
          <div className="auth-feature-item">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>AssemblyAI Voice Agent API with live 24kHz audio streaming</span>
          </div>
          <div className="auth-feature-item">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Autonomous 3D spatial interior mutations & PBR materials</span>
          </div>
          <div className="auth-feature-item">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Multi-workspace architecture with persistent conversation history</span>
          </div>
        </div>

        {/* Error Alert if any */}
        {authError && <div className="auth-error-alert">{authError}</div>}

        {/* Actions */}
        <div className="auth-actions-group">
          {/* Primary 1-Click Demo Account for Hackathon Judges */}
          <button className="auth-demo-btn" onClick={handleDemoLogin}>
            <div className="auth-btn-icon">
              <UserCheck size={18} />
            </div>
            <div className="auth-btn-content">
              <span className="auth-btn-title">1-Click Demo Guest Account</span>
              <span className="auth-btn-desc">
                Instant access for hackathon judges with preloaded 3D workspaces
              </span>
            </div>
            <ArrowRight size={16} className="auth-arrow-icon" />
          </button>

          {/* Secondary Google OAuth */}
          <button
            className="auth-google-btn"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loadingGoogle ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Security badge note */}
        <div className="auth-footer-note">
          <Shield size={13} className="text-slate-400" />
          <span>No keys required. Temporary AssemblyAI session tokens minted on server.</span>
        </div>
      </div>
    </div>
  )
}
