export interface Metabolite {
    name: string;
    formula: string;
    type: 'VMH' | 'Custom';
    source: 'cache' | 'api' | 'user';
}

export const commonMetabolites: Metabolite[] = [
    {
        name: 'Glucose',
        formula: 'C6H12O6',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'ATP',
        formula: 'C10H16N5O13P3',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'NADH',
        formula: 'C21H29N7O14P2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Pyruvate',
        formula: 'C3H3O3',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Acetyl-CoA',
        formula: 'C23H38N7O17P3S',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Citrate',
        formula: 'C6H5O7',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Malate',
        formula: 'C4H4O5',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Fumarate',
        formula: 'C4H2O4',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Succinate',
        formula: 'C4H4O4',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Oxaloacetate',
        formula: 'C4H2O5',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Alpha-Ketoglutarate',
        formula: 'C5H4O5',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Isocitrate',
        formula: 'C6H5O7',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Glyceraldehyde-3-phosphate',
        formula: 'C3H5O6P',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: '1,3-Bisphosphoglycerate',
        formula: 'C3H4O10P2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Phosphoenolpyruvate',
        formula: 'C3H2O6P',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Fructose-6-phosphate',
        formula: 'C6H11O9P',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Fructose-1,6-bisphosphate',
        formula: 'C6H10O12P2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'Dihydroxyacetone phosphate',
        formula: 'C3H5O6P',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: '3-Phosphoglycerate',
        formula: 'C3H4O7P',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: '2-Phosphoglycerate',
        formula: 'C3H4O7P',
        type: 'VMH',
        source: 'cache'
    }
];

export const specialCases: Metabolite[] = [
    {
        name: '3-Hydroxyacyl-CoA',
        formula: 'C25H42N7O18P3S',
        type: 'VMH',
        source: 'api'
    },
    {
        name: '3-Hydroxybutyryl-CoA',
        formula: 'C25H42N7O18P3S',
        type: 'VMH',
        source: 'api'
    },
    {
        name: '3-Hydroxydecanoyl-CoA',
        formula: 'C31H54N7O18P3S',
        type: 'VMH',
        source: 'api'
    },
    {
        name: '3-Hydroxypalmitoyl-CoA',
        formula: 'C37H66N7O18P3S',
        type: 'VMH',
        source: 'api'
    }
];

export const vmhMetabolites: Metabolite[] = [
    {
        name: 'h2o',
        formula: 'H2O',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'co2',
        formula: 'CO2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'o2',
        formula: 'O2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'h',
        formula: 'H',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'pi',
        formula: 'HO4P',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'ppi',
        formula: 'H4O7P2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'nad',
        formula: 'C21H27N7O14P2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'nadh',
        formula: 'C21H29N7O14P2',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'nadp',
        formula: 'C21H26N7O17P3',
        type: 'VMH',
        source: 'cache'
    },
    {
        name: 'nadph',
        formula: 'C21H28N7O17P3',
        type: 'VMH',
        source: 'cache'
    }
];

export const allMetabolites: Metabolite[] = [
    ...commonMetabolites,
    ...specialCases,
    ...vmhMetabolites
];

export const getMetaboliteByName = (name: string): Metabolite | undefined => {
    return allMetabolites.find(metabolite => metabolite.name.toLowerCase() === name.toLowerCase());
};

export const getMetabolitesByType = (type: 'VMH' | 'Custom'): Metabolite[] => {
    return allMetabolites.filter(metabolite => metabolite.type === type);
};

export const getMetabolitesBySource = (source: 'cache' | 'api' | 'user'): Metabolite[] => {
    return allMetabolites.filter(metabolite => metabolite.source === source);
}; 