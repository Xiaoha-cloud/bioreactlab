from django.test import TestCase
from rest_framework.test import APIClient

class ReactionCreateTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_data = {
            "substrates": [
                {
                    "name": "ATP",
                    "stoichiometry": 1.0,
                    "compartment": "cytosol",
                    "type": "metabolite",
                    "formula": "C10H16N5O13P3",
                    "charge": -4
                }
            ],
            "products": [
                {
                    "name": "ADP",
                    "stoichiometry": 1.0,
                    "compartment": "cytosol",
                    "type": "metabolite",
                    "formula": "C10H15N5O10P2",
                    "charge": -3
                }
            ]
        }
        
    def test_missing_stoichiometry(self):
        invalid_data = {
            "substrates": [{"name": "ATP"}],
            "products": [{"name": "ADP"}]
        }
        response = self.client.post(
            '/api/reactions/create/',
            invalid_data,
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('Missing', response.json()['error'])

    def test_invalid_stoichiometry_type(self):
        invalid_data = self.valid_data.copy()
        invalid_data['substrates'][0]['stoichiometry'] = "1.0"
        response = self.client.post(
            '/api/reactions/create/',
            invalid_data,
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid stoichiometry', response.json()['error'])

    def test_invalid_compartment(self):
        invalid_data = self.valid_data.copy()
        invalid_data['substrates'][0]['compartment'] = "invalid"
        response = self.client.post(
            '/api/reactions/create/',
            invalid_data,
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid compartment', response.json()['error'])

    def test_invalid_type(self):
        invalid_data = self.valid_data.copy()
        invalid_data['substrates'][0]['type'] = "invalid"
        response = self.client.post(
            '/api/reactions/create/',
            invalid_data,
            format='json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid type', response.json()['error'])

    def test_successful_creation(self):
        response = self.client.post(
            '/api/reactions/create/',
            self.valid_data,
            format='json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['message'], 'Reaction created successfully') 