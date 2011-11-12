from django.db import models

class Entry(models.Model):
	class Meta:
		db_table = 'entries'
	id = models.IntegerField(primary_key=True)
	title = models.TextField()
	url_title = models.CharField(max_length=100)
	content = models.TextField()
	custom_css = models.TextField()
	date = models.DateField(auto_now_add=True)
	date_label = models.CharField(max_length=100)
	def __unicode__(self):
		return self.url_title
