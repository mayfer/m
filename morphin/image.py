from __future__ import division
from m.morphin.models import Morph
from django.conf import settings
import os
from PIL import Image

# imgur api: ee1c55995a1a35cf35223ca8cd5bee8f (anonymous)

class Morpher(object):
	def __init__(self, master_file, slave_file):
		self.frames = 20
		self.delay = 5
		self.master_filename = master_file
		self.slave_filename = slave_file
		self.path = os.path.dirname(master_file)
		
	def generate_frames(self, marker_pairs):
		self.marker_pairs = marker_pairs
		
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
				
			frame_top_layer += "' {path}/master_slave_{0}.jpg".format(frame, path=self.path)
			frame_bottom_layer += "' {path}/slave_master_{0}.jpg".format(frame, path=self.path)
			
			frame_image = "composite -dissolve {0}x{1}  -gravity center {path}/slave_master_{2}.jpg  {path}/master_slave_{2}.jpg -alpha Set {path}/frame{2}.jpg".format(int((frame/self.frames)*100), int(((self.frames-frame)/self.frames)*100), frame, path=self.path)
			
			self.execute(frame_top_layer)
			self.execute(frame_bottom_layer)
			self.execute(frame_image)
		
		self.execute("cp {master} {path}/frame0.jpg".format(master=self.master_filename))
		self.execute("cp {slave} {path}/frame{frames}.jpg".format(slave=self.slave_filename, frames=self.frames))
		
		all_frames = " ".join( [ "{path}/frame{0}.jpg".format(i, path=self.path) for i in range(0, self.frames+1)+range(self.frames+1, -1, -1) ] )
		
		gif_name = "animation.gif"
		animation = "convert -verbose -delay {0} -loop 0 {1} {path}/{gif_name}".format(self.delay, all_frames, path=self.path, gif_name=gif_name)
		self.execute(animation)
		return os.path.join(self.path, gif_name)

	def execute(self, command):
		#os.chdir(settings.FILE_ROOT)
		os.system(command)

class Cropper(object):
	def __init__(self, filename):
		self.filename = filename
		self.image = Image.open(self.filename)
		
	def resize(self, w, h, even_if_larger=True):
		try:
			x, y = self.image.size
			aspect = x/y
			
			if aspect > w/h:
				h = int(w / aspect)
			if aspect < w/h:
				w = int(h * aspect)
			
			if (x > w or y > h) or even_if_larger:
				self.image = self.image.resize((w, h), Image.ANTIALIAS)
				self.image.save(self.filename, 'JPEG')
		except IOError, e:
			print "cannot resize '%s'" % filename
			print e

	def crop(self, attrs):
		try:			
			for key, val in attrs.items():
				attrs[key] = int(val)
				
			box = (
				attrs['x'],
				attrs['y'],
				attrs['x']+attrs['w'],
				attrs['y']+attrs['h']
			)
			
			self.image = self.image.crop(box)
			self.image.save(self.filename, 'JPEG')
		except IOError, e:
			print "cannot crop '%s':" % filename
			print e