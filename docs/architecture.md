# AgriOptima AI — System Architecture

## Architecture Overview

```
                               ┌────────────────────────────────┐
                               │   Farmer Web & Mobile Client   │
                               │  (React 19 + Vite + Tailwind)  │
                               └──────────────┬─────────────────┘
                                              │ REST / JSON (JWT)
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AgriOptima Full-Stack Node/Express Engine                       │
│                                                                                        │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │   Auth & Farm API     │  │  Agronomic ML Pipeline   │  │  Simplex LP Optimizer    │ │
│  │ (/api/farms, /plans)  │  │  - Crop Suitability      │  │  - Land Constraint       │ │
│  │                       │  │  - Yield Regression      │  │  - Water Constraint      │ │
│  │                       │  │  - Transparent XAI       │  │  - Budget & Fert Bounds  │ │
│  └───────────────────────┘  └─────────────────────────┘  └──────────────────────────┘ │
│                                         │                              │               │
│                                         ▼                              ▼               │
│                        ┌──────────────────────────────────────────────────┐            │
│                        │          What-If Scenario Simulator              │            │
│                        │       (Multi-Resource Sensitivity Engine)        │            │
│                        └──────────────────────────────────────────────────┘            │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                      ┌───────────────────────┴──────────────────────┐
                      ▼                                              ▼
          ┌─────────────────────────┐                   ┌────────────────────────┐
          │  Embedded Database      │                   │  Python ML Pipelines   │
          │  (JSON / SQLite Store)  │                   │  (Training & Eval)     │
          └─────────────────────────┘                   └────────────────────────┘
```

## Core Components
1. **Frontend**: React 19 single-page application with responsive tab navigation, 7 top-level KPI cards, interactive 2D Digital Farm parcel maps, slider-based What-If simulation, and automated client-side PDF reporting.
2. **Backend**: Express REST API exposing authentication, farm CRUD, crop knowledge base, ML inference, optimization, and What-If simulation.
3. **ML Pipeline**: Random Forest & Decision Tree classification with Gaussian agronomic priors for crop suitability, coupled with non-linear Mitscherlich regression for harvest yield.
4. **Optimization Engine**: Primal/Dual Simplex Linear Programming solving exact acreage parcel allocations across 4 strategic objectives (Profit Focus, Water Saver, Balanced, Risk Aware).
5. **Explainable AI (XAI)**: Dual-layer explainability providing farmer plain-English pros/cons alongside technical agronomic sub-index scores.
