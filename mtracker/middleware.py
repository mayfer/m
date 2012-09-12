from m.mtracker.models import Visit

class TrackerMiddleware(object):
    def process_request(self, request):
        visit = Visit().load(request)
        blacklist = [
            '/admin',
            '/favicon.ico',
            '/robots.txt'
        ]
        track = True
        for path in blacklist:
            if visit.page.startswith(path):
                track = False
        if track:
            visit.save()
