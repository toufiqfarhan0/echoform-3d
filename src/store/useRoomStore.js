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

export const useRoomStore = create((set, get) => ({
  // Active Lighting Preset
  lightingPreset: 'golden_hour',
  setLightingPreset: (preset) => {
    if (LIGHTING_PRESETS[preset]) {
      set({ lightingPreset: preset })
    }
  },

  // Active Camera Preset
  cameraView: 'overview',
  setCameraView: (view) => {
    if (CAMERA_VIEWS[view]) {
      set({ cameraView: view })
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
      material: 'marble',
      customColor: null,
      shape: 'oval', // 'oval' | 'rectangle'
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
    set((state) => ({
      furniture: {
        ...state.furniture,
        sofa: { ...state.furniture.sofa, ...updates },
      },
    })),

  updateTable: (updates) =>
    set((state) => ({
      furniture: {
        ...state.furniture,
        table: { ...state.furniture.table, ...updates },
      },
    })),

  updateRug: (updates) =>
    set((state) => ({
      furniture: {
        ...state.furniture,
        rug: { ...state.furniture.rug, ...updates },
      },
    })),

  toggleLamp: () =>
    set((state) => ({
      furniture: {
        ...state.furniture,
        lamp: { ...state.furniture.lamp, isOn: !state.furniture.lamp.isOn },
      },
    })),

  togglePlant: () =>
    set((state) => ({
      furniture: {
        ...state.furniture,
        plant: { ...state.furniture.plant, isVisible: !state.furniture.plant.isVisible },
      },
    })),

  // Voice Agent State (Pre-wired for Phase 3/4)
  voiceState: {
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    lastTranscript: '',
    lastAgentReply: 'Welcome to EchoForm. Click any preset or get ready to speak your space into existence.',
    lastToolCall: null,
  },
  setVoiceState: (updates) =>
    set((state) => ({
      voiceState: { ...state.voiceState, ...updates },
    })),
}))
