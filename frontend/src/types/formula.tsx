export interface FormulaResult {
    name: string;
    formula: string;
    source: 'cache' | 'api' | 'user';
} 