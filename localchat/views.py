from m.shortcuts import template_response, json_response, html_response, not_found, redirect
from django.db.models import Q
from django.contrib.humanize.templatetags.humanize import naturaltime
from m.localchat.models import Message
import time
from datetime import datetime

def index(request):
	messages = Message.objects.filter()
	response = {
		'messages': messages,
        'timestamp': time.time(),
	}
	return template_response('localchat/index.html', response, request)

def messages(request, timestamp=None):
    if timestamp:
        date = datetime.fromtimestamp(timestamp)
        messages = Message.objects.filter(date__gt=date)
    else:
        messages = Message.objects.filter()

    response = {
        'messages': [ {'message':message.message, 'date':naturaltime(message.date)} for message in messages ],
        'timestamp': time.time(),
    }
    return json_response(response)
    

def post(request):
    message = Message(
        message=request.POST['message'].strip(),
        ip=request.META['REMOTE_ADDR'],
        date=datetime.now()
    )
    print request.POST['message']
    print request.POST['message'].strip()

    if len(message.message) > 0:
        message.save()
        response = {
            'status': 'ok',
            'timestamp': time.time(),
        }
    else:
        # do nothing
        response = {
            'status': 'ok',
        }
    return json_response(response)
