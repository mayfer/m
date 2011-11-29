from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
import m.settings as settings
import views

admin.autodiscover()

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'm.views.home', name='home'),
    # url(r'^m/', include('m.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'views.home', name='home'),
    url(r'^work/?$', 'views.work', name='work'),
    url(r'^play/?$', 'views.play', name='play'),
    url(r'^pretend/?$', 'views.pretend', name='pretend'),
    url(r'^morphin/?$', 'views.morphin', name='morphin'),
    url(r'^morphin/generate/?$', 'views.morphin_generate', name='morphin_generate'),
    url(r'^morphin/upload/?$', 'views.morphin_upload', name='morphin_upload'),
)

# to serve static files on development servers
if settings.DEBUG:
    from django.views.static import serve
    _media_url = settings.MEDIA_URL
    if _media_url.startswith('/'):
        _media_url = _media_url[1:]
        urlpatterns += patterns('',
            (r'^%s(?P<path>.*)$' % _media_url, serve, {'document_root': settings.MEDIA_ROOT})
        )
    del(_media_url, serve)
