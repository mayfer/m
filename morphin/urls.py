from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('morphin.views',
    url(r'^$', 'index', name='index'),
    url(r'^upload/?$', 'upload', name='upload'),
    url(r'^crop/(\d*)/?$', 'crop', name='crop'),
    url(r'^points/(\d*)/?$', 'points', name='points'),
    url(r'^generate/(\d*)/?$', 'generate', name='generate'),
    url(r'^view/(\d*)/?$', 'view', name='view'),
)
