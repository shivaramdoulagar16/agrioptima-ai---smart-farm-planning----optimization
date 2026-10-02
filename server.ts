/**
 * AgriOptima AI - Primary Application & API Server
 * Hosts all REST API endpoints, ML inference, mathematical LP optimization,
 * What-If scenario simulations, and mounts Vite for the frontend.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db, Farm } from './src/server/db.ts';
import { runOptimization, FarmConstraints, CropData } from './src/server/optimizer.ts';
import { evaluateCropSuitability, predictCropYield, SoilInput, WeatherInput, ResourceInput } from './src/server/mlInference.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'agrioptima_super_secret_jwt_key_2026';

app.use(express.json());

// CORS & Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Auth Middleware (extracts user if present, allows demo fallback)
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Fallback to demo user for seamless UX if no token provided
    req.user = {
      id: 'usr_demo_01',
      email: 'farmer@agrioptima.ai',
      name: 'Ramesh Patel'
    };
    next();
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      req.user = {
        id: 'usr_demo_01',
        email: 'farmer@agrioptima.ai',
        name: 'Ramesh Patel'
      };
    } else {
      req.user = decodedUser as any;
    }
    next();
  });
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AgriOptima AI Decision-Support Platform',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    ml_models: {
      crop_classifier: { status: 'ONLINE', accuracy: '80.8%', classes: 12 },
      yield_regressor: { status: 'ONLINE', r2_score: '0.9309', mae_tons: '2.20' }
    },
    optimization_engine: { status: 'ONLINE', algorithm: 'Simplex Linear Programming (Primal/Dual)' }
  });
});

// 2. Auth: Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    const user = db.createUser(email, password, name);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// 3. Auth: Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required.' });
      return;
    }
    const user = db.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// 4. Auth: Me
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// 5. Crops Knowledge Base
app.get('/api/crops', (req, res) => {
  const crops = db.getCrops();
  res.json({
    count: crops.length,
    crops,
    source: 'ICAR / FAO Agronomic Research Standards',
    version: '2026.1'
  });
});

// 6. Farms: List
app.get('/api/farms', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || 'usr_demo_01';
  const farms = db.getFarmsByUser(userId);
  res.json(farms);
});

// 7. Farms: Get Single
app.get('/api/farms/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
  const farm = db.getFarmById(req.params.id);
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  res.json(farm);
});

// 8. Farms: Create
app.post('/api/farms', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || 'usr_demo_01';
    const { name, location, land_area_ha, season, soil, resources, weather } = req.body;

    if (!name || !land_area_ha || !soil || !resources || !weather) {
      res.status(400).json({ error: 'Missing required farm input parameters.' });
      return;
    }

    const farm = db.createFarm(userId, {
      name,
      location: location || 'Agricultural Zone',
      land_area_ha: parseFloat(land_area_ha),
      season: season || 'Kharif',
      soil: {
        soil_type: soil.soil_type || 'Loam',
        pH: parseFloat(soil.pH) || 6.5,
        N: parseFloat(soil.N) || 120,
        P: parseFloat(soil.P) || 40,
        K: parseFloat(soil.K) || 45,
        organic_matter: soil.organic_matter ? parseFloat(soil.organic_matter) : 1.5
      },
      resources: {
        water_m3: parseFloat(resources.water_m3) || 50000,
        fertilizer_kg: parseFloat(resources.fertilizer_kg) || 1500,
        budget_usd: parseFloat(resources.budget_usd) || 8000
      },
      weather: {
        temperature: parseFloat(weather.temperature) || 26.0,
        rainfall: parseFloat(weather.rainfall) || 650,
        humidity: parseFloat(weather.humidity) || 65
      }
    });

    res.status(201).json(farm);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create farm.' });
  }
});

// 9. Farms: Update
app.put('/api/farms/:id', authenticateToken, (req, res) => {
  const updated = db.updateFarm(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  res.json(updated);
});

// 10. Farms: Delete
app.delete('/api/farms/:id', authenticateToken, (req, res) => {
  const deleted = db.deleteFarm(req.params.id);
  res.json({ success: deleted });
});

// 11. AI Analysis (Complete Pipeline: Recommendations + Yield + Risk + Explanation)
app.post('/api/analyze', (req, res) => {
  try {
    const { soil, weather, resources, season } = req.body;
    if (!soil || !weather || !resources) {
      res.status(400).json({ error: 'Soil, weather, and resource inputs are required.' });
      return;
    }

    const crops = db.getCrops();
    const soilInput: SoilInput = {
      soil_type: soil.soil_type || 'Loam',
      pH: parseFloat(soil.pH) || 6.5,
      N: parseFloat(soil.N) || 120,
      P: parseFloat(soil.P) || 40,
      K: parseFloat(soil.K) || 40,
      organic_matter: soil.organic_matter ? parseFloat(soil.organic_matter) : 1.5
    };
    const weatherInput: WeatherInput = {
      temperature: parseFloat(weather.temperature) || 26.0,
      rainfall: parseFloat(weather.rainfall) || 600,
      humidity: parseFloat(weather.humidity) || 65
    };
    const resourceInput: ResourceInput = {
      water_m3: parseFloat(resources.water_m3) || 50000,
      fertilizer_kg: parseFloat(resources.fertilizer_kg) || 1500,
      budget_usd: parseFloat(resources.budget_usd) || 8000,
      land_ha: parseFloat(resources.land_ha) || 10
    };

    const recommendations = crops.map(crop =>
      evaluateCropSuitability(crop, soilInput, weatherInput, resourceInput, season || 'Kharif')
    );

    // Sort descending by suitability score
    recommendations.sort((a, b) => b.suitability_score - a.suitability_score);

    // Composite Farm Risk Assessment
    const waterStressRatio = (resourceInput.water_m3 / resourceInput.land_ha) / 6000;
    const weatherDeviation = Math.abs(weatherInput.temperature - 26) / 10;
    const riskFactor = (1 / Math.max(0.4, waterStressRatio)) * 0.4 + weatherDeviation * 0.3;
    const overallRiskLevel = riskFactor > 0.85 ? 'High' : riskFactor > 0.5 ? 'Medium' : 'Low';

    res.json({
      analyzed_at: new Date().toISOString(),
      model_version: 'AgriOptima Ensemble ML v1.2',
      input_summary: { soil: soilInput, weather: weatherInput, resources: resourceInput, season },
      recommendations,
      top_recommendations: recommendations.slice(0, 4),
      farm_risk: {
        level: overallRiskLevel,
        score: Math.min(1.0, Math.round(riskFactor * 100) / 100),
        factors: [
          waterStressRatio < 0.8 ? 'Water deficit risk present for high-water crops' : 'Adequate irrigation reserves',
          weatherInput.rainfall < 400 ? 'Low rainfall creates dependence on artificial irrigation' : 'Favorable rainfall support',
          soilInput.pH < 5.8 || soilInput.pH > 7.8 ? 'Soil pH requires buffering for certain sensitive crops' : 'Optimal soil reaction pH'
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Analysis failed.' });
  }
});

// 12. Recommendations endpoint (alias/direct)
app.post('/api/recommendations', (req, res) => {
  // Delegates to analyze logic
  const { soil, weather, resources, season } = req.body;
  const crops = db.getCrops();
  const recs = crops.map(c =>
    evaluateCropSuitability(c, soil, weather, resources, season || 'Kharif')
  ).sort((a, b) => b.suitability_score - a.suitability_score);
  res.json({ recommendations: recs });
});

// 13. Yield Prediction endpoint
app.post('/api/yield-prediction', (req, res) => {
  const { crop_id, soil, weather, resources } = req.body;
  const crop = db.getCropById(crop_id);
  if (!crop) {
    res.status(404).json({ error: 'Crop not found.' });
    return;
  }
  const predicted = predictCropYield(crop, soil, weather, resources);
  res.json({
    crop_id: crop.id,
    crop_name: crop.name,
    predicted_yield_tons_ha: predicted,
    expected_revenue_per_ha: Math.round(predicted * crop.market_price_ton),
    cultivation_cost_per_ha: crop.cost_per_ha,
    net_profit_per_ha: Math.round(predicted * crop.market_price_ton) - crop.cost_per_ha
  });
});

// 14. Real Mathematical Optimization Engine
app.post('/api/optimize', (req, res) => {
  try {
    const {
      total_land_ha,
      total_water_m3,
      total_fertilizer_kg,
      total_budget_usd,
      strategy = 'balanced',
      selected_crops
    } = req.body;

    if (!total_land_ha || !total_water_m3 || !total_budget_usd) {
      res.status(400).json({ error: 'Land, water, and budget constraints are required.' });
      return;
    }

    const crops = db.getCrops();
    const constraints: FarmConstraints = {
      total_land_ha: parseFloat(total_land_ha),
      total_water_m3: parseFloat(total_water_m3),
      total_fertilizer_kg: parseFloat(total_fertilizer_kg) || 2000,
      total_budget_usd: parseFloat(total_budget_usd),
      strategy: strategy as any,
      selected_crops: selected_crops && selected_crops.length > 0 ? selected_crops : undefined
    };

    const result = runOptimization(crops, constraints);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Optimization failed.' });
  }
});

// 15. What-If Scenario Simulator
app.post('/api/scenario', (req, res) => {
  try {
    const {
      baseline_constraints,
      scenario_modifiers, // e.g. { water_pct: -40, budget_pct: -20, rainfall_pct: -30, price_pct: 10 }
      selected_crops
    } = req.body;

    if (!baseline_constraints) {
      res.status(400).json({ error: 'Baseline constraints required for scenario simulation.' });
      return;
    }

    const crops = db.getCrops();

    // 1. Run Baseline Optimization
    const baselineConstraints: FarmConstraints = {
      total_land_ha: parseFloat(baseline_constraints.total_land_ha),
      total_water_m3: parseFloat(baseline_constraints.total_water_m3),
      total_fertilizer_kg: parseFloat(baseline_constraints.total_fertilizer_kg || 2000),
      total_budget_usd: parseFloat(baseline_constraints.total_budget_usd),
      strategy: baseline_constraints.strategy || 'balanced',
      selected_crops
    };
    const baselineResult = runOptimization(crops, baselineConstraints);

    // 2. Apply scenario modifications
    const waterFactor = 1 + ((scenario_modifiers?.water_pct || 0) / 100);
    const budgetFactor = 1 + ((scenario_modifiers?.budget_pct || 0) / 100);
    const landFactor = 1 + ((scenario_modifiers?.land_pct || 0) / 100);
    const fertFactor = 1 + ((scenario_modifiers?.fert_pct || 0) / 100);
    const priceFactor = 1 + ((scenario_modifiers?.price_pct || 0) / 100);

    // Modulate crop prices if price modifier active
    const simulatedCrops = crops.map(c => ({
      ...c,
      market_price_ton: Math.round(c.market_price_ton * priceFactor)
    }));

    const simulatedConstraints: FarmConstraints = {
      total_land_ha: Math.max(0.5, Math.round(baselineConstraints.total_land_ha * landFactor * 10) / 10),
      total_water_m3: Math.max(500, Math.round(baselineConstraints.total_water_m3 * waterFactor)),
      total_fertilizer_kg: Math.max(50, Math.round(baselineConstraints.total_fertilizer_kg * fertFactor)),
      total_budget_usd: Math.max(500, Math.round(baselineConstraints.total_budget_usd * budgetFactor)),
      strategy: scenario_modifiers?.strategy || baselineConstraints.strategy,
      selected_crops
    };

    const scenarioResult = runOptimization(simulatedCrops, simulatedConstraints);

    // Calculate Before vs After deltas
    const deltaProfit = scenarioResult.summary.total_profit - baselineResult.summary.total_profit;
    const deltaProfitPct = baselineResult.summary.total_profit > 0
      ? Math.round((deltaProfit / baselineResult.summary.total_profit) * 1000) / 10
      : 0;

    const deltaWater = scenarioResult.summary.used_water_m3 - baselineResult.summary.used_water_m3;
    const deltaYield = scenarioResult.summary.expected_production_tons - baselineResult.summary.expected_production_tons;

    // Shift in crop allocations (e.g. "Rice decreased by 3.2 ha, Chickpea increased by 3.0 ha")
    const allocationShifts: string[] = [];
    const allCropIds = new Set([
      ...baselineResult.allocations.map(a => a.crop_id),
      ...scenarioResult.allocations.map(a => a.crop_id)
    ]);

    for (const cid of allCropIds) {
      const bAlloc = baselineResult.allocations.find(a => a.crop_id === cid)?.allocated_ha || 0;
      const sAlloc = scenarioResult.allocations.find(a => a.crop_id === cid)?.allocated_ha || 0;
      const cropName = crops.find(c => c.id === cid)?.name || cid;
      const diff = Math.round((sAlloc - bAlloc) * 100) / 100;
      if (Math.abs(diff) >= 0.1) {
        allocationShifts.push(`${cropName}: ${diff > 0 ? '+' : ''}${diff} ha (${bAlloc} ha → ${sAlloc} ha)`);
      }
    }

    res.json({
      scenario_applied: scenario_modifiers,
      baseline: baselineResult,
      scenario: scenarioResult,
      delta: {
        profit: deltaProfit,
        profit_pct: deltaProfitPct,
        water_used_m3: deltaWater,
        yield_tons: Math.round(deltaYield * 10) / 10,
        risk_before: baselineResult.summary.composite_risk,
        risk_after: scenarioResult.summary.composite_risk,
        allocation_shifts: allocationShifts
      },
      insights: [
        deltaProfit < 0
          ? `Resource reduction causes a projected profit decrease of $${Math.abs(deltaProfit).toLocaleString()} (${Math.abs(deltaProfitPct)}%).`
          : `Scenario increases projected net profit by $${deltaProfit.toLocaleString()} (+${deltaProfitPct}%).`,
        allocationShifts.length > 0
          ? `Crop mix shifts toward drought/cost-resilient varieties: ${allocationShifts.slice(0, 2).join('; ')}.`
          : 'Crop allocation remains stable within existing safety margins.'
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scenario simulation failed.' });
  }
});

// 16. Farm Plans (Save & Retrieve)
app.post('/api/farm-plans', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id || 'usr_demo_01';
    const { farm_id, farm_name, plan_name, strategy, allocations, summary, scenario_note } = req.body;

    if (!farm_id || !allocations || !summary) {
      res.status(400).json({ error: 'Farm ID, allocations, and summary are required.' });
      return;
    }

    const saved = db.savePlan(userId, {
      farm_id,
      farm_name: farm_name || 'My Farm',
      plan_name: plan_name || `Optimized Plan (${strategy || 'Balanced'})`,
      strategy: strategy || 'balanced',
      allocations,
      summary,
      scenario_note
    });

    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save plan.' });
  }
});

app.get('/api/farm-plans', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || 'usr_demo_01';
  const plans = db.getPlansByUser(userId);
  res.json(plans);
});

app.delete('/api/farm-plans/:id', authenticateToken, (req, res) => {
  const deleted = db.deletePlan(req.params.id);
  res.json({ success: deleted });
});

// 17. API Docs / Swagger Interactive Reference
app.get(['/docs', '/api/docs'], (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AgriOptima AI - API Specification & Swagger Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: sans-serif; }
    .header-banner { background: #166534; color: white; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
    .header-banner h1 { margin: 0; font-size: 20px; }
    .header-banner a { color: #86efac; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header-banner">
    <h1>🌾 AgriOptima AI REST API & Decision Engine</h1>
    <a href="/">← Back to Dashboard</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        dom_id: '#swagger-ui',
        spec: {
          openapi: "3.0.0",
          info: {
            title: "AgriOptima AI API",
            description: "High-performance agronomic decision-support, linear programming farm optimization, and what-if simulation engine.",
            version: "1.2.0"
          },
          paths: {
            "/api/health": {
              get: {
                summary: "System Health & ML Engine Status",
                responses: { "200": { description: "Service is operational" } }
              }
            },
            "/api/crops": {
              get: {
                summary: "Get Agricultural Knowledge Base Crops",
                responses: { "200": { description: "List of 12 benchmark crops with agronomic parameters" } }
              }
            },
            "/api/analyze": {
              post: {
                summary: "AI Crop Suitability & Yield Prediction Analysis",
                requestBody: {
                  required: true,
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          soil: { type: "object" },
                          weather: { type: "object" },
                          resources: { type: "object" },
                          season: { type: "string" }
                        }
                      }
                    }
                  }
                },
                responses: { "200": { description: "Ranked crop suitability with farmer and technical explainability" } }
              }
            },
            "/api/optimize": {
              post: {
                summary: "Mathematical Constrained LP Resource Optimization",
                description: "Solves primal/dual Simplex algorithm for land, water, fertilizer and budget constraints under 4 strategies.",
                responses: { "200": { description: "Optimal hectare allocations and financial yields" } }
              }
            },
            "/api/scenario": {
              post: {
                summary: "What-If Scenario Simulator",
                description: "Evaluates multi-resource perturbation (e.g. -40% water, +15% prices) and outputs Before vs After deltas.",
                responses: { "200": { description: "Delta analysis and crop mix shifts" } }
              }
            },
            "/api/farms": {
              get: { summary: "List User Farms" },
              post: { summary: "Create New Farm Holding" }
            },
            "/api/farm-plans": {
              get: { summary: "List Saved Optimization Plans" },
              post: { summary: "Save Optimized Farm Plan" }
            }
          }
        }
      });
    };
  </script>
</body>
</html>
  `);
});

// Vite Middleware for Frontend Serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development mode: attach Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌾 AgriOptima AI Server running at http://0.0.0.0:${PORT}`);
    console.log(`📖 API Documentation available at http://0.0.0.0:${PORT}/docs`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
