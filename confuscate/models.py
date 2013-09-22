from django.db import models

# Create your models here.

class Word(models.Model):
    class Meta:
        db_table = 'words'
        ordering = ['-id']

    id = models.AutoField(primary_key=True)
    ip = models.CharField(max_length=100)
    useragent = models.CharField(max_length=200)
    date = models.DateTimeField(auto_now=True, editable=True)
    word = models.CharField(max_length=200)
    
    def __unicode__(self):
            return '{word} // {ip}, {date}'.format(page=self.page, ip=self.ip, date=self.date)

    def load(self, request):
        self.ip = request.META['REMOTE_ADDR']
        self.useragent = request.META['HTTP_USER_AGENT']
        return self

