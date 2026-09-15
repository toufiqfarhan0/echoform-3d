import React, { useEffect, useState } from 'react'
import { Zap, CheckCircle2 } from 'lucide-react'
import { useRoomStore } from '../../store/useRoomStore'

export default function ToolCallToast() {
  const activeToolAlert = useRoomStore((state) => state.activeToolAlert)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (activeToolAlert) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
      }, 3400)
      return () => clearTimeout(timer)
    }
  }, [activeToolAlert])

  if (!visible || !activeToolAlert) return null

  return (
    <div className="tool-call-toast">
      <div className="toast-icon-pulse">
        <Zap size={16} className="text-amber-400" />
      </div>
      <div className="toast-content">
        <div className="toast-header">
          <span className="toast-tag">3D Mutation Dispatched</span>
          <span className="toast-tool-name">{activeToolAlert.tool}</span>
        </div>
        <div className="toast-message">{activeToolAlert.message}</div>
      </div>
      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
    </div>
  )
}
