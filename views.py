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
	response['entries'] = Entry.objects.filter(visible=True)
	return template_response('play.html', response, request)

def entry(request, id):
	response = {}
	response['entry'] = Entry.objects.get(id=id)
	return template_response('play_entry.html', response, request)

def entry(request, title):
	response = {}
	response['entry'] = Entry.objects.get(url_title=title)
	return template_response('play_entry.html', response, request)

def entry_body(request, id):
	return html_response(Entry.objects.get(id=id).content)

def entry_body(request, title):
	return html_response(Entry.objects.get(url_title=title).content)

def make(request):
	response = {}
	return template_response('make.html', response, request)

def confuscate(request):
    response = {}
    return template_response('confuscate.html', response, request)
