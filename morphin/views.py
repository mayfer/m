from m.shortcuts import template_response, json_response, html_response, not_found, redirect
from django.conf import settings
from m.morphin.models import Morph
from m.morphin.image import Morpher, Cropper
import simplejson as json
import os

def index(request):
	response = {}
	return template_response('morphin/morphin.html', response, request)
	
def upload(request):
	response = {}
	if request.method == 'POST' and 'master' in request.FILES and 'slave' in request.FILES:
		master = request.FILES['master']
		slave = request.FILES['slave']
		
		morph = Morph()
		morph.save()
		try:
			w, h = 600, 600
			morph.master_image.save("m_{0}".format(master.name), master, save=True)
			morph.slave_image.save("s_{0}".format(slave.name), slave, save=True)
			cropper_master = Cropper(morph.master_image.path)
			cropper_slave = Cropper(morph.slave_image.path)
			cropper_master.resize(w, h)
			cropper_slave.resize(w, h)
			return redirect(label='morphin:crop', args=[morph.id])
		except Exception, e:
			morph.delete()
			return html_response(e)
	return template_response('morphin/upload.html', response, request)
	
def generate(request):
	response = {}
	if request.method == 'POST' and 'data' in request.POST:
		response['status'] = 'ok'
		input = json.loads(request.POST['data'])
		morpher = Morpher(input['markers'])
		print input['markers']
		morpher.generate_frames()
		response['data'] = input
	else:
		response['status'] = 'error'
	return json_response(response)
	
def crop(request, morph_id):
	try:
		morph = Morph.objects.get(id=morph_id)
	except:
		not_found()
	
	if request.method == 'POST':
		cropper_master = Cropper(morph.master_image.path)
		cropper_slave = Cropper(morph.slave_image.path)
		
		master_crop = json.loads(request.POST['master'])
		slave_crop = json.loads(request.POST['slave'])
		
		cropper_master.crop(master_crop)
		cropper_slave.crop(slave_crop)
		
		return redirect(label='morphin:crop', args=[morph_id])
	else:
		response = {
			'morph': morph
		}
		return template_response('morphin/crop.html', response, request)