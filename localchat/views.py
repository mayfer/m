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
        message=request.POST['message'].strip(),
        ip=request.META['REMOTE_ADDR'],
        date=datetime.now()
    )
    if len(message.message) > 0:
        message.save()
        response = {
            'status': 'ok',
        }
    else:
        response = {
            'status': 'fail',
            'reason': 'no message provided',
        }
    return json_response(response)
