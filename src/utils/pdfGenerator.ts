/**
 * AgriOptima AI - PDF Report Generation Utility
 * Generates an executive decision-support farm report with agronomic recommendations,
 * LP allocation tables, financial projections, and risk analysis.
 */

import { jsPDF } from 'jspdf';
import { Farm, OptimizationResult, CropRecommendation } from '../types/index.ts';

export function generateFarmReportPDF(
  farm: Farm,
  optimization: OptimizationResult | null,
  recommendations: CropRecommendation[] = [],
  scenarioNote?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(22, 101, 52); // Forest Green
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('AGRIOPTIMA AI - SMART FARM DECISION REPORT', 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('From Crop Prediction to Mathematically Optimized Resource Allocation', 14, 20);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  doc.text(`Generated: ${reportDate} | Engine: Simplex LP + ML v1.2`, pageWidth - 80, 20);

  y = 36;
  doc.setTextColor(30, 41, 59);

  // Section 1: Farm Profile
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Farm Identification & Resource Baseline', 14, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 26, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Farm Name: ${farm.name}`, 18, y + 6);
  doc.text(`Location: ${farm.location}`, 18, y + 12);
  doc.text(`Total Land Area: ${farm.land_area_ha} Hectares`, 18, y + 18);
  doc.text(`Target Season: ${farm.season}`, 18, y + 24);

  doc.text(`Water Reserve: ${farm.resources.water_m3.toLocaleString()} m³`, 105, y + 6);
  doc.text(`Fertilizer Budget: ${farm.resources.fertilizer_kg.toLocaleString()} kg`, 105, y + 12);
  doc.text(`Working Capital: $${farm.resources.budget_usd.toLocaleString()}`, 105, y + 18);
  doc.text(`Soil Type & pH: ${farm.soil.soil_type} (pH ${farm.soil.pH})`, 105, y + 24);

  y += 34;

  // Section 2: Soil Chemistry & Agro-Climate
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Soil Chemistry & Environmental Weather Profile', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Available Nutrients: Nitrogen (N): ${farm.soil.N} kg/ha | Phosphorus (P): ${farm.soil.P} kg/ha | Potassium (K): ${farm.soil.K} kg/ha`, 14, y);
  y += 5;
  doc.text(`Weather Conditions: Temperature: ${farm.weather.temperature}°C | Seasonal Rainfall: ${farm.weather.rainfall} mm | Humidity: ${farm.weather.humidity}%`, 14, y);

  y += 10;

  // Section 3: AI Crop Suitability Recommendations
  if (recommendations.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Top AI-Evaluated Candidate Crops', 14, y);
    y += 6;

    // Table Header
    doc.setFillColor(220, 252, 231);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Crop', 16, y + 5);
    doc.text('Suitability', 55, y + 5);
    doc.text('Pred. Yield', 88, y + 5);
    doc.text('Cost/ha', 118, y + 5);
    doc.text('Est. Revenue/ha', 142, y + 5);
    doc.text('Risk', 178, y + 5);
    y += 7;

    doc.setFont('helvetica', 'normal');
    recommendations.slice(0, 4).forEach((rec, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 6, 'F');
      }
      doc.text(rec.crop_name, 16, y + 4.5);
      doc.text(`${rec.suitability_score}% (${rec.suitability_tier})`, 55, y + 4.5);
      doc.text(`${rec.predicted_yield_tons_ha} t/ha`, 88, y + 4.5);
      doc.text(`$${rec.cultivation_cost_per_ha.toLocaleString()}`, 118, y + 4.5);
      doc.text(`$${rec.expected_revenue_per_ha.toLocaleString()}`, 142, y + 4.5);
      doc.text(rec.risk_level, 178, y + 4.5);
      y += 6;
    });

    y += 6;
  }

  // Section 4: Mathematical Optimization & Allocation
  if (optimization && optimization.feasible) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`4. Optimal Land & Resource Allocation (${optimization.strategy.toUpperCase()})`, 14, y);
    y += 6;

    // Allocation Table Header
    doc.setFillColor(220, 238, 255);
    doc.rect(14, y, pageWidth - 28, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Allocated Crop', 16, y + 5);
    doc.text('Area (ha)', 60, y + 5);
    doc.text('Land %', 85, y + 5);
    doc.text('Water (m³)', 110, y + 5);
    doc.text('Cost ($)', 138, y + 5);
    doc.text('Projected Profit ($)', 164, y + 5);
    y += 7;

    doc.setFont('helvetica', 'normal');
    optimization.allocations.forEach((alloc, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, pageWidth - 28, 6, 'F');
      }
      doc.text(alloc.crop_name, 16, y + 4.5);
      doc.text(`${alloc.allocated_ha} ha`, 60, y + 4.5);
      doc.text(`${alloc.percentage_of_land}%`, 85, y + 4.5);
      doc.text(`${alloc.water_used_m3.toLocaleString()}`, 110, y + 4.5);
      doc.text(`$${alloc.cultivation_cost.toLocaleString()}`, 138, y + 4.5);
      doc.text(`$${alloc.expected_profit.toLocaleString()}`, 164, y + 4.5);
      y += 6;
    });

    y += 5;

    // Financial & Resource KPI Cards
    const summary = optimization.summary;
    doc.setFillColor(240, 253, 244);
    doc.rect(14, y, pageWidth - 28, 22, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text(`Projected Net Profit: $${summary.total_profit.toLocaleString()} (Margin: ${summary.profit_margin_pct}%)`, 18, y + 6);
    doc.text(`Total Expected Production: ${summary.expected_production_tons} Tons`, 18, y + 12);
    doc.text(`Total Cultivation Expenditure: $${summary.total_cost.toLocaleString()}`, 18, y + 18);

    doc.setTextColor(30, 41, 59);
    doc.text(`Land Used: ${summary.used_land_ha}/${summary.total_land_ha} ha (${summary.land_utilization_pct}%)`, 115, y + 6);
    doc.text(`Water Consumed: ${summary.used_water_m3.toLocaleString()} m³ (${summary.water_utilization_pct}%)`, 115, y + 12);
    doc.text(`Composite Farm Risk: ${summary.composite_risk} (Score: ${summary.composite_risk_score})`, 115, y + 18);

    y += 28;
  }

  // Section 5: Scenario & Decision Notes
  if (scenarioNote) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('5. What-If Simulation Notes', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(scenarioNote, 14, y, { maxWidth: pageWidth - 28 });
    y += 12;
  }

  // Footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AgriOptima AI is an agronomic decision-support prototype powered by Constrained Linear Programming & Agronomic ML. Final farm decisions should account for local microclimate, seed availability, and local agricultural extension guidelines.', 14, 285, { maxWidth: pageWidth - 28 });

  // Download
  doc.save(`AgriOptima_Report_${farm.name.replace(/\s+/g, '_')}_${reportDate}.pdf`);
}
