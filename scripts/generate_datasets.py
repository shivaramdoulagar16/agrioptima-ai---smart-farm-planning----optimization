#!/usr/bin/env python3
"""
AgriOptima AI - Dataset Generator
Generates benchmark agricultural datasets for Crop Suitability and Yield Prediction
based on FAO and ICAR (Indian Council of Agricultural Research) agronomic standards.
"""

import csv
import json
import math
import os
import random

random.seed(42)

CROPS_BENCHMARK = [
    {
        "id": "rice",
        "name": "Rice (Paddy)",
        "category": "Cereal",
        "season": "Kharif",
        "soil_types": ["Clay", "Clay Loam", "Alluvial"],
        "min_ph": 5.5,
        "max_ph": 7.2,
        "optimal_ph": 6.5,
        "min_temp": 20,
        "max_temp": 38,
        "optimal_temp": 28,
        "min_rainfall": 900,
        "max_rainfall": 2500,
        "water_req_m3_ha": 11500,
        "fert_req_kg_ha": 180,  # N:100, P:40, K:40
        "cost_per_ha": 850,     # Cultivation cost USD
        "base_yield_tons_ha": 4.5,
        "market_price_ton": 320,
        "duration_days": 125,
        "risk_level": "Medium",
        "risk_score": 0.45,
        "drought_tolerance": 0.2,
        "description": "High water staple crop, optimal in heavy soils with abundant water availability."
    },
    {
        "id": "wheat",
        "name": "Wheat",
        "category": "Cereal",
        "season": "Rabi",
        "soil_types": ["Loam", "Clay Loam", "Alluvial"],
        "min_ph": 6.0,
        "max_ph": 7.8,
        "optimal_ph": 6.8,
        "min_temp": 12,
        "max_temp": 26,
        "optimal_temp": 20,
        "min_rainfall": 350,
        "max_rainfall": 900,
        "water_req_m3_ha": 4800,
        "fert_req_kg_ha": 150,
        "cost_per_ha": 620,
        "base_yield_tons_ha": 3.8,
        "market_price_ton": 290,
        "duration_days": 120,
        "risk_level": "Low",
        "risk_score": 0.25,
        "drought_tolerance": 0.6,
        "description": "Temperate cool-season grain with moderate irrigation requirement and stable market pricing."
    },
    {
        "id": "maize",
        "name": "Maize (Corn)",
        "category": "Cereal",
        "season": "All Season",
        "soil_types": ["Loam", "Sandy Loam", "Alluvial", "Red Soil"],
        "min_ph": 5.8,
        "max_ph": 7.5,
        "optimal_ph": 6.5,
        "min_temp": 18,
        "max_temp": 35,
        "optimal_temp": 26,
        "min_rainfall": 500,
        "max_rainfall": 1100,
        "water_req_m3_ha": 5500,
        "fert_req_kg_ha": 160,
        "cost_per_ha": 580,
        "base_yield_tons_ha": 5.2,
        "market_price_ton": 240,
        "duration_days": 105,
        "risk_level": "Low",
        "risk_score": 0.30,
        "drought_tolerance": 0.55,
        "description": "Versatile cereal crop with high yield potential, adaptable to diverse seasons and soils."
    },
    {
        "id": "cotton",
        "name": "Cotton",
        "category": "Fiber/Cash",
        "season": "Kharif",
        "soil_types": ["Black Soil", "Loam", "Clay Loam"],
        "min_ph": 6.0,
        "max_ph": 8.2,
        "optimal_ph": 7.2,
        "min_temp": 22,
        "max_temp": 38,
        "optimal_temp": 30,
        "min_rainfall": 600,
        "max_rainfall": 1200,
        "water_req_m3_ha": 7200,
        "fert_req_kg_ha": 140,
        "cost_per_ha": 920,
        "base_yield_tons_ha": 2.2,
        "market_price_ton": 950,
        "duration_days": 160,
        "risk_level": "High",
        "risk_score": 0.65,
        "drought_tolerance": 0.65,
        "description": "High-value commercial cash crop requiring deep fertile soil, susceptible to pest surges."
    },
    {
        "id": "soybean",
        "name": "Soybean",
        "category": "Legume/Oilseed",
        "season": "Kharif",
        "soil_types": ["Loam", "Black Soil", "Clay Loam"],
        "min_ph": 6.0,
        "max_ph": 7.5,
        "optimal_ph": 6.7,
        "min_temp": 20,
        "max_temp": 34,
        "optimal_temp": 27,
        "min_rainfall": 600,
        "max_rainfall": 1000,
        "water_req_m3_ha": 4500,
        "fert_req_kg_ha": 85,   # Fixes own atmospheric nitrogen!
        "cost_per_ha": 480,
        "base_yield_tons_ha": 2.5,
        "market_price_ton": 560,
        "duration_days": 100,
        "risk_level": "Low",
        "risk_score": 0.28,
        "drought_tolerance": 0.60,
        "description": "Nitrogen-fixing legume with low chemical fertilizer requirement and solid oilseed margins."
    },
    {
        "id": "chickpea",
        "name": "Chickpea (Gram)",
        "category": "Pulses",
        "season": "Rabi",
        "soil_types": ["Sandy Loam", "Loam", "Black Soil"],
        "min_ph": 6.0,
        "max_ph": 8.0,
        "optimal_ph": 7.0,
        "min_temp": 14,
        "max_temp": 30,
        "optimal_temp": 22,
        "min_rainfall": 300,
        "max_rainfall": 700,
        "water_req_m3_ha": 2900,
        "fert_req_kg_ha": 65,
        "cost_per_ha": 410,
        "base_yield_tons_ha": 1.8,
        "market_price_ton": 680,
        "duration_days": 110,
        "risk_level": "Low",
        "risk_score": 0.22,
        "drought_tolerance": 0.85,
        "description": "Highly drought-resilient pulse crop, perfect for drylands and water-deficit conditions."
    },
    {
        "id": "groundnut",
        "name": "Groundnut (Peanut)",
        "category": "Oilseed/Legume",
        "season": "Kharif",
        "soil_types": ["Sandy Loam", "Loam", "Red Soil"],
        "min_ph": 5.8,
        "max_ph": 7.2,
        "optimal_ph": 6.5,
        "min_temp": 22,
        "max_temp": 35,
        "optimal_temp": 28,
        "min_rainfall": 450,
        "max_rainfall": 950,
        "water_req_m3_ha": 4200,
        "fert_req_kg_ha": 95,
        "cost_per_ha": 540,
        "base_yield_tons_ha": 2.3,
        "market_price_ton": 720,
        "duration_days": 115,
        "risk_level": "Medium",
        "risk_score": 0.38,
        "drought_tolerance": 0.70,
        "description": "High-value legume favoring well-drained sandy loams with good heat tolerance."
    },
    {
        "id": "tomato",
        "name": "Tomato",
        "category": "Horticulture",
        "season": "All Season",
        "soil_types": ["Loam", "Sandy Loam", "Alluvial"],
        "min_ph": 6.0,
        "max_ph": 7.0,
        "optimal_ph": 6.5,
        "min_temp": 16,
        "max_temp": 32,
        "optimal_temp": 24,
        "min_rainfall": 400,
        "max_rainfall": 900,
        "water_req_m3_ha": 6000,
        "fert_req_kg_ha": 210,
        "cost_per_ha": 1300,
        "base_yield_tons_ha": 25.0,
        "market_price_ton": 140,
        "duration_days": 90,
        "risk_level": "High",
        "risk_score": 0.70,
        "drought_tolerance": 0.35,
        "description": "High-revenue commercial horticultural vegetable with fast cycle but price volatility."
    },
    {
        "id": "sugarcane",
        "name": "Sugarcane",
        "category": "Cash",
        "season": "All Season",
        "soil_types": ["Clay Loam", "Loam", "Alluvial"],
        "min_ph": 6.0,
        "max_ph": 7.8,
        "optimal_ph": 6.8,
        "min_temp": 22,
        "max_temp": 38,
        "optimal_temp": 30,
        "min_rainfall": 1100,
        "max_rainfall": 2200,
        "water_req_m3_ha": 18000,
        "fert_req_kg_ha": 260,
        "cost_per_ha": 1450,
        "base_yield_tons_ha": 75.0,
        "market_price_ton": 42,
        "duration_days": 330,
        "risk_level": "Medium",
        "risk_score": 0.40,
        "drought_tolerance": 0.30,
        "description": "Perennial high-tonnage cash crop with intensive irrigation and nutrient demands."
    },
    {
        "id": "mustard",
        "name": "Mustard",
        "category": "Oilseed",
        "season": "Rabi",
        "soil_types": ["Loam", "Sandy Loam", "Alluvial"],
        "min_ph": 6.0,
        "max_ph": 7.5,
        "optimal_ph": 6.8,
        "min_temp": 10,
        "max_temp": 25,
        "optimal_temp": 18,
        "min_rainfall": 250,
        "max_rainfall": 500,
        "water_req_m3_ha": 2800,
        "fert_req_kg_ha": 110,
        "cost_per_ha": 390,
        "base_yield_tons_ha": 1.7,
        "market_price_ton": 750,
        "duration_days": 105,
        "risk_level": "Low",
        "risk_score": 0.24,
        "drought_tolerance": 0.80,
        "description": "Cool-season oilseed crop requiring minimal irrigation, optimal for water-conserving rotations."
    },
    {
        "id": "millets",
        "name": "Millets (Bajra/Sorghum)",
        "category": "Coarse Grain",
        "season": "Kharif",
        "soil_types": ["Sandy Loam", "Red Soil", "Loam"],
        "min_ph": 5.5,
        "max_ph": 8.0,
        "optimal_ph": 6.7,
        "min_temp": 22,
        "max_temp": 40,
        "optimal_temp": 32,
        "min_rainfall": 250,
        "max_rainfall": 650,
        "water_req_m3_ha": 3100,
        "fert_req_kg_ha": 70,
        "cost_per_ha": 320,
        "base_yield_tons_ha": 2.1,
        "market_price_ton": 340,
        "duration_days": 85,
        "risk_level": "Low",
        "risk_score": 0.18,
        "drought_tolerance": 0.95,
        "description": "Climate-smart supercrop surviving on low rainfall, low fertilizer, and extreme temperatures."
    },
    {
        "id": "potato",
        "name": "Potato",
        "category": "Tuber/Horticulture",
        "season": "Rabi",
        "soil_types": ["Sandy Loam", "Loam"],
        "min_ph": 5.2,
        "max_ph": 6.8,
        "optimal_ph": 6.0,
        "min_temp": 14,
        "max_temp": 24,
        "optimal_temp": 19,
        "min_rainfall": 400,
        "max_rainfall": 750,
        "water_req_m3_ha": 5000,
        "fert_req_kg_ha": 220,
        "cost_per_ha": 1150,
        "base_yield_tons_ha": 22.0,
        "market_price_ton": 160,
        "duration_days": 95,
        "risk_level": "Medium",
        "risk_score": 0.42,
        "drought_tolerance": 0.40,
        "description": "High yield tuber crop responding strongly to balanced fertilization and friable loam soils."
    }
]

def generate_crop_suitability_dataset(output_path, n_samples=1800):
    """
    Generates synthetic agricultural field trial samples matching real agronomic conditions.
    Columns: N, P, K, pH, temperature, rainfall, humidity, soil_type, season, label (crop_id)
    """
    soil_choices = ["Clay", "Clay Loam", "Loam", "Sandy Loam", "Black Soil", "Alluvial", "Red Soil"]
    seasons = ["Kharif", "Rabi", "Zaid"]

    rows = []
    crops = CROPS_BENCHMARK

    for _ in range(n_samples):
        # Pick a target crop
        c = random.choice(crops)
        # Generate input features biased toward its optimal conditions with realistic variance
        ph = round(random.gauss(c["optimal_ph"], 0.4), 2)
        ph = max(4.5, min(9.0, ph))

        temp = round(random.gauss(c["optimal_temp"], 3.5), 1)
        temp = max(5.0, min(45.0, temp))

        optimal_rain = (c["min_rainfall"] + c["max_rainfall"]) / 2.0
        rainfall = round(max(100.0, random.gauss(optimal_rain, 150.0)), 1)

        humidity = round(max(20.0, min(95.0, random.gauss(65.0, 15.0))), 1)

        # N, P, K in kg/ha
        n = round(max(10.0, random.gauss(c["fert_req_kg_ha"] * 0.55, 20.0)), 1)
        p = round(max(5.0, random.gauss(c["fert_req_kg_ha"] * 0.25, 12.0)), 1)
        k = round(max(5.0, random.gauss(c["fert_req_kg_ha"] * 0.20, 10.0)), 1)

        # Soil type (90% likely to pick matching soil)
        if random.random() < 0.88:
            soil = random.choice(c["soil_types"])
        else:
            soil = random.choice(soil_choices)

        # Season
        if c["season"] == "All Season":
            season = random.choice(seasons)
        elif random.random() < 0.85:
            season = c["season"]
        else:
            season = random.choice(seasons)

        rows.append({
            "N": n,
            "P": p,
            "K": k,
            "temperature": temp,
            "humidity": humidity,
            "pH": ph,
            "rainfall": rainfall,
            "soil_type": soil,
            "season": season,
            "crop": c["id"]
        })

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["N", "P", "K", "temperature", "humidity", "pH", "rainfall", "soil_type", "season", "crop"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} crop suitability samples -> {output_path}")

def generate_yield_dataset(output_path, n_samples=2200):
    """
    Generates realistic historical crop yield records.
    Features: crop, soil_type, season, N, P, K, pH, temp, rainfall, water_applied_m3, fert_applied_kg, yield_tons_ha
    """
    crop_map = {c["id"]: c for c in CROPS_BENCHMARK}
    rows = []

    for _ in range(n_samples):
        c = random.choice(CROPS_BENCHMARK)
        soil = random.choice(c["soil_types"])
        season = c["season"] if c["season"] != "All Season" else random.choice(["Kharif", "Rabi", "Zaid"])

        ph = round(random.gauss(c["optimal_ph"], 0.4), 2)
        temp = round(random.gauss(c["optimal_temp"], 3.0), 1)
        rain = round(max(150.0, random.gauss((c["min_rainfall"] + c["max_rainfall"])/2, 120.0)), 1)

        # Water applied (ratio to requirement)
        water_ratio = random.uniform(0.6, 1.3)
        water_applied = round(c["water_req_m3_ha"] * water_ratio, 0)

        # Fertilizer applied
        fert_ratio = random.uniform(0.65, 1.35)
        fert_applied = round(c["fert_req_kg_ha"] * fert_ratio, 0)
        n = round(fert_applied * 0.55, 1)
        p = round(fert_applied * 0.25, 1)
        k = round(fert_applied * 0.20, 1)

        # Agronomic yield response curve (Mitscherlich / Von Liebig law of minimums)
        # Yield is scaled by water factor, fertilizer factor, pH factor, temp factor
        water_eff = math.exp(-0.5 * ((water_ratio - 1.0) / 0.35) ** 2) if water_ratio < 1.0 else min(1.05, 1.0 + 0.05 * (water_ratio - 1.0))
        fert_eff = 1.0 - math.exp(-2.5 * fert_ratio)
        fert_eff = min(1.08, fert_eff / (1.0 - math.exp(-2.5)))
        ph_dev = abs(ph - c["optimal_ph"])
        ph_eff = max(0.65, 1.0 - 0.2 * ph_dev)
        temp_dev = abs(temp - c["optimal_temp"])
        temp_eff = max(0.70, 1.0 - 0.04 * temp_dev)

        noise = random.gauss(1.0, 0.06)
        final_yield = c["base_yield_tons_ha"] * water_eff * fert_eff * ph_eff * temp_eff * noise
        final_yield = round(max(0.1, final_yield), 2)

        rows.append({
            "crop": c["id"],
            "soil_type": soil,
            "season": season,
            "N": n,
            "P": p,
            "K": k,
            "pH": ph,
            "temperature": temp,
            "rainfall": rain,
            "water_applied_m3": water_applied,
            "fert_applied_kg": fert_applied,
            "yield_tons_ha": final_yield
        })

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        fields = ["crop", "soil_type", "season", "N", "P", "K", "pH", "temperature", "rainfall", "water_applied_m3", "fert_applied_kg", "yield_tons_ha"]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} yield prediction samples -> {output_path}")

def save_crops_knowledge_base(output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(CROPS_BENCHMARK, f, indent=2)
    print(f"Saved crop knowledge base ({len(CROPS_BENCHMARK)} crops) -> {output_path}")

if __name__ == "__main__":
    save_crops_knowledge_base("data/crops_knowledge.json")
    save_crops_knowledge_base("ml/models/crops_knowledge.json")
    generate_crop_suitability_dataset("data/crop_recommendation.csv")
    generate_crop_suitability_dataset("ml/data/crop_recommendation.csv")
    generate_yield_dataset("data/crop_yield.csv")
    generate_yield_dataset("ml/data/crop_yield.csv")
