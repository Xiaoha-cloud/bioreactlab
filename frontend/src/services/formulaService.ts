import { FormulaResult } from '../types/formula';

// Preloaded formula cache
const FORMULA_CACHE: Record<string, string> = {
    '3hadpcoa': 'C21H32N7O17P3S',
    'atp': 'C10H16N5O13P3',
    'nadh': 'C21H27N7O14P2',
    'glucose': 'C6H12O6',
    'pyruvate': 'C3H4O3',
    'lactate': 'C3H6O3',
    'acetylcoa': 'C23H38N7O17P3S',
    'nadph': 'C21H27N7O17P3',
    'fadh2': 'C27H33N9O15P2',
    'co2': 'CO2',
    'h2o': 'H2O',
    'o2': 'O2',
    'h2o2': 'H2O2',
    'nh3': 'NH3',
    'h2s': 'H2S',
    'h2': 'H2',
    'hco3': 'HCO3',
    'hpo4': 'HPO4',
    'h2po4': 'H2PO4',
    'h': 'H',
    'oh': 'OH',
    'hcooh': 'HCOOH',
    'ch4': 'CH4',
    'ch3oh': 'CH3OH',
    'ch2o': 'CH2O',
    'ch3cooh': 'CH3COOH',
};

// Regular expression for chemical formula validation
const FORMULA_PATTERN = /^([A-Z][a-z]?\d*)+$/;

// Set of valid element symbols
const VALID_ELEMENTS = new Set([
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
    'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
    'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
    'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
    'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
    'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb',
    'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
    'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th',
    'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm',
    'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds',
    'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
]);

/**
 * Mock API function to simulate network requests
 * @param name - Name of the metabolite to look up
 * @returns Promise<FormulaResult | null>
 */
export const mockAPI = async (name: string): Promise<FormulaResult | null> => {
    // Simulate network delay (100-500ms)
    const delay = Math.floor(Math.random() * 400) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 50% chance of service unavailability
    if (Math.random() > 0.5) {
        return null;
    }

    const formula = FORMULA_CACHE[name.toLowerCase()];
    if (formula) {
        return {
            name,
            formula,
            source: 'api'
        };
    }

    return null;
};

/**
 * Validate a chemical formula
 * @param formula - Chemical formula to validate
 * @returns boolean
 */
export const validateFormula = (formula: string): boolean => {
    if (!formula) return false;

    // Check basic format
    if (!FORMULA_PATTERN.test(formula)) {
        return false;
    }

    // Extract and validate elements
    const elements = formula.match(/[A-Z][a-z]?/g) || [];
    return elements.every(element => VALID_ELEMENTS.has(element));
};

/**
 * Normalize a chemical formula to standard format
 * @param formula - Chemical formula to normalize
 * @returns string
 */
export const normalizeFormula = (formula: string): string => {
    if (!formula) return '';

    // Remove whitespace and convert to uppercase
    formula = formula.trim().toUpperCase();

    // Parse elements and their counts
    const elements: Record<string, number> = {};
    let currentElement = '';
    let currentCount = '';

    for (const char of formula) {
        if (char.match(/[A-Z]/)) {
            if (currentElement) {
                const count = currentCount ? parseInt(currentCount, 10) : 1;
                elements[currentElement] = (elements[currentElement] || 0) + count;
            }
            currentElement = char;
            currentCount = '';
        } else if (char.match(/[a-z]/)) {
            currentElement += char;
        } else if (char.match(/\d/)) {
            currentCount += char;
        }
    }

    // Add the last element
    if (currentElement) {
        const count = currentCount ? parseInt(currentCount, 10) : 1;
        elements[currentElement] = (elements[currentElement] || 0) + count;
    }

    // Sort elements and reconstruct formula
    return Object.entries(elements)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([element, count]) => `${element}${count > 1 ? count : ''}`)
        .join('');
};

/**
 * Look up a formula by name, checking cache first
 * @param name - Name of the metabolite to look up
 * @returns Promise<FormulaResult | null>
 */
export const lookupFormula = async (name: string): Promise<FormulaResult | null> => {
    // Check cache first
    const cachedFormula = FORMULA_CACHE[name.toLowerCase()];
    if (cachedFormula) {
        return {
            name,
            formula: cachedFormula,
            source: 'cache'
        };
    }

    // If not in cache, try API
    return mockAPI(name);
};

/**
 * Save a user-created formula
 * @param name - Name of the metabolite
 * @param formula - Chemical formula
 * @returns FormulaResult
 */
export const saveUserFormula = (name: string, formula: string): FormulaResult => {
    if (!validateFormula(formula)) {
        throw new Error('Invalid chemical formula');
    }

    const normalized = normalizeFormula(formula);
    return {
        name,
        formula: normalized,
        source: 'user'
    };
}; 