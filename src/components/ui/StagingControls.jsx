import React, { useState } from 'react'
import {
  Sun,
  Moon,
  Zap,
  Armchair,
  Table,
  Camera,
  Lightbulb,
  TreePine,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react'
import {
  useRoomStore,
  LIGHTING_PRESETS,
  FURNITURE_MATERIALS,
  CAMERA_VIEWS,
} from '../../store/useRoomStore'

export default function StagingControls() {
  const [activeTab, setActiveTab] = useState('lighting') // 'lighting' | 'sofa' | 'table' | 'camera'
  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    lightingPreset,
    setLightingPreset,
    cameraView,
    setCameraView,
    furniture,
    updateSofa,
    updateTable,
    toggleLamp,
    togglePlant,
  } = useRoomStore()

  const lightingIcons = {
    golden_hour: Sun,
    daylight: Sun,
    moody_night: Moon,
    cyberpunk_neon: Zap,
  }

  return (
    <aside className={`staging-dock ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Dock Header */}
      <div className="dock-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="dock-title">
          <span>Staging Controls</span>
          <span className="dock-subtitle">(Manual Test Bed)</span>
        </div>
        <button className="dock-toggle-btn" aria-label="Toggle Dock">
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="dock-body">
          {/* Navigation Tabs */}
          <div className="dock-tabs">
            <button
              className={`dock-tab ${activeTab === 'lighting' ? 'active' : ''}`}
              onClick={() => setActiveTab('lighting')}
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              className={`dock-tab ${activeTab === 'sofa' ? 'active' : ''}`}
              onClick={() => setActiveTab('sofa')}
            >
              <Armchair size={14} />
              <span>Sofa</span>
            </button>
            <button
              className={`dock-tab ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              <Table size={14} />
              <span>Table</span>
            </button>
            <button
              className={`dock-tab ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              <Camera size={14} />
              <span>Camera</span>
            </button>
          </div>

          {/* Tab 1: Lighting Presets */}
          {activeTab === 'lighting' && (
            <div className="tab-pane">
              <div className="dock-section-title">Atmospheric Presets</div>
              <div className="presets-grid">
                {Object.entries(LIGHTING_PRESETS).map(([key, item]) => {
                  const Icon = lightingIcons[key] || Sun
                  const isSelected = lightingPreset === key
                  return (
                    <button
                      key={key}
                      className={`preset-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setLightingPreset(key)}
                    >
                      <div className="preset-card-top">
                        <Icon size={16} />
                        <span
                          className="color-swatch-dot"
                          style={{ backgroundColor: item.ambientColor }}
                        />
                      </div>
                      <span className="preset-name">{item.name}</span>
                    </button>
                  )
                })}
              </div>

              <div className="dock-section-title" style={{ marginTop: '14px' }}>
                Fixtures
              </div>
              <div className="toggle-row">
                <button
                  className={`toggle-btn ${furniture.lamp.isOn ? 'active' : ''}`}
                  onClick={toggleLamp}
                >
                  <Lightbulb size={14} />
                  <span>Floor Lamp {furniture.lamp.isOn ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  className={`toggle-btn ${furniture.plant.isVisible ? 'active' : ''}`}
                  onClick={togglePlant}
                >
                  <TreePine size={14} />
                  <span>Plant {furniture.plant.isVisible ? 'Shown' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Sofa Materials */}
          {activeTab === 'sofa' && (
            <div className="tab-pane">
              <div className="dock-section-title">Upholstery Material</div>
              <div className="materials-list">
                {Object.entries(FURNITURE_MATERIALS.sofa).map(([key, mat]) => {
                  const isSelected = furniture.sofa.material === key
                  return (
                    <button
                      key={key}
                      className={`material-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => updateSofa({ material: key, customColor: null })}
                    >
                      <span className="mat-swatch" style={{ backgroundColor: mat.color }} />
                      <span className="mat-name">{mat.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Coffee Table Materials & Shapes */}
          {activeTab === 'table' && (
            <div className="tab-pane">
              <div className="dock-section-title">Surface Material</div>
              <div className="materials-list">
                {Object.entries(FURNITURE_MATERIALS.table).map(([key, mat]) => {
                  const isSelected = furniture.table.material === key
                  return (
                    <button
                      key={key}
                      className={`material-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => updateTable({ material: key, customColor: null })}
                    >
                      <span className="mat-swatch" style={{ backgroundColor: mat.color }} />
                      <span className="mat-name">{mat.name}</span>
                    </button>
                  )
                })}
              </div>

              <div className="dock-section-title" style={{ marginTop: '14px' }}>
                Table Geometry
              </div>
              <div className="toggle-row">
                <button
                  className={`toggle-btn ${furniture.table.shape === 'oval' ? 'active' : ''}`}
                  onClick={() => updateTable({ shape: 'oval' })}
                >
                  Oval Form
                </button>
                <button
                  className={`toggle-btn ${furniture.table.shape === 'rectangle' ? 'active' : ''}`}
                  onClick={() => updateTable({ shape: 'rectangle' })}
                >
                  Rectangular
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Camera Perspectives */}
          {activeTab === 'camera' && (
            <div className="tab-pane">
              <div className="dock-section-title">Cinematic Viewpoints</div>
              <div className="camera-grid">
                {Object.keys(CAMERA_VIEWS).map((key) => {
                  const isSelected = cameraView === key
                  const labels = {
                    overview: 'Spatial Overview',
                    sofa_focus: 'Sofa Close-Up',
                    overhead_plan: 'Floor Plan (Top)',
                    window_view: 'Window Vista',
                  }
                  return (
                    <button
                      key={key}
                      className={`camera-preset-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setCameraView(key)}
                    >
                      <Camera size={14} />
                      <span>{labels[key] || key}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
