import re
from typing import Optional, Tuple
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors

class FormulaValidator:
    """Service class for chemical formula validation and normalization."""
    
    # Regular expression for chemical formula validation
    # Matches patterns like: C6H12O6, CH4, H2O, etc.
    FORMULA_PATTERN = re.compile(r'^([A-Z][a-z]?\d*)+$')
    
    # Dictionary of common element symbols
    ELEMENTS = {
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

    @staticmethod
    def validate_format(formula: str) -> bool:
        """
        Validate the format of a chemical formula.
        
        Args:
            formula: Chemical formula string to validate
            
        Returns:
            bool: True if the formula format is valid, False otherwise
        """
        if not formula:
            return False
            
        # Check if the formula matches the basic pattern
        if not FormulaValidator.FORMULA_PATTERN.match(formula):
            return False
            
        # Extract elements and validate they are real elements
        elements = re.findall(r'([A-Z][a-z]?)', formula)
        return all(element in FormulaValidator.ELEMENTS for element in elements)

    @staticmethod
    def normalize(formula: str) -> str:
        """
        Normalize a chemical formula to standard format.
        
        Args:
            formula: Chemical formula string to normalize
            
        Returns:
            str: Normalized chemical formula
        """
        if not formula:
            return ''
            
        # Remove any whitespace
        formula = formula.strip()
        
        # Parse elements and their counts
        elements = {}
        current_element = ''
        current_count = ''
        
        for char in formula:
            if char.isupper():
                if current_element:
                    count = int(current_count) if current_count else 1
                    elements[current_element] = elements.get(current_element, 0) + count
                current_element = char
                current_count = ''
            elif char.islower():
                current_element += char
            elif char.isdigit():
                current_count += char
                
        # Add the last element
        if current_element:
            count = int(current_count) if current_count else 1
            elements[current_element] = elements.get(current_element, 0) + count
            
        # Sort elements by atomic number (roughly alphabetical for common elements)
        sorted_elements = sorted(elements.items())
        
        # Reconstruct formula
        normalized = ''.join(f"{element}{count if count > 1 else ''}" 
                           for element, count in sorted_elements)
                           
        return normalized

    @staticmethod
    def validate_with_rdkit(formula: str) -> Tuple[bool, Optional[str]]:
        """
        Validate a chemical formula using RDKit.
        
        Args:
            formula: Chemical formula string to validate
            
        Returns:
            Tuple[bool, Optional[str]]: (is_valid, error_message)
        """
        try:
            # First validate the format
            if not FormulaValidator.validate_format(formula):
                return False, "Invalid formula format"
                
            # Try to create a molecule from the formula
            mol = Chem.MolFromSmiles(formula)
            if mol is None:
                return False, "Invalid molecular structure"
                
            # Additional validation using RDKit
            # Check if the molecule can be sanitized
            try:
                Chem.SanitizeMol(mol)
            except Exception as e:
                return False, f"Invalid molecular structure: {str(e)}"
                
            # Get the molecular formula from RDKit
            rdkit_formula = rdMolDescriptors.CalcMolFormula(mol)
            
            # Compare with normalized input formula
            normalized_input = FormulaValidator.normalize(formula)
            normalized_rdkit = FormulaValidator.normalize(rdkit_formula)
            
            if normalized_input != normalized_rdkit:
                return False, f"Formula mismatch: expected {normalized_input}, got {normalized_rdkit}"
                
            return True, None
            
        except Exception as e:
            return False, f"Validation error: {str(e)}" 