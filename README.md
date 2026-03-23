# ArthaShala | Financial Simulation for Rural India 🌾🏦

ArthaShala is a **high-fidelity financial literacy simulation** designed to empower rural Indian users through gamified, visual-first learning. Built with **React** and **Tailwind CSS**, it features a beautiful, glassmorphic 3D village map where users make critical life decisions—from taking bank loans (KCC) to managing emergency expenses with local moneylenders.

## 🚀 Key Features
- **Visual-First Simulation:** A vibrant, interactive 3D village map designed for low-literacy users.
- **Epiphany Engine:** A silent mistake-tracking system that quantifies the "Opportunity Cost" of financial decisions (e.g., lost assets like Milch Cows or Solar Pumps).
- **Artha Chacha Guide:** An intelligent, multi-lingual guide providing context-aware financial advice.
- **Bolo Engine (Voice AI):** Integrated voice command support for hands-free interaction.
- **Multilingual Support:** Fully translated into **Hindi, Marathi, Gujarati, and Bengali**.

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite
- **Styling:** Tailwind CSS (Premium Glassmorphism)
- **State Management:** React Context API
- **Icons/Assets:** Custom 3D isometric assets and SVG icons

## 📦 Project Structure
- `/src/components`: Core UI components including the SimulationMap, QuantumCoach, and DecisionModals.
- `/src/context`: Global financial state management via `FinancialContext.jsx`.
- `/src/data`: Game content, translations, and location metadata.
- `/src/hooks`: Custom hooks for the game clock and scheme evaluation.
- `/_legacy_archive`: Contains earlier technical prototypes and data processing scripts.

## 🏃 How to Run
1. Clone the repository: `git clone https://github.com/devdash01/ArthaShala.git`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open the app at `http://localhost:5173`

---
*Built for the ArthaShala Hackathon 2026. Empowering Bharat, one decision at a time.*
