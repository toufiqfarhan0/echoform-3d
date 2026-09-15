import React from 'react'
import { Sparkles, Armchair, Sun, Compass, Palette } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'
import { ToolDispatcher } from '../../services/toolDispatcher'

const STYLE_OPTIONS = [
  {
    id: 'opt-modern',
    label: 'Modern Minimalist',
    icon: Armchair,
    badge: 'Bouclé + Oak',
    action: () => {
      ToolDispatcher.execute('update_furniture', { category: 'sofa', material: 'boucle' })
      ToolDispatcher.execute('update_furniture', { category: 'table', material: 'oak', shape: 'oval' })
      ToolDispatcher.execute('adjust_lighting', { preset: 'daylight' })
      return {
        userText: 'I would like a clean modern minimalist interior.',
        agentReply: 'Applied warm bouclé sofa, Nordic white oak oval table, and bright daylight.',
      }
    },
  },
  {
    id: 'opt-vintage',
    label: 'Vintage Mid-Century',
    icon: Compass,
    badge: 'Leather + Walnut',
    action: () => {
      ToolDispatcher.execute('update_furniture', { category: 'sofa', material: 'leather' })
      ToolDispatcher.execute('update_furniture', { category: 'table', material: 'walnut', shape: 'rectangle' })
      ToolDispatcher.execute('adjust_lighting', { preset: 'golden_hour' })
      return {
        userText: 'Give me a vintage mid-century style with rich textures.',
        agentReply: 'Staged full-grain Italian leather, rich American walnut, and warm golden hour sunlight.',
      }
    },
  },
  {
    id: 'opt-cyberpunk',
    label: 'Cyberpunk Neon',
    icon: Sparkles,
    badge: 'Smoked Glass + Cyan',
    action: () => {
      ToolDispatcher.execute('update_furniture', { category: 'sofa', material: 'charcoal' })
      ToolDispatcher.execute('update_furniture', { category: 'table', material: 'smoked_glass' })
      ToolDispatcher.execute('adjust_lighting', { preset: 'cyberpunk_neon' })
      return {
        userText: 'Switch this room into a futuristic Cyberpunk Neon mood.',
        agentReply: 'Engaged high-contrast cyan-magenta neon lighting with smoked glass surfaces.',
      }
    },
  },
  {
    id: 'opt-emerald',
    label: 'Emerald Moody Luxury',
    icon: Palette,
    badge: 'Velvet + Nero Marquina',
    action: () => {
      ToolDispatcher.execute('update_furniture', { category: 'sofa', material: 'emerald' })
      ToolDispatcher.execute('update_furniture', { category: 'table', material: 'black_marble' })
      ToolDispatcher.execute('adjust_lighting', { preset: 'moody_night' })
      return {
        userText: 'I want a moody luxury vibe with emerald and dark marble.',
        agentReply: 'Applied emerald suede, Nero Marquina marble, and deep moody night lighting.',
      }
    },
  },
]

export default function StyleGuidanceChips() {
  const addTranscriptToHistory = useRoomStore((state) => state.addTranscriptToHistory)
  const setVoiceState = useRoomStore((state) => state.setVoiceState)

  const handleSelectOption = (opt) => {
    const { userText, agentReply } = opt.action()

    // Update HUD display
    setVoiceState({
      lastTranscript: userText,
      lastAgentReply: agentReply,
    })

    // Record in workspace conversation history
    addTranscriptToHistory('user', userText)
    addTranscriptToHistory('agent', agentReply, { name: 'preset_style', args: { style: opt.label } })

    // Optional audio confirmation via browser TTS if live WebSocket is not speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(agentReply)
      utterance.rate = 1.05
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="style-guidance-container">
      <div className="style-guidance-label">
        <Sparkles size={13} className="text-amber-400 animate-pulse" />
        <span>Agent Guided Options:</span>
      </div>

      <div className="style-chips-scroll">
        {STYLE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          return (
            <button
              key={opt.id}
              className="style-chip-btn"
              onClick={() => handleSelectOption(opt)}
              title={`Ask agent for ${opt.label}`}
            >
              <Icon size={13} className="text-amber-300" />
              <span className="style-chip-name">{opt.label}</span>
              <span className="style-chip-badge">{opt.badge}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
