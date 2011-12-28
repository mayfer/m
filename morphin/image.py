from __future__ import division
from m.morphin.models import Morph
from django.conf import settings
import os
from PIL import Image

# imgur api: ee1c55995a1a35cf35223ca8cd5bee8f (anonymous)

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

class Cropper(object):
	def __init__(self, filename):
		self.filename = filename
		self.image = Image.open(self.filename)
		
	def resize(self, w, h, even_if_larger=True):
		try:
			x, y = self.image.size
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