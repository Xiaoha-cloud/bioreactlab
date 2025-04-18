from rdkit import Chem
from rdkit.Chem import AllChem
import re

def parse_formula(formula):
    """Parse chemical formula into element counts."""
    pattern = r'([A-Z][a-z]?)(\d*)'
    matches = re.findall(pattern, formula)
    counts = {}
    for element, count in matches:
        counts[element] = int(count) if count else 1
    return counts

def formula_to_smiles(formula):
    """
    Convert chemical formula to a basic SMILES representation.
    This is a simplified version that creates a basic structure.
    For complex molecules, manual editing might be needed.
    """
    try:
        # Parse the formula
        counts = parse_formula(formula)
        
        # Create a basic molecular graph
        mol = Chem.RWMol()
        
        # Add atoms first
        atom_indices = {}
        for element, count in counts.items():
            for _ in range(count):
                idx = mol.AddAtom(Chem.Atom(element))
                if element not in atom_indices:
                    atom_indices[element] = []
                atom_indices[element].append(idx)
        
        # Try to create a valid structure by connecting atoms
        # This is a very basic approach and might not create chemically valid structures
        atoms = list(mol.GetAtoms())
        for i in range(len(atoms) - 1):
            mol.AddBond(i, i + 1, Chem.BondType.SINGLE)
        
        # Try to sanitize the molecule
        try:
            Chem.SanitizeMol(mol)
        except:
            pass  # Ignore sanitization errors
        
        # Generate SMILES
        smiles = Chem.MolToSmiles(mol)
        return smiles
    except Exception as e:
        print(f"Error converting formula to SMILES: {e}")
        return None

def get_structure_from_formula(formula):
    """
    Get molecular structure information from chemical formula.
    Returns a dict with SMILES and molfile if successful.
    """
    try:
        # Generate SMILES from formula
        smiles = formula_to_smiles(formula)
        if not smiles:
            return None
            
        # Create 3D structure
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None
            
        # Generate 3D coordinates
        mol = Chem.AddHs(mol)
        AllChem.EmbedMolecule(mol, randomSeed=42)
        AllChem.MMFFOptimizeMolecule(mol)
        mol = Chem.RemoveHs(mol)
        
        # Generate molfile
        molfile = Chem.MolToMolBlock(mol)
        
        return {
            'smiles': smiles,
            'molfile': molfile
        }
    except Exception as e:
        print(f"Error generating structure: {e}")
        return None 