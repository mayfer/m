from django.http import HttpResponse
from django.template import RequestContext
from django.shortcuts import render_to_response

def template_response(template, data, request):
    return HttpResponse(render_to_response(template, data, context_instance=RequestContext(request)))