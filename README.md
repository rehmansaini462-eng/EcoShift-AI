# EcoShift AI 🌿🌐

> **AI-Powered Cradle-to-Grave Vehicle Lifecycle Assessment (LCA) & Carbon Parity Engine**  
> *Built for the AI 4 Earth Hackathon*

[![Next.js 15](https://img.shields.io/badge/Next.js-15_App_Router-black?logo=next.js)](https://nextjs.org/)
[![Google Gemini API](https://img.shields.io/badge/AI-Gemini_2.5_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌍 The Problem & Environmental Urgency: The "Tailpipe Illusion"

When consumers evaluate Electric Vehicles (EVs) against Internal Combustion Engine (ICE) petrol/diesel cars, they are often misled by **zero tailpipe emissions**. This is known as the **"Tailpipe Illusion"**.

True environmental impact requires a complete **Cradle-to-Grave Lifecycle Assessment (LCA)**:
1. **Embodied Manufacturing Carbon Penalty:** Manufacturing a Lithium-ion EV battery generates **85 kg CO2e per kWh** of capacity during mineral mining (Lithium, Nickel, Cobalt) and cell refining. A 60 kWh battery adds over **5,100 kg CO2e** upfront before the car drives its first kilometer!
2. **The Regional Grid Factor:** EVs are only as clean as the electricity grid charging them. In coal-heavy regions (e.g., India at 710 g CO2/kWh), an EV takes significantly longer to offset its manufacturing debt compared to clean-grid regions (e.g., Norway at 30 g CO2/kWh).

**EcoShift AI** eliminates greenwashing by providing a deterministic LCA calculation engine combined with Google Gemini AI to analyze true carbon parity break-even points across any vehicle model worldwide.

---

## ⚡ Core Features

- 🤖 **AI-Driven Vehicle Spec Extraction:** Powered by **Google Gemini 2.5 Flash**, users can input *any* make, model, or trim (e.g. *"Hyundai Ioniq 5 AWD"*, *"Ford F-150 Lightning"*), and Gemini instantly extracts battery size (kWh), curb weight (kg), efficiency, and manufacturing footprint.
- 📐 **Deterministic LCA Engine:** Math-backed trajectory generator calculating cumulative carbon year-by-year from Year 0 to Year 20.
- 🎯 **Exact Linear Break-Even Intercept:** Solves the exact point where an EV's lower operational footprint crosses and offsets its higher initial manufacturing carbon debt.
- 📊 **Dynamic Recharts Data Visualizations:**
  - **Line Trajectory Chart:** Visualizing cumulative carbon lines with interactive break-even reference pins.
  - **Stacked Bar Chart:** Comparing embodied manufacturing carbon vs lifetime operational driving carbon.
- ⚡ **Regional Electricity Grid Controls:** Instant preset simulation across global grids (India 710g, US 370g, EU 230g, California 210g, Renewable 30g) and custom g CO2/kWh sliders.
- 🧠 **AI Green Climate Advisor:** One-click executive climate verdict providing grid sensitivity analysis and tailored buyer recommendations.

---

## 📐 Mathematical Formulation

### 1. Upfront Manufacturing Footprint ($CO2_{\text{mfg}}$)

$$CO2_{\text{mfg}} = \text{Baseline Chassis Manufacturing (kg)} + (\text{Battery Capacity (kWh)} \times 85\text{ kg CO2e/kWh})$$

### 2. Annual Operational Driving Footprint ($CO2_{\text{annual}}$)

$$\text{For ICE (Petrol/Diesel): } CO2_{\text{annual}} = \left( \frac{\text{Annual km}}{\text{Fuel Efficiency (km/L)}} \right) \times \text{Fuel Carbon Intensity (kg CO2/L)}$$

$$\text{For BEV (Electric): } CO2_{\text{annual}} = \left( \frac{\text{Annual km}}{\text{Efficiency (km/kWh)}} \right) \times \left( \frac{\text{Grid Intensity (g CO2/kWh)}}{1000} \right)$$

*Where Petrol = 2.31 kg CO2/L and Diesel = 2.68 kg CO2/L.*

### 3. Break-Even Mileage ($km_{\text{parity}}$)

$$km_{\text{parity}} = \frac{CO2_{\text{mfg, EV}} - CO2_{\text{mfg, ICE}}}{CO2_{\text{ops/km, ICE}} - CO2_{\text{ops/km, EV}}}$$

---

## 🏗️ Technical Architecture & Data Pipeline

```
[ User Input / Query ] ──► [ Gemini 2.5 Flash API Route ]
                                      │ (Structured JSON Schema)
                                      ▼
[ VehicleSpec Object ] ──► [ LCA Deterministic Engine ] ──► [ ISO 14040 Calculations ]
                                      │
                                      ▼
                     [ Real-Time State Reactive Store ]
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
[ Metric Summary Cards ]   [ Recharts Visualizer ]   [ AI Green Advisor Route ]
 (Parity, Trees, Delta)    (Line & Stacked Bar)     (Executive Synthesis)
```

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | React Server & Client Components |
| **Language** | TypeScript 5.0 | Strict type safety across LCA domains |
| **AI / LLM** | Google Gemini 2.5 Flash | Vehicle spec extraction & synthesis via `@google/genai` |
| **Styling** | Tailwind CSS v4 | Dark mode glassmorphism theme |
| **Data Viz** | Recharts | Dynamic responsive line & bar charts |
| **Icons** | Lucide React | Modern minimalist icons |
| **Deployment** | Vercel | Production edge serverless hosting |

---

## 🚀 Local Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/rehmansaini462-eng/EcoShift-AI.git
cd EcoShift-AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_google_gemini_api_key_here
```
*(Note: If no key is supplied, EcoShift AI automatically uses intelligent fallback estimates so the app remains fully functional).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
