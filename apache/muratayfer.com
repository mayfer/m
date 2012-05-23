<VirtualHost *:80>
	ServerAdmin murat@ayfer.net
	ServerName muratayfer.com
    ServerAlias www.muratayfer.com

	WSGIScriptAlias / /var/django/m/apache/django.wsgi
    WSGIDaemonProcess m user=murat group=murat processes=1 threads=10
    WSGIProcessGroup m

	Alias /static/admin/  /usr/lib/python2.7/dist-packages/django/contrib/admin/media/
	<Directory /usr/lib/python2.7/dist-packages/django/contrib/admin/media/>
		Order deny,allow
		Allow from all
	</Directory>
	Alias /static/ /var/django/m/static/
	<Directory /var/django/m/static/>
		Order deny,allow
		Allow from all
	</Directory>

	Alias /secret-box /var/www/secret-box/
	<Directory /var/www/secret-box/>
		Order deny,allow
		Allow from all
	</Directory>
	Alias /chords /var/www/chords/
	<Directory /var/www/chords/>
		Order deny,allow
		Allow from all
	</Directory>

	<Directory /var/django/m/apache/>
		Order deny,allow
		Allow from all
	</Directory>

	ErrorLog ${APACHE_LOG_DIR}/m.error.log
	CustomLog ${APACHE_LOG_DIR}/m.access.log combined
	# Possible values include: debug, info, notice, warn, error, crit, alert, emerg.
	LogLevel warn

</VirtualHost>
