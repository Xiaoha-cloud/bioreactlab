import json
from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from ..models import Metabolite, FormulaAuditLog

class FormulaChangeLogger(MiddlewareMixin):
    """Middleware to log changes to chemical formulas."""
    
    def process_request(self, request):
        """Store the request for later use in process_response."""
        if request.method == 'POST':
            # Only process POST requests
            request._formula_change_data = None
            
            try:
                # Try to parse JSON body
                if request.content_type == 'application/json':
                    data = json.loads(request.body)
                else:
                    data = request.POST
                
                # Check if this is a formula change request
                if 'chemical_formula' in data and ('id' in data or 'pk' in data):
                    metabolite_id = data.get('id') or data.get('pk')
                    try:
                        metabolite = Metabolite.objects.get(pk=metabolite_id)
                        if metabolite.chemical_formula != data['chemical_formula']:
                            request._formula_change_data = {
                                'metabolite': metabolite,
                                'old_formula': metabolite.chemical_formula,
                                'new_formula': data['chemical_formula']
                            }
                    except Metabolite.DoesNotExist:
                        pass
            except (json.JSONDecodeError, ValueError):
                pass
                
        return None

    def process_response(self, request, response):
        """Log formula changes after successful response."""
        if (hasattr(request, '_formula_change_data') and 
            request._formula_change_data and 
            isinstance(response, HttpResponse) and 
            response.status_code in [200, 201, 204]):
            
            try:
                FormulaAuditLog.objects.create(
                    metabolite=request._formula_change_data['metabolite'],
                    old_formula=request._formula_change_data['old_formula'],
                    new_formula=request._formula_change_data['new_formula'],
                    changed_by=request.user if request.user.is_authenticated else None,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT')
                )
            except Exception as e:
                # Log the error but don't interrupt the response
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to log formula change: {str(e)}")
                
        return response 