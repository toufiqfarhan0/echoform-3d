# 🏛️ EchoForm 3D
### Voice-Orchestrated 3D Spatial Staging Studio

> **"Speak your space into existence."**  
> *Built for the AssemblyAI Voice Agent Hackathon on lablab.ai (Sep 2026).*

[![AssemblyAI Voice Agent API](https://img.shields.io/badge/AssemblyAI-Voice%20Agent%20API-10b981.svg)](https://www.assemblyai.com/products/voice-agent-api)
[![Groq Cloud](https://img.shields.io/badge/Groq-Llama%203.3%2070B%20(BYO--LLM)-f59e0b.svg)](https://groq.com)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%20Canvas-06b6d4.svg)](https://threejs.org)
[![React Three Fiber](https://img.shields.io/badge/R3F-React%20Three%20Fiber-8b5cf6.svg)](https://docs.pmnd.rs/react-three-fiber)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 💡 Overview

**EchoForm 3D** is an autonomous, conversational interior staging studio that lets architects, real estate developers, and homeowners style and configure living spaces in real time purely using natural voice.

Instead of navigating complex CAD menus or slow dropdowns, users simply speak:
- *"Echo, set the room to golden hour sunset and dim the floor lamp."*
- *"Change the 3-seater sofa to Italian saddle leather and replace the table with Nero Marquina black marble."*
- *"Zoom into the seating area and switch the rug to terracotta earth."*

Within milliseconds, the **AssemblyAI Voice Agent API** transcribes the speech, passes context to an ultra-low latency **Groq BYO-LLM (Llama-3.3-70B)** brain, dispatches real-time 3D tool calls, and replies aloud in a natural, fluid voice while the **Three.js** canvas physically mutates textures, meshes, and lighting.

---

## 🏗️ Architecture

```
                                  [User's Microphone]
                                           │
                                           ▼ (24kHz 16-bit PCM Stream)
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                        AssemblyAI Voice Agent API                                │
 │                     (wss://agents.assemblyai.com/v1/ws)                          │
 │                                                                                  │
 │  • Speech-to-Text powered by Universal-3 Pro                                     │
 │  • Neural Turn-Taking & Voice Activity Detection (VAD)                           │
 │  • Barge-In / Natural Interruption Handling                                      │
 │  • Native Voice Audio Output (24kHz TTS Streaming)                               │
 └────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                         AssemblyAI calls │ (OpenAI-compatible chat completions)
                         BYO-LLM Endpoint │ base_url: https://api.groq.com/openai/v1
                                          ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                        Groq Cloud API (100% Free Tier)                           │
 │                         Model: llama-3.3-70b-versatile                           │
 │                                                                                  │
 │  • 30 Requests / Minute (Bypasses the 2 req/min Gateway limit!)                  │
 │  • ~150ms Time-To-First-Token (>300 tokens/sec)                                  │
 │  • Native JSON Schema Tool Calling (`update_furniture`, `adjust_lighting`, etc.) │
 └────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                      Tool Call Events &  │
                      Streaming Audio     │
                                          ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                    EchoForm 3D Client (React + Three.js)                         │
 │                                                                                  │
 │  1. Tool Dispatcher updates Zustand Room Store in real time                      │
 │  2. Three.js / R3F swaps PBR materials, furniture geometries, & lighting         │
 │  3. 3D Audio-Reactive EchoCore holographic orb pulses to voice volume            │
 │  4. Web Audio API plays continuous voice playback with instant barge-in flush    │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

1. **End-to-End Voice Agent Pipeline**:
   - Single persistent WebSocket connection to `wss://agents.assemblyai.com/v1/ws`.
   - Full-duplex conversational turn-taking with neural Voice Activity Detection.
   - Natural interruption (barge-in): Start talking while the agent is speaking, and it immediately cuts off its speech to listen.
2. **Bring Your Own LLM (Groq Llama-3.3-70B)**:
   - Configured via `session.update` with an OpenAI-compatible endpoint.
   - Eliminates rate-limit bottlenecks with 30 RPM and ~150ms latency.
3. **Photorealistic 3D Living Room Architecture**:
   - Hardwood oak plank flooring with soft real-time contact shadows.
   - Floor-to-ceiling panoramic window overlooking a dynamic skyline that reacts to the time of day.
   - Modular 3-seater sofa (Bouclé, Italian Leather, Royal Velvet, Charcoal, Emerald).
   - Architectural coffee table (Carrara White Marble, Nero Marquina, Nordic Oak, American Walnut, Smoked Glass, Oval/Rectangle).
   - Castiglioni arched floor lamp with real-time `PointLight` illumination.
   - Ceramic Monstera plant, layered area rug, and Bauhaus framed wall art.
4. **Spatial 3D Audio-Reactive EchoCore**:
   - Floating gyroscopic holographic orb that pulses, rotates, and glows in response to audio frequencies.
   - Drifting window sunbeams and atmospheric light motes.
5. **High-Res Snapshot Exporter**:
   - 1-click **Snapshot** button captures high-resolution WebGL renders with stamped branding and date metadata.
6. **Interactive Quick-Trigger Simulator**:
   - Instant 1-click voice prompt buttons allow full presentation and testing even without a physical microphone.

---

## 🛠️ Tool Calling Schema

The agent is equipped with native JSON Schema tools:

| Tool Name | Parameters | Action |
|---|---|---|
| `update_furniture` | `category`, `material`, `color`, `shape` | Swaps sofa upholstery, coffee table surfaces, shapes, or area rugs. |
| `adjust_lighting` | `preset` (`golden_hour`, `daylight`, `moody_night`, `cyberpunk_neon`) | Shifts sunlight angles, ambient warmth, window glow, and sky colors. |
| `set_camera_view` | `view` (`overview`, `sofa_focus`, `overhead_plan`, `window_view`) | Interpolates the 3D camera smoothly using cinematic lerp damping. |
| `toggle_fixture` | `fixture` (`floor_lamp`, `plant`), `state` (`on`, `off`, `toggle`) | Toggles physical fixtures and dynamic lighting sources. |

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/toufiqfarhan0/echoform-3d.git
cd echoform-3d
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Setup Environment Variables (Optional)
Create a `.env` file based on `.env.example`:
```env
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```
*(Or simply leave it empty and enter your keys directly in the on-screen **API Keys** modal!)*

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 🏆 Hackathon Judging Criteria Alignment

| Criteria (25% each) | How EchoForm 3D Delivers |
|---|---|
| **Application of Technology** | End-to-end integration of AssemblyAI Voice Agent API with streaming 24kHz PCM, token minting, BYO-LLM hook, neural turn-taking, and bidirectional tool-calling. |
| **Presentation** | Futuristic dark glassmorphic spatial HUD, floating audio-reactive 3D EchoCore orb, atmospheric sunbeams, and instant snapshot studio. |
| **Business Value** | Solves high-cost friction in real estate staging, architectural client presentations, and e-commerce 3D room planning. |
| **Originality** | Blends WebGL spatial computing with real-time conversational voice agents—moving far beyond simple text bots into immersive 3D world manipulation. |

---

## 📜 License
MIT License. Built for the **AssemblyAI Voice Agent Hackathon** hosted by **lablab.ai**.
