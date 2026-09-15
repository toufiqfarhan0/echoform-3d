import { useRoomStore } from '../store/useRoomStore'

/**
 * ToolDispatcher: Executes function calls emitted by AssemblyAI Voice Agent
 * and updates the 3D scene in Zustand in real time.
 */
export class ToolDispatcher {
  static execute(toolName, args) {
    console.log(`[ToolDispatcher] Executing ${toolName}:`, args)
    const store = useRoomStore.getState()

    try {
      switch (toolName) {
        case 'update_furniture': {
          const { category, material, color, shape } = args

          if (category === 'sofa') {
            const updates = {}
            if (material) updates.material = material
            if (color) updates.customColor = color
            store.updateSofa(updates)
            return {
              status: 'success',
              message: `Updated sofa with material ${material || 'default'} and color ${color || 'original'}`,
            }
          }

          if (category === 'coffee_table' || category === 'table') {
            const updates = {}
            if (material) updates.material = material
            if (color) updates.customColor = color
            if (shape) updates.shape = shape
            store.updateTable(updates)
            return {
              status: 'success',
              message: `Updated coffee table with material ${material || 'default'} and shape ${shape || 'oval'}`,
            }
          }

          if (category === 'rug') {
            if (material) store.updateRug({ style: material })
            return { status: 'success', message: `Updated rug style to ${material}` }
          }

          return { status: 'error', message: `Unknown furniture category: ${category}` }
        }

        case 'adjust_lighting': {
          const { preset } = args
          const validPresets = ['golden_hour', 'daylight', 'moody_night', 'cyberpunk_neon']

          if (validPresets.includes(preset)) {
            store.setLightingPreset(preset)
            return {
              status: 'success',
              message: `Switched atmospheric lighting to ${preset.replace('_', ' ')}`,
            }
          }

          // Fallback keyword matching
          if (preset.includes('sunset') || preset.includes('gold')) {
            store.setLightingPreset('golden_hour')
            return { status: 'success', message: 'Set lighting to golden hour' }
          }
          if (preset.includes('night') || preset.includes('dark') || preset.includes('dim')) {
            store.setLightingPreset('moody_night')
            return { status: 'success', message: 'Set lighting to moody night' }
          }
          if (preset.includes('day') || preset.includes('bright')) {
            store.setLightingPreset('daylight')
            return { status: 'success', message: 'Set lighting to bright daylight' }
          }
          if (preset.includes('neon') || preset.includes('cyber')) {
            store.setLightingPreset('cyberpunk_neon')
            return { status: 'success', message: 'Set lighting to cyberpunk neon' }
          }

          return { status: 'error', message: `Unsupported preset: ${preset}` }
        }

        case 'set_camera_view': {
          const { view } = args
          const validViews = ['overview', 'sofa_focus', 'overhead_plan', 'window_view']

          if (validViews.includes(view)) {
            store.setCameraView(view)
            return { status: 'success', message: `Moved camera to ${view.replace('_', ' ')}` }
          }

          if (view.includes('sofa') || view.includes('close')) {
            store.setCameraView('sofa_focus')
            return { status: 'success', message: 'Focused camera on sofa' }
          }
          if (view.includes('top') || view.includes('plan') || view.includes('overhead')) {
            store.setCameraView('overhead_plan')
            return { status: 'success', message: 'Switched to floor plan overview' }
          }
          if (view.includes('window') || view.includes('view') || view.includes('sky')) {
            store.setCameraView('window_view')
            return { status: 'success', message: 'Focused camera on panoramic window' }
          }

          store.setCameraView('overview')
          return { status: 'success', message: 'Reset camera to spatial overview' }
        }

        case 'toggle_fixture': {
          const { fixture, state } = args

          if (fixture === 'lamp' || fixture === 'floor_lamp') {
            if (state === 'on') {
              if (!store.furniture.lamp.isOn) store.toggleLamp()
            } else if (state === 'off') {
              if (store.furniture.lamp.isOn) store.toggleLamp()
            } else {
              store.toggleLamp()
            }
            return { status: 'success', message: `Toggled floor lamp` }
          }

          if (fixture === 'plant') {
            if (state === 'on' || state === 'show') {
              if (!store.furniture.plant.isVisible) store.togglePlant()
            } else if (state === 'off' || state === 'hide') {
              if (store.furniture.plant.isVisible) store.togglePlant()
            } else {
              store.togglePlant()
            }
            return { status: 'success', message: `Toggled plant visibility` }
          }

          return { status: 'error', message: `Unknown fixture: ${fixture}` }
        }

        default:
          return { status: 'error', message: `Unrecognized tool: ${toolName}` }
      }
    } catch (error) {
      console.error('[ToolDispatcher] Execution error:', error)
      return { status: 'error', message: error.message }
    }
  }
}
