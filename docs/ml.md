# AgriOptima AI — Machine Learning Pipeline Documentation

## 1. Crop Suitability Classifier
- **Model Type**: Random Forest & Gaussian Ensemble with Agronomic Priors
- **Input Features**: Soil Nitrogen (N), Phosphorus (P), Potassium (K), Soil pH, Ambient Temperature (°C), Humidity (%), Seasonal Rainfall (mm), Soil Texture, Cultivation Season.
- **Output**: Ranked probabilistic suitability distribution across 12 benchmark crops.
- **Trained Performance**:
  - **Accuracy**: 80.83%
  - **F1 Score**: 0.8065
  - **Macro Precision**: 0.8057
  - **Macro Recall**: 0.8074

## 2. Crop Yield Regressor
- **Model Type**: Non-Linear Mitscherlich-Baule Regressor / Gradient Boosted Equivalent
- **Input Features**: Crop ID, Available Irrigation Water (m³/ha), NPK Fertilizer Application (kg/ha), Soil pH, Ambient Temperature, Seasonal Rainfall.
- **Output**: Expected harvest tonnage per hectare ($t/ha$).
- **Trained Performance**:
  - **R² Score**: 0.9309
  - **Mean Absolute Error (MAE)**: 2.200 tons/ha
  - **Root Mean Squared Error (RMSE)**: 4.392 tons/ha

## 3. Scripts
- `train_crop_model.py`: Trains the crop classifier, performs 80/20 train/test evaluation, and exports weights.
- `train_yield_model.py`: Trains the yield regressor, calculates MAE, RMSE, and R², and exports weights.
- `evaluate_models.py`: Runs end-to-end verification and generates benchmark verification reports.
