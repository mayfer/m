from django.db import models
import datetime, time, os

class Morph(models.Model):
	def get_upload_path(instance, filename):
		return "uploads/{id}/{filename}".format(id=instance.id, filename=filename)
	
	class Meta:
		db_table = 'morphs'
	id = models.AutoField(primary_key=True)
	master_image = models.ImageField(upload_to=get_upload_path, null=True, blank=True)
	slave_image = models.ImageField(upload_to=get_upload_path, null=True, blank=True)
	morph_image = models.ImageField(upload_to=get_upload_path, null=True, blank=True)
	date = models.DateTimeField()
	visible = models.BooleanField(default=False)
	final = models.BooleanField(default=False)
	caption = models.TextField(null=True, blank=True)
	points = models.TextField(null=True, blank=True)
	
	def __unicode__(self):
		return self.url_title

	def save(self, *args, **kwargs):
		"set current timestamp on first save"
		if not self.id:
			self.date = datetime.datetime.today()
		super(Morph, self).save(*args, **kwargs)
