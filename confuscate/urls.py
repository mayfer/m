from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('m.confuscate.views',
    url(r'^$', 'index', name='index'),
)

