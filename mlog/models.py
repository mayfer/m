from django.db import models
import datetime

class Entry(models.Model):
	class Meta:
		db_table = 'entries'
	id = models.AutoField(primary_key=True)
	title = models.TextField()
	preview = models.TextField(blank=True)
	url_title = models.CharField(max_length=100)
	content = models.TextField(blank=True)
	custom_css = models.TextField(blank=True)
	date = models.DateTimeField()
	date_label = models.CharField(max_length=100)
	visible = models.BooleanField(default=False)
	
	def __unicode__(self):
		return self.url_title

	def save(self, *args, **kwargs):
		"set current timestamp on first save"
		if not self.id:
			self.date = datetime.datetime.today()
		super(Entry, self).save(*args, **kwargs)