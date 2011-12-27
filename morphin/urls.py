from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('morphin.views',
    url(r'^$', 'index', name='index'),
    url(r'^generate/?$', 'generate', name='generate'),
    url(r'^upload/?$', 'upload', name='upload'),
    url(r'^crop/(\d*)/?$', 'crop', name='crop'),
)
