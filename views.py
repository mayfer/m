from __future__ import division
from m.shortcuts import template_response, json_response, html_response
from m.mlog.models import Entry
from django.conf import settings
import simplejson as json
import os

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
	
def morphin_generate(request):
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


class Morpher(object):
	def __init__(self, marker_pairs):
		self.marker_pairs = marker_pairs
		self.frames = 20
		self.delay = 5
		self.master_filename = "manuel.jpg"
		self.slave_filename = "squirrel.jpg"
		
	def generate_frames(self):
		for frame in range(1, self.frames+1):
			frame_top_layer = "convert {0} -virtual-pixel Mirror -distort Shepards '".format(self.master_filename)
			frame_bottom_layer = "convert {0} -virtual-pixel Mirror -distort Shepards '".format(self.slave_filename)

			for marker_pair in self.marker_pairs:
				master = marker_pair['master']
				slave = marker_pair['slave']
				
				diff_x = slave['x'] - master['x']
				diff_y = slave['y'] - master['y']
				
				master_new_x = int(round(master['x'] + (diff_x * (frame/self.frames))))
				master_new_y = int(round(master['y'] + (diff_y * (frame/self.frames))))
				frame_top_layer += " {0},{1} {2},{3} ".format(master['x'], master['y'], master_new_x, master_new_y)
				
				slave_new_x = int(round(slave['x'] + (-diff_x * ((self.frames - frame)/self.frames))))
				slave_new_y = int(round(slave['y'] + (-diff_y * ((self.frames - frame)/self.frames))))
				frame_bottom_layer += " {0},{1} {2},{3} ".format(slave['x'], slave['y'], slave_new_x, slave_new_y)
				
			frame_top_layer += "' master_slave_{0}.jpg".format(frame)
			frame_bottom_layer += "' slave_master_{0}.jpg".format(frame)
			
			dissolve_percentage = int()
			frame_image = "composite -dissolve {0}x{1}  -gravity center slave_master_{2}.jpg  master_slave_{2}.jpg -alpha Set frame{2}.jpg".format(int((frame/self.frames)*100), int(((self.frames-frame)/self.frames)*100), frame)
			self.execute([frame_top_layer, frame_bottom_layer, frame_image])
			
		all_frames = " ".join( [ "frame{0}.jpg".format(i) for i in range(0, self.frames+1)+range(self.frames+1, -1, -1) ] )
		animation = """convert -verbose -delay {0} -loop 0 {1} animation.gif""".format(self.delay, all_frames)
		self.execute(["cp manuel.jpg frame0.jpg", "cp squirrel.jpg frame{0}.jpg".format(self.frames+1), animation])

	def execute(self, commands):
		for command in commands:
			os.chdir(settings.TMP_ROOT)
			#print command
			os.system(command)
