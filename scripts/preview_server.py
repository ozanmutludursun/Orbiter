#!/usr/bin/env python3
"""Local-only preview; same Python engine as the plugin. No Steam access."""
import copy
import json
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'defaults'))
from orbiter_core.engine import Engine
from orbiter_core.source import REGIONS

engine = Engine(ROOT / 'work' / 'preview-data')
notifications = []
original = None
engine.update_session({'running': True, 'known': True})


def worker():
    while True:
        notices = engine.tick()
        with engine.lock:
            notifications.extend(notices)
            del notifications[:-20]
        time.sleep(1)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'preview-dist'), **kwargs)

    def log_message(self, format, *args):
        if not args or not str(args[0]).startswith(('GET /api', 'POST /api')):
            super().log_message(format, *args)

    def respond(self, data, status=200):
        payload = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        if self.path == '/api/state':
            self.respond(engine.state())
        elif self.path == '/api/notifications':
            with engine.lock:
                notices = list(notifications)
                notifications.clear()
            self.respond(notices)
        else:
            super().do_GET()

    def do_POST(self):
        global original
        # Only our own origin can mutate preview settings; never expose a LAN server.
        if self.headers.get('Origin') not in (None, 'http://127.0.0.1:8765', 'http://localhost:8765') or self.headers.get('Content-Type') != 'application/json':
            self.respond({'error': 'Origin/content type rejected'}, 403)
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length < 32_000:
                raise ValueError('Invalid request size')
            values = json.loads(self.rfile.read(length))
            if self.path == '/api/settings':
                result = engine.update_settings(values)
            elif self.path == '/api/session':
                result = engine.update_session(values)
                if values.get('panel') and engine.stale(engine.clock()):
                    result = engine.refresh()
            elif self.path == '/api/refresh':
                result = engine.refresh(True)
            elif self.path == '/api/demo':
                with engine.lock:
                    if values.get('enabled'):
                        if not engine.data:
                            raise ValueError('Load the official schedule before demo mode')
                        if not engine.demo:
                            original = copy.deepcopy(engine.data)
                        engine.demo = True
                        data = copy.deepcopy(original)
                        now = engine.clock()
                        # Illustrations and names stay official; only demo timing is synthetic.
                        data['events'] = []
                        for i, event in enumerate(original['events'][:8]):
                            start = now - 1_200_000 if i < 3 else now + 65_000 + (i-3) * 30_000
                            data['events'].append({**event, 'times': {r:[start,start+3_600_000] for r in REGIONS}})
                        data.update(obtainedAt=now, serverNow=now)
                        engine.data = data
                    else:
                        engine.demo = False
                        if original:
                            engine.data = original
                    engine.last_tick = engine.clock()
                    notifications.clear()
                    result = engine.state()
            else:
                self.respond({'error': 'Unknown endpoint'}, 404)
                return
            self.respond(result)
        except (ValueError, TypeError, KeyError) as exc:
            self.respond({'error': str(exc)}, 400)


if __name__ == '__main__':
    threading.Thread(target=worker, daemon=True).start()
    print('Orbiter preview: http://127.0.0.1:8765  (Ctrl+C to stop)', flush=True)
    try:
        ThreadingHTTPServer(('127.0.0.1', 8765), Handler).serve_forever()
    except KeyboardInterrupt:
        pass
