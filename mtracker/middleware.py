from m.mtracker.models import Visit

class TrackerMiddleware(object):
	def process_request(self, request):
		Visit().load(request).save()