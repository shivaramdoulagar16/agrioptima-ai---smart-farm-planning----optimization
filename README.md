# 🌾 AgriOptima AI: From Crop Prediction to Optimized Farm Planning

> **Next-Generation Agricultural Decision-Support System** combining Agronomic Machine Learning, Constrained Linear Programming (Simplex LP), Multi-Resource What-If Simulation, and Explainable AI.

---

## 🚀 Core USP: PREDICT → OPTIMIZE → SIMULATE → EXPLAIN

Traditional agriculture platforms ask: *"Which single crop should I grow?"*  
**AgriOptima AI** answers: *"Which combination of crops should I cultivate, how should I allocate my limited land, water, fertilizer, and working capital, what yield and financial profit can I expect, and what happens if drought or price volatility strikes?"*

---

## 🔑 Key Features

1. **🌾 AI Crop Suitability Classifier**:
   - Random Forest & Gaussian agronomic ensembles evaluating N, P, K, pH, temperature, rainfall, humidity, soil texture, and cultivation season.
   - **Trained Accuracy: 80.83% | F1 Score: 0.8065** across 12 ICAR/FAO benchmark crops.

2. **📈 Crop Yield Regressor**:
   - Non-linear Mitscherlich-Baule / Von Liebig harvest prediction based on available water, fertilizer, pH, and climate variables.
   - **Trained Performance: R² = 0.9309 | MAE = 2.20 tons/ha**.

3. **⚙️ Constrained Mathematical Optimization (Simplex LP)**:
   - Solves for exact acreage allocations: $x_i = \text{hectares for crop } i$.
   - Strictly enforces four physical resource bounds:
     - $\sum \text{area}_i \le \text{Total Land Area}$
     - $\sum \text{water}_i \times \text{area}_i \le \text{Available Water Reserve}$
     - $\sum \text{fert}_i \times \text{area}_i \le \text{Available Fertilizer}$
     - $\sum \text{cost}_i \times \text{area}_i \le \text{Working Capital Budget}$
   - Automated **Infeasibility Diagnostics**: Detects resource bottlenecks and delivers actionable remedies.

4. **⚖️ Four Strategic Optimization Modes**:
   - **Balanced**: Harmonious blend of profit maximization, multi-crop diversification, and resource preservation.
   - **Profit Focus**: Aggressive ROI maximization for high-value commercial crops.
   - **Water Saver**: Drought-resilient mode minimizing water intensity per dollar earned.
   - **Risk Aware**: Defensive allocation favoring essential domestic staples.

5. **🔮 What-If Multi-Resource Scenario Simulator (Main Wow Feature)**:
   - Interactive perturbation sliders: Water (-60% to +50%), Budget, Land, Fertilizer, and Market Prices.
   - 6 One-click benchmark scenarios: *Water Shortage (-40%)*, *Budget Crunch (-30%)*, *Severe Drought (-50%)*, *Fertilizer Rationing (-35%)*, *Price Boom (+25%)*, *Acreage Expansion (+50%)*.
   - **BEFORE vs AFTER** comparison with live delta metrics ($\Delta \text{Profit}$, $\Delta \text{Water}$, $\Delta \text{Yield}$, $\Delta \text{Risk}$) and crop mix shift analysis.

6. **🗺️ Digital Farm Spatial 2D Parcel Map**:
   - Responsive visual partitioning of acreage into color-coded crop parcels with live yield, irrigation flow, and fallow reserve indicators.

7. **💡 Explainable AI (XAI)**:
   - **Farmer Explanation**: Plain-language pros, cons, and agronomic rationale.
   - **Technical Breakdown**: Quantitative sub-indices for pH curves, thermal windows, and evapotranspiration matching.

8. **📥 Executive PDF Farm Report**:
   - Downloadable, client-side generated multi-page farm decision report with agronomic recommendations, allocation tables, financial summaries, and verification stamps.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, Recharts
- **Backend**: Express.js, TypeScript (`server.ts`), JWT Authentication, Bcrypt password hashing
- **Mathematical Optimization**: Simplex Linear Programming Engine (`javascript-lp-solver`)
- **Machine Learning**: Python 3.10, Random Forest / Gaussian Ensembles, Non-Linear Mitscherlich Regressors (`ml/`)
- **Reporting**: jsPDF client-side PDF engine
- **API Documentation**: OpenAPI / Swagger UI at `/docs`

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npx tsx tests/test_pipeline.ts

# 3. Train & evaluate Python ML models
python3 evaluate_models.py

# 4. Start development server
npm run dev
# Live at http://localhost:3000
```
