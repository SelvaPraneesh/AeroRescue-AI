# 🚁 AeroRescue-AI
**Multimodal AI Hackathon 2026 Submission | Track B: Mapping Flood Damage from Space**

AeroRescue-AI is a multimodal intelligence dashboard designed to triage catastrophic flood events when traditional infrastructure and communication lines fail. 

By applying Generative and Agentic AI to Earth observation data, this system processes complex, multi-layered inputs (optical satellite imagery, SAR radar returns, and topographical maps) to generate structured, actionable rescue logistics for emergency dispatchers.

## 🚀 Features
* **Multimodal Data Processing:** Uses a custom "Antigravity Prompt" to force an LLM to reason across visual satellite data, text weather reports, and geospatial coordinates.
* **JSON Tactical Payload:** The AI strictly outputs a structured JSON file containing severed routes, isolated communities, and prioritized extraction zones.
* **Dynamic Routing Dashboard:** A glassmorphism-styled command center that consumes the AI's JSON to visualize the crisis zone.
* **Interactive Triage:** Features a real-time water-level simulator and asset-specific routing toggles (Helicopter vs. Shallow-Draft Boat) to determine viable rescue paths dynamically.

## 🛠️ Tech Stack
* **AI/Logic:** Prompt Engineering (Multimodal LLM context generation & constraint forcing)
* **Frontend:** HTML5 Canvas, CSS3 (Glassmorphism), Vanilla JavaScript
* **Mapping:** Custom coordinate-to-canvas rendering engine

## 📂 Project Structure
* `index.html` - The command center UI.
* `style.css` - Custom styling, animations, and responsive grid layout.
* `app.js` - Canvas rendering engine and dynamic routing logic.
* `system_prompt.md` - The exact LLM instructions used to process satellite data and generate the JSON payload.

## 🔗 Live Demo
[Insert your GitHub Pages or Vercel link here once deployed]
