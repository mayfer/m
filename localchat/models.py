from django.db import models
import datetime

class Message(models.Model):
	id = models.AutoField(primary_key=True)
	message = models.TextField()
	ip = models.CharField(max_length=100)
	date = models.DateTimeField()
	
	class Meta:
		db_table = 'messages'
		ordering = ['-date']

	def __unicode__(self):
		return "[{ip}] {message}".format(ip=self.ip, message=self.message)
