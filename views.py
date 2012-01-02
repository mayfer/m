from m.shortcuts import template_response, json_response, html_response
from m.mlog.models import Entry

def placeholder(request):
	return html_response("my old server died.<br />i need to revive my site.<br /><br />note to self: make backups")

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
