from m.shortcuts import template_response, json_response, html_response, not_found, redirect
from django.db.models import Q
from m.localchat.models import Message
from datetime import datetime

def index(request):
	messages = Message.objects.filter(
	)
	response = {
		'messages': messages,
	}
	return template_response('localchat/index.html', response, request)

def post(request):
    message = Message(
        message=request.POST['message'],
        ip=request.META['REMOTE_ADDR'],
        date=datetime.now()
    )
    message.save()
    response = {
        'status': 'ok',
    }
    return json_response(response)
