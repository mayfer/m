from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
import m.settings as settings

admin.autodiscover()

urlpatterns = patterns('',
    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^$', 'm.views.home', name='home'),
    url(r'^#demo$', 'm.views.home', name='home-demo'),
    url(r'^work/?$', 'm.views.work', name='work'),
    url(r'^play/?$', 'm.views.play', name='play'),
    url(r'^play/ajax/(?P<id>\d*)/?$', 'm.views.entry_body', name='play-entry-ajax'),
    url(r'^play/ajax/(?P<title>[^\d].*)/?$', 'm.views.entry_body', name='play-entry-ajax-title'),
    url(r'^play/entry/(?P<id>\d+)/?$', 'm.views.entry', name='play-entry'),
    url(r'^play/entry/(?P<title>[^\d].*)/?$', 'm.views.entry', name='play-entry-title'),
    url(r'^make/?$', 'm.views.make', name='make'),

    url(r'^morphin/', include('m.morphin.urls', namespace='morphin')),
    url(r'^chat/', include('m.localchat.urls', namespace='chat')),
    url(r'^confuscate/', include('m.confuscate.urls', namespace='confuscate')),
)
