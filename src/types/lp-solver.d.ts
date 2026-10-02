declare module 'javascript-lp-solver' {
  export interface LPModel {
    optimize: string;
    opType: 'max' | 'min';
    constraints: Record<string, { min?: number; max?: number; equal?: number }>;
    variables: Record<string, Record<string, number>>;
    ints?: Record<string, number>;
  }

  export interface LPSolution {
    feasible: boolean;
    result: number;
    bounded?: boolean;
    isCurrent?: boolean;
    [key: string]: any;
  }

  export function Solve(model: LPModel): LPSolution;
}
