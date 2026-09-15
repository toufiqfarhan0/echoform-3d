import { create } from 'zustand'

export const LIGHTING_PRESETS = {
  golden_hour: {
    name: 'Golden Hour',
    ambientColor: '#ffb36b',
    ambientIntensity: 0.7,
    sunColor: '#ff8c3b',
    sunIntensity: 2.2,
    sunPosition: [8, 4, -4],
    skyColor: '#ff7733',
    fogColor: '#2b1b17',
    windowGlow: '#ffaa44',
  },
  daylight: {
    name: 'Bright Daylight',
    ambientColor: '#ffffff',
    ambientIntensity: 0.9,
    sunColor: '#fff9e6',
    sunIntensity: 2.5,
    sunPosition: [6, 8, -5],
    skyColor: '#7cb5ec',
    fogColor: '#1a202c',
    windowGlow: '#ffffff',
  },
  moody_night: {
    name: 'Moody Night',
    ambientColor: '#1e2640',
    ambientIntensity: 0.35,
    sunColor: '#3a506b',
    sunIntensity: 0.8,
    sunPosition: [4, 6, -3],
    skyColor: '#0b132b',
    fogColor: '#0a0d14',
    windowGlow: '#486581',
  },
  cyberpunk_neon: {
    name: 'Cyberpunk Neon',
    ambientColor: '#5c007a',
    ambientIntensity: 0.6,
    sunColor: '#00e5ff',
    sunIntensity: 2.4,
    sunPosition: [7, 5, -4],
    skyColor: '#9c27b0',
    fogColor: '#0f051d',
    windowGlow: '#00f0ff',
  },
}

export const FURNITURE_MATERIALS = {
  sofa: {
    leather: { name: 'Italian Leather', roughness: 0.45, metalness: 0.1, color: '#3d2817' },
    velvet: { name: 'Royal Velvet', roughness: 0.85, metalness: 0.05, color: '#1a365d' },
    boucle: { name: 'Warm Bouclé', roughness: 0.95, metalness: 0.0, color: '#e2d9cc' },
    charcoal: { name: 'Charcoal Weave', roughness: 0.8, metalness: 0.1, color: '#27272a' },
    emerald: { name: 'Emerald Suede', roughness: 0.75, metalness: 0.05, color: '#064e3b' },
  },
  table: {
    marble: { name: 'Carrara Marble', roughness: 0.2, metalness: 0.1, color: '#f8fafc' },
    black_marble: { name: 'Nero Marquina', roughness: 0.25, metalness: 0.15, color: '#18181b' },
    oak: { name: 'Nordic White Oak', roughness: 0.6, metalness: 0.0, color: '#b58d67' },
    walnut: { name: 'American Walnut', roughness: 0.55, metalness: 0.0, color: '#4a2c11' },
    smoked_glass: { name: 'Smoked Glass', roughness: 0.1, metalness: 0.9, color: '#1e293b', opacity: 0.85 },
  },
  rug: {
    cream_geometric: { name: 'Cream Geometric', color: '#f1ede4', patternColor: '#c4b5a5' },
    charcoal_plush: { name: 'Charcoal Minimal', color: '#334155', patternColor: '#1e293b' },
    terracotta: { name: 'Terracotta Earth', color: '#9a3412', patternColor: '#7c2d12' },
  },
}

export const CAMERA_VIEWS = {
  overview: { position: [4.5, 3.8, 6.2], target: [0, 0.8, 0] },
  sofa_focus: { position: [2.2, 1.6, 3.2], target: [0, 0.7, 0] },
  overhead_plan: { position: [0.1, 7.5, 0.5], target: [0, 0, 0] },
  window_view: { position: [-3.2, 2.2, 3.8], target: [1.2, 1.2, -1.5] },
}

const DEFAULT_WORKSPACES = [
  {
    id: 'ws-nordic',
    name: 'Nordic Sanctuary',
    style: 'Modern Minimalist',
    lightingPreset: 'golden_hour',
    cameraView: 'overview',
    furniture: {
      sofa: { material: 'boucle', customColor: null, cushionColor: '#c2410c' },
      table: { material: 'oak', customColor: null, shape: 'oval' },
      rug: { style: 'cream_geometric' },
      lamp: { isOn: true, intensity: 1.5, color: '#ffddaa' },
      plant: { isVisible: true, type: 'monstera' },
    },
    history: [
      {
        id: 'h-1',
        role: 'agent',
        text: "Hi! I'm EchoForm, your spatial interior designer. How can I help style your space today?",
        timestamp: '10:00 AM',
      },
      {
        id: 'h-2',
        role: 'user',
        text: 'What are the available options?',
        timestamp: '10:00 AM',
      },
      {
        id: 'h-3',
        role: 'agent',
        text: 'I can create a complete new interior design! We can start with the style and floor materials. Do you prefer a modern minimalist interior with light oak and warm bouclé, or an old vintage aesthetic with Italian saddle leather and dark walnut? What colors do you like?',
        timestamp: '10:01 AM',
      },
    ],
  },
  {
    id: 'ws-cyberpunk',
    name: 'Cyberpunk Loft',
    style: 'Futuristic Neo-Tokyo',
    lightingPreset: 'cyberpunk_neon',
    cameraView: 'sofa_focus',
    furniture: {
      sofa: { material: 'charcoal', customColor: null, cushionColor: '#00f0ff' },
      table: { material: 'smoked_glass', customColor: null, shape: 'rectangle' },
      rug: { style: 'charcoal_plush' },
      lamp: { isOn: true, intensity: 2.0, color: '#00e5ff' },
      plant: { isVisible: false, type: 'monstera' },
    },
    history: [
      {
        id: 'h-4',
        role: 'user',
        text: 'Switch this room into a high-contrast Cyberpunk aesthetic with neon lighting.',
        timestamp: 'Yesterday',
      },
      {
        id: 'h-5',
        role: 'agent',
        text: 'Atmospheric lighting shifted to Cyberpunk Neon with smoked glass and charcoal weave.',
        timestamp: 'Yesterday',
        toolCall: { name: 'adjust_lighting', args: { preset: 'cyberpunk_neon' } },
      },
    ],
  },
  {
    id: 'ws-midcentury',
    name: 'Mid-Century Penthouse',
    style: 'Vintage Luxury',
    lightingPreset: 'daylight',
    cameraView: 'window_view',
    furniture: {
      sofa: { material: 'leather', customColor: null, cushionColor: '#9a3412' },
      table: { material: 'black_marble', customColor: null, shape: 'oval' },
      rug: { style: 'terracotta' },
      lamp: { isOn: true, intensity: 1.2, color: '#ffeecc' },
      plant: { isVisible: true, type: 'monstera' },
    },
    history: [
      {
        id: 'h-6',
        role: 'user',
        text: 'Show me vintage mid-century luxury with Italian leather.',
        timestamp: '2 days ago',
      },
      {
        id: 'h-7',
        role: 'agent',
        text: 'Applied full-grain Italian leather, Nero Marquina marble, and bright morning daylight.',
        timestamp: '2 days ago',
        toolCall: { name: 'update_furniture', args: { category: 'sofa', material: 'leather' } },
      },
    ],
  },
]

function getInitialUser() {
  try {
    const saved = localStorage.getItem('echoform_user')
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  // Default to Demo Guest so there's zero friction for visitors/judges
  return {
    id: 'demo-guest',
    name: 'Demo Guest Designer',
    email: 'guest@echoform.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isDemo: true,
  }
}

function getInitialWorkspaces() {
  try {
    const saved = localStorage.getItem('echoform_workspaces')
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return DEFAULT_WORKSPACES
}

export const useRoomStore = create((set, get) => ({
  // Authentication State
  currentUser: getInitialUser(),
  isAuthModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),

  loginAsDemo: () => {
    const demoUser = {
      id: 'demo-guest',
      name: 'Demo Guest Designer',
      email: 'guest@echoform.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isDemo: true,
    }
    localStorage.setItem('echoform_user', JSON.stringify(demoUser))
    set({ currentUser: demoUser, isAuthModalOpen: false })
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('echoform_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('echoform_user')
    }
    set({ currentUser: user, isAuthModalOpen: !user })
  },

  logout: () => {
    localStorage.removeItem('echoform_user')
    set({ currentUser: null, isAuthModalOpen: true })
  },

  // Workspace Management
  workspaces: getInitialWorkspaces(),
  activeWorkspaceId: 'ws-nordic',
  isWorkspaceDrawerOpen: false,
  setIsWorkspaceDrawerOpen: (open) => set({ isWorkspaceDrawerOpen: open }),

  switchWorkspace: (workspaceId) => {
    const ws = get().workspaces.find((w) => w.id === workspaceId)
    if (!ws) return
    set({
      activeWorkspaceId: workspaceId,
      lightingPreset: ws.lightingPreset || 'golden_hour',
      cameraView: ws.cameraView || 'overview',
      furniture: { ...ws.furniture },
      voiceState: {
        ...get().voiceState,
        lastAgentReply: `Switched to ${ws.name}. Say any command or ask for style options.`,
      },
    })
  },

  createWorkspace: (name, style = 'Modern Minimalist') => {
    const newWs = {
      id: `ws-${Date.now().toString(36)}`,
      name: name || 'New Interior Studio',
      style,
      lightingPreset: get().lightingPreset,
      cameraView: get().cameraView,
      furniture: JSON.parse(JSON.stringify(get().furniture)),
      history: [
        {
          id: `h-${Date.now()}`,
          role: 'agent',
          text: `Workspace "${name}" ready. What aesthetic direction would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }
    const updated = [newWs, ...get().workspaces]
    localStorage.setItem('echoform_workspaces', JSON.stringify(updated))
    set({
      workspaces: updated,
      activeWorkspaceId: newWs.id,
    })
  },

  addTranscriptToHistory: (role, text, toolCall = null) => {
    const activeId = get().activeWorkspaceId
    const item = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role,
      text,
      toolCall,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    set((state) => {
      const updated = state.workspaces.map((ws) => {
        if (ws.id === activeId) {
          return {
            ...ws,
            history: [...(ws.history || []), item],
            furniture: { ...state.furniture },
            lightingPreset: state.lightingPreset,
            cameraView: state.cameraView,
          }
        }
        return ws
      })
      try {
        localStorage.setItem('echoform_workspaces', JSON.stringify(updated))
      } catch (e) {}
      return { workspaces: updated }
    })
  },

  // Active Lighting Preset
  lightingPreset: 'golden_hour',
  setLightingPreset: (preset) => {
    if (LIGHTING_PRESETS[preset]) {
      set({ lightingPreset: preset })
      // Sync to active workspace
      const activeId = get().activeWorkspaceId
      set((state) => ({
        workspaces: state.workspaces.map((ws) =>
          ws.id === activeId ? { ...ws, lightingPreset: preset } : ws
        ),
      }))
    }
  },

  // Active Camera Preset
  cameraView: 'overview',
  setCameraView: (view) => {
    if (CAMERA_VIEWS[view]) {
      set({ cameraView: view })
      const activeId = get().activeWorkspaceId
      set((state) => ({
        workspaces: state.workspaces.map((ws) =>
          ws.id === activeId ? { ...ws, cameraView: view } : ws
        ),
      }))
    }
  },

  // Furniture Configuration
  furniture: {
    sofa: {
      material: 'boucle',
      customColor: null,
      cushionColor: '#c2410c',
    },
    table: {
      material: 'oak',
      customColor: null,
      shape: 'oval',
    },
    rug: {
      style: 'cream_geometric',
    },
    lamp: {
      isOn: true,
      intensity: 1.5,
      color: '#ffddaa',
    },
    plant: {
      isVisible: true,
      type: 'monstera',
    },
  },

  updateSofa: (updates) =>
    set((state) => {
      const newFurniture = {
        ...state.furniture,
        sofa: { ...state.furniture.sofa, ...updates },
      }
      return { furniture: newFurniture }
    }),

  updateTable: (updates) =>
    set((state) => {
      const newFurniture = {
        ...state.furniture,
        table: { ...state.furniture.table, ...updates },
      }
      return { furniture: newFurniture }
    }),

  updateRug: (updates) =>
    set((state) => {
      const newFurniture = {
        ...state.furniture,
        rug: { ...state.furniture.rug, ...updates },
      }
      return { furniture: newFurniture }
    }),

  toggleLamp: () =>
    set((state) => {
      const newFurniture = {
        ...state.furniture,
        lamp: { ...state.furniture.lamp, isOn: !state.furniture.lamp.isOn },
      }
      return { furniture: newFurniture }
    }),

  togglePlant: () =>
    set((state) => {
      const newFurniture = {
        ...state.furniture,
        plant: { ...state.furniture.plant, isVisible: !state.furniture.plant.isVisible },
      }
      return { furniture: newFurniture }
    }),

  // Voice Agent State
  voiceState: {
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    lastTranscript: '',
    lastAgentReply: "Welcome to EchoForm. Click 'Connect Voice' or say what style you'd love to see.",
    lastToolCall: null,
    audioLevel: 0,
  },
  setVoiceState: (updates) =>
    set((state) => ({
      voiceState: { ...state.voiceState, ...updates },
    })),

  // Live Audio Level (0.0 - 1.0) for 3D Holographic Visualizer
  audioLevel: 0,
  setAudioLevel: (level) => set({ audioLevel: level }),

  // Live Delta Transcript (Streaming captions)
  liveDeltaTranscript: null,
  setLiveDeltaTranscript: (text, role) =>
    set({
      liveDeltaTranscript: text ? { text, role } : null,
    }),

  // Floating Toast Alert for Voice Tools
  activeToolAlert: null,
  setActiveToolAlert: (alert) => set({ activeToolAlert: alert }),
}))

