from m.shortcuts import template_response, json_response, html_response, not_found, redirect
from django.conf import settings
from django.core.files import File
from django.db.models import Q
from m.morphin.models import Morph
from m.morphin.image import Morpher, Cropper, sanitize
import simplejson as json
import os

def index(request):
	morphs = Morph.objects.filter(
		Q(visible=True),
		Q(master_image__isnull=False) | ~Q(master_image__exact=''),
		Q(slave_image__isnull=False) | ~Q(slave_image__exact=''),
		Q(morph_image__isnull=False) | ~Q(morph_image__exact='')
	)
	
	for morph in morphs:
		morph.points = json.loads(morph.points)
	
	response = {
		'morph_examples': morphs
	}
	return template_response('morphin/index.html', response, request)
	
def upload(request):
	response = {}
	if request.method == 'POST' and 'master' in request.FILES and 'slave' in request.FILES:
		master = request.FILES['master']
		slave = request.FILES['slave']
		
		morph = Morph()
		morph.save()
		try:
			w, h = 300, 300
			morph.master_image.save("m_{0}".format(sanitize(master.name)), master, save=True)
			morph.slave_image.save("s_{0}".format(sanitize(slave.name)), slave, save=True)
			cropper_master = Cropper(morph.master_image.path)
			cropper_slave = Cropper(morph.slave_image.path)
			cropper_master.resize(w, h, even_if_larger=False)
			cropper_slave.resize(w, h, even_if_larger=False)
			return redirect(label='morphin:crop', args=[morph.id])
		except Exception, e:
			morph.delete()
			return html_response(e)
	return template_response('morphin/upload.html', response, request)
	
def crop(request, morph_id):
	try:
		morph = Morph.objects.get(id=morph_id)
		if morph.final:
			return redirect(label='morphin:view', args=[morph_id])
	except:
		not_found()
	
	if request.method == 'POST':
		cropper_master = Cropper(morph.master_image.path)
		cropper_slave = Cropper(morph.slave_image.path)
		
		master_cropdata = json.loads(request.POST['master'])
		slave_cropdata = json.loads(request.POST['slave'])
		
		cropper_master.crop(master_cropdata)
		cropper_slave.crop(slave_cropdata)
		
		# resize to the average of the two images
		mw, mh = cropper_master.image.size
		sw, sh = cropper_master.image.size
		w = (mw+sw)/2
		h = (mh+sh)/2
		print w, h
		cropper_master.resize(w, h)
		cropper_slave.resize(w, h)
			
		return redirect(label='morphin:points', args=[morph_id])
	else:
		response = {
			'morph': morph
		}
		return template_response('morphin/crop.html', response, request)
		
def points(request, morph_id):
	try:
		morph = Morph.objects.get(id=morph_id)
		if morph.final:
			return redirect(label='morphin:view', args=[morph_id])
	except:
		not_found()
		
	response = {'morph': morph}
	return template_response('morphin/points.html', response, request)

def generate(request, morph_id):
	try:
		morph = Morph.objects.get(id=morph_id)
		if morph.final:
			return redirect(label='morphin:view', args=[morph_id])
	except:
		not_found()
		
	response = {}
	if request.method == 'POST' and 'data' in request.POST:
		response['status'] = 'ok'
		input = json.loads(request.POST['data'])
		morpher = Morpher(morph.master_image.path, morph.slave_image.path)
		
		gif_path = morpher.generate_frames(input['markers'])
		
		morph.morph_image = os.path.join('uploads', str(morph.id), os.path.basename(gif_path))
		morph.points = json.dumps(input['markers'])
		morph.save()
		
		response['data'] = input
		response['image_url'] = morph.morph_image.url
	else:
		response['status'] = 'error'
	return json_response(response)

def view(request, morph_id):
	firsttime = False
	try:
		morph = Morph.objects.get(id=morph_id)
		if not morph.final:
			if request.method == "POST" and 'caption' in request.POST and request.POST['caption'] != "Enter a caption. Or not.":
				morph.caption = request.POST['caption']
			firsttime = True
			morph.final = True
			morph.save()
	except:
		not_found()
		
	if not morph.morph_image:
		not_found()
	
	response = {
		'morph': morph,
		'firsttime': firsttime
	}
	
	return template_response('morphin/view.html', response, request)
