from collections import Counter
import re
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors

def parse_formula(formula):
    """Parse a chemical formula into a dictionary of element counts."""
    # Remove any charge information
    formula = re.sub(r'\[[+-]\d*\]', '', formula)
    
    # Split into elements and their counts
    pattern = r'([A-Z][a-z]*)(\d*)'
    elements = re.findall(pattern, formula)
    
    # Convert to dictionary
    counts = {}
    for element, count in elements:
        counts[element] = counts.get(element, 0) + (int(count) if count else 1)
    
    return counts

def get_atom_counts_from_smiles(smiles):
    """Get atom counts from a SMILES string using RDKit."""
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None
        
        # Get atom symbols and their counts
        atom_counts = Counter()
        for atom in mol.GetAtoms():
            symbol = atom.GetSymbol()
            atom_counts[symbol] += 1
        
        return dict(atom_counts)
    except Exception as e:
        print(f"Error processing SMILES {smiles}: {str(e)}")
        return None

def get_atom_counts(entry):
    """Get atom counts from either SMILES or formula."""
    # Try SMILES first
    if 'smiles' in entry and entry['smiles']:
        counts = get_atom_counts_from_smiles(entry['smiles'])
        if counts is not None:
            return counts
    
    # Fall back to formula
    if 'formula' in entry and entry['formula']:
        return parse_formula(entry['formula'])
    
    return None

def is_mixed_balanced(reactants, products):
    """Check if a reaction is balanced using either SMILES or formulas."""
    # Get total atom counts for reactants
    reactant_counts = Counter()
    for reactant in reactants:
        counts = get_atom_counts(reactant)
        if counts is None:
            return False, "Missing chemical information for reactants"
        coefficient = reactant.get('coefficient', 1)
        for element, count in counts.items():
            reactant_counts[element] += count * coefficient
    
    # Get total atom counts for products
    product_counts = Counter()
    for product in products:
        counts = get_atom_counts(product)
        if counts is None:
            return False, "Missing chemical information for products"
        coefficient = product.get('coefficient', 1)
        for element, count in counts.items():
            product_counts[element] += count * coefficient
    
    # Compare counts
    if reactant_counts != product_counts:
        return False, {
            'reactant_counts': dict(reactant_counts),
            'product_counts': dict(product_counts)
        }
    
    return True, None

def is_balanced(reactants, products):
    """Check if a reaction is balanced using chemical formulas."""
    # Get total atom counts for reactants
    reactant_counts = Counter()
    for coefficient, formula in reactants:
        counts = parse_formula(formula)
        for element, count in counts.items():
            reactant_counts[element] += count * coefficient
    
    # Get total atom counts for products
    product_counts = Counter()
    for coefficient, formula in products:
        counts = parse_formula(formula)
        for element, count in counts.items():
            product_counts[element] += count * coefficient
    
    # Compare counts
    if reactant_counts != product_counts:
        return False, {
            'reactant_counts': dict(reactant_counts),
            'product_counts': dict(product_counts)
        }
    
    return True, None 