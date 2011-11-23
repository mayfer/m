from django.db import models

# Create your models here.

class Visit(models.Model):
	class Meta:
		db_table = 'visits'
	id = models.AutoField(primary_key=True)
	ip = models.CharField(max_length=100)
	useragent = models.CharField(max_length=200)
	date = models.DateTimeField(auto_now=True)
	page = models.CharField(max_length=200)
	label = models.CharField(max_length=200)
	
	def __unicode__(self):
		if self.label:
			return "{0} ({1})".format(self.label, self.ip)
		else:
			return self.ip
	
	def load(self, request):
		self.ip = request.META['REMOTE_ADDR']
		self.useragent = request.META['HTTP_USER_AGENT']
		self.page = request.get_full_path()
		return self