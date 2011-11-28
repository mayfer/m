from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response
import simplejson as json

def template_response(template, data, request):
    return HttpResponse(render_to_response(template, data, context_instance=RequestContext(request)))
    
def json_response(data):
	return HttpResponse(json.dumps(data), mimetype='application/javascript')
	
def html_response(response):
	return HttpResponse(response, mimetype='text/html')