import re
from collections import defaultdict
from typing import List, Tuple, Dict, Union

# Valid chemical elements
VALID_ELEMENTS = {
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
}

def parse_formula(formula: str) -> Dict[str, int]:
    """
    Parse a chemical formula into a dictionary of element counts.
    
    Args:
        formula (str): Chemical formula string (e.g. "C6H12O6")
        
    Returns:
        Dict[str, int]: Dictionary mapping elements to their counts
        
    Raises:
        ValueError: If the formula contains invalid elements or is malformed
    """
    if not formula:
        return {}
    
    try:
        # Remove any spaces and convert to uppercase
        formula = formula.replace(' ', '').upper()
        
        # Validate overall formula format
        if not re.match(r'^([A-Z][a-z]?\d*)+$', formula):
            raise ValueError(f"Invalid formula format: {formula}. Formula should contain only element symbols and numbers.")
        
        # Match element symbols and their counts
        tokens = re.findall(r'([A-Z][a-z]?)(\d*)', formula)
        if not tokens:
            raise ValueError(f"Invalid formula format: {formula}")
            
        count = defaultdict(int)
        
        for element, num in tokens:
            # Validate element
            if element not in VALID_ELEMENTS:
                raise ValueError(f"Invalid element symbol: {element}. Please use valid chemical element symbols.")
            
            try:
                # Convert count to integer (default to 1 if no number specified)
                count[element] += int(num) if num else 1
            except ValueError:
                raise ValueError(f"Invalid number format in formula: {formula}. Numbers should be positive integers.")
        
        # Validate that all counts are positive
        if any(count <= 0 for count in count.values()):
            raise ValueError(f"Invalid formula: {formula}. All element counts must be positive.")
        
        return dict(count)
    except Exception as e:
        raise ValueError(f"Error parsing formula '{formula}': {str(e)}")

def is_formula_balanced(reactants: List[Tuple[float, str]], products: List[Tuple[float, str]]) -> bool:
    """
    Check if a reaction is balanced based on chemical formulas.
    
    Args:
        reactants (List[Tuple[float, str]]): List of (coefficient, formula) pairs for reactants
        products (List[Tuple[float, str]]): List of (coefficient, formula) pairs for products
        
    Returns:
        bool: True if the reaction is balanced, False otherwise
    """
    try:
        r_total = defaultdict(int)
        p_total = defaultdict(int)

        for coeff, formula in reactants:
            if not formula:
                continue
            atoms = parse_formula(formula)
            for element, count in atoms.items():
                r_total[element] += coeff * count

        for coeff, formula in products:
            if not formula:
                continue
            atoms = parse_formula(formula)
            for element, count in atoms.items():
                p_total[element] += coeff * count

        return dict(r_total) == dict(p_total)
    except Exception as e:
        raise ValueError(f"Error checking balance: {str(e)}")

def get_balance_status(reactants: List[Tuple[float, str]], products: List[Tuple[float, str]]) -> Dict[str, Union[bool, Dict[str, int]]]:
    """
    Get detailed balance status including element counts on both sides.
    
    Args:
        reactants (List[Tuple[float, str]]): List of (coefficient, formula) pairs for reactants
        products (List[Tuple[float, str]]): List of (coefficient, formula) pairs for products
        
    Returns:
        Dict[str, Union[bool, Dict[str, int]]]: Dictionary containing:
            - 'is_balanced': bool indicating if reaction is balanced
            - 'reactant_counts': element counts on reactant side
            - 'product_counts': element counts on product side
    """
    try:
        print("Calculating balance status for:")
        print("Reactants:", reactants)
        print("Products:", products)
        
        r_total = defaultdict(int)
        p_total = defaultdict(int)

        for coeff, formula in reactants:
            if not formula:
                continue
            print(f"Processing reactant: {coeff} * {formula}")
            atoms = parse_formula(formula)
            print(f"Parsed atoms: {atoms}")
            for element, count in atoms.items():
                r_total[element] += coeff * count

        for coeff, formula in products:
            if not formula:
                continue
            print(f"Processing product: {coeff} * {formula}")
            atoms = parse_formula(formula)
            print(f"Parsed atoms: {atoms}")
            for element, count in atoms.items():
                p_total[element] += coeff * count

        print("Reactant totals:", dict(r_total))
        print("Product totals:", dict(p_total))

        return {
            'is_balanced': dict(r_total) == dict(p_total),
            'reactant_counts': dict(r_total),
            'product_counts': dict(p_total)
        }
    except Exception as e:
        print(f"Error in get_balance_status: {str(e)}")
        raise ValueError(f"Error getting balance status: {str(e)}") 