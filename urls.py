from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
import m.settings as settings
import views, m.morphin as morphin

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'm.views.home', name='home'),
    # url(r'^m/', include('m.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    
    #url(r'^$', 'views.home', name='home'),
    #url(r'^work/?$', 'views.work', name='work'),
    #url(r'^play/?$', 'views.play', name='play'),
    #url(r'^pretend/?$', 'views.pretend', name='pretend'),
    
    url(r'^morphin/', include('morphin.urls', namespace='morphin')),
)

# to serve static files on development servers
if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
   )