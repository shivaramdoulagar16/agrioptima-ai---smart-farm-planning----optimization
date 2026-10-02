# AgriOptima AI — Mathematical Optimization Formulation

## 1. Mathematical Formulation

Let $C = \{1, \dots, n\}$ be the set of eligible candidate crops.
Let $x_i \ge 0$ be the continuous decision variable representing the land area (in hectares) allocated to crop $i$.

### Objective Function
Maximize synthetic objective score $Z$:
$$\max Z = \sum_{i \in C} c_i \cdot x_i$$

Where $c_i$ is determined by the selected strategic mode:
1. **Profit Focus**: $c_i = \text{Revenue}_i - \text{Cost}_i = (\text{Yield}_i \times P_i) - C_i$
2. **Water Saver**: $c_i = (\text{Revenue}_i - C_i) - \lambda_{\text{water}} \cdot \frac{W_i}{1000} + (\text{DroughtTol}_i \times 400)$
3. **Balanced**: $c_i = (\text{Revenue}_i - C_i) \cdot (1 - 0.35 \times \text{Risk}_i) - 30 \times \frac{W_i}{1000}$
4. **Risk Aware**: $c_i = (\text{Revenue}_i - C_i) \cdot (1 - 0.75 \times \text{Risk}_i)$

### Constraints
1. **Total Land Area**:
   $$\sum_{i \in C} x_i \le L_{\text{total}}$$

2. **Total Irrigation Water Available**:
   $$\sum_{i \in C} W_i \cdot x_i \le W_{\text{available}}$$

3. **Fertilizer Quantity Available**:
   $$\sum_{i \in C} F_i \cdot x_i \le F_{\text{available}}$$

4. **Working Capital / Budget Available**:
   $$\sum_{i \in C} C_i \cdot x_i \le B_{\text{available}}$$

5. **Non-Negativity**:
   $$x_i \ge 0 \quad \forall i \in C$$

6. **Diversification Cap (Balanced & Risk Aware Modes)**:
   $$x_i \le 0.70 \cdot L_{\text{total}} \quad \forall i \in C$$

## 2. Infeasibility Diagnostics
If the linear programming problem is mathematically infeasible (due to severe budget, water, or nutrient constraints preventing even 0.1 hectare cultivation), the solver diagnoses the exact limiting bottleneck, computes the minimum resource required to achieve feasibility, and supplies actionable remedies for the farmer.
