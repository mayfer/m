from m.shortcuts import template_response, json_response, html_response
from m.confuscate.models import Word

def index(request):
    response = {}
    return template_response('confuscate.html', response, request)
