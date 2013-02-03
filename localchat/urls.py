from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('m.localchat.views',
    url(r'^$', 'index', name='index'),
    url(r'^post/?$', 'post', name='post'),
    url(r'^messages/?$', 'messages', name='messages'),
)
