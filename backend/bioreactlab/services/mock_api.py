import random
import time
from typing import Optional, Dict
from dataclasses import dataclass

@dataclass
class ChemicalFormula:
    name: str
    formula: str
    source: str = 'mock_api'

class MockChemicalAPI:
    """Mock API for chemical formula lookup with simulated network behavior."""
    
    # Built-in dictionary of common metabolites
    METABOLITES: Dict[str, str] = {
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
        'ch3ch2oh': 'CH3CH2OH',
        'ch3ch2cooh': 'CH3CH2COOH',
        'ch3ch2ch2oh': 'CH3CH2CH2OH',
        'ch3ch2ch2cooh': 'CH3CH2CH2COOH',
        'ch3ch2ch2ch2oh': 'CH3CH2CH2CH2OH',
        'ch3ch2ch2ch2cooh': 'CH3CH2CH2CH2COOH',
        'ch3ch2ch2ch2ch2oh': 'CH3CH2CH2CH2CH2OH',
        'ch3ch2ch2ch2ch2cooh': 'CH3CH2CH2CH2CH2COOH',
        'ch3ch2ch2ch2ch2ch2oh': 'CH3CH2CH2CH2CH2CH2OH',
        'ch3ch2ch2ch2ch2ch2cooh': 'CH3CH2CH2CH2CH2CH2COOH',
        'ch3ch2ch2ch2ch2ch2ch2oh': 'CH3CH2CH2CH2CH2CH2CH2OH',
        'ch3ch2ch2ch2ch2ch2ch2cooh': 'CH3CH2CH2CH2CH2CH2CH2COOH',
        'ch3ch2ch2ch2ch2ch2ch2ch2oh': 'CH3CH2CH2CH2CH2CH2CH2CH2OH',
        'ch3ch2ch2ch2ch2ch2ch2ch2cooh': 'CH3CH2CH2CH2CH2CH2CH2CH2COOH',
        'ch3ch2ch2ch2ch2ch2ch2ch2ch2oh': 'CH3CH2CH2CH2CH2CH2CH2CH2CH2OH',
        'ch3ch2ch2ch2ch2ch2ch2ch2ch2cooh': 'CH3CH2CH2CH2CH2CH2CH2CH2CH2COOH',
    }

    def __init__(self, success_rate: float = 0.5):
        """
        Initialize the mock API.
        
        Args:
            success_rate: Probability of successful response (0.0 to 1.0)
        """
        self.success_rate = max(0.0, min(1.0, success_rate))

    def lookup_formula(self, name: str) -> Optional[ChemicalFormula]:
        """
        Simulate API lookup with random delay and success rate.
        
        Args:
            name: Name of the metabolite to look up
            
        Returns:
            Optional[ChemicalFormula]: Chemical formula data or None if service is unavailable
        """
        # Simulate network delay (100-500ms)
        delay_ms = random.randint(100, 500)
        time.sleep(delay_ms / 1000.0)

        # Simulate service availability
        if random.random() > self.success_rate:
            return None

        # Look up formula
        formula = self.METABOLITES.get(name.lower())
        if formula:
            return ChemicalFormula(
                name=name,
                formula=formula,
                source='mock_api'
            )
        return None

# Example usage and testing
if __name__ == '__main__':
    import unittest
    
    class TestMockChemicalAPI(unittest.TestCase):
        def setUp(self):
            self.api = MockChemicalAPI(success_rate=1.0)  # 100% success rate for testing
            
        def test_known_metabolites(self):
            # Test known metabolites
            test_cases = [
                ('3hadpcoa', 'C21H32N7O17P3S'),
                ('atp', 'C10H16N5O13P3'),
                ('nadh', 'C21H27N7O14P2'),
            ]
            
            for name, expected_formula in test_cases:
                result = self.api.lookup_formula(name)
                self.assertIsNotNone(result)
                self.assertEqual(result.formula, expected_formula)
                self.assertEqual(result.source, 'mock_api')
                
        def test_unknown_metabolite(self):
            # Test unknown metabolite
            result = self.api.lookup_formula('unknown_metabolite')
            self.assertIsNone(result)
            
        def test_case_insensitivity(self):
            # Test case insensitivity
            result1 = self.api.lookup_formula('ATP')
            result2 = self.api.lookup_formula('atp')
            self.assertEqual(result1.formula, result2.formula)
            
    # Run tests
    unittest.main() 