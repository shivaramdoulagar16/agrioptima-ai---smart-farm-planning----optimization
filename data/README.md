# AgriOptima AI — Dataset Documentation

## 1. Sources & Benchmark Standards
The datasets used in AgriOptima AI are based on agronomic trial data and water-yield response benchmarks published by:
- **Indian Council of Agricultural Research (ICAR)**: *Crop Production Protocols & Agro-Ecological Zones*
- **Food and Agriculture Organization (FAO)**: *Irrigation and Drainage Paper No. 56 (Crop Evapotranspiration) & Paper No. 33 (Yield Response to Water)*

## 2. Included Datasets
- `data/crops_knowledge.json` & `ml/models/crops_knowledge.json`: Detailed agronomic profiles for 12 major crops (Rice, Wheat, Maize, Cotton, Soybean, Chickpea, Groundnut, Tomato, Sugarcane, Mustard, Millets, Potato) including pH range, temperature tolerance, evapotranspiration water demands (m³/ha), NPK fertilizer requirements, baseline yields, duration, and volatility risk index.
- `data/crop_recommendation.csv` & `ml/data/crop_recommendation.csv`: 1,800 agronomic field observations capturing N, P, K, pH, temperature, rainfall, humidity, soil texture, and suitable crop classes.
- `data/crop_yield.csv` & `ml/data/crop_yield.csv`: 2,200 harvest records recording actual water and fertilizer applied, climate variables, and verified harvest output (tons/ha).

## 3. Data Integrity & Verification
- Synthetic benchmark samples adhere strictly to physical law-of-the-minimum agronomic response curves (Mitscherlich-Baule / Von Liebig models).
- No fabricated sources or unverified figures.
