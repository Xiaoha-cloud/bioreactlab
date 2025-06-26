from django.shortcuts import render
from django.http import JsonResponse, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import MetaboliteSerializer
from reactions.balance_utils import is_formula_balanced, get_balance_status
import json
import requests
from rdkit import Chem
from rdkit.Chem import AllChem

# Create your views here.

@csrf_exempt
@require_http_methods(["POST"])
def create_reaction(request):
    try:
        # 验证请求头
        if 'Content-Type' not in request.headers:
            return JsonResponse({'error': 'Missing Content-Type'}, status=400)
        elif request.headers['Content-Type'] != 'application/json':
            return JsonResponse({'error': 'Unsupported media type'}, status=415)

        # 解析请求体
        data = json.loads(request.body)
        substrates = data.get('substrates', [])
        products = data.get('products', [])

        # 验证必要字段
        if not substrates or not products:
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # 定义必需字段
        required_fields = {'name', 'stoichiometry', 'compartment', 'type'}

        # 验证底物
        for idx, substrate in enumerate(substrates):
            # 字段存在性检查
            if missing := required_fields - substrate.keys():
                return JsonResponse(
                    {"error": f"Missing {missing} in substrates[{idx}]"},
                    status=400
                )
            # 数值类型验证
            if not isinstance(substrate.get('stoichiometry', 0), (int, float)):
                return JsonResponse(
                    {"error": f"Invalid stoichiometry in substrates[{idx}]"},
                    status=400
                )
            # 使用序列化器验证
            serializer = MetaboliteSerializer(data=substrate)
            if not serializer.is_valid():
                return JsonResponse(
                    {"error": f"Invalid substrate data at index {idx}: {serializer.errors}"},
                    status=400
                )

        # 验证产物
        for idx, product in enumerate(products):
            # 字段存在性检查
            if missing := required_fields - product.keys():
                return JsonResponse(
                    {"error": f"Missing {missing} in products[{idx}]"},
                    status=400
                )
            # 数值类型验证
            if not isinstance(product.get('stoichiometry', 0), (int, float)):
                return JsonResponse(
                    {"error": f"Invalid stoichiometry in products[{idx}]"},
                    status=400
                )
            # 使用序列化器验证
            serializer = MetaboliteSerializer(data=product)
            if not serializer.is_valid():
                return JsonResponse(
                    {"error": f"Invalid product data at index {idx}: {serializer.errors}"},
                    status=400
                )

        # TODO: 实现反应创建逻辑
        # 这里应该添加实际的数据库操作

        return JsonResponse({
            'message': 'Reaction created successfully',
            'substrates': substrates,
            'products': products
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
def check_balance(request):
    """
    Check if a reaction is balanced based on chemical formulas.
    
    Expected POST data format:
    {
        "reactants": [[coefficient, "formula"], ...],
        "products": [[coefficient, "formula"], ...]
    }
    
    Example:
    {
        "reactants": [[1, "C6H12O6"]],
        "products": [[2, "C3H6O3"]]
    }
    """
    try:
        print("Received balance check request:", request.data)
        reactants = request.data.get("reactants", [])
        products = request.data.get("products", [])
        
        # Validate input format
        if not isinstance(reactants, list) or not isinstance(products, list):
            return Response({"error": "Reactants and products must be lists"}, status=400)
            
        for pair in reactants + products:
            if not isinstance(pair, list) or len(pair) != 2:
                return Response({"error": "Each reactant and product must be a [coefficient, formula] pair"}, status=400)
            if not isinstance(pair[0], (int, float)) or not isinstance(pair[1], str):
                return Response({"error": "Coefficient must be a number and formula must be a string"}, status=400)
        
        print("Validating reactants:", reactants)
        print("Validating products:", products)
        
        # Get detailed balance status
        try:
            status = get_balance_status(reactants, products)
            print("Balance status:", status)
            
            return Response({
                "balanced": status["is_balanced"],
                "reactant_counts": status["reactant_counts"],
                "product_counts": status["product_counts"]
            })
        except ValueError as ve:
            print("Error in get_balance_status:", str(ve))
            return Response({"error": str(ve)}, status=400)
        except Exception as e:
            print("Unexpected error in get_balance_status:", str(e))
            return Response({"error": f"Error calculating balance: {str(e)}"}, status=500)
        
    except Exception as e:
        print("Error in check_balance:", str(e))
        return Response({"error": f"Error processing request: {str(e)}"}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def validate_metabolite(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get("name", "").lower()

        # Try VMH API first
        try:
            vmh_response = requests.get(f"https://www.vmh.life/_api/metabolites/?search={name}")
            if vmh_response.status_code == 200:
                data = vmh_response.json()
                if data and data.get('results') and len(data['results']) > 0:
                    # Get the first matching metabolite
                    metabolite = data['results'][0]
                    formula = metabolite.get('chargedFormula') or metabolite.get('neutralFormula')
                    smiles = metabolite.get('smile')  # Note: VMH uses 'smile' instead of 'smiles'
                    
                    if formula or smiles:
                        return JsonResponse({
                            "structure": smiles,
                            "formula": formula,
                            "verified": True,
                            "has_structure": bool(smiles),
                            "message": "Found in VMH database" + (" with structure" if smiles else " with formula only")
                        })
        except Exception as e:
            print(f"Error fetching from VMH API: {str(e)}")

        # If VMH API fails, try our formula search
        try:
            formula_response = requests.get(f"http://localhost:8000/api/formula/search?name={name}")
            if formula_response.status_code == 200:
                formula_data = formula_response.json()
                if formula_data.get('results') and len(formula_data['results']) > 0:
                    result = formula_data['results'][0]
                    return JsonResponse({
                        "formula": result.get('formula'),
                        "verified": True,
                        "has_structure": False,
                        "message": "Found formula in local database"
                    })
        except Exception as e:
            print(f"Error in formula search: {str(e)}")

        # If nothing found, return 404
        return JsonResponse({
            "error": "Metabolite not found",
            "verified": False,
            "has_structure": False,
            "message": "Please enter the metabolite manually"
        }, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def search_formula(request):
    try:
        data = json.loads(request.body)
        name = data.get('name')

        if not name:
            return JsonResponse({'error': 'Missing name parameter'}, status=400)

        # 这里应该添加实际的公式搜索逻辑
        # 暂时返回一个示例响应
        return JsonResponse({
            'results': [{
                'name': name,
                'formula': 'C6H12O6',  # 示例化学式
                'source': 'api',
                'smiles': 'C(C1C(C(C(C(O1)O)O)O)O)O'  # 示例 SMILES
            }]
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def formula_search(request):
    name = request.GET.get('name', '').lower()
    
    # Mock data for 3hadpcoa
    if name == '3hadpcoa':
        return Response({
            'results': [{
                'name': '3hadpcoa',
                'formula': 'C21H33N7O17P3S',
                'source': 'mock_database'
            }]
        })
    
    # For other metabolites, return empty results
    return Response({
        'results': []
    })

@csrf_exempt
@require_http_methods(["POST"])
def generate_structure(request):
    try:
        print("Received request body:", request.body)
        data = json.loads(request.body)
        print("Parsed JSON data:", data)
        formula = data.get('formula')
        print("Formula:", formula)

        if not formula:
            return JsonResponse({'error': 'Missing formula parameter'}, status=400)

        try:
            # Parse the formula to get atom counts
            import re
            from collections import defaultdict
            
            # Regular expression to match element symbols and their counts
            pattern = r'([A-Z][a-z]?)(\d*)'
            matches = re.findall(pattern, formula)
            
            # Convert matches to atom counts
            atom_counts = defaultdict(int)
            for element, count in matches:
                atom_counts[element] = int(count) if count else 1
            
            print("Atom counts:", dict(atom_counts))
            
            # Define maximum valences for each element
            max_valences = {
                'C': 4,  # Carbon
                'N': 3,  # Nitrogen
                'O': 2,  # Oxygen
                'P': 5,  # Phosphorus
                'S': 6,  # Sulfur
                'H': 1   # Hydrogen
            }
            
            # Create a simple molecular graph
            mol = Chem.RWMol()
            
            # Add atoms (excluding hydrogens initially)
            atom_map = {}
            for element, count in atom_counts.items():
                if element != 'H':  # Skip hydrogens for now
                    atomic_num = Chem.GetPeriodicTable().GetAtomicNumber(element)
                    for i in range(count):
                        atom = Chem.Atom(atomic_num)
                        atom.SetNoImplicit(True)  # Don't automatically add hydrogens
                        atom_idx = mol.AddAtom(atom)
                        atom_map.setdefault(element, []).append(atom_idx)
            
            # Initialize valence for all atoms
            for atom in mol.GetAtoms():
                atom.UpdatePropertyCache(strict=False)
            
            def can_add_bond(atom1_idx, atom2_idx):
                """Check if we can add a bond between two atoms without exceeding their valences"""
                atom1 = mol.GetAtomWithIdx(atom1_idx)
                atom2 = mol.GetAtomWithIdx(atom2_idx)
                symbol1 = Chem.GetPeriodicTable().GetElementSymbol(atom1.GetAtomicNum())
                symbol2 = Chem.GetPeriodicTable().GetElementSymbol(atom2.GetAtomicNum())
                
                return (atom1.GetExplicitValence() < max_valences.get(symbol1, 0) and 
                        atom2.GetExplicitValence() < max_valences.get(symbol2, 0))
            
            # Add some basic bonds (this is a simplified approach)
            # First connect carbons if present
            if 'C' in atom_map:
                carbons = atom_map['C']
                for i in range(len(carbons) - 1):
                    if can_add_bond(carbons[i], carbons[i + 1]):
                        mol.AddBond(carbons[i], carbons[i + 1], Chem.BondType.SINGLE)
                        mol.GetAtomWithIdx(carbons[i]).UpdatePropertyCache(strict=False)
                        mol.GetAtomWithIdx(carbons[i + 1]).UpdatePropertyCache(strict=False)
            
            # Connect oxygens to carbons
            if 'O' in atom_map and 'C' in atom_map:
                for o_idx in atom_map['O']:
                    o_atom = mol.GetAtomWithIdx(o_idx)
                    if o_atom.GetExplicitValence() >= 2:  # Skip if oxygen already has 2 bonds
                        continue
                    for c_idx in atom_map['C']:
                        if can_add_bond(c_idx, o_idx):
                            mol.AddBond(c_idx, o_idx, Chem.BondType.SINGLE)
                            mol.GetAtomWithIdx(c_idx).UpdatePropertyCache(strict=False)
                            o_atom.UpdatePropertyCache(strict=False)
                            break
            
            # Connect nitrogens
            if 'N' in atom_map:
                for n_idx in atom_map['N']:
                    n_atom = mol.GetAtomWithIdx(n_idx)
                    if n_atom.GetExplicitValence() >= 3:  # Skip if nitrogen already has 3 bonds
                        continue
                    if 'C' in atom_map:
                        for c_idx in atom_map['C']:
                            if can_add_bond(c_idx, n_idx):
                                mol.AddBond(c_idx, n_idx, Chem.BondType.SINGLE)
                                mol.GetAtomWithIdx(c_idx).UpdatePropertyCache(strict=False)
                                n_atom.UpdatePropertyCache(strict=False)
                                break
            
            # Connect phosphorus to oxygens
            if 'P' in atom_map and 'O' in atom_map:
                for p_idx in atom_map['P']:
                    p_atom = mol.GetAtomWithIdx(p_idx)
                    for o_idx in atom_map['O']:
                        if can_add_bond(p_idx, o_idx):
                            mol.AddBond(p_idx, o_idx, Chem.BondType.SINGLE)
                            p_atom.UpdatePropertyCache(strict=False)
                            mol.GetAtomWithIdx(o_idx).UpdatePropertyCache(strict=False)
            
            # Connect sulfur
            if 'S' in atom_map:
                for s_idx in atom_map['S']:
                    s_atom = mol.GetAtomWithIdx(s_idx)
                    if 'C' in atom_map:
                        for c_idx in atom_map['C']:
                            if can_add_bond(c_idx, s_idx):
                                mol.AddBond(c_idx, s_idx, Chem.BondType.SINGLE)
                                mol.GetAtomWithIdx(c_idx).UpdatePropertyCache(strict=False)
                                s_atom.UpdatePropertyCache(strict=False)
                                break
            
            # Add explicit hydrogens
            if 'H' in atom_counts:
                h_count = atom_counts['H']
                h_added = 0
                
                # First, collect all atoms that need hydrogens
                atoms_needing_h = []
                for atom in mol.GetAtoms():
                    atom.UpdatePropertyCache(strict=False)
                    symbol = Chem.GetPeriodicTable().GetElementSymbol(atom.GetAtomicNum())
                    max_valence = max_valences.get(symbol, 0)
                    current_valence = atom.GetExplicitValence()
                    
                    if current_valence < max_valence:
                        atoms_needing_h.append((atom, max_valence - current_valence))
                
                # Then add hydrogens to those atoms
                for atom, h_needed in atoms_needing_h:
                    while h_needed > 0 and h_added < h_count:
                        h_idx = mol.AddAtom(Chem.Atom(1))  # Add hydrogen atom
                        mol.AddBond(atom.GetIdx(), h_idx, Chem.BondType.SINGLE)
                        atom.UpdatePropertyCache(strict=False)
                        mol.GetAtomWithIdx(h_idx).UpdatePropertyCache(strict=False)
                        h_added += 1
                        h_needed -= 1
            
            try:
                mol = Chem.Mol(mol.GetMol())
                Chem.SanitizeMol(mol)
                
                # Generate 2D coordinates
                AllChem.Compute2DCoords(mol)
                
                # Convert to SMILES and molfile
                smiles = Chem.MolToSmiles(mol)
                molfile = Chem.MolToMolBlock(mol)
                
                print("Successfully generated structure. SMILES:", smiles)
                
                return JsonResponse({
                    'smiles': smiles,
                    'molfile': molfile,
                    'success': True
                })
            except Exception as e:
                print("Failed to sanitize molecule:", str(e))
                return JsonResponse({
                    'error': 'Could not generate a valid structure from the formula',
                    'success': False
                }, status=400)
                
        except Exception as e:
            print("Error in RDKit processing:", str(e))
            return JsonResponse({
                'error': f'Error generating structure: {str(e)}',
                'success': False
            }, status=400)

    except json.JSONDecodeError as e:
        print("JSON decode error:", str(e))
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print("Unexpected error:", str(e))
        return JsonResponse({'error': str(e)}, status=500)
