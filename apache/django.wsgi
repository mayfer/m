import os
import sys

#Calculate the path based on the location of the WSGI script.
apache_configuration= os.path.dirname(__file__)
project = os.path.dirname(apache_configuration)
workspace = os.path.dirname(project)
if workspace not in sys.path:
    sys.path.append(workspace) 

os.environ['DJANGO_SETTINGS_MODULE'] = 'm.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
