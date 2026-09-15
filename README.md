<div align="center">

# 🏛️ EchoForm 3D
### Autonomous Voice-Orchestrated 3D Spatial Staging Studio

**"Speak your space into existence."**  
*Built for the AssemblyAI Voice Agent Hackathon on lablab.ai (Sep 2026).*

[![AssemblyAI Voice Agent API](https://img.shields.io/badge/AssemblyAI-Voice%20Agent%20API-10b981.svg?style=for-the-badge&logo=assemblyai)](https://www.assemblyai.com/products/voice-agent-api)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%20Canvas-06b6d4.svg?style=for-the-badge&logo=three.js)](https://threejs.org)
[![React Three Fiber](https://img.shields.io/badge/R3F-React%20Three%20Fiber-8b5cf6.svg?style=for-the-badge)](https://docs.pmnd.rs/react-three-fiber)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Workspaces-3ecf8e.svg?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Executive Summary

**EchoForm 3D** is an autonomous, voice-orchestrated spatial interior staging studio that transforms spoken conversations into real-time 3D architectural mutations.

Navigating complex CAD menus, dropdowns, and nested material panels slows down interior designers, real estate stagers, and homeowners. **EchoForm** replaces static UI controls with proactive, consultative voice dialogues:

> 🗣️ *"Echo, stage a vintage mid-century look with Italian leather and warm golden hour sunlight."*

Within **<600 milliseconds**, the voice agent understands spatial intent, triggers parallel JSON tool calls, mutates 3D models and lighting, and speaks back in a natural human voice—while soundwaves pulse across the room in living 3D.

---

## 🏗️ Technical Architecture & Pipeline

EchoForm operates on a secure **Server-Side Token Minting** pattern. Long-lived credentials never reach the browser:

```
                                  [User's Microphone]
                                           │
                                           ▼ (24,000 Hz 16-bit Mono PCM Stream)
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          EchoForm 3D Client (React 19 + Three.js)                           │
│                                                                                             │
│  • 1-Click Demo Guest Account (Zero-friction evaluator mode) / Google OAuth (Supabase)       │
│  • Multi-Workspace Manager (Nordic Sanctuary, Cyberpunk Loft, Mid-Century Penthouse)       │
│  • Real-Time Conversation History & 3D Staging Action Manifest                              │
│  • Audio-Reactive Visualizers (3D Holographic Core, Floor Soundwave Ripples, EQ Bars)       │
└───────────────────────┬─────────────────────────────────────────────▲───────────────────────┘
                        │ GET /api/voice-agent-token                   │
                        ▼                                             │
┌────────────────────────────────────────────────┐                    │
│      Serverless Token Endpoint (Vercel/Vite)   │                    │
│                                                │                    │
│  • Reads ASSEMBLYAI_API_KEY from .env (secure) │                    │
│  • Mints short-lived temporary token           │                    │
│    (expires_in_seconds=300, max_duration=900)  │                    │
└───────────────────────┬────────────────────────┘                    │
                        │                                             │
                        ▼ (Authenticated WebSocket Connection)        │
┌─────────────────────────────────────────────────────────────────────┴───────────────────────┐
│                                 AssemblyAI Voice Agent API                                  │
│                             (wss://agents.assemblyai.com/v1/ws)                             │
│                                                                                             │
│  • Real-time Speech-to-Text powered by Universal-3 Pro                                      │
│  • Neural Turn-Taking & Voice Activity Detection (VAD)                                      │
│  • Native Proactive LLM Spatial Reasoning & Consultative Dialogues                         │
│  • Barge-In / Natural Interruption Handling (clears buffer when user speaks)                │
│  • Real-Time Function / Tool Calling (`update_furniture`, `adjust_lighting`, etc.)          │
│  • Chunked Streaming TTS Voice Synthesis (24kHz natural voices)                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| **Pure AssemblyAI Architecture** | Powered directly by AssemblyAI Voice Agent API using only `ASSEMBLYAI_API_KEY`. No external BYO-LLM complexity or rate limits. |
| **Zero-Friction Demo Account** | 1-Click Demo Guest Account for instant hackathon evaluation without signup or credentials. |
| **Multi-Workspace Studio** | Create and switch between distinct interior workspaces (*Nordic Sanctuary*, *Cyberpunk Loft*, *Mid-Century Penthouse*). |
| **Persistent Conversation History** | Chronological timeline tracking every user prompt, agent response, and 3D tool execution. |
| **Proactive Interior Stylist** | The agent proactively interviews you (*"Do you prefer modern minimalist or warm vintage? What color palette inspires you?"*). |
| **Bi-Directional 24kHz Audio** | 24,000 Hz 16-bit Linear PCM audio input via Web Audio API, paired with scheduled streaming playback and barge-in support. |
| **Real-Time 3D PBR Mutations** | Mutates bouclé, full-grain Italian leather, royal velvet, Carrara marble, Nero Marquina, Nordic oak, and smoked glass at 60fps. |
| **Dynamic Lighting Presets** | Instant atmospheric shifts: *Golden Hour*, *Bright Daylight*, *Moody Night*, and *Cyberpunk Neon*. |
| **3D Audio-Reactive Ripples** | Holographic core and 3D floor acoustic ripples reacting dynamically to microphone and agent voice amplitude. |
| **High-Res Snapshot Export** | Built-in WebGL canvas capture to export 4K PNG renders of completed room designs. |

---

## 🛠️ Voice Agent Tool Calling Schema

EchoForm registers 4 client-side execution tools with AssemblyAI:

```json
[
  {
    "type": "function",
    "name": "update_furniture",
    "description": "Change furniture material, color, or shape in the 3D room",
    "parameters": {
      "type": "object",
      "properties": {
        "category": { "type": "string", "enum": ["sofa", "coffee_table", "table", "rug"] },
        "material": { "type": "string" },
        "color": { "type": "string" },
        "shape": { "type": "string", "enum": ["oval", "rectangle"] }
      },
      "required": ["category"]
    }
  },
  {
    "type": "function",
    "name": "adjust_lighting",
    "description": "Change the atmospheric lighting and time of day in the 3D room",
    "parameters": {
      "type": "object",
      "properties": {
        "preset": { "type": "string", "enum": ["golden_hour", "daylight", "moody_night", "cyberpunk_neon"] }
      },
      "required": ["preset"]
    }
  },
  {
    "type": "function",
    "name": "set_camera_view",
    "description": "Transition the 3D camera viewpoint",
    "parameters": {
      "type": "object",
      "properties": {
        "view": { "type": "string", "enum": ["overview", "sofa_focus", "overhead_plan", "window_view"] }
      },
      "required": ["view"]
    }
  },
  {
    "type": "function",
    "name": "toggle_fixture",
    "description": "Toggle lamps or plants in the room",
    "parameters": {
      "type": "object",
      "properties": {
        "fixture": { "type": "string", "enum": ["floor_lamp", "plant"] },
        "state": { "type": "string", "enum": ["on", "off", "toggle"] }
      },
      "required": ["fixture"]
    }
  }
]
```

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/toufiqfarhan0/echoform-3d.git
cd echoform-3d
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and add your AssemblyAI API key:
```env
# AssemblyAI API Key (Free credits via hackathon link)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# Optional: Supabase Auth (If omitted, 1-Click Demo Account provides full access)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🏆 Hackathon Alignment

- **Voice-Native Innovation**: Not just transcription—the agent autonomously controls a full 3D WebGL environment via structured tool calling.
- **Enterprise UX**: Zero-friction demo evaluation for judges, multi-workspace architecture, and persistent conversation history.
- **Sub-Second Latency**: 24kHz linear PCM streaming with barge-in support and instant PBR shader updates.
- **Architectural Security**: Follows standard serverless token delegation—API keys remain protected server-side.

---

## 📄 License
MIT License © 2026 Toufiq Farhan. Built with ❤️ for the AssemblyAI Voice Agent Hackathon.
