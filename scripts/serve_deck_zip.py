"""Serve only the current Decky installer on a selected local network address."""
import argparse
import hashlib
import io
import json
import secrets
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from zipfile import ZipFile, BadZipFile

ROOT = Path(__file__).resolve().parents[1]
KEY_FILE = ROOT / 'work' / 'deck-download-key.txt'


class Handler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.reply(body=False)

    def do_GET(self):
        self.reply(body=True)

    def reply(self, body):
        if not secrets.compare_digest(self.path, self.server.download_path):
            self.send_error(404)
            return
        version = json.loads((ROOT / 'package.json').read_text())['version']
        try:
            payload = (ROOT / 'outputs' / f'Orbiter-{version}-dev.zip').read_bytes()
            with ZipFile(io.BytesIO(payload)) as archive:
                if archive.testzip() is not None:
                    raise BadZipFile('Incomplete build')
        except (OSError, BadZipFile):
            self.send_error(503, 'Build not ready; retry shortly')
            return
        self.send_response(200)
        self.send_header('Content-Type', 'application/zip')
        self.send_header('Content-Disposition', 'attachment; filename="orbiter.zip"')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Orbiter-SHA256', hashlib.sha256(payload).hexdigest())
        self.end_headers()
        if body:
            self.wfile.write(payload)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bind', required=True, help='Mac local network IP')
    parser.add_argument('--port', type=int, default=8766)
    args = parser.parse_args()
    KEY_FILE.parent.mkdir(exist_ok=True)
    if not KEY_FILE.exists():
        KEY_FILE.write_text(secrets.token_urlsafe(24))
        KEY_FILE.chmod(0o600)
    key = KEY_FILE.read_text().strip()
    if len(key) < 32:
        raise ValueError('Download key is invalid')
    server = ThreadingHTTPServer((args.bind, args.port), Handler)
    server.download_path = f'/{key}/orbiter.zip'
    print(f'Decky installer: http://{args.bind}:{args.port}{server.download_path}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
