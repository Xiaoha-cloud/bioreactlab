import re
from collections import defaultdict
from typing import List, Tuple, Dict, Union

def parse_formula(formula: str) -> Dict[str, int]:
    """
    Parse a chemical formula into a dictionary of element counts.
    
    Args:
        formula (str): Chemical formula string (e.g. "C6H12O6")
        
    Returns:
        Dict[str, int]: Dictionary mapping elements to their counts
    """
    if not formula:
        return {}
        
    tokens = re.findall(r'([A-Z][a-z]*)(\d*)', formula)
    count = defaultdict(int)
    for element, num in tokens:
        count[element] += int(num) if num else 1
    return dict(count)

def is_formula_balanced(reactants: List[Tuple[float, str]], products: List[Tuple[float, str]]) -> bool:
    """
    Check if a reaction is balanced based on chemical formulas.
    
    Args:
        reactants (List[Tuple[float, str]]): List of (coefficient, formula) pairs for reactants
        products (List[Tuple[float, str]]): List of (coefficient, formula) pairs for products
        
    Returns:
        bool: True if the reaction is balanced, False otherwise
    """
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

    return r_total == p_total

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

    return {
        'is_balanced': dict(r_total) == dict(p_total),
        'reactant_counts': dict(r_total),
        'product_counts': dict(p_total)
    } 