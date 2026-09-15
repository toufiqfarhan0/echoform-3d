<div align="center">

# 🏛️ EchoForm 3D
### Voice-Orchestrated 3D Spatial Staging Studio

**"Speak your space into existence."**  
*Built for the AssemblyAI Voice Agent Hackathon on lablab.ai (Sep 2026).*

[![AssemblyAI Voice Agent API](https://img.shields.io/badge/AssemblyAI-Voice%20Agent%20API-10b981.svg?style=for-the-badge&logo=assemblyai)](https://www.assemblyai.com/products/voice-agent-api)
[![Groq Cloud](https://img.shields.io/badge/Groq-Llama%203.3%2070B%20(BYO--LLM)-f59e0b.svg?style=for-the-badge)](https://groq.com)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL%20Canvas-06b6d4.svg?style=for-the-badge&logo=three.js)](https://threejs.org)
[![React Three Fiber](https://img.shields.io/badge/R3F-React%20Three%20Fiber-8b5cf6.svg?style=for-the-badge)](https://docs.pmnd.rs/react-three-fiber)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📖 Executive Summary

**EchoForm 3D** is a voice-orchestrated spatial interior staging application that transforms natural speech into real-time 3D architectural mutations.

Navigating complex CAD menus, sliders, and nested material panels slows down interior designers, real estate stagers, and homeowners. **EchoForm** replaces clunky UI controls with fluid, sub-second voice conversations:

> 🗣️ *"Echo, set the room to golden hour sunset, change the sofa to Italian saddle leather, and focus the camera on the seating area."*

Within **<600 milliseconds**, the voice agent understands spatial intent, triggers parallel JSON tool calls, mutates 3D models and lighting, and speaks back in a natural human voice—while soundwaves pulse across the room in living 3D.

---

## 🏗️ Technical Architecture & Pipeline

EchoForm uses AssemblyAI’s **Voice Agent API** configured with a **"Bring Your Own LLM" (BYO-LLM)** endpoint pointing to **Groq Cloud (Llama-3.3-70B)**. This bypasses the 2 req/min rate limit of free gateways while maintaining end-to-end streaming performance:

```
                                      [User's Microphone]
                                               │
                                               ▼ (24,000 Hz 16-bit Mono PCM Stream)
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                               AssemblyAI Voice Agent API                                  │
 │                            (wss://agents.assemblyai.com/v1/ws)                            │
 │                                                                                           │
 │  • Real-time Speech-to-Text powered by Universal-3 Pro                                    │
 │  • Neural Turn-Taking & Voice Activity Detection (VAD)                                    │
 │  • Barge-In / Natural Interruption Handling (clears buffer when user speaks)              │
 │  • Chunked Streaming TTS Voice Synthesis (24kHz natural voices)                           │
 └─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               │
                              AssemblyAI calls │ (OpenAI-compatible chat completions)
                              BYO-LLM Endpoint │ base_url: https://api.groq.com/openai/v1
                                               ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                              Groq Cloud API (100% Free Tier)                              │
 │                               Model: llama-3.3-70b-versatile                              │
 │                                                                                           │
 │  • 30 Requests / Minute (Bypasses free Gateway limits)                                    │
 │  • ~150ms Time-To-First-Token (>300 tokens/second)                                        │
 │  • Native JSON Schema Tool Calling (`update_furniture`, `adjust_lighting`, etc.)          │
 └─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               │
                           Tool Call Events &  │
                           Streaming Audio     │
                                               ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────┐
 │                         EchoForm 3D Web Client (React + Three.js)                         │
 │                                                                                           │
 │  1. Tool Dispatcher updates central Zustand 3D store in real time                         │
 │  2. Three.js / R3F executes real-time PBR material swaps & lighting transitions           │
 │  3. Floating 3D EchoCore orb & Floor Acoustic Ripples react to speech volume              │
 │  4. Web Audio API plays continuous voice playback with seamless buffer scheduling         │
 │  5. Floating ToolCallToast displays immediate visual feedback for executed mutations      │
 └───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Real-Time Tool Calling Schema

The agent is equipped with native JSON Schema tools executed directly on the client:

| Tool Name | Parameters | Real-World Action |
|---|---|---|
| `update_furniture` | `category`, `material`, `color`, `shape`, `cushionColor` | Swaps 3D sofa upholstery (Bouclé, Italian Leather, Royal Velvet, Emerald), coffee table surfaces (Carrara White Marble, Nero Marquina, Nordic Oak, American Walnut, Smoked Glass), shapes (Oval vs. Rectangular), or area rugs. |
| `adjust_lighting` | `preset` (`golden_hour`, `daylight`, `moody_night`, `cyberpunk_neon`) | Real-time directional sunlight angles, atmospheric sky gradients, soft ambient fill, and window area glows. |
| `set_camera_view` | `view` (`overview`, `sofa_focus`, `overhead_plan`, `window_view`) | Interpolates the camera smoothly using cinematic lerp damping. |
| `toggle_fixture` | `fixture` (`floor_lamp`, `plant`), `state` (`on`, `off`, `toggle`) | Toggles physical fixtures and dynamic lighting sources in the room. |
| `reset_room` | *none* | Restores the entire living space back to default Scandinavian luxury staging. |

---

## 🌟 Key Highlights & Innovations

- **Zero-Friction Free Tier**: Runs 100% on free-tier infrastructure. No credit card required. Free AssemblyAI hackathon credits + free Groq API key + client-side WebGL.
- **Barge-In Interruption**: Start speaking while the agent is replying, and the audio pipeline immediately flushes its buffer to listen to your correction.
- **Acoustic Soundwave Ripples**: 3D concentric sound rings expand across the floorboards in sync with vocal amplitude.
- **Holographic EchoCore**: Floating gyroscopic 3D orb that rotates, glows, and pulses to indicate agent listening, thinking, and speaking states.
- **1-Click High-Res Snapshot Studio**: Instantly exports branded 3D renders with stamped room metadata for client presentations.
- **Interactive Voice Simulators**: Quick-trigger buttons allow testing and screen-recording demos even without a physical microphone.

---

## 🚀 Getting Started (Run Locally)

### 1. Clone & Install
```bash
git clone https://github.com/toufiqfarhan0/echoform-3d.git
cd echoform-3d
npm install --legacy-peer-deps
```

### 2. Configure API Keys
You can either create a `.env` file:
```env
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
```
Or launch the app and click the **API Keys** button in the header to paste your keys directly into the secure on-screen modal!

### 3. Start the Studio
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

---

## 🏆 Hackathon Judging Criteria Alignment

| Criteria (25% each) | How EchoForm 3D Delivers |
|---|---|
| **Application of Technology** | Advanced full-duplex WebSocket integration with AssemblyAI Voice Agent API, 24kHz Base64 PCM audio pipelines, BYO-LLM Groq routing, token minting middleware, and bidirectional client-side tool calling. |
| **Presentation** | Futuristic glassmorphic HUD, floating audio-reactive 3D EchoCore orb, floor acoustic ripples, atmospheric sunbeams, and instant snapshot studio. |
| **Business Value** | Dramatically accelerates high-end architectural visualization, virtual real estate staging, and 3D e-commerce furniture customizers. |
| **Originality** | Elevates voice AI beyond simple chat text into physical 3D spatial computing—allowing users to speak physical environments into existence. |

---

## 📜 License
MIT License. Created by Toufiq Farhan for the **AssemblyAI Voice Agent Hackathon** hosted on **lablab.ai** (September 2026).
