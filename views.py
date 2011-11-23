from django.http import HttpResponse
from m.shortcuts import template_response
from m.mlog.models import Entry

def home(request):
	response = {}
	return template_response('home.html', response, request)

def work(request):
	response = {}
	return template_response('work.html', response, request)

def play(request):
	response = {}
	response['entries'] = Entry.objects.filter(visible=True).order_by('-date')
	return template_response('play.html', response, request)

def pretend(request):
	response = {}
	return template_response('pretend.html', response, request)

def morphin(request):
	response = {}
	return template_response('morphin.html', response, request)