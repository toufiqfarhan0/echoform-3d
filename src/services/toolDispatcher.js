import { useRoomStore } from '../store/useRoomStore'

/**
 * ToolDispatcher: Executes function calls emitted by AssemblyAI Voice Agent
 * and updates the 3D scene in Zustand in real time with visual alerts.
 */
export class ToolDispatcher {
  static execute(toolName, args) {
    console.log(`[ToolDispatcher] Executing ${toolName}:`, args)
    const store = useRoomStore.getState()

    try {
      let result = { status: 'success', message: '' }

      switch (toolName) {
        case 'update_furniture': {
          const { category, material, color, shape, cushionColor } = args

          if (category === 'sofa') {
            const updates = {}
            if (material) updates.material = material.toLowerCase()
            if (color) updates.customColor = color
            if (cushionColor) updates.cushionColor = cushionColor
            store.updateSofa(updates)
            result.message = `Updated sofa with ${material ? `${material} upholstery` : ''} ${color ? `in ${color}` : ''}`.trim()
            break
          }

          if (category === 'coffee_table' || category === 'table') {
            const updates = {}
            if (material) updates.material = material.toLowerCase()
            if (color) updates.customColor = color
            if (shape) updates.shape = shape.toLowerCase()
            store.updateTable(updates)
            result.message = `Updated coffee table to ${material || 'selected'} surface with ${shape || 'oval'} form.`
            break
          }

          if (category === 'rug') {
            const rugStyle = (material || 'cream_geometric').toLowerCase()
            store.updateRug({ style: rugStyle })
            result.message = `Updated area rug style to ${rugStyle.replace('_', ' ')}.`
            break
          }

          result = { status: 'error', message: `Unknown furniture category: ${category}` }
          break
        }

        case 'adjust_lighting': {
          const { preset } = args
          const p = (preset || '').toLowerCase()
          const validPresets = ['golden_hour', 'daylight', 'moody_night', 'cyberpunk_neon']

          if (validPresets.includes(p)) {
            store.setLightingPreset(p)
            result.message = `Switched atmospheric lighting to ${p.replace('_', ' ')}.`
            break
          }

          // Fallback keyword matching
          if (p.includes('sunset') || p.includes('gold') || p.includes('warm')) {
            store.setLightingPreset('golden_hour')
            result.message = 'Set atmospheric lighting to warm Golden Hour.'
            break
          }
          if (p.includes('night') || p.includes('dark') || p.includes('dim') || p.includes('moody')) {
            store.setLightingPreset('moody_night')
            result.message = 'Dimmed lights to Moody Night ambience.'
            break
          }
          if (p.includes('day') || p.includes('bright') || p.includes('white')) {
            store.setLightingPreset('daylight')
            result.message = 'Set lighting to Bright Daylight.'
            break
          }
          if (p.includes('neon') || p.includes('cyber') || p.includes('purple')) {
            store.setLightingPreset('cyberpunk_neon')
            result.message = 'Illuminated room with Cyberpunk Neon glow.'
            break
          }

          result = { status: 'error', message: `Unsupported lighting preset: ${preset}` }
          break
        }

        case 'set_camera_view': {
          const { view } = args
          const v = (view || '').toLowerCase()
          const validViews = ['overview', 'sofa_focus', 'overhead_plan', 'window_view']

          if (validViews.includes(v)) {
            store.setCameraView(v)
            result.message = `Transitioned camera to ${v.replace('_', ' ')}.`
            break
          }

          if (v.includes('sofa') || v.includes('close') || v.includes('chair')) {
            store.setCameraView('sofa_focus')
            result.message = 'Focused camera on the sofa arrangement.'
            break
          }
          if (v.includes('top') || v.includes('plan') || v.includes('overhead')) {
            store.setCameraView('overhead_plan')
            result.message = 'Switched camera to overhead floor plan.'
            break
          }
          if (v.includes('window') || v.includes('view') || v.includes('sky')) {
            store.setCameraView('window_view')
            result.message = 'Oriented camera toward the panoramic window vista.'
            break
          }

          store.setCameraView('overview')
          result.message = 'Reset camera to spatial overview.'
          break
        }

        case 'toggle_fixture': {
          const { fixture, state } = args
          const f = (fixture || '').toLowerCase()
          const s = (state || 'toggle').toLowerCase()

          if (f.includes('lamp') || f.includes('light')) {
            if (s === 'on') {
              if (!store.furniture.lamp.isOn) store.toggleLamp()
            } else if (s === 'off') {
              if (store.furniture.lamp.isOn) store.toggleLamp()
            } else {
              store.toggleLamp()
            }
            result.message = `Floor lamp is now ${store.furniture.lamp.isOn ? 'ON' : 'OFF'}.`
            break
          }

          if (f.includes('plant') || f.includes('tree')) {
            if (s === 'on' || s === 'show') {
              if (!store.furniture.plant.isVisible) store.togglePlant()
            } else if (s === 'off' || s === 'hide') {
              if (store.furniture.plant.isVisible) store.togglePlant()
            } else {
              store.togglePlant()
            }
            result.message = `Monstera plant is now ${store.furniture.plant.isVisible ? 'shown' : 'hidden'}.`
            break
          }

          result = { status: 'error', message: `Unknown fixture: ${fixture}` }
          break
        }

        case 'reset_room': {
          store.setLightingPreset('golden_hour')
          store.setCameraView('overview')
          store.updateSofa({ material: 'boucle', customColor: null, cushionColor: '#c2410c' })
          store.updateTable({ material: 'marble', shape: 'oval', customColor: null })
          store.updateRug({ style: 'cream_geometric' })
          if (!store.furniture.lamp.isOn) store.toggleLamp()
          if (!store.furniture.plant.isVisible) store.togglePlant()
          result.message = 'Reset the living room to default Scandinavian luxury styling.'
          break
        }

        default:
          result = { status: 'error', message: `Unrecognized tool: ${toolName}` }
          break
      }

      // Dispatch Toast Alert to UI
      if (result.status === 'success') {
        store.setActiveToolAlert({
          tool: toolName,
          args,
          message: result.message,
          timestamp: Date.now(),
        })
      }

      return result
    } catch (error) {
      console.error('[ToolDispatcher] Execution error:', error)
      return { status: 'error', message: error.message }
    }
  }
}
