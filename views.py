from django.http import HttpResponse
from m.shortcuts import template_response
from m.mlog.models import Entry

def home(request):
	response = {}
	return template_response('home.html', response, request)
