from m.mtracker.models import Visit

class TrackerMiddleware(object):
    def process_request(self, request):
        visit = Visit().load(request)
        
        if visit.ip == '174.6.216.160':
            visit.label = 'murat home'
        
        blacklist = [
            '/admin',
            '/favicon.ico',
            '/robots.txt'
        ]
        bots = [
            'Googlebot', 'Google-Test', 'Feedfetcher-Google',
            'Baiduspider',
            'bingbot'
            'facebookexternalhit',
            'YandexBot',
            'JikeSpider',
        ]
        track = True
        for bot in bots:
            if bot in visit.useragent:
                track = False
        for path in blacklist:
            if visit.page.startswith(path):
                track = False
        if track:
            visit.save()
