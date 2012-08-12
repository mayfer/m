from django.db import models
import datetime

class Entry(models.Model):
	id = models.AutoField(primary_key=True)
	title = models.TextField()
	preview = models.TextField(blank=True)
	url_title = models.CharField(max_length=100)
	content = models.TextField(blank=True)
	custom_css = models.TextField(blank=True)
	date = models.DateTimeField()
	date_label = models.CharField(max_length=100)
	visible = models.BooleanField(default=False)
	
	class Meta:
		db_table = 'entries'
		ordering = ['-date']

	def __unicode__(self):
		return "{title} ({date})".format(title=self.url_title, date=self.date)
